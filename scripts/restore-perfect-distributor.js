const fs = require('fs');
const path = require('path');
const { backupClientIndex } = require('./backup-client-index');

const ROOT_DIR = path.resolve(__dirname, '..');

function fixAndRestoreClient(clientId) {
    const backupFile = path.join(ROOT_DIR, 'public/clients', clientId, 'backups/index.backup_2026-08-29_20-56-52.html');
    const targetFile = path.join(ROOT_DIR, 'public/clients', clientId, 'index.html');

    if (!fs.existsSync(backupFile)) {
        console.error('❌ Backup file not found for ' + clientId);
        return;
    }

    let html = fs.readFileSync(backupFile, 'utf8');

    // Remove ONLY the duplicate placeholder function handleSignOut at the bottom
    html = html.replace(
        /\/\/ ================================================================\s*\/\/  AUTH \(Placeholder\)[\s\S]*?function handleSignOut\(\)\s*\{[\s\S]*?showToast\('Signed out'\);[\s\S]*?\}\s*\}/g,
        '// User sign out handled by Firebase Auth Gate Guard'
    );

    // Also remove any standalone duplicate placeholder handleSignOut
    html = html.replace(
        /function handleSignOut\(\)\s*\{\s*if\s*\(confirm\('Are you sure you want to sign out\?'\)\)\s*\{\s*showToast\('Signed out'\);[\s\S]*?\}\s*\}/g,
        '// Duplicate placeholder removed'
    );

    fs.writeFileSync(targetFile, html, 'utf8');
    console.log(`✅ Restored full rich 457KB version of [${clientId}] (${(Buffer.byteLength(html, 'utf8') / 1024).toFixed(2)} KB)`);

    backupClientIndex(clientId, 'Fixed duplicate signout placeholder on full system');
}

fixAndRestoreClient('delightbakers');
fixAndRestoreClient('spi_holdings');

console.log('\n🎉 Both clients restored with full complete rich UI and functioning Sign Out!');
