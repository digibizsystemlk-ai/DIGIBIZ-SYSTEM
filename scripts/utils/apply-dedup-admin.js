const fs = require('fs');
let content = fs.readFileSync('i:/DIGIBIZ-SYSTEM/public/admin/index.html', 'utf8');

// Define deduplicateClientsList function
const dedupFnCode = `
        function deduplicateClientsList(rawList) {
            const canonicalMap = new Map();

            rawList.forEach(item => {
                if (!item || !item.id) return;
                
                const emailKey = (item.ownerEmail || '').trim().toLowerCase();
                const nameKey = (item.businessName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                const idKey = (item.id || item.clientId || '').trim().toLowerCase();

                let matchKey = null;
                for (const [key, existing] of canonicalMap.entries()) {
                    const exEmail = (existing.ownerEmail || '').trim().toLowerCase();
                    const exName = (existing.businessName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                    const exId = (existing.id || existing.clientId || '').trim().toLowerCase();

                    if (emailKey && exEmail && emailKey === exEmail) {
                        matchKey = key;
                        break;
                    }
                    if (nameKey && exName && nameKey === exName && nameKey.length > 3) {
                        matchKey = key;
                        break;
                    }
                    if (idKey && exId && (idKey === exId || idKey.includes(exId) || exId.includes(idKey))) {
                        matchKey = key;
                        break;
                    }
                }

                if (matchKey) {
                    const existing = canonicalMap.get(matchKey);
                    
                    const isItemUid = item.id.length > 20 && /[A-Z]/.test(item.id) && /[0-9]/.test(item.id);
                    const isExistingUid = existing.id.length > 20 && /[A-Z]/.test(existing.id) && /[0-9]/.test(existing.id);

                    const primaryDoc = (!isItemUid && isExistingUid) ? item : existing;
                    const secondaryDoc = (!isItemUid && isExistingUid) ? existing : item;

                    const mergedAllowedEmails = Array.from(new Set([
                        ...(primaryDoc.allowedEmails || []),
                        ...(secondaryDoc.allowedEmails || []),
                        primaryDoc.ownerEmail,
                        secondaryDoc.ownerEmail
                    ].filter(Boolean)));

                    const mergedDoc = {
                        ...secondaryDoc,
                        ...primaryDoc,
                        id: primaryDoc.id,
                        clientId: primaryDoc.clientId || primaryDoc.id,
                        businessName: primaryDoc.businessName || secondaryDoc.businessName,
                        ownerName: (primaryDoc.ownerName && primaryDoc.ownerName !== '—') ? primaryDoc.ownerName : secondaryDoc.ownerName,
                        phone: primaryDoc.phone || secondaryDoc.phone,
                        ownerEmail: primaryDoc.ownerEmail || secondaryDoc.ownerEmail,
                        allowedEmails: mergedAllowedEmails,
                        rawDocIds: Array.from(new Set([...(primaryDoc.rawDocIds || [primaryDoc.id]), ...(secondaryDoc.rawDocIds || [secondaryDoc.id])]))
                    };

                    canonicalMap.set(matchKey, mergedDoc);
                } else {
                    const primaryKey = emailKey || nameKey || idKey;
                    canonicalMap.set(primaryKey, {
                        ...item,
                        rawDocIds: [item.id]
                    });
                }
            });

            return Array.from(canonicalMap.values());
        }

        async function deleteClientDoc(id, rawDocIdsJson) {
            let ids = [id];
            try {
                if (typeof rawDocIdsJson === 'string') ids = JSON.parse(rawDocIdsJson);
                else if (Array.isArray(rawDocIdsJson)) ids = rawDocIdsJson;
            } catch(e) {}

            if (!confirm('Are you sure you want to remove workspace record "' + id + '" from Firestore database?')) return;
            try {
                for (const dId of ids) {
                    await db.collection('system_clients').doc(dId).delete().catch(() => {});
                    await db.collection('businesses').doc(dId).delete().catch(() => {});
                }
                showToast('Removed record "' + id + '" from database.');
                await loadClientsData();
            } catch (err) {
                alert('Failed to delete: ' + err.message);
            }
        }
`;

// Insert dedupFnCode before loadClientsData
if (!content.includes('function deduplicateClientsList')) {
    content = content.replace('async function loadClientsData() {', dedupFnCode + '\n        async function loadClientsData() {');
}

// Ensure ALL_CLIENTS is deduplicated in loadClientsData
content = content.replace('ALL_CLIENTS.push(customDoc);', 'ALL_CLIENTS.push(customDoc);');
content = content.replace('updateDashboardMetrics(ALL_CLIENTS);\n                renderClientsTable(ALL_CLIENTS);', 'ALL_CLIENTS = deduplicateClientsList(ALL_CLIENTS);\n                updateDashboardMetrics(ALL_CLIENTS);\n                renderClientsTable(ALL_CLIENTS);');

// Ensure realtime updates are deduplicated
content = content.replace(/ALL_CLIENTS\.push\(data\);/g, 'ALL_CLIENTS.push(data); ALL_CLIENTS = deduplicateClientsList(ALL_CLIENTS);');
content = content.replace(/ALL_CLIENTS\.push\(normalized\);/g, 'ALL_CLIENTS.push(normalized); ALL_CLIENTS = deduplicateClientsList(ALL_CLIENTS);');

// Add delete button in table row
const oldEditBtn = `<button class="btn-outline" style="padding:5px 9px; font-size:11px;" onclick="editClient('\\' + c.id + '\\')" title="Edit Business">
                                <i class="fas fa-edit"></i>
                            </button>`;

const newRowBtns = `<button class="btn-outline" style="padding:5px 9px; font-size:11px;" onclick="editClient(\'' + c.id + '\')" title="Edit Business">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-outline" style="padding:5px 9px; font-size:11px; color:#f87171; border-color:rgba(239,68,68,0.3);" onclick="deleteClientDoc(\'' + c.id + '\', \'' + escapeHtml(JSON.stringify(c.rawDocIds || [c.id])) + '\')" title="Delete / Purge Document">
                                <i class="fas fa-trash"></i>
                            </button>`;

content = content.replace(/<button class="btn-outline" style="padding:5px 9px; font-size:11px;" onclick="editClient\('\\' \+ c\.id \+ '\\'\)" title="Edit Business">[\s\S]*?<\/button>/, newRowBtns);

fs.writeFileSync('i:/DIGIBIZ-SYSTEM/public/admin/index.html', content, 'utf8');
console.log('Successfully added deduplication and delete capability to public/admin/index.html!');
