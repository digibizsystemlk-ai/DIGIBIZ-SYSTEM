/**
 * Robust Zero-Leak Snapshot Generator Utility — DIGIBIZ
 * Fully isolates HTML, JS, CSS and Service Worker assets within versioned directories.
 * Usage: node scripts/create-snapshot.js [versionTag]
 */
const fs = require('fs');
const path = require('path');

const versionTag = process.argv[2] || 'STABLE_FREEZE_2026_08_17';
const dateMatch = versionTag.match(/(\d{4}_\d{2}_\d{2})/);
const shortAlias = dateMatch ? `v${dateMatch[1]}` : versionTag.toLowerCase().replace(/[^a-z0-9_]/g, '_');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const targetSnapshotDir = path.join(publicDir, 'snapshots', versionTag);
const targetShortAliasDir = path.join(publicDir, shortAlias);

console.log(`[SnapshotGenerator] 📸 Generating sealed snapshot for version: "${versionTag}"...`);
console.log(`[SnapshotGenerator] Target directories:\n -> ${targetSnapshotDir}\n -> ${targetShortAliasDir}`);

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
            if (childItemName === 'snapshots' || childItemName.startsWith('v2026_') || childItemName === '_restore_points') return;
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

function rewriteSnapshotAssets(targetDir, urlPrefix) {
    let rewrittenFilesCount = 0;

    function walkAndRewrite(currentDir) {
        if (!fs.existsSync(currentDir)) return;
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                walkAndRewrite(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
                let content = fs.readFileSync(fullPath, 'utf8');
                const orig = content;

                // 1. Rewrite script tags
                content = content.replace(/(<script\s+[^>]*src=["'])\/(core|scripts|assets|modules|admin)\//gi, `$1${urlPrefix}/$2/`);
                
                // 2. Rewrite stylesheet link tags
                content = content.replace(/(<link\s+[^>]*href=["'])\/(css|core|assets|icons|admin)\//gi, `$1${urlPrefix}/$2/`);
                
                // 3. Rewrite icon & image src tags
                content = content.replace(/(<img\s+[^>]*src=["'])\/(icons|images|assets|admin)\//gi, `$1${urlPrefix}/$2/`);
                content = content.replace(/(<link\s+[^>]*href=["'])\/(manifest\.json|icons\/)/gi, `$1${urlPrefix}/$2`);

                if (content !== orig) {
                    fs.writeFileSync(fullPath, content, 'utf8');
                    rewrittenFilesCount++;
                }
            } else if (entry.isFile() && entry.name === 'sw.js') {
                let swContent = fs.readFileSync(fullPath, 'utf8');
                swContent = swContent.replace(/const CACHE_NAME = ["'][^"']+["'];/, `const CACHE_NAME = "digibiz-${shortAlias}";`);
                swContent = swContent.replace(/["']\/(assets|core|modules|manifest\.json)/g, `"${urlPrefix}/$1`);
                fs.writeFileSync(fullPath, swContent, 'utf8');
                rewrittenFilesCount++;
            }
        }
    }

    walkAndRewrite(targetDir);
    return rewrittenFilesCount;
}

try {
    // 1. Copy into /snapshots/<versionTag>/
    if (!fs.existsSync(targetSnapshotDir)) {
        fs.mkdirSync(targetSnapshotDir, { recursive: true });
    }
    dirsToCopy.forEach(dirName => {
        const srcPath = path.join(publicDir, dirName);
        const destPath = path.join(targetSnapshotDir, dirName);
        if (fs.existsSync(srcPath)) copyRecursiveSync(srcPath, destPath);
    });
    filesToCopy.forEach(fileName => {
        const srcPath = path.join(publicDir, fileName);
        const destPath = path.join(targetSnapshotDir, fileName);
        if (fs.existsSync(srcPath)) fs.copyFileSync(srcPath, destPath);
    });

    // 2. Copy into short alias /v<date>/
    if (!fs.existsSync(targetShortAliasDir)) {
        fs.mkdirSync(targetShortAliasDir, { recursive: true });
    }
    dirsToCopy.forEach(dirName => {
        const srcPath = path.join(publicDir, dirName);
        const destPath = path.join(targetShortAliasDir, dirName);
        if (fs.existsSync(srcPath)) copyRecursiveSync(srcPath, destPath);
    });
    filesToCopy.forEach(fileName => {
        const srcPath = path.join(publicDir, fileName);
        const destPath = path.join(targetShortAliasDir, fileName);
        if (fs.existsSync(srcPath)) fs.copyFileSync(srcPath, destPath);
    });

    // 3. Post-process & rewrite all asset references to be 100% self-contained
    const countShortAlias = rewriteSnapshotAssets(targetShortAliasDir, `/${shortAlias}`);
    const countSnapshotDir = rewriteSnapshotAssets(targetSnapshotDir, `/snapshots/${versionTag}`);

    // 4. Write snapshot metadata manifest
    const metaPayload = {
        versionTag: versionTag,
        createdDate: new Date().toISOString(),
        snapshotPath: `/${shortAlias}/`
    };
    fs.writeFileSync(path.join(targetSnapshotDir, 'snapshot-meta.json'), JSON.stringify(metaPayload, null, 2));
    fs.writeFileSync(path.join(targetShortAliasDir, 'snapshot-meta.json'), JSON.stringify(metaPayload, null, 2));

    console.log(`[SnapshotGenerator] ✅ Successfully generated & sealed snapshot:`);
    console.log(`  -> Path: /${shortAlias}/ (Rewrote ${countShortAlias} files to self-contained assets)`);
    console.log(`  -> Path: /snapshots/${versionTag}/ (Rewrote ${countSnapshotDir} files to self-contained assets)`);
} catch (err) {
    console.error(`[SnapshotGenerator] ❌ Failed to generate snapshot:`, err);
    process.exit(1);
}
