/**
 * Verification script for Snapshot Isolation
 */
const fs = require('fs');
const path = require('path');

const targetDirs = [
    path.join(__dirname, '..', 'public', 'v2026_08_17'),
    path.join(__dirname, '..', 'public', 'snapshots', 'STABLE_FREEZE_2026_08_17')
];

let totalHtmlChecked = 0;
let leaksFound = [];

function checkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            checkDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            totalHtmlChecked++;
            const content = fs.readFileSync(fullPath, 'utf8');

            // Patterns that indicate root live leak
            const leakPatterns = [
                /<script\s+[^>]*src=["']\/(core|scripts|modules)\//i,
                /<link\s+[^>]*href=["']\/(css|core)\//i
            ];

            for (const pattern of leakPatterns) {
                const match = content.match(pattern);
                if (match) {
                    leaksFound.push({ file: fullPath, match: match[0] });
                }
            }
        }
    }
}

targetDirs.forEach(checkDir);

console.log(`\n========================================`);
console.log(`SNAPSHOT ISOLATION VERIFICATION REPORT`);
console.log(`========================================`);
console.log(`Total HTML files scanned: ${totalHtmlChecked}`);
console.log(`Total Root Asset Leaks: ${leaksFound.length}`);

if (leaksFound.length === 0) {
    console.log(`✅ 100% ISOLATED! Zero root script/style leaks detected in snapshot directories.`);
} else {
    console.error(`❌ Leaks found:`);
    leaksFound.forEach(l => console.error(`  ${l.file} -> ${l.match}`));
    process.exit(1);
}
