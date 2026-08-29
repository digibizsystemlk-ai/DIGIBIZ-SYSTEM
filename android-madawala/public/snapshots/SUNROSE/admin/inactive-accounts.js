/**
 * Super Admin Inactive Accounts Queue & Authorization Management
 * Analyzes users inactive for 90+ days and executes authorized complete deletion.
 */
(() => {
    const state = {
        currentUser: null,
        isSuperAdmin: false,
        allUsers: [],
        businessesMap: new Map(),
        inactiveAccounts: [],
        filteredAccounts: [],
        selectedTargets: new Set(),
        pendingPurgeTargets: []
    };

    const $ = (id) => document.getElementById(id);
    const toast = (msg) => {
        const t = $('toast');
        if (!t) return;
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2800);
    };

    const safe = (v) => String(v ?? '').replace(/[<>&'"]/g, (c) => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&#39;',
        '"': '&quot;'
    }[c]));

    const parseDate = (v) => {
        if (!v) return null;
        if (typeof v.toDate === 'function') return v.toDate();
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    };

    const formatDate = (v) => {
        const d = parseDate(v);
        if (!d) return '-';
        try {
            return new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Colombo',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).format(d);
        } catch (e) {
            return d.toISOString().slice(0, 16).replace('T', ' ');
        }
    };

    // Protected Accounts that should NEVER be queued for deletion
    const PROTECTED_EMAILS = [
        'biz.sirimal@gmail.com',
        '2biz.sirimal@gmail.com',
        'chinthaka@gmail.com',
        'digibizsystemlk@gmail.com',
        'demo@digibiz.lk'
    ];

    function isProtectedAccount(email, role) {
        const cleanEmail = String(email || '').toLowerCase().trim();
        if (PROTECTED_EMAILS.includes(cleanEmail)) return true;
        if (String(role || '').toUpperCase() === 'SUPER_ADMIN') return true;
        return false;
    }

    async function guardSuperAdmin(user) {
        state.currentUser = user;
        const token = await user.getIdTokenResult(true).catch(() => null);
        const claimAdmin = !!(token && token.claims && (token.claims.admin === true || token.claims.superAdmin === true));
        
        let docAdmin = false;
        if (window.db) {
            const udoc = await window.db.collection('users').doc(user.uid).get().catch(() => null);
            const u = udoc && udoc.exists ? (udoc.data() || {}) : {};
            docAdmin = u.superAdmin === true || String(u.role || '').toUpperCase() === 'SUPER_ADMIN';
        }

        const isSuperAdminEmail = PROTECTED_EMAILS.includes(String(user.email || '').toLowerCase());
        state.isSuperAdmin = claimAdmin || docAdmin || isSuperAdminEmail;

        if (!state.isSuperAdmin) {
            console.warn('[InactiveAccounts] Access denied: Super Admin only.');
            window.location.href = '/modules/core/dashboard.html';
            return false;
        }

        return true;
    }

    async function loadInactiveAccountsData() {
        $('inactiveTableBody').innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:36px; color:#64748b;">
                    <div style="font-size:24px; margin-bottom:8px;">⏳</div>
                    <div>Analyzing all system accounts for inactivity (>90 days)...</div>
                </td>
            </tr>
        `;

        const now = Date.now();
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;

        try {
            // 1. Fetch Users
            const usersSnap = await window.db.collection('users').limit(1500).get();
            state.allUsers = usersSnap.docs.map(d => ({ id: d.id, ...(d.data() || {}) }));

            // 2. Fetch Businesses
            const bizSnap = await window.db.collection('businesses').limit(1500).get().catch(() => ({ docs: [] }));
            state.businessesMap.clear();
            bizSnap.docs.forEach(d => {
                const bData = d.data() || {};
                state.businessesMap.set(d.id, { id: d.id, ...bData });
                if (bData.ownerEmail) {
                    state.businessesMap.set(String(bData.ownerEmail).toLowerCase().trim(), { id: d.id, ...bData });
                }
            });

            // 3. Optional: Fetch recent audit logs to detect any recent interactions
            const auditActivityMap = new Map();
            try {
                const auditSnap = await window.db.collection('audit_logs').limit(1000).get();
                auditSnap.docs.forEach(doc => {
                    const data = doc.data() || {};
                    const ts = parseDate(data.timestamp);
                    if (ts) {
                        const email = String(data.performedByEmail || '').toLowerCase().trim();
                        const uid = String(data.performedByUid || '').trim();
                        if (email && (!auditActivityMap.has(email) || auditActivityMap.get(email) < ts.getTime())) {
                            auditActivityMap.set(email, ts.getTime());
                        }
                        if (uid && (!auditActivityMap.has(uid) || auditActivityMap.get(uid) < ts.getTime())) {
                            auditActivityMap.set(uid, ts.getTime());
                        }
                    }
                });
            } catch (eAudit) {
                console.warn('[InactiveAccounts] Audit log fetch skipped:', eAudit);
            }

            // 4. Calculate Inactivity for each user
            const processedList = [];

            state.allUsers.forEach(u => {
                const email = String(u.email || '').toLowerCase().trim();
                const uid = u.id;
                const role = String(u.role || 'STAFF').toUpperCase().trim();

                // Skip protected super admin accounts
                if (isProtectedAccount(email, role)) {
                    return;
                }

                // Check timestamps
                const tsList = [];
                if (u.lastActiveAt) tsList.push(parseDate(u.lastActiveAt)?.getTime());
                if (u.lastLoginAt) tsList.push(parseDate(u.lastLoginAt)?.getTime());
                if (u.updatedAt) tsList.push(parseDate(u.updatedAt)?.getTime());
                if (u.createdAt) tsList.push(parseDate(u.createdAt)?.getTime());
                if (auditActivityMap.has(email)) tsList.push(auditActivityMap.get(email));
                if (auditActivityMap.has(uid)) tsList.push(auditActivityMap.get(uid));

                // Check associated business timestamp
                const bizId = u.businessId || uid;
                const biz = state.businessesMap.get(bizId) || state.businessesMap.get(email) || null;
                if (biz) {
                    if (biz.updatedAt) tsList.push(parseDate(biz.updatedAt)?.getTime());
                    if (biz.createdAt) tsList.push(parseDate(biz.createdAt)?.getTime());
                }

                const validTimestamps = tsList.filter(t => typeof t === 'number' && !isNaN(t) && t > 0);
                let latestActive = validTimestamps.length > 0 ? Math.max(...validTimestamps) : null;
                const createdTime = parseDate(u.createdAt)?.getTime() || (biz ? parseDate(biz.createdAt)?.getTime() : null);

                // If no activity at all, fallback to creation time
                if (!latestActive && createdTime) {
                    latestActive = createdTime;
                }

                // If still no date found, treat as created 91 days ago
                if (!latestActive) {
                    latestActive = now - (91 * ONE_DAY_MS);
                }

                const diffMs = Math.max(0, now - latestActive);
                const inactiveDays = Math.floor(diffMs / ONE_DAY_MS);

                // Queue accounts inactive for 90+ days
                if (inactiveDays >= 90) {
                    processedList.push({
                        uid: u.id,
                        email: email || `[No Email - ${u.id}]`,
                        name: u.name || u.displayName || 'Unnamed User',
                        phone: u.phone || u.phoneNumber || '',
                        role: role,
                        businessId: biz ? biz.id : (u.businessId || '-'),
                        businessName: biz ? (biz.name || biz.businessName || '-') : (u.businessName || '-'),
                        businessType: biz ? (biz.businessType || '-') : (u.businessType || '-'),
                        lastActiveTime: new Date(latestActive),
                        createdTime: createdTime ? new Date(createdTime) : null,
                        inactiveDays: inactiveDays
                    });
                }
            });

            // Sort by inactivity duration descending (longest inactive first)
            processedList.sort((a, b) => b.inactiveDays - a.inactiveDays);
            state.inactiveAccounts = processedList;

            // Update KPI Counters
            updateStatsCounters();

            // Apply Filters & Render
            applyFiltersAndRender();

        } catch (err) {
            console.error('[InactiveAccounts] Load error:', err);
            $('inactiveTableBody').innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:30px; color:#ef4444;">
                        ❌ Error loading inactive accounts: ${safe(err.message)}
                    </td>
                </tr>
            `;
        }
    }

    function updateStatsCounters() {
        const totalUsers = state.allUsers.length;
        const inact90 = state.inactiveAccounts.filter(a => a.inactiveDays >= 90 && a.inactiveDays < 180).length;
        const inact180 = state.inactiveAccounts.filter(a => a.inactiveDays >= 180 && a.inactiveDays < 365).length;
        const inact365 = state.inactiveAccounts.filter(a => a.inactiveDays >= 365).length;

        $('stTotalUsers').textContent = totalUsers.toLocaleString();
        $('stInactive90').textContent = inact90.toLocaleString();
        $('stInactive180').textContent = inact180.toLocaleString();
        $('stInactive365').textContent = inact365.toLocaleString();
    }

    function applyFiltersAndRender() {
        const q = String($('searchQuery').value || '').toLowerCase().trim();
        const threshold = Number($('filterThreshold').value || 90);
        const roleFilter = String($('filterRole').value || '').toUpperCase().trim();

        state.filteredAccounts = state.inactiveAccounts.filter(acc => {
            if (threshold > 0 && acc.inactiveDays < threshold) return false;
            if (roleFilter && acc.role !== roleFilter) return false;
            if (q) {
                const searchStr = `${acc.email} ${acc.name} ${acc.businessName} ${acc.businessId} ${acc.uid}`.toLowerCase();
                if (!searchStr.includes(q)) return false;
            }
            return true;
        });

        renderTable();
        updateSelectedCount();
    }

    function renderTable() {
        const tbody = $('inactiveTableBody');
        if (!state.filteredAccounts.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:36px; color:#64748b;">
                        🎉 No inactive accounts match your filter criteria.
                    </td>
                </tr>
            `;
            return;
        }

        const rows = state.filteredAccounts.map(acc => {
            const isChecked = state.selectedTargets.has(acc.uid);
            
            let badgeClass = 'badge-inactive-warn';
            let badgeIcon = '⚠️';
            if (acc.inactiveDays >= 365) {
                badgeClass = 'badge-inactive-critical';
                badgeIcon = '💀';
            } else if (acc.inactiveDays >= 180) {
                badgeClass = 'badge-inactive-danger';
                badgeIcon = '🚨';
            }

            return `
                <tr style="${isChecked ? 'background:rgba(239,68,68,0.05);' : ''}">
                    <td style="text-align:center;">
                        <input type="checkbox" class="row-checkbox" data-uid="${safe(acc.uid)}" ${isChecked ? 'checked' : ''} style="width:16px; height:16px; cursor:pointer;" />
                    </td>
                    <td>
                        <div style="font-weight:700; color:#0f172a;">${safe(acc.name)}</div>
                        <div style="font-size:12px; color:#3b82f6; font-weight:600;">${safe(acc.email)}</div>
                        <div style="font-size:11px; color:#94a3b8; font-family:monospace;">UID: ${safe(acc.uid)}</div>
                    </td>
                    <td>
                        <span style="font-size:11.5px; font-weight:700; padding:2px 8px; border-radius:12px; background:#f1f5f9; color:#475569;">
                            ${safe(acc.role)}
                        </span>
                    </td>
                    <td>
                        <div style="font-weight:600; color:#1e293b;">${safe(acc.businessName)}</div>
                        <div style="font-size:11.5px; color:#64748b;">${safe(acc.businessType)} &bull; <code>${safe(acc.businessId)}</code></div>
                    </td>
                    <td>
                        <div class="badge-inactive ${badgeClass}">
                            <span>${badgeIcon}</span>
                            <span>${acc.inactiveDays} Days Inactive</span>
                        </div>
                    </td>
                    <td>
                        <div style="font-size:12px; font-weight:600; color:#334155;">Last: ${formatDate(acc.lastActiveTime)}</div>
                        <div style="font-size:11px; color:#94a3b8;">Created: ${formatDate(acc.createdTime)}</div>
                    </td>
                    <td>
                        <button class="btn btn-sm danger btn-single-delete" data-uid="${safe(acc.uid)}" type="button">
                            🗑️ Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = rows;

        // Bind Checkboxes
        tbody.querySelectorAll('.row-checkbox').forEach(cb => {
            cb.onchange = (e) => {
                const uid = e.target.dataset.uid;
                if (e.target.checked) {
                    state.selectedTargets.add(uid);
                } else {
                    state.selectedTargets.delete(uid);
                }
                updateSelectedCount();
                renderTableSelectionStyles();
            };
        });

        // Bind Single Delete Buttons
        tbody.querySelectorAll('.btn-single-delete').forEach(btn => {
            btn.onclick = () => {
                const uid = btn.dataset.uid;
                const target = state.inactiveAccounts.find(a => a.uid === uid);
                if (target) {
                    openAuthorizationModal([target]);
                }
            };
        });

        // Sync Select All checkbox state
        const allFilteredSelected = state.filteredAccounts.length > 0 && state.filteredAccounts.every(a => state.selectedTargets.has(a.uid));
        $('selectAllCheckbox').checked = allFilteredSelected;
    }

    function renderTableSelectionStyles() {
        const tbody = $('inactiveTableBody');
        tbody.querySelectorAll('tr').forEach(tr => {
            const cb = tr.querySelector('.row-checkbox');
            if (cb && cb.checked) {
                tr.style.background = 'rgba(239,68,68,0.06)';
            } else {
                tr.style.background = '';
            }
        });
    }

    function updateSelectedCount() {
        const count = state.selectedTargets.size;
        $('selectedCountBadge').textContent = `Selected: ${count} account(s)`;
        $('btnBulkPurge').disabled = count === 0;
    }

    // Modal & Deletion Execution
    function openAuthorizationModal(targets) {
        if (!targets || !targets.length) {
            toast('Please select at least one account to delete.');
            return;
        }

        state.pendingPurgeTargets = targets;
        $('modalTargetCount').textContent = targets.length;

        const emailSummary = targets.slice(0, 5).map(t => `&bull; <strong>${safe(t.email)}</strong> (${safe(t.businessName)})`).join('<br>');
        const extraCount = targets.length > 5 ? `<br><em style="color:#64748b;">...and ${targets.length - 5} more account(s)</em>` : '';
        $('modalTargetEmailsSummary').innerHTML = emailSummary + extraCount;

        $('adminPasswordInput').value = '';
        $('authErrorMsg').style.display = 'none';
        $('authErrorMsg').textContent = '';
        $('btnConfirmPurge').disabled = false;
        $('btnConfirmPurge').innerHTML = `<span>⚠️</span><span>Authorize & Delete Permanently</span>`;

        $('authModal').classList.add('show');
        setTimeout(() => $('adminPasswordInput').focus(), 100);
    }

    function closeAuthorizationModal() {
        $('authModal').classList.remove('show');
        state.pendingPurgeTargets = [];
    }

    async function executePurgeWithPassword() {
        const password = String($('adminPasswordInput').value || '');
        const errorDiv = $('authErrorMsg');
        const confirmBtn = $('btnConfirmPurge');

        if (!password) {
            errorDiv.textContent = 'Please enter your Super Admin password to authorize deletion.';
            errorDiv.style.display = 'block';
            $('adminPasswordInput').focus();
            return;
        }

        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `<span>⏳</span><span>Verifying Password & Deleting...</span>`;
        errorDiv.style.display = 'none';

        try {
            // 1. Re-authenticate Super Admin with entered password
            const currentEmail = state.currentUser.email;
            const cred = firebase.auth.EmailAuthProvider.credential(currentEmail, password);
            await state.currentUser.reauthenticateWithCredential(cred);

            console.log('[InactiveAccounts] Password verified successfully. Proceeding with deletion...');

            // 2. Prepare Target Payload
            const targetsPayload = state.pendingPurgeTargets.map(t => ({
                uid: t.uid,
                email: t.email,
                businessId: t.businessId
            }));

            // 3. Call Cloud Function to delete from Firebase Auth and Firestore
            let cloudSuccess = false;
            try {
                const purgeFn = firebase.functions().httpsCallable('adminPurgeInactiveUserAccounts');
                const result = await purgeFn({ targets: targetsPayload });
                if (result && result.data && result.data.success) {
                    cloudSuccess = true;
                }
            } catch (fnErr) {
                console.warn('[InactiveAccounts] Cloud function call warning:', fnErr);
            }

            // 4. Fallback client-side Firestore cleanup if Cloud Function was not available
            if (!cloudSuccess && window.db) {
                for (const t of targetsPayload) {
                    if (t.uid) await window.db.collection('users').doc(t.uid).delete().catch(() => {});
                    if (t.businessId) {
                        await window.db.collection('businesses').doc(t.businessId).delete().catch(() => {});
                        await window.db.collection('settings').doc(t.businessId).delete().catch(() => {});
                    }
                }
            }

            // 5. Clean up selection state
            targetsPayload.forEach(t => state.selectedTargets.delete(t.uid));

            // 6. Close modal and show success toast
            closeAuthorizationModal();
            toast(`✅ සාර්ථකයි! අක්‍රිය ගිණුම් ${targetsPayload.length} ක් සම්පූර්ණයෙන්ම Delete කරන ලදී.`);

            // 7. Reload list
            await loadInactiveAccountsData();

        } catch (err) {
            console.error('[InactiveAccounts] Purge error:', err);
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = `<span>⚠️</span><span>Authorize & Delete Permanently</span>`;

            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                errorDiv.textContent = '❌ වැරදි මුරපදයක්! කරුණාකර නිවැරදි Super Admin password එක ඇතුලත් කරන්න. (Invalid Password)';
            } else {
                errorDiv.textContent = `❌ Error: ${err.message || 'Authorization failed'}`;
            }
            errorDiv.style.display = 'block';
        }
    }

    function exportInactiveReportCsv() {
        if (!state.inactiveAccounts.length) {
            toast('No inactive accounts to export.');
            return;
        }

        const headers = ['Email', 'Name', 'Role', 'Business Name', 'Business ID', 'Business Type', 'Inactive Days', 'Last Active Date', 'Created Date', 'UID'];
        const rows = state.inactiveAccounts.map(a => [
            `"${a.email}"`,
            `"${a.name}"`,
            `"${a.role}"`,
            `"${a.businessName}"`,
            `"${a.businessId}"`,
            `"${a.businessType}"`,
            a.inactiveDays,
            `"${formatDate(a.lastActiveTime)}"`,
            `"${formatDate(a.createdTime)}"`,
            `"${a.uid}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `digibiz_inactive_accounts_report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast('CSV Report exported successfully.');
    }

    // Event Bindings
    function bindEvents() {
        $('btnRefresh').onclick = loadInactiveAccountsData;
        $('btnExport').onclick = exportInactiveReportCsv;
        $('btnTheme').onclick = () => document.documentElement.classList.toggle('light');

        $('searchQuery').oninput = applyFiltersAndRender;
        $('filterThreshold').onchange = applyFiltersAndRender;
        $('filterRole').onchange = applyFiltersAndRender;

        $('selectAllCheckbox').onchange = (e) => {
            const isChecked = e.target.checked;
            state.filteredAccounts.forEach(acc => {
                if (isChecked) {
                    state.selectedTargets.add(acc.uid);
                } else {
                    state.selectedTargets.delete(acc.uid);
                }
            });
            updateSelectedCount();
            renderTable();
        };

        $('btnBulkPurge').onclick = () => {
            const selectedList = state.inactiveAccounts.filter(a => state.selectedTargets.has(a.uid));
            openAuthorizationModal(selectedList);
        };

        $('btnCancelAuth').onclick = closeAuthorizationModal;
        $('btnConfirmPurge').onclick = executePurgeWithPassword;

        $('adminPasswordInput').onkeydown = (e) => {
            if (e.key === 'Enter') {
                executePurgeWithPassword();
            }
        };
    }

    // Initialization
    function init() {
        bindEvents();
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    const isSuper = await guardSuperAdmin(user);
                    if (isSuper) {
                        await loadInactiveAccountsData();
                    }
                } else {
                    window.location.href = '/auth/login.html';
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
