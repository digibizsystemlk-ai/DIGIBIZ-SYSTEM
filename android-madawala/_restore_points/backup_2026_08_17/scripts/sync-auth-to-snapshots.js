/**
 * Syncs /auth/ directory into all snapshot vaults so version locked URLs can login seamlessly.
 */
const fs = require('fs');
const path = require('path');

function copyDirRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

const authSrc = path.resolve(__dirname, '../public/auth');
const targets = [
    path.resolve(__dirname, '../public/snapshots/STABLE_FREEZE_2026_08_11/auth'),
    path.resolve(__dirname, '../public/v2026_08_11/auth'),
    path.resolve(__dirname, '../public/v_2026_08_11/auth')
];

for (const target of targets) {
    copyDirRecursive(authSrc, target);
    console.log(`✅ Copied auth directory to: ${target}`);
}

console.log('🎉 Auth sync complete!');
