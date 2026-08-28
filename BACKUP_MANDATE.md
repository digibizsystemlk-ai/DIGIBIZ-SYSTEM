# 🛡️ DIGIBIZ SYSTEM — MANDATORY CLIENT BACKUP VAULT MANDATE

## 📌 Architectural Requirement:
For any client application hosted within `public/clients/<clientId>/`:
1. Whenever `index.html` is modified or updated at any moment:
   - A timestamped snapshot `index.backup_YYYY-MM-DD_HH-mm-ss.html` is saved to `public/clients/<clientId>/backups/`.
   - The backup directory maintains **strictly the 3 most recent backups**.
   - If a 4th backup is created, the oldest backup is automatically pruned (FIFO - First In, First Out).
   - An updated `manifest.json` tracks active backup slots, hashes, and timestamps.
2. Every backup creation and auto-pruning event outputs an announcement to the terminal.

## 🚀 Commands:
- **Run Manual Backup for all clients:**
  ```bash
  npm run backup
  # or: node scripts/backup-client-index.js --all
  ```
- **Run Real-Time Auto-Backup Watcher Guard:**
  ```bash
  npm run watch:backups
  # or: node scripts/client-backup-watcher.js
  ```
