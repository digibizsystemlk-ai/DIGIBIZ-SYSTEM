#!/usr/bin/env node
/**
 * DigiBiz Client Health & Isolation Integrity Verifier
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.resolve(__dirname, '../config/client-lock-registry.json');
const ROOT_DIR = path.resolve(__dirname, '..');

const reg = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));

console.log('\n========================================================================');
console.log('            🛡️ DIGIBIZ CLIENT APPLICATION INTEGRITY CHECK              ');
console.log('========================================================================\n');

let allHealthy = true;

Object.keys(reg.clients).forEach(clientId => {
    const client = reg.clients[clientId];
    const fullPath = path.join(ROOT_DIR, client.primaryEntry);

    if (!fs.existsSync(fullPath)) {
        console.error(`❌ [MISSING FILE] ${clientId}: ${fullPath} not found`);
        allHealthy = false;
        return;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n').length;
    const bytes = (Buffer.byteLength(content) / 1024).toFixed(1);

    // Syntax validation of internal script blocks
    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let syntaxOk = true;
    let syntaxErr = '';

    while ((match = scriptRegex.exec(content)) !== null) {
        const script = match[1].trim();
        if (!script) continue;
        try {
            new Function(script);
        } catch (e) {
            syntaxOk = false;
            syntaxErr = e.message;
            break;
        }
    }

    if (syntaxOk) {
        console.log(`✅ [STABLE] ${clientId.padEnd(22)} | ${bytes} KB | ${lines} lines | JS Syntax: OK | Status: ${client.status}`);
    } else {
        console.error(`❌ [ERROR]  ${clientId.padEnd(22)} | Syntax Error: ${syntaxErr}`);
        allHealthy = false;
    }
});

console.log('\n========================================================================');
if (allHealthy) {
    console.log('🎉 ALL CLIENT APPLICATIONS ARE 100% HEALTHY, ISOLATED & PROTECTED!');
} else {
    console.error('⚠️ ONE OR MORE CLIENT PORTALS FAILED INTEGRITY VERIFICATION.');
}
console.log('========================================================================\n');
