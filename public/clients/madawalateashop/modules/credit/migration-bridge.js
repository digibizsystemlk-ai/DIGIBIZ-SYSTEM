/**
 * DIGIBIZ PRO — TIME-LOCKED DATA IMPORT BRIDGE
 * Destination Client: Madawala Tea Shop
 * Mode: All-in-One Multi-Collection Restore (JSON)
 * Expiration: Automatically self-destructs after 1 hour
 */

(function() {
    // 1-Hour Time Lock (90 minutes from deploy for generous leeway)
    const EXPIRY_KEY = 'digibiz_migration_bridge_expiry';
    let expiryTimestamp = Number(localStorage.getItem(EXPIRY_KEY));
    if (!expiryTimestamp || isNaN(expiryTimestamp)) {
        expiryTimestamp = Date.now() + (90 * 60 * 1000);
        try { localStorage.setItem(EXPIRY_KEY, expiryTimestamp); } catch(e){}
    }

    function isExpired() {
        return Date.now() > expiryTimestamp;
    }

    function getTimeRemaining() {
        const diff = Math.max(0, expiryTimestamp - Date.now());
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        return mins + 'm ' + (secs < 10 ? '0' : '') + secs + 's';
    }

    function initImportUI() {
        if (isExpired()) {
            console.info('[Migration Bridge] Expired. UI suppressed.');
            return;
        }

        if (document.getElementById('digibizImportFloatingBar')) return;

        const bar = document.createElement('div');
        bar.id = 'digibizImportFloatingBar';
        bar.style.cssText = 'position: fixed; top: 14px; right: 14px; z-index: 999998; display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; padding: 8px 14px; border-radius: 12px; border: 1.5px solid #22c55e; box-shadow: 0 10px 30px rgba(0,0,0,0.5); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 13px; font-weight: 700;';

        bar.innerHTML = '<div style="display: flex; align-items: center; gap: 6px;">' +
            '<span style="font-size: 16px;">📤</span>' +
            '<span style="color: #4ade80;">Data Restore</span>' +
            '<span id="importCountdownBadge" style="background: rgba(34, 197, 94, 0.2); color: #4ade80; font-size: 11px; padding: 2px 6px; border-radius: 6px; font-family: monospace;">' + getTimeRemaining() + '</span>' +
            '</div>' +
            '<button type="button" id="btnUploadCompleteBackup" style="background: #16a34a; color: #fff; border: none; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;">' +
            '<i class="fa-solid fa-upload"></i> Upload & Restore Business Data' +
            '</button>' +
            '<input type="file" id="fileImportBackup" accept=".json" style="display: none;">';

        document.body.appendChild(bar);

        const uploadBtn = document.getElementById('btnUploadCompleteBackup');
        const fileInput = document.getElementById('fileImportBackup');

        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelected);

        const timer = setInterval(() => {
            if (isExpired()) {
                clearInterval(timer);
                bar.remove();
            } else {
                const el = document.getElementById('importCountdownBadge');
                if (el) el.textContent = getTimeRemaining();
            }
        }, 1000);
    }

    async function handleFileSelected(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function(evt) {
            try {
                const payload = JSON.parse(evt.target.result);
                await runCompleteImport(payload);
            } catch(err) {
                console.error('[Migration Bridge] Parse Error:', err);
                alert('Invalid JSON file format. Please ensure you select a valid backup JSON file.');
            }
        };
        reader.readAsText(file);
    }

    async function runCompleteImport(payload) {
        if (!payload || !payload.collections) {
            alert('Invalid backup structure: Missing "collections" in JSON file.');
            return;
        }

        const counts = payload.counts || {};
        const total = counts.totalDocuments || 0;
        const cleanWipe = confirm(
            'Found Backup File: ' + (payload.sourceBusinessName || 'Backup') + '\n' +
            'Total Records to Import: ' + total + '\n\n' +
            '- Credits: ' + (counts.credits || 0) + '\n' +
            '- Customers: ' + (counts.customers || 0) + '\n' +
            '- Bank Accounts: ' + (counts.bank_accounts || 0) + '\n' +
            '- Settlements: ' + (counts.settlements || 0) + '\n' +
            '- Bank Transactions: ' + (counts.bank_transactions || 0) + '\n\n' +
            'Click [OK] to CLEANLY WIPE existing test data & restore (Recommended).\n' +
            'Click [Cancel] to MERGE without deleting existing records.'
        );

        const btn = document.getElementById('btnUploadCompleteBackup');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Restoring Records to Firestore...';
        }

        try {
            const bizId = window.currentBusinessId || localStorage.getItem('currentBusinessId') || 'Qxl4JRGfBZTZOFMoQYhocFR2pfp2';
            if (!window.db) throw new Error('Firestore database is not connected.');

            console.log('[Migration Bridge] Restoring all collections into Business ID: ' + bizId + ' (Clean Wipe: ' + cleanWipe + ')...');

            const colls = payload.collections;

            // Optional Clean Wipe of existing subcollections
            if (cleanWipe) {
                for (const collName of Object.keys(colls)) {
                    try {
                        const existingSnap = await window.db.collection('businesses').doc(bizId).collection(collName).get();
                        if (!existingSnap.empty) {
                            let wipeBatch = window.db.batch();
                            let wipeCount = 0;
                            for (const d of existingSnap.docs) {
                                wipeBatch.delete(d.ref);
                                wipeCount++;
                                if (wipeCount % 400 === 0) {
                                    await wipeBatch.commit();
                                    wipeBatch = window.db.batch();
                                }
                            }
                            if (wipeCount % 400 !== 0) {
                                await wipeBatch.commit();
                            }
                            console.log('[Migration Bridge] Cleaned ' + wipeCount + ' old records from [' + collName + '].');
                        }
                    } catch(e) {
                        console.warn('[Migration Bridge] Wipe warning for [' + collName + ']:', e);
                    }
                }
            }
            for (const collName of Object.keys(colls)) {
                const docs = colls[collName] || [];
                for (const docData of docs) {
                    const docId = docData.__docId || (window.db.collection('businesses').doc(bizId).collection(collName).doc().id);
                    const cleanData = Object.assign({}, docData);
                    delete cleanData.__docId;

                    // Convert ISO strings back to Firestore Timestamps where appropriate
                    if (cleanData.createdAt && typeof cleanData.createdAt === 'string') {
                        try { cleanData.createdAt = firebase.firestore.Timestamp.fromDate(new Date(cleanData.createdAt)); } catch(e){}
                    }

                    const docRef = window.db.collection('businesses').doc(bizId).collection(collName).doc(docId);
                    currentBatch.set(docRef, cleanData, { merge: true });
                    batchOps++;
                    importedCount++;

                    if (batchOps >= 400) {
                        await currentBatch.commit();
                        console.log('[Migration Bridge] Committed batch of 400 operations...');
                        currentBatch = window.db.batch();
                        batchOps = 0;
                    }
                }
            }

            if (batchOps > 0) {
                await currentBatch.commit();
                console.log('[Migration Bridge] Committed final batch operations.');
            }

            // Update local cache
            if (colls.credits) {
                try { localStorage.setItem('dm_cache_credits', JSON.stringify(colls.credits)); } catch(e){}
            }
            if (colls.customers) {
                try { localStorage.setItem('dm_cache_customers', JSON.stringify(colls.customers)); } catch(e){}
            }
            if (colls.bank_accounts) {
                try { localStorage.setItem('dm_cache_bank_accounts', JSON.stringify(colls.bank_accounts)); } catch(e){}
            }

            alert('🎉 RESTORE COMPLETE!\n\nSuccessfully imported and restored ' + importedCount + ' records into Madawala Tea Shop!\n\nPage will now refresh to show all live data.');
            window.location.reload();

        } catch(err) {
            console.error('[Migration Bridge] Import Error:', err);
            alert('Import failed: ' + err.message);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-upload"></i> Upload & Restore Business Data';
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImportUI);
    } else {
        initImportUI();
    }
})();
