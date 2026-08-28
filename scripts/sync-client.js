/**
 * DIGIBIZ-SYSTEM — Client Importer & Synchronizer
 * 
 * Usage:
 *   node scripts/sync-client.js <client_name>
 * Example:
 *   node scripts/sync-client.js bawantharandipa
 */

const fs = require('fs');
const path = require('path');

const MASTER_PATH = path.resolve('I:/DIGIBIZ_MASTER/public/clients');
const TARGET_PATH = path.resolve(__dirname, '../public/clients');

const NEW_FIREBASE_CONFIG = `        const firebaseConfig = {
            apiKey: "AIzaSyDz-rTtysyWgt_3PUHG-ar8gS8oN0HTJiI",
            authDomain: "digibiz-system.firebaseapp.com",
            projectId: "digibiz-system",
            storageBucket: "digibiz-system.firebasestorage.app",
            messagingSenderId: "21839180976",
            appId: "1:21839180976:web:cbbeda3ebc061285db7775"
        };`;

const clientName = process.argv[2];

if (!clientName) {
    console.error('❌ Error: Please specify client name.');
    console.log('👉 Usage: node scripts/sync-client.js <client_name>');
    process.exit(1);
}

const srcClientDir = path.join(MASTER_PATH, clientName);
const destClientDir = path.join(TARGET_PATH, clientName);

if (!fs.existsSync(srcClientDir)) {
    console.error(`❌ Error: Source directory does not exist: ${srcClientDir}`);
    process.exit(1);
}

console.log(`🚀 Starting sync for client [${clientName}]...`);

const { backupClientIndex } = require('./backup-client-index');

// Ensure destination exists
if (!fs.existsSync(destClientDir)) {
    fs.mkdirSync(destClientDir, { recursive: true });
} else {
    // 🛡️ Automatic Pre-Sync Backup Vault Trigger
    backupClientIndex(clientName, 'Pre-Sync Backup before Master Overwrite');
}

// Copy files
const files = fs.readdirSync(srcClientDir);
for (const file of files) {
    if (file === '_backup' || file === 'node_modules') continue;
    
    const srcFile = path.join(srcClientDir, file);
    const destFile = path.join(destClientDir, file);

    if (fs.statSync(srcFile).isFile()) {
        let content = fs.readFileSync(srcFile, 'utf8');

        if (file === 'index.html') {
            // Replace Firebase Config with digibiz-system config
            content = content.replace(
                /const firebaseConfig = \{[\s\S]*?\};/,
                NEW_FIREBASE_CONFIG
            );

            // Update any redirects from /auth/login.html to /
            content = content.replace(/window\.location\.href\s*=\s*['"]\/auth\/login\.html['"]/g, "window.location.href = '/'");
        }

        fs.writeFileSync(destFile, content, 'utf8');
        console.log(`  ✓ Synced: ${file}`);
    }
}

// Ensure isolated manifest.json exists
const manifestFile = path.join(destClientDir, 'manifest.json');
if (!fs.existsSync(manifestFile)) {
    const manifestContent = {
        name: `DIGIBIZ ${clientName.toUpperCase()}`,
        short_name: clientName,
        description: `Enterprise Isolated System for ${clientName}`,
        start_url: "./index.html",
        scope: "./",
        display: "standalone",
        background_color: "#0a101d",
        theme_color: "#ff9900"
    };
    fs.writeFileSync(manifestFile, JSON.stringify(manifestContent, null, 2), 'utf8');
    console.log(`  ✓ Created isolated: manifest.json`);
}

// Ensure isolated sw.js exists
const swFile = path.join(destClientDir, 'sw.js');
if (!fs.existsSync(swFile)) {
    const swContent = `// Isolated Scoped Service Worker for ${clientName}
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => e.respondWith(fetch(e.request).catch(() => caches.match(e.request))));
`;
    fs.writeFileSync(swFile, swContent, 'utf8');
    console.log(`  ✓ Created isolated: sw.js`);
}

console.log(`\n🎉 Successfully synced and isolated [${clientName}] inside DIGIBIZ-SYSTEM!`);
