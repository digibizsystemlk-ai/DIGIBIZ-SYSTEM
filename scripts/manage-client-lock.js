#!/usr/bin/env node
/**
 * DigiBiz Client Lock Manager
 * Usage:
 *   node scripts/manage-client-lock.js list
 *   node scripts/manage-client-lock.js lock <clientId>
 *   node scripts/manage-client-lock.js unlock <clientId>
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.resolve(__dirname, '../config/client-lock-registry.json');

function loadRegistry() {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
}

function saveRegistry(data) {
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2), 'utf8');
}

const args = process.argv.slice(2);
const command = (args[0] || 'list').toLowerCase();
const targetId = args[1];

const reg = loadRegistry();

if (command === 'list') {
    console.log('\n======================================================');
    console.log('       🛡️ DIGIBIZ CLIENT ISOLATION & LOCK STATUS       ');
    console.log('======================================================');
    Object.keys(reg.clients).forEach(id => {
        const c = reg.clients[id];
        const isLocked = c.status === 'PRODUCTION_LOCKED';
        const icon = isLocked ? '🔒 [LOCKED]' : '🔓 [ACTIVE DEV]';
        console.log(`${icon.padEnd(16)} ${id.padEnd(22)} | ${c.businessName} (${c.businessType})`);
    });
    console.log('======================================================\n');
} else if (command === 'lock') {
    if (!targetId || !reg.clients[targetId]) {
        console.error(`❌ Client '${targetId}' not found in registry.`);
        process.exit(1);
    }
    reg.clients[targetId].status = 'PRODUCTION_LOCKED';
    reg.clients[targetId].allowBulkScripts = false;
    reg.clients[targetId].lastLockedAt = new Date().toISOString();
    saveRegistry(reg);
    console.log(`🔒 Client '${targetId}' is now PRODUCTION_LOCKED. Bulk modifications are blocked.`);
} else if (command === 'unlock') {
    if (!targetId || !reg.clients[targetId]) {
        console.error(`❌ Client '${targetId}' not found in registry.`);
        process.exit(1);
    }
    reg.clients[targetId].status = 'ACTIVE_DEV';
    reg.clients[targetId].allowBulkScripts = true;
    reg.clients[targetId].lastUnlockedAt = new Date().toISOString();
    saveRegistry(reg);
    console.log(`🔓 Client '${targetId}' is now ACTIVE_DEV. Explicit targeted edits enabled.`);
} else {
    console.log('Unknown command. Use list, lock, or unlock.');
}
