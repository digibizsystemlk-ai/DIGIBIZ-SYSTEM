/**
 * DIGIBIZ-SYSTEM — Automated Client Index Backup & Pruning Engine
 * 
 * Mandate:
 *   - Automatically creates a timestamped backup of `index.html` for any client in `public/clients/<clientId>/`.
 *   - Stores backups inside `public/clients/<clientId>/backups/`.
 *   - Retains strictly the 3 most recent backups (FIFO pruning: deletes the 4th oldest).
 *   - Broadcasts clear announcements for every backup and pruning operation.
 * 
 * Usage:
 *   node scripts/backup-client-index.js <clientId> [reason]
 *   node scripts/backup-client-index.js --all
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CLIENTS_DIR = path.resolve(__dirname, '../public/clients');
const MAX_BACKUPS = 3;

/**
 * Calculates SHA-256 hash of a string or buffer
 */
function getHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Formats date into a filesystem-safe ISO string: YYYY-MM-DD_HH-mm-ss
 */
function getTimestamp() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
    const hr = pad(now.getHours());
    const min = pad(now.getMinutes());
    const sec = pad(now.getSeconds());
    return `${y}-${m}-${d}_${hr}-${min}-${sec}`;
}

/**
 * Backs up a client's index.html file with a strict 3-backup retention limit.
 * 
 * @param {string} clientId - Name of the client folder (e.g. 'sathityrecentre')
 * @param {string} reason - Optional label describing why backup was triggered
 * @returns {object|null} - Details of the backup operation or null if skipped
 */
function backupClientIndex(clientId, reason = 'Auto Backup') {
    const clientDir = path.join(CLIENTS_DIR, clientId);
    const indexFile = path.join(clientDir, 'index.html');
    const backupDir = path.join(clientDir, 'backups');

    if (!fs.existsSync(clientDir) || !fs.statSync(clientDir).isDirectory()) {
        console.warn(`⚠️ [Backup Skipped] Client directory not found: ${clientId}`);
        return null;
    }

    if (!fs.existsSync(indexFile)) {
        console.warn(`⚠️ [Backup Skipped] index.html not found in client: ${clientId}`);
        return null;
    }

    // Ensure backups directory exists
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const currentContent = fs.readFileSync(indexFile, 'utf8');
    const currentHash = getHash(currentContent);

    // Get existing backups sorted by modification time (newest first)
    const existingFiles = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('index.backup_') && f.endsWith('.html'))
        .map(f => {
            const filePath = path.join(backupDir, f);
            const stats = fs.statSync(filePath);
            return {
                name: f,
                path: filePath,
                mtime: stats.mtimeMs,
                size: stats.size
            };
        })
        .sort((a, b) => b.mtime - a.mtime);

    // If the newest existing backup has the identical content, skip creating a duplicate
    if (existingFiles.length > 0) {
        const latestBackupContent = fs.readFileSync(existingFiles[0].path, 'utf8');
        if (getHash(latestBackupContent) === currentHash) {
            console.log(`ℹ️ [Backup Vault] ${clientId}/index.html is identical to latest backup (${existingFiles[0].name}). Skipping duplicate.`);
            return { skipped: true, clientId, reason: 'Identical content' };
        }
    }

    // 1. Create the new backup file
    const timestamp = getTimestamp();
    const backupFileName = `index.backup_${timestamp}.html`;
    const backupFilePath = path.join(backupDir, backupFileName);

    fs.writeFileSync(backupFilePath, currentContent, 'utf8');

    // 2. Announce backup creation
    console.log(`\n===============================================================`);
    console.log(`🛡️  [DIGIBIZ VAULT] BACKUP CREATED FOR CLIENT: [${clientId}]`);
    console.log(`===============================================================`);
    console.log(`📁 File:        ${backupFileName}`);
    console.log(`🕒 Timestamp:   ${new Date().toLocaleString()}`);
    console.log(`📝 Reason:      ${reason}`);
    console.log(`📦 Size:        ${(Buffer.byteLength(currentContent, 'utf8') / 1024).toFixed(2)} KB`);

    // 3. Update the backup list and enforce the strict 3-backup limit (FIFO Pruning)
    const allBackups = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('index.backup_') && f.endsWith('.html'))
        .map(f => {
            const filePath = path.join(backupDir, f);
            return {
                name: f,
                path: filePath,
                mtime: fs.statSync(filePath).mtimeMs
            };
        })
        .sort((a, b) => b.mtime - a.mtime); // Newest first

    const prunedFiles = [];
    if (allBackups.length > MAX_BACKUPS) {
        const toDelete = allBackups.slice(MAX_BACKUPS);
        for (const item of toDelete) {
            fs.unlinkSync(item.path);
            prunedFiles.push(item.name);
            console.log(`🗑️  [Auto-Prune] Deleted oldest backup: ${item.name}`);
        }
    }

    // 4. Update manifest for instant inspection
    const activeBackups = allBackups.slice(0, MAX_BACKUPS);
    const manifest = {
        clientId: clientId,
        maxRetention: MAX_BACKUPS,
        lastBackupAt: new Date().toISOString(),
        activeBackupsCount: activeBackups.length,
        backups: activeBackups.map((b, idx) => ({
            slot: idx + 1,
            fileName: b.name,
            createdAt: new Date(b.mtime).toLocaleString(),
            hash: getHash(fs.readFileSync(b.path, 'utf8'))
        }))
    };

    fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

    console.log(`📊 Active Vault Backups: ${activeBackups.length} / ${MAX_BACKUPS} (Strict FIFO Retention Enforced)`);
    console.log(`===============================================================\n`);

    return {
        clientId,
        backupFileName,
        prunedFiles,
        activeCount: activeBackups.length
    };
}

/**
 * Backs up all client index.html files found in public/clients/
 */
function backupAllClients(reason = 'Global Client Sync') {
    if (!fs.existsSync(CLIENTS_DIR)) {
        console.error(`❌ Clients directory not found: ${CLIENTS_DIR}`);
        return;
    }

    const clients = fs.readdirSync(CLIENTS_DIR)
        .filter(name => !name.startsWith('.') && fs.statSync(path.join(CLIENTS_DIR, name)).isDirectory());

    console.log(`🔍 Found ${clients.length} client workspace(s) in public/clients/...`);

    for (const client of clients) {
        backupClientIndex(client, reason);
    }
}

// Direct Execution CLI handler
if (require.main === module) {
    const arg = process.argv[2];
    const reasonArg = process.argv[3] || 'Manual Trigger';

    if (!arg || arg === '--all') {
        backupAllClients(reasonArg);
    } else {
        backupClientIndex(arg, reasonArg);
    }
}

module.exports = {
    backupClientIndex,
    backupAllClients,
    MAX_BACKUPS
};
