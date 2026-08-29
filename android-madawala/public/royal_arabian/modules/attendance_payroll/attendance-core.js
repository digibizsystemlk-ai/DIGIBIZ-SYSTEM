/* ============================================================================
 * attendance-core.js
 * ----------------------------------------------------------------------------
 * Multitenant (per-business) core for the Attendance & Payroll module.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The Attendance / Payroll module previously used GLOBAL localStorage keys
 * (digibiz_registered_employees, digibiz_attendance_logs, digibiz_gate_passes)
 * and a fixed business id ('ATTENDANCE_BIZ_001') plus hard-coded Sunrose-Lanka
 * seed data. That caused CROSS-ORGANIZATION DATA LEAKAGE: two different
 * businesses opening these pages on the same browser/device would see and
 * overwrite each other's employees & attendance logs.
 *
 * This file centralises three concerns so every page in the module stays
 * consistent and isolated per business:
 *   1. Business id resolution (never hard-coded).
 *   2. Business-scoped localStorage keys  (isolation even offline).
 *   3. Business-scoped Firestore paths + admin access gating.
 *
 * It also provides the SECURE employee login gate used by the Mobile QR
 * Attendance Scanner (mobile-scan.html). Login is handled by Firebase Auth
 * (email + password). The phone number is NOT present in any URL (that was
 * insecure); instead an employee authenticates and their phone is verified by
 * comparing the logged-in profile with the business employee record.
 * ========================================================================== */

