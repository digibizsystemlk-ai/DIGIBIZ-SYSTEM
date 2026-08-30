/**
 * Client Guard & Production Lock Enforcer
 * Prevents automated batch scripts from accidentally mutating locked production client codebases.
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.resolve(__dirname, '../../config/client-lock-registry.json');

function getRegistry() {
    if (!fs.existsSync(REGISTRY_PATH)) {
        return { globalPolicy: { enforceIsolation: true }, clients: {} };
    }
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
}

function isClientLocked(clientId) {
    const reg = getRegistry();
    const client = reg.clients && reg.clients[clientId];
    if (!client) return false;
    return client.status === 'PRODUCTION_LOCKED' || client.allowBulkScripts === false;
}

function getLockedClients() {
    const reg = getRegistry();
    return Object.keys(reg.clients || {}).filter(isClientLocked);
}

function assertClientMutable(clientId, options = {}) {
    if (isClientLocked(clientId) && !options.allowLockedOverride) {
        throw new Error(
            `🛡️ [CLIENT GUARD BLOCKED] Client '${clientId}' is marked as PRODUCTION_LOCKED.\n` +
            `Bulk or automated mutations are strictly prohibited on this client to guarantee stability.\n` +
            `To intentionally modify this client, pass explicit single-target flags: --target=${clientId} --allow-locked-override`
        );
    }
}

function filterMutableClients(clientList, options = {}) {
    return clientList.filter(c => {
        const id = typeof c === 'string' ? c : (c.id || c.clientId);
        if (isClientLocked(id) && !options.allowLockedOverride) {
            console.warn(`🔒 [Client Guard] Skipping locked client: ${id}`);
            return false;
        }
        return true;
    });
}

module.exports = {
    getRegistry,
    isClientLocked,
    getLockedClients,
    assertClientMutable,
    filterMutableClients
};
