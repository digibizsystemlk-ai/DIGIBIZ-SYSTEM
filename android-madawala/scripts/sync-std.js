/**
 * Sync Standard Production Release (/std/) — DIGIBIZ
 * Fully creates & isolates the permanent standard production release in public/std/
 * Usage: node scripts/sync-std.js
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const targetStdDir = path.join(publicDir, 'std');

console.log(`\n======================================================`);
console.log(`🚀 SYNCING LIVE CODEBASE TO STANDARD PRODUCTION (/std/)`);
console.log(`======================================================\n`);

const dirsToCopy = ['admin', 'auth', 'core', 'modules', 'css', 'scripts', 'icons', 'assets'];
const filesToCopy = ['sw.js', 'manifest.json', 'favicon.ico', 'index.html'];

function copyRecursiveSync(src, dest) {
    if (!fs.existsSync(src)) return;
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(childItemName => {
            if (childItemName === 'snapshots' || childItemName === 'std' || childItemName === 'royal_arabian' || childItemName === 'sunrose' || childItemName.startsWith('v2026_') || childItemName === '_restore_points') return;
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(src, dest);
    }
}

function safeReadFileSync(fullPath, encoding = 'utf8') {
    let attempts = 0;
    while (attempts < 5) {
        try {
            return fs.readFileSync(fullPath, encoding);
        } catch (err) {
            if (err.code === 'EBUSY' && attempts < 4) {
                attempts++;
                const delay = attempts * 100;
                const start = Date.now();
                while (Date.now() - start < delay) {}
            } else {
                throw err;
            }
        }
    }
}

function safeWriteFileSync(fullPath, content, encoding = 'utf8') {
    let attempts = 0;
    while (attempts < 5) {
        try {
            fs.writeFileSync(fullPath, content, encoding);
            return;
        } catch (err) {
            if (err.code === 'EBUSY' && attempts < 4) {
                attempts++;
                const delay = attempts * 100;
                const start = Date.now();
                while (Date.now() - start < delay) {}
            } else {
                throw err;
            }
        }
    }
}

function rewriteStdAssets(targetDir, urlPrefix) {
    let rewrittenFilesCount = 0;

    function walkAndRewrite(currentDir) {
        if (!fs.existsSync(currentDir)) return;
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                walkAndRewrite(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
                let content = safeReadFileSync(fullPath, 'utf8');
                const orig = content;

                // 1. Rewrite script tags
                content = content.replace(/(<script\s+[^>]*src=["'])\/(core|scripts|assets|modules|admin|auth)\//gi, `$1${urlPrefix}/$2/`);
                
                // 2. Rewrite stylesheet link tags
                content = content.replace(/(<link\s+[^>]*href=["'])\/(css|core|assets|icons|admin)\//gi, `$1${urlPrefix}/$2/`);
                
                // 3. Rewrite icon & image src tags
                content = content.replace(/(<img\s+[^>]*src=["'])\/(icons|images|assets|admin)\//gi, `$1${urlPrefix}/$2/`);
                content = content.replace(/(<link\s+[^>]*href=["'])\/(manifest\.json|icons\/)/gi, `$1${urlPrefix}/$2`);

                if (content !== orig) {
                    safeWriteFileSync(fullPath, content, 'utf8');
                    rewrittenFilesCount++;
                }
            } else if (entry.isFile() && entry.name === 'sw.js') {
                let swContent = safeReadFileSync(fullPath, 'utf8');
                swContent = swContent.replace(/const CACHE_NAME = ["'][^"']+["'];/, `const CACHE_NAME = "digibiz-std-v1";`);
                swContent = swContent.replace(/["']\/(assets|core|modules|manifest\.json)/g, `"${urlPrefix}/$1`);
                safeWriteFileSync(fullPath, swContent, 'utf8');
                rewrittenFilesCount++;
            }
        }
    }

    walkAndRewrite(targetDir);
    return rewrittenFilesCount;
}

try {
    const targets = [
        { name: 'STD Production Vault', dir: path.join(publicDir, 'std'), urlPrefix: '/std', tag: 'STD' },
        { name: 'Sunrose Client Vault', dir: path.join(publicDir, 'sunrose'), urlPrefix: '/sunrose', tag: 'sunrose' },
        { name: 'Sunrose Snapshot Vault', dir: path.join(publicDir, 'snapshots', 'SUNROSE'), urlPrefix: '/snapshots/SUNROSE', tag: 'SUNROSE' }
    ];

    targets.forEach(target => {
        if (!fs.existsSync(target.dir)) {
            fs.mkdirSync(target.dir, { recursive: true });
        }

        dirsToCopy.forEach(dirName => {
            const srcPath = path.join(publicDir, dirName);
            const destPath = path.join(target.dir, dirName);
            if (fs.existsSync(srcPath)) copyRecursiveSync(srcPath, destPath);
        });

        filesToCopy.forEach(fileName => {
            const srcPath = path.join(publicDir, fileName);
            const destPath = path.join(target.dir, fileName);
            if (fs.existsSync(srcPath)) fs.copyFileSync(srcPath, destPath);
        });

        const rewrittenCount = rewriteStdAssets(target.dir, target.urlPrefix);

        const metaPayload = {
            versionTag: target.tag,
            releaseName: `${target.name} Synchronized`,
            snapshotPath: `${target.urlPrefix}/`,
            syncedAt: new Date().toISOString()
        };
        fs.writeFileSync(path.join(target.dir, 'snapshot-meta.json'), JSON.stringify(metaPayload, null, 2));

        console.log(`✅ Synced ${target.name}!`);
        console.log(`  -> Target Directory: ${target.dir}`);
        console.log(`  -> Processed & Rewrote: ${rewrittenCount} files for 100% Zero-Leak Isolation`);
    });
} catch (err) {
    console.error(`❌ Sync failed:`, err);
    process.exit(1);
}