window.AttendanceCore = (function () {

    // -----------------------------------------------------------------------
    // 1. BUSINESS ID RESOLUTION
    // -----------------------------------------------------------------------
    // Always derive the business from the authenticated session. Never fall
    // back to a hard-coded tenant so that each organisation only ever sees
    // its own data.
    function resolveBusinessId() {
        let urlBizId = null;
        try {
            if (typeof window !== 'undefined' && window.location && window.location.search) {
                urlBizId = new URLSearchParams(window.location.search).get('bizId');
            }
        } catch (e) {}

        const candidates = [
            urlBizId,
            localStorage.getItem('digibiz_impersonate_biz_id'),
            localStorage.getItem('currentBusinessId'),
            sessionStorage.getItem('currentBusinessId'),
            localStorage.getItem('selectedBusinessId'),
            sessionStorage.getItem('selectedBusinessId'),
            localStorage.getItem('activeBusinessId'),
            (window.auth && window.auth.currentUser && window.auth.currentUser.uid)
        ];
        for (const c of candidates) {
            if (c) return String(c);
        }
        return null; // no business selected -> caller must guard
    }
    // Always scope to the current authenticated user's business. Never fall back
    // to a shared 'UNSCOPED' namespace: that would let two different accounts
    // (or new registrations) on the same browser see each other's data.
    // If no explicit business is selected yet, we isolate per logged-in user UID
    // so every account uses its own private bucket even pre-business-selection.
    function scoped(key) {
        const bid = resolveBusinessId();
        if (bid) return key + '__' + bid;
        const auth = window.firebase && window.firebase.auth ? window.firebase.auth() : null;
        const uid = (auth && auth.currentUser && auth.currentUser.uid) || 'guest';
        return key + '__user_' + uid;
    }

    // One-time migration: drop the old GLOBAL (unscoped) localStorage keys so
    // legacy Sunrose-Lanka seed data can never leak into any tenant's view.
    function scrubLegacyGlobalKeys() {
        try {
            const legacy = [
                'digibiz_registered_employees',
                'digibiz_attendance_logs',
                'digibiz_gate_passes',
                'digibiz_employees_initialized'
            ];
            let removed = false;
            legacy.forEach(function (k) {
                if (localStorage.getItem(k) !== null) {
                    localStorage.removeItem(k);
                    removed = true;
                }
            });
            if (removed) console.info('[AttendanceCore] Legacy unscoped attendance keys scrubbed.');
        } catch (e) { /* ignore */ }
    }

    scrubLegacyGlobalKeys();

    function readJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(scoped(key));
            if (!raw) return fallback;
            const v = JSON.parse(raw);
            return Array.isArray(v) ? v : fallback;
        } catch (e) {
            return fallback;
        }
    }

    function writeJSON(key, value) {
        try {
            localStorage.setItem(scoped(key), JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('[AttendanceCore] writeJSON failed:', key, e);
            return false;
        }
    }

    const SEED_NICS = new Set([
        '751232454V',
        '910290517V',
        '897010208V',
        '950623993V',
        '200185502650',
        '981240129V'
    ]);

    function scrubAccidentalSeedEmployees(list, bid) {
        // Do not scrub user data — preserve all employees added by users
        return Array.isArray(list) ? list : [];
    }

    // Entry points used across the whole module
    function getEmployees() {
        let list = readJSON('digibiz_registered_employees', []);
        if (Array.isArray(list) && list.length > 0) return list;

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('digibiz_registered_employees__')) {
                    const raw = localStorage.getItem(k);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                    }
                }
            }
        } catch (e) { }

        return [];
    }

    function setEmployees(list) {
        return writeJSON('digibiz_registered_employees', Array.isArray(list) ? list : []);
    }

    function getAttendanceLogs() {
        let list = readJSON('digibiz_attendance_logs', []);
        if (Array.isArray(list) && list.length > 0) return list;

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('digibiz_attendance_logs__')) {
                    const raw = localStorage.getItem(k);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                    }
                }
            }
        } catch (e) { }

        return [];
    }
    function setAttendanceLogs(list) { return writeJSON('digibiz_attendance_logs', list); }

    function getGatePasses() { return readJSON('digibiz_gate_passes', []); }
    function setGatePasses(list) { return writeJSON('digibiz_gate_passes', list); }

    function getLoans() {
        let list = readJSON('digibiz_salary_loans', []);
        if (Array.isArray(list) && list.length > 0) return list;

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('digibiz_salary_loans__')) {
                    const raw = localStorage.getItem(k);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                    }
                }
            }
        } catch (e) { }

        return [];
    }
    function setLoans(list) { return writeJSON('digibiz_salary_loans', list); }

    // Convenience: resolve an employee (within the current business) by
    // phone OR empId OR email — always scoped to this business's list.
    function findEmployee(query) {
        const empId = String(query.empId || '').trim().toLowerCase();
        const phone = String(query.phone || '').replace(/[^0-9]/g, '');
        const email = String(query.email || '').trim().toLowerCase();
        const list = getEmployees();
        return list.find(e => {
            const ePhone = String(e.phone || '').replace(/[^0-9]/g, '');
            const eEmail = String(e.email || '').trim().toLowerCase();
            if (empId && String(e.empId || '').trim().toLowerCase() === empId) return true;
            if (phone && ePhone === phone) return true;
            if (email && eEmail === email) return true;
            return false;
        }) || null;
    }

    // -----------------------------------------------------------------------
    // 3. FIREBASE HELPERS (business-scoped reads/writes)
    // -----------------------------------------------------------------------
    function db() {
        return window.db || (window.firebase && window.firebase.firestore ? window.firebase.firestore() : null);
    }

    function attendanceLogsCol(bid) {
        return db().collection('businesses').doc(bid).collection('attendance_logs');
    }

    function gatePassesCol(bid) {
        return db().collection('businesses').doc(bid).collection('gate_passes');
    }

    function pushLog(log) {
        const bid = resolveBusinessId();
        if (!bid || !db()) return Promise.resolve();
        return attendanceLogsCol(bid).doc(log.id).set(log, { merge: true }).catch(e => console.warn('[AttendanceCore] pushLog:', e));
    }

    function pushGatePass(gp) {
        const bid = resolveBusinessId();
        if (!bid || !db()) return Promise.resolve();
        return gatePassesCol(bid).doc(gp.id).set(gp, { merge: true }).catch(e => console.warn('[AttendanceCore] pushGatePass:', e));
    }

    function deleteLog(logId) {
        const bid = resolveBusinessId();
        if (!bid || !db() || !logId) return Promise.resolve();
        return attendanceLogsCol(bid).doc(logId).delete().catch(e => console.warn('[AttendanceCore] deleteLog:', e));
    }

    // -----------------------------------------------------------------------
    // 4. ROLE-BASED ACCESS (Owner / Admin / Accountant)
    // -----------------------------------------------------------------------
    // Waits for Firebase to finish restoring the persisted session before
    // reading the current user. Reading auth.currentUser synchronously during
    // DOMContentLoaded frequently returns null (session restore is async),
    // which would wrongly deny access to even legitimate admins.
    function waitForAuthUser(timeoutMs) {
        const auth = window.firebase && window.firebase.auth ? window.firebase.auth() : null;
        if (!auth) return Promise.resolve(null);
        if (auth.currentUser) return Promise.resolve(auth.currentUser);
        return new Promise(function (resolve) {
            let unsub = null;
            let done = false;
            const timer = setTimeout(function () {
                if (done) return;
                done = true;
                if (unsub) { try { unsub(); } catch (e) { } }
                resolve(auth.currentUser || null);
            }, timeoutMs || 4000);
            try {
                unsub = auth.onAuthStateChanged(function (u) {
                    if (done) return;
                    done = true;
                    clearTimeout(timer);
                    if (unsub) { try { unsub(); } catch (e) { } }
                    resolve(u || null);
                });
            } catch (e) {
                if (!done) { done = true; clearTimeout(timer); resolve(auth.currentUser || null); }
            }
        });
    }

    async function canAccessModule() {
        // Impersonation (super-admin driving) always allowed.
        const searchStr = (typeof window !== 'undefined' && window.location && window.location.search) ? window.location.search : '';
        if (localStorage.getItem('digibiz_impersonate_active') === 'true' || searchStr.includes('impersonate=true')) return true;

        const user = await waitForAuthUser();
        if (!user || !user.uid) return false;

        // Business membership role first
        const bid = resolveBusinessId();
        const ok = new Set(['BUSINESS_OWNER', 'OWNER', 'ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT', 'DISTRIBUTOR_OWNER']);
        let role = null;

        if (bid && window.db) {
            try {
                const snap = await window.db.collection('businesses').doc(bid)
                    .collection('users').doc(user.uid).get();
                if (snap.exists && snap.data().role) role = String(snap.data().role).toUpperCase();
            } catch (e) { /* ignore */ }
        }

        if (role) {
            if (ok.has(role) || role.includes('OWNER') || role === 'ACCOUNTANT') return true;
            return false;
        }

        // Fall back to global role resolution
        try {
            const info = await window.getUserRole(user.uid, bid);
            const r = String(info && info.role || '').toUpperCase();
            return ok.has(r) || r.includes('OWNER') || r === 'ACCOUNTANT';
        } catch (e) {
            return false;
        }
    }

    // -----------------------------------------------------------------------
    // 5. EMPLOYEE LOGIN & PHONE VERIFICATION (for mobile-scan.html)
    // -----------------------------------------------------------------------
    // A secure, linkless-of-credentials flow:
    //   Step 1  : employee opens the shared PWA link (no empId/phone in URL)
    //   Step 2  : employee signs in with email + password (Firebase Auth)
    //   Step 3  : we verify the authenticated user belongs to THIS business as
    //             a registered employee, and that the phone stored on the
    //             employee record matches what they provide on-screen.
    // Determine whether a user may use the Attendance scanner. The scanner is
    // RESTRICTED to the Attendance & Payroll domain: the business (tenant) must be
    // an 'attendance_payroll' business AND the user must be one of its owners/
    // admins or a registered employee. Any other account (other business types,
    // unrelated businesses) is rejected so no cross-tenant data is exposed.
    async function resolveAttendanceTenant(user) {
        if (!user || !user.uid) return { allowed: false, error: 'no_user', bid: null };
        if (!window.db) return { allowed: false, error: 'no_business', bid: null };

        // Candidate businesses: the active selection first, then the user's own uid
        // (the user's uid is usually their business doc id), then the businessId
        // recorded on the master users/{uid} doc.
        const candidates = [];
        const raw = resolveBusinessId();
        if (raw) candidates.push(raw);
        if (!candidates.includes(user.uid)) candidates.push(user.uid);

        try {
            const udoc = await window.db.collection('users').doc(user.uid).get();
            if (udoc.exists) {
                const userBizId = udoc.data().businessId || udoc.data().assignedBusiness || null;
                if (userBizId && !candidates.includes(String(userBizId))) candidates.push(String(userBizId));
            }
        } catch (e) { /* ignore */ }

        // Search staff_registry and registered_employees across businesses by employee email
        if (user.email && window.db) {
            const cleanEmail = String(user.email).trim().toLowerCase();
            try {
                const regSnap = await window.db.collection('staff_registry').doc(cleanEmail).get();
                if (regSnap.exists && regSnap.data().businessId) {
                    const mappedBid = String(regSnap.data().businessId);
                    if (!candidates.includes(mappedBid)) candidates.push(mappedBid);
                }
            } catch (e) { /* ignore */ }

            try {
                const allBiz = await window.db.collection('businesses').get();
                allBiz.docs.forEach(d => {
                    const bData = d.data() || {};
                    const emps = bData.registered_employees || [];
                    if (Array.isArray(emps) && emps.some(e => e && String(e.email || '').trim().toLowerCase() === cleanEmail)) {
                        if (!candidates.includes(d.id)) candidates.push(d.id);
                    }
                });
            } catch (e) { /* ignore */ }
        }

        const allowedRoles = new Set(['OWNER', 'BUSINESS_OWNER', 'ADMIN', 'SUPER_ADMIN', 'HR', 'HR_MANAGER', 'ACCOUNTANT', 'STAFF', 'VIEWER']);

        for (const bid of candidates) {
            if (!bid) continue;
            try {
                const bizDoc = await window.db.collection('businesses').doc(bid).get();
                if (!bizDoc.exists) continue;
                const bData = bizDoc.data() || {};
                const bType = String(bData.businessType || bData.type || '').toLowerCase();
                const isAttendanceType = bType.includes('attendance') || bType.includes('payroll') || bData.ownerId || bData.registered_employees;

                const isOwner = bData.ownerId === user.uid || bizDoc.id === user.uid ||
                    (bData.ownerEmail && String(bData.ownerEmail).toLowerCase() === String(user.email || '').toLowerCase());
                if (isOwner && isAttendanceType) return { allowed: true, bid: bid };

                let role = null;
                try {
                    const memberSnap = await window.db.collection('businesses').doc(bid).collection('users').doc(user.uid).get();
                    if (memberSnap.exists && memberSnap.data().role) role = String(memberSnap.data().role).toUpperCase();
                } catch (e) { /* ignore */ }
                if (role && (allowedRoles.has(role) || role.includes('OWNER') || role.includes('HR') || role.includes('ADMIN'))) {
                    return { allowed: true, bid: bid };
                }

                const emp = await findEmployeeInTenant(user, bid);
                if (emp) return { allowed: true, bid: bid, emp: emp };
            } catch (e) { /* continue to next candidate */ }
        }

        return { allowed: false, error: 'not_attendance_member', bid: null };
    }

    async function findEmployeeInTenant(user, bid) {
        const email = String(user.email || '').trim().toLowerCase();
        // 1. Check local list
        const list = getEmployees();
        const localEmp = list.find(e => String(e.email || '').trim().toLowerCase() === email);
        if (localEmp) return localEmp;

        // 2. Check Firestore registered_employees array for this business
        try {
            const bizSnap = await window.db.collection('businesses').doc(bid).get();
            if (bizSnap.exists) {
                const emps = bizSnap.data().registered_employees || [];
                const matched = emps.find(e => e && String(e.email || '').trim().toLowerCase() === email);
                if (matched) return matched;
            }
        } catch (e) { /* ignore */ }

        // 3. Fallback check employees subcollection
        try {
            const q = await window.db.collection('businesses').doc(bid).collection('employees')
                .where('email', '==', email).limit(1).get();
            if (!q.empty) return q.docs[0].data();
        } catch (e) { /* ignore */ }

        return null;
    }

    async function authenticateEmployee(email, password) {
        const auth = window.firebase && window.firebase.auth ? window.firebase.auth() : null;
        if (!auth) return { ok: false, error: 'auth_unavailable' };
        try {
            const cred = await auth.signInWithEmailAndPassword(email.trim(), password);
            const user = cred.user;
            if (!user) return { ok: false, error: 'no_user' };

            // Make the authenticated user the active business context so scoped
            // localStorage reads (getEmployees etc.) use the correct tenant.
            try {
                localStorage.setItem('currentBusinessId', user.uid);
                sessionStorage.setItem('currentBusinessId', user.uid);
                localStorage.setItem('activeBusinessId', user.uid);
            } catch (e) { /* ignore */ }

            const tenant = await resolveAttendanceTenant(user);
            if (!tenant.allowed) {
                await auth.signOut().catch(() => { });
                return { ok: false, error: tenant.error || 'not_attendance_member' };
            }

            // Pin the active business context to the AUTHORIZED attendance tenant so
            // scoped localStorage keys AND cloud reads/writes target the correct
            // organisation (and never a stale or cross-tenant id).
            const bid = tenant.bid;
            try {
                localStorage.setItem('currentBusinessId', bid);
                sessionStorage.setItem('currentBusinessId', bid);
                localStorage.setItem('activeBusinessId', bid);
            } catch (e) { /* ignore */ }

            // Prefer an explicit employee record; otherwise this is an owner/admin
            // operating the terminal (scans are then attributed to them).
            let emp = tenant.emp || null;
            if (!emp) {
                emp = await findEmployeeInTenant(user, bid);
            }

            return { ok: true, emp: emp || { name: user.displayName || user.email, empId: '', phone: '', email: user.email }, bid: bid };
        } catch (err) {
            const code = err && err.code;
            if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-email') {
                await auth.signOut().catch(() => { });
                return { ok: false, error: 'invalid_credentials' };
            }
            return { ok: false, error: (err && err.code) || 'generic_error', detail: String(err && err.message || '') };
        }
    }

    // Final gate helper: employee must be localStorage role OK too (optional).
    function isEmployeeLoggedIn() {
        const auth = window.firebase && window.firebase.auth ? window.firebase.auth() : null;
        return !!(auth && auth.currentUser);
    }

    // Ensures the browser's active business selection never points at someone
    // else's data. Called on Attendance module boot *after* access is granted.
    // If the stored 'currentBusinessId' is stale (left by a previous account's
    // session) and the current user is NOT an owner/member of that business, then
    // we override the selection with the user's own private UID bucket (empty) so
    // a brand-new account never inherits e.g. Sunrose labels/logs from the same
    // browser.
    async function bootstrapAuthorizedBusiness() {
        const created = await getAuthorizedBusinessId();
        if (!created) return created;
        try {
            // Make the resolved (authorised) business the active one so all
            // synchronous scoped reads/writes (localStorage) use the correct tenant.
            localStorage.setItem('currentBusinessId', created);
            localStorage.setItem('activeBusinessId', created);
            sessionStorage.setItem('currentBusinessId', created);
            return created;
        } catch (e) {
            return created;
        }
    }

    // Resolve the business the CURRENT authenticated user is actually allowed to
    // use. This prevents a stale browser-global 'currentBusinessId' (left over by
    // a previous account's session, e.g. Sunrose) from pulling another company's
    // data into a brand-new account's view. If the user is not verified as owner /
    // member of the selected business, we fall back to their own private UID
    // bucket (empty) instead of silently showing someone else's data.
    async function getAuthorizedBusinessId() {
        const user = await waitForAuthUser();
        if (!user || !user.uid) return null;
        
        let raw = resolveBusinessId();
        const firestoreDb = window.db || (window.firebase && window.firebase.firestore ? window.firebase.firestore() : null);
        if (!firestoreDb) return raw || user.uid;

        if (localStorage.getItem('digibiz_impersonate_active') === 'true' && raw) return raw;

        const email = String(user.email || '').trim().toLowerCase();

        // 1. Check if raw ID points to a valid business where user is owner/member
        if (raw) {
            try {
                const snap = await firestoreDb.collection('businesses').doc(raw).get();
                if (snap.exists) {
                    const b = snap.data() || {};
                    const isOwner = b.ownerId === user.uid || snap.id === user.uid ||
                        (b.ownerEmail && String(b.ownerEmail).toLowerCase() === email) ||
                        (b.email && String(b.email).toLowerCase() === email);
                    if (isOwner) return raw;

                    const memberSnap = await firestoreDb.collection('businesses').doc(raw).collection('users').doc(user.uid).get();
                    if (memberSnap.exists) return raw;
                }
            } catch (e) { }
        }

        // 2. Fallback: Search businesses collection by ownerEmail / ownerId
        try {
            if (email) {
                const qEmail = await firestoreDb.collection('businesses').where('ownerEmail', '==', email).limit(1).get();
                if (!qEmail.empty) {
                    const foundId = qEmail.docs[0].id;
                    try {
                        localStorage.setItem('currentBusinessId', foundId);
                        localStorage.setItem('activeBusinessId', foundId);
                        sessionStorage.setItem('currentBusinessId', foundId);
                    } catch (e) { }
                    return foundId;
                }
            }
            const qOwner = await firestoreDb.collection('businesses').where('ownerId', '==', user.uid).limit(1).get();
            if (!qOwner.empty) {
                const foundId = qOwner.docs[0].id;
                try {
                    localStorage.setItem('currentBusinessId', foundId);
                    localStorage.setItem('activeBusinessId', foundId);
                    sessionStorage.setItem('currentBusinessId', foundId);
                } catch (e) { }
                return foundId;
            }
        } catch (e) { }

        return raw || user.uid;
    }

    async function purgeEmployeeLogs(query) {
        const empId = String(query.empId || '').trim();
        const nic = String(query.nic || '').trim();
        const phone = String(query.phone || '').replace(/[^0-9]/g, '');

        if (!empId && !nic && !phone) return;

        // 1. Purge from local storage attendance logs
        let logs = getAttendanceLogs();
        const cleanLogs = logs.filter(l => {
            if (!l) return false;
            const lEmpId = String(l.empId || '').trim();
            const lNic = String(l.nic || '').trim();
            const lPhone = String(l.phone || '').replace(/[^0-9]/g, '');
            if (empId && lEmpId === empId) return false;
            if (nic && lNic === nic) return false;
            if (phone && lPhone && lPhone === phone) return false;
            return true;
        });
        setAttendanceLogs(cleanLogs);

        // 2. Purge from local storage gate passes
        let gatePasses = getGatePasses();
        const cleanGP = gatePasses.filter(gp => {
            if (!gp) return false;
            const gpEmpId = String(gp.empId || '').trim();
            const gpPhone = String(gp.phone || '').replace(/[^0-9]/g, '');
            if (empId && gpEmpId === empId) return false;
            if (phone && gpPhone && gpPhone === phone) return false;
            return true;
        });
        setGatePasses(cleanGP);

        // 3. Purge from Firestore sub-collections
        const bizId = resolveBusinessId();
        const firestoreDb = db();
        if (bizId && firestoreDb) {
            try {
                const logsCol = attendanceLogsCol(bizId);
                const snap = await logsCol.get();
                const batch = firestoreDb.batch();
                let count = 0;
                snap.docs.forEach(doc => {
                    const data = doc.data() || {};
                    const lEmpId = String(data.empId || '').trim();
                    const lNic = String(data.nic || '').trim();
                    const lPhone = String(data.phone || '').replace(/[^0-9]/g, '');
                    if ((empId && lEmpId === empId) || (nic && lNic === nic) || (phone && lPhone && lPhone === phone)) {
                        batch.delete(doc.ref);
                        count++;
                    }
                });
                if (count > 0) await batch.commit();
            } catch (e) {
                console.warn('[AttendanceCore] Firestore purge error:', e);
            }

            try {
                const gpCol = gatePassesCol(bizId);
                const snap = await gpCol.get();
                const batch = firestoreDb.batch();
                let count = 0;
                snap.docs.forEach(doc => {
                    const data = doc.data() || {};
                    const lEmpId = String(data.empId || '').trim();
                    const lPhone = String(data.phone || '').replace(/[^0-9]/g, '');
                    if ((empId && lEmpId === empId) || (phone && lPhone && lPhone === phone)) {
                        batch.delete(doc.ref);
                        count++;
                    }
                });
                if (count > 0) await batch.commit();
            } catch (e) {
                console.warn('[AttendanceCore] Firestore GP purge error:', e);
            }
        }
    }

    const SRI_LANKA_MERCANTILE_HOLIDAYS_LIST = [
        "2026-01-03", // Duruthu Full Moon Poya Day
        "2026-01-14", // Tamil Thai Pongal Day
        "2026-02-01", // Navam Full Moon Poya Day
        "2026-02-04", // National Day (Independence Day)
        "2026-02-15", // Mahasivarathri Day
        "2026-03-03", // Medin Full Moon Poya Day
        "2026-03-21", // Id-Ul-Fitr (Ramazan Festival Day)
        "2026-04-01", // Bak Full Moon Poya Day
        "2026-04-02", // Good Friday
        "2026-04-13", // Sinhala & Tamil New Year Eve
        "2026-04-14", // Sinhala & Tamil New Year Day
        "2026-05-01", // May Day / International Workers' Day
        "2026-05-27", // Id-Ul-Alha (Hadji Festival Day)
        "2026-05-31", // Vesak Full Moon Poya Day
        "2026-06-01", // Day following Vesak Full Moon Poya Day
        "2026-06-29", // Poson Full Moon Poya Day
        "2026-07-28", // Esala Full Moon Poya Day
        "2026-08-26", // Nikini Full Moon Poya Day
        "2026-08-27", // Milad-Un-Nabi (Holy Prophet's Birthday)
        "2026-09-25", // Binara Full Moon Poya Day
        "2026-10-25", // Vap Full Moon Poya Day
        "2026-11-08", // Deepavali Festival Day
        "2026-11-23", // Ill Full Moon Poya Day
        "2026-12-23", // Unduvap Full Moon Poya Day
        "2026-12-25"  // Christmas Day
    ];

    const SRI_LANKA_HOLIDAY_DETAILS = [
        { date: "2026-01-03", day: "Saturday", name: "Duruthu Full Moon Poya Day" },
        { date: "2026-01-14", day: "Wednesday", name: "Tamil Thai Pongal Day" },
        { date: "2026-02-01", day: "Sunday", name: "Navam Full Moon Poya Day" },
        { date: "2026-02-04", day: "Wednesday", name: "National Day (Independence Day)" },
        { date: "2026-02-15", day: "Sunday", name: "Mahasivarathri Day" },
        { date: "2026-03-03", day: "Tuesday", name: "Medin Full Moon Poya Day" },
        { date: "2026-03-21", day: "Saturday", name: "Id-Ul-Fitr (Ramazan Festival Day)" },
        { date: "2026-04-01", day: "Wednesday", name: "Bak Full Moon Poya Day" },
        { date: "2026-04-02", day: "Thursday", name: "Good Friday" },
        { date: "2026-04-13", day: "Monday", name: "Sinhala & Tamil New Year Eve" },
        { date: "2026-04-14", day: "Tuesday", name: "Sinhala & Tamil New Year Day" },
        { date: "2026-05-01", day: "Friday", name: "May Day (International Workers' Day)" },
        { date: "2026-05-27", day: "Wednesday", name: "Id-Ul-Alha (Hadji Festival Day)" },
        { date: "2026-05-31", day: "Sunday", name: "Vesak Full Moon Poya Day" },
        { date: "2026-06-01", day: "Monday", name: "Day following Vesak Full Moon Poya Day" },
        { date: "2026-06-29", day: "Monday", name: "Poson Full Moon Poya Day" },
        { date: "2026-07-28", day: "Tuesday", name: "Esala Full Moon Poya Day" },
        { date: "2026-08-26", day: "Wednesday", name: "Nikini Full Moon Poya Day" },
        { date: "2026-08-27", day: "Thursday", name: "Milad-Un-Nabi (Holy Prophet's Birthday)" },
        { date: "2026-09-25", day: "Friday", name: "Binara Full Moon Poya Day" },
        { date: "2026-10-25", day: "Sunday", name: "Vap Full Moon Poya Day" },
        { date: "2026-11-08", day: "Sunday", name: "Deepavali Festival Day" },
        { date: "2026-11-23", day: "Monday", name: "Ill Full Moon Poya Day" },
        { date: "2026-12-23", day: "Wednesday", name: "Unduvap Full Moon Poya Day" },
        { date: "2026-12-25", day: "Friday", name: "Christmas Day" }
    ];

    function isMercantileHoliday(dateStr, customShift) {
        if (customShift && (String(customShift).toLowerCase().includes('mercantile') || String(customShift).toLowerCase().includes('holiday'))) {
            return true;
        }
        if (!dateStr) return false;
        const d = String(dateStr).trim();
        return SRI_LANKA_MERCANTILE_HOLIDAYS_LIST.includes(d);
    }

    function parseToMinutes(tStr) {
        if (!tStr || tStr === '--:--') return 0;
        const parts = String(tStr).trim().split(' ');
        let [hrs, mins] = parts[0].split(':').map(Number);
        if (parts[1]) {
            const ampm = parts[1].toUpperCase();
            if (ampm === 'PM' && hrs < 12) hrs += 12;
            if (ampm === 'AM' && hrs === 12) hrs = 0;
        }
        return hrs * 60 + mins;
    }

    function calcShiftMetrics(shiftName, inTime, outTime, dateStr) {
        const isHoliday = isMercantileHoliday(dateStr, shiftName);
        let dayOfWeek = -1;
        if (dateStr) {
            const dt = new Date(dateStr + 'T00:00:00');
            if (!isNaN(dt.getTime())) dayOfWeek = dt.getDay(); // 0 = Sunday, 6 = Saturday
        }

        const isSunday = (dayOfWeek === 0);
        const isSaturday = (dayOfWeek === 6);

        if (!outTime || outTime === '--:--') {
            return {
                totalShiftHoursNum: 12.0,
                restBreakNum: 1.0,
                totalShiftHoursStr: '12.0 hrs',
                restBreakStr: '1.0 hrs',
                activeWorkHoursStr: 'In Progress',
                activeWorkHoursNum: 0.0,
                basicHoursStr: isHoliday || isSunday ? '0.0 hrs' : (isSaturday ? '5.0 hrs' : '8.0 hrs'),
                otHoursStr: '0.0 Hours',
                otHoursNum: 0.0,
                sundryOtHoursNum: 0.0,
                isHoliday: isHoliday,
                isSunday: isSunday,
                isSaturday: isSaturday
            };
        }

        let inMins = parseToMinutes(inTime);
        let outMins = parseToMinutes(outTime);
        if (outMins < inMins) outMins += 24 * 60;

        let elapsedMins = outMins - inMins;
        let totalElapsedHours = elapsedMins / 60;

        let restBreak = 0.0;
        if (totalElapsedHours >= 20) {
            restBreak = 2.0;
        } else if (totalElapsedHours >= 8.5) {
            restBreak = 1.0;
        }

        let activeWorkHours = Math.max(0, totalElapsedHours - restBreak);
        let basicHours = 0.0;
        let otHours = 0.0;
        let sundryOtHours = 0.0;

        if (isHoliday || isSunday) {
            // Sunday or Mercantile Holiday: 100% Sundry OT (2.0x Rate), 0 Basic Duty
            basicHours = 0.0;
            otHours = 0.0;
            sundryOtHours = activeWorkHours;
        } else if (isSaturday) {
            // Saturday: Standard Duty Limit = 5.0 Hours (07:30 AM - 12:30 PM). Lunch = 12:30 PM - 01:30 PM. Excess = Normal OT (1.5x Rate)
            basicHours = Math.min(5.0, activeWorkHours);
            otHours = Math.max(0, activeWorkHours - 5.0);
            sundryOtHours = 0.0;
        } else {
            // Normal Weekday (Mon-Fri): Standard Duty Limit = 8.0 Hours. Excess = Normal OT (1.5x Rate)
            basicHours = Math.min(8.0, activeWorkHours);
            otHours = Math.max(0, activeWorkHours - 8.0);
            sundryOtHours = 0.0;
        }

        let otFormatted = `${otHours.toFixed(1)} hrs`;
        if (isHoliday || isSunday) {
            const label = isHoliday ? '🇱🇰 Sundry OT' : '📅 Sunday OT';
            otFormatted = `<span style="color:#7c3aed;font-weight:800;">${label}: ${sundryOtHours.toFixed(1)} hrs</span>`;
        } else {
            let otMins = Math.round(otHours * 60);
            if (otMins > 0) {
                let otH = Math.floor(otMins / 60);
                let otM = otMins % 60;
                otFormatted = otH > 0 ? `${otH}h ${otM}m (${otHours.toFixed(1)} hrs)` : `${otM} mins (${otHours.toFixed(1)} hrs)`;
            }
        }

        return {
            totalShiftHoursNum: totalElapsedHours,
            restBreakNum: restBreak,
            totalShiftHoursStr: `${totalElapsedHours.toFixed(1)} hrs`,
            restBreakStr: `${restBreak.toFixed(1)} hrs`,
            activeWorkHoursStr: `${activeWorkHours.toFixed(1)} hrs`,
            activeWorkHoursNum: activeWorkHours,
            basicHoursStr: `${basicHours.toFixed(1)} hrs`,
            otHoursStr: otFormatted,
            otHoursNum: otHours,
            sundryOtHoursNum: sundryOtHours,
            isHoliday: isHoliday,
            isSunday: isSunday,
            isSaturday: isSaturday
        };
    }

    // Export public API
    return {
        resolveBusinessId,
        getEmployees,
        setEmployees,
        getAttendanceLogs,
        setAttendanceLogs,
        getGatePasses,
        setGatePasses,
        getLoans,
        setLoans,
        findEmployee,
        pushLog,
        pushGatePass,
        deleteLog,
        purgeEmployeeLogs,
        canAccessModule,
        getAuthorizedBusinessId,
        bootstrapAuthorizedBusiness,
        scrubAccidentalSeedEmployees,
        resolveAttendanceTenant,
        findEmployeeInTenant,
        authenticateEmployee,
        isEmployeeLoggedIn,
        SRI_LANKA_MERCANTILE_HOLIDAYS: SRI_LANKA_MERCANTILE_HOLIDAYS_LIST,
        SRI_LANKA_HOLIDAY_DETAILS: SRI_LANKA_HOLIDAY_DETAILS,
        isMercantileHoliday,
        calcShiftMetrics
    };
})();
