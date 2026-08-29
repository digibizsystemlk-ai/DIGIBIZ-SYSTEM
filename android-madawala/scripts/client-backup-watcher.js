/**
 * DIGIBIZ-SYSTEM — Automated Real-Time Client Index Watcher & Backup Guard
 * 
 * Mandate:
 *   - Watches `public/clients/` directory continuously in real-time.
 *   - Whenever any client `index.html` is edited or updated at any moment:
 *   - Automatically creates an instant backup in `public/clients/<clientId>/backups/`.
 *   - Strictly maintains the 3 most recent backups (auto-pruning the 4th oldest).
 *   - Broadcasts real-time notifications to the console.
 * 
 * Usage:
 *   node scripts/client-backup-watcher.js
 */

const fs = require('fs');
const path = require('path');
const { backupClientIndex, backupAllClients } = require('./backup-client-index');

const CLIENTS_DIR = path.resolve(__dirname, '../public/clients');
const debounceTimers = new Map();

console.log(`\n===============================================================`);
console.log(`🛡️  DIGIBIZ-SYSTEM REAL-TIME CLIENT BACKUP GUARD`);
console.log(`===============================================================`);
console.log(`📂 Watching Path: ${CLIENTS_DIR}`);
console.log(`🎯 Target:       Any client index.html modifications`);
console.log(`📦 Policy:       Strict 3-Backup FIFO Vault Retention`);
console.log(`🕒 Status:       ACTIVE & LISTENING...`);
console.log(`===============================================================\n`);

// 1. Initial baseline check & backup on startup
backupAllClients('Watcher Startup Baseline');

// 2. Watch public/clients recursively
try {
    fs.watch(CLIENTS_DIR, { recursive: true }, (eventType, filename) => {
        if (!filename) return;

        // Normalize path
        const normalized = filename.replace(/\\/g, '/');
        const parts = normalized.split('/');

        // Only trigger on <clientId>/index.html modifications (ignore changes inside backups/)
        if (parts.length >= 2 && parts[1] === 'index.html' && parts[0] !== 'backups' && !normalized.includes('/backups/')) {
            const clientId = parts[0];

            // Debounce to prevent multiple triggers on single save operation
            if (debounceTimers.has(clientId)) {
                clearTimeout(debounceTimers.get(clientId));
            }

            const timer = setTimeout(() => {
                debounceTimers.delete(clientId);
                console.log(`\n⚡ [CHANGE DETECTED] Modification in: public/clients/${clientId}/index.html`);
                backupClientIndex(clientId, 'Real-time Watcher Trigger');
            }, 300);

            debounceTimers.set(clientId, timer);
        }
    });
} catch (err) {
    console.error(`❌ Watcher Error:`, err.message);
}

// Keep process alive
process.on('SIGINT', () => {
    console.log(`\n🛑 Client Backup Watcher stopped safely.`);
    process.exit(0);
});
