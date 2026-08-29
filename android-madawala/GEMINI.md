# 🚨 CRITICAL ARCHITECTURAL MANDATES & PRODUCTION SHIELD RULES 🚨

## 1. THE SACRED "STD" (STANDARD PRODUCTION) VAULT RULE:
- **DO NOT DIRECTLY EDIT ANY FILES INSIDE `public/std/` OR `public/snapshots/`!**
- The `public/std/` directory is the **SACRED PRODUCTION VAULT** where active, paying PRO customers (e.g. SPI HOLDINGS / Nadun De Alwis, etc.) run with 100% Zero-Leak Isolation.
- Any manual edits inside `public/std/` will be overwritten and can cause production discrepancies.

## 2. STANDARD DEVELOPMENT WORKFLOW (FOR ALL DEVELOPERS & AI):
- **Step 1 (Develop in Live Master):** ALWAYS develop, edit, and experiment in the **Live Master codebase**:
  - `public/modules/`
  - `public/core/`
  - `public/css/`
  - `public/scripts/`
  - `public/admin/`
  - `public/auth/`
- **Step 2 (Verify on Live):** Test all changes thoroughly in the Live Master environment (`https://digibiz-sys.web.app/modules/...`).
- **Step 3 (Sync to STD):** Only when changes are 100% verified and explicitly approved by the project owner, synchronize them to the standard production vault by running:
  ```bash
  node scripts/sync-std.js
  firebase deploy --only hosting
  ```

## 3. PRO ACCOUNT PROTECTION & ROUTING:
- All paying PRO clients are automatically locked to `versionTag: 'STD'`, `snapshotPath: '/std/'`.
- Demo, Trial, and Free accounts must ALWAYS operate on the Live Master codebase (`/modules/...`).
- `public/core/pwa-init.js` and `public/core/sidebar.js` enforce this isolation. NEVER bypass or break this sandbox boundary.

## 4. MANDATORY CLIENT INDEX 3-BACKUP VAULT POLICY (FIFO RETENTION):
- **Continuous Backup Protection**: Whenever ANY client `index.html` inside `public/clients/<clientId>/` is modified or updated:
  - An instant timestamped backup must be placed inside `public/clients/<clientId>/backups/`.
  - Strictly maintain the **3 most recent backups** (when a 4th backup is added, the oldest must be automatically pruned/deleted).
  - Clear terminal broadcast logs must announce all backup and pruning operations.
  - Run `node scripts/backup-client-index.js --all` or run the real-time background guard `node scripts/client-backup-watcher.js`.

