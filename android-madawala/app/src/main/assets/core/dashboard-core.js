// Universal Dashboard Core - business-aware metrics aggregator

class DashboardCore {
    normalizeBusinessType(typeRaw) {
        const raw = String(typeRaw || '').trim().toLowerCase();
        if (!raw) return 'retail';
        const compact = raw.replace(/[\s\-_]+/g, '');
        if (compact === 'teafactory') return 'manufacturer';
        if (compact === 'scrapcollectioncenter') return 'scrap_collection_center';
        if (compact === 'coconut' || compact === 'coconutwholesale') return 'coconut';
        if (compact === 'bakery' || compact === 'baking') return 'bakery';
        if (compact === 'quickbilling' || compact === 'easybill' || compact === 'quickbill' || compact === 'billing') return 'quick_billing';
        if (compact === 'distributor') return 'distributor';
        if (compact === 'manufacturer') return 'manufacturer';
        if (compact === 'pharmacy') return 'pharmacy';
        if (compact === 'hardware') return 'hardware';
        if (compact === 'service') return 'service';
        if (compact === 'retail') return 'retail';
        return raw;
    }

    resolvePath(targetPath) {
        if (!targetPath || targetPath.startsWith('http') || targetPath.startsWith('#') || targetPath.startsWith('javascript:')) return targetPath;
        const pathname = (typeof window !== 'undefined' && window.location && window.location.pathname) || '';
        const clientMatch = pathname.match(/^\/clients\/[^\/]+/i);
        if (clientMatch) {
            const prefix = clientMatch[0];
            const cleanTarget = targetPath.startsWith('/') ? targetPath : '/' + targetPath;
            if (!cleanTarget.startsWith(prefix + '/')) {
                return prefix + cleanTarget;
            }
            return cleanTarget;
        }
        const match = pathname.match(/^\/(snapshots\/[^\/]+|v[0-9_]+|std|[a-z0-9_-]+)\/(modules|admin|core|css|scripts|icons|assets)\//);
        if (match) {
            const prefix = '/' + match[1];
            const cleanTarget = targetPath.startsWith('/') ? targetPath : '/' + targetPath;
            if (!cleanTarget.startsWith(prefix + '/')) {
                return prefix + cleanTarget;
            }
        }
        return targetPath;
    }

    getVerticalDashboardUrl(typeRaw) {
        const norm = this.normalizeBusinessType(typeRaw);
        let target = `/modules/${norm}/dashboard.html`;
        if (norm === 'quick_billing') target = '/modules/quick_billing/app.html';
        else if (norm === 'distributor') target = '/modules/distributor/web/dashboard.html';
        else if (norm === 'bakery') target = '/modules/bakery/dashboard.html';
        else if (norm === 'manufacturer') target = '/modules/manufacturer/dashboard.html';
        else if (norm === 'retail') target = '/modules/retail/dashboard.html';
        else if (norm === 'pharmacy') target = '/modules/pharmacy/dashboard.html';
        else if (norm === 'auto_care') target = '/modules/auto_care/dashboard.html';
        else if (norm === 'hardware') target = '/modules/hardware/dashboard.html';
        else if (norm === 'tire_centre') target = '/modules/tire_centre/dashboard.html';
        else if (norm === 'scrap_collection_center') target = '/modules/scrap_collection_center/dashboard.html';
        else if (norm === 'coconut') target = '/modules/coconut/dashboard.html';
        return this.resolvePath(target);
    }

    getMwTradingCanonicalBusinessId() {
        return '13Gu7XIBcBZJFS61Ub42sUV7ger1';
    }

    isMwTradingOwner(user) {
        return !!(user && user.email && String(user.email).trim().toLowerCase() === 'mwtradingsolutions@gmail.com');
    }

    /** @see window.ensureMwTradingOwnerBizMembership in firebase-init.js */
    async ensureMwTradingOwnerBizMembership(user) {
        if (typeof window.ensureMwTradingOwnerBizMembership === 'function') {
            await window.ensureMwTradingOwnerBizMembership(user);
        }
    }

    getStoredBusinessId() {
        const localId = localStorage.getItem('currentBusinessId');
        const sessionId = sessionStorage.getItem('currentBusinessId');
        return localId || sessionId || null;
    }

    getStoredBusinessType() {
        const localType = localStorage.getItem('currentBusinessType');
        const sessionType = sessionStorage.getItem('currentBusinessType');
        return localType || sessionType || null;
    }

    persistContext(context) {
        if (!context) return;
        if (context.businessId) {
            localStorage.setItem('currentBusinessId', context.businessId);
            sessionStorage.setItem('currentBusinessId', context.businessId);
        }
        if (context.businessType) {
            localStorage.setItem('currentBusinessType', context.businessType);
            sessionStorage.setItem('currentBusinessType', context.businessType);
        }
    }

    async canAccessBusiness(user, businessId, userDocData) {
        const bid = String(businessId || '').trim();
        if (!user || !bid) return false;
        if (this.isSuperAdminRole(userDocData)) return true;
        if (String(userDocData && userDocData.businessId || '') === bid) return true;
        const email = String(user.email || '').trim().toLowerCase();
        try {
            const bizDoc = await window.db.collection('businesses').doc(bid).get();
            if (!bizDoc.exists) return false;
            const bizData = bizDoc.data() || {};
            if (String(bizData.ownerId || '') === String(user.uid || '')) return true;
            if (String(bizData.ownerEmail || '').toLowerCase() === email) return true;
        } catch (e) { /* ignore */ }
        try {
            const bizUserDoc = await window.db.collection('businesses').doc(bid).collection('users').doc(user.uid).get();
            if (bizUserDoc.exists) return true;

            if (email) {
                const bizUserEmailDoc = await window.db.collection('businesses').doc(bid).collection('users').doc(email).get();
                if (bizUserEmailDoc.exists) return true;

                const regDoc = await window.db.collection('staff_registry').doc(email).get();
                if (regDoc.exists && String(regDoc.data().businessId || '') === bid) return true;
            }
        } catch (e2) { /* ignore */ }
        return false;
    }

    isSuperAdminRole(userDocData) {
        return String(userDocData && userDocData.role || '').toUpperCase() === 'SUPER_ADMIN';
    }

    async resolveFallbackBusinessId(user, userDocData) {
        if (!user) return null;
        const emailNorm = String(user.email || '').trim().toLowerCase();

        // 1. TOP PRIORITY: Global Staff Registry (Instant & rock solid for invited staff)
        if (emailNorm && window.db) {
            try {
                const registryDoc = await window.db.collection('staff_registry').doc(emailNorm).get();
                if (registryDoc.exists) {
                    const regData = registryDoc.data() || {};
                    const memberBusinessId = String(regData.businessId || '').trim();
                    if (memberBusinessId) {
                        try {
                            const updateBatch = window.db.batch();
                            updateBatch.set(window.db.collection('users').doc(user.uid), {
                                businessId: memberBusinessId,
                                role: regData.role || 'CASHIER',
                                email: emailNorm,
                                name: user.displayName || regData.name || 'Staff'
                            }, { merge: true });
                            updateBatch.set(window.db.collection('businesses').doc(memberBusinessId).collection('users').doc(user.uid), {
                                email: emailNorm,
                                role: regData.role || 'CASHIER',
                                name: user.displayName || regData.name || 'Staff',
                                uid: user.uid,
                                linkedAt: new Date()
                            }, { merge: true });
                            await updateBatch.commit();
                            try {
                                localStorage.setItem('currentBusinessId', memberBusinessId);
                                localStorage.setItem('currentUserRole', regData.role || 'CASHIER');
                                sessionStorage.setItem('currentBusinessId', memberBusinessId);
                                sessionStorage.setItem('currentUserRole', regData.role || 'CASHIER');
                            } catch (eStorage) {}
                        } catch (ePersist) { console.warn('[Staff AutoLink warn]', ePersist); }
                        return memberBusinessId;
                    }
                }
            } catch (eReg) { console.warn('[StaffRegistry Check Warn]', eReg); }
        }

        const userBusinessId = String(userDocData && userDocData.businessId || '').trim();
        if (userBusinessId && userBusinessId !== user.uid && (await this.canAccessBusiness(user, userBusinessId, userDocData))) {
            return userBusinessId;
        }

        // 2. Direct Business subcollection query fallback
        try {
            const owned = await window.db.collection('businesses').where('ownerId', '==', user.uid).limit(1).get();
            if (!owned.empty) return owned.docs[0].id;
        } catch (e) { /* ignore */ }

        // 3. Collection Group (UID & Email) fallback
        try {
            if (window.db && window.db.collectionGroup && typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldPath) {
                let memberSnap = await window.db.collectionGroup('users')
                    .where(firebase.firestore.FieldPath.documentId(), '==', user.uid)
                    .limit(1)
                    .get();

                if (memberSnap.empty && emailNorm) {
                    memberSnap = await window.db.collectionGroup('users')
                        .where('email', '==', emailNorm)
                        .limit(1)
                        .get();
                }

                if (!memberSnap.empty) {
                    const doc = memberSnap.docs[0];
                    const parentBusinessRef = doc.ref && doc.ref.parent && doc.ref.parent.parent;
                    const memberBusinessId = parentBusinessRef ? String(parentBusinessRef.id || '').trim() : '';
                    if (memberBusinessId) {
                        try {
                            await window.db.collection('users').doc(user.uid).set({ businessId: memberBusinessId }, { merge: true });
                        } catch (ePersist) { /* ignore */ }
                        return memberBusinessId;
                    }
                }
            }
        } catch (eM) { /* ignore */ }
        return null;
    }

    parseDateAny(val) {
        if (!val) return null;
        if (typeof val.toDate === 'function') {
            const d = val.toDate();
            return isNaN(d.getTime()) ? null : d;
        }
        if (val.seconds !== undefined) {
            const d = new Date(val.seconds * 1000);
            return isNaN(d.getTime()) ? null : d;
        }
        if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
    }

    async getContext(user) {
        if (localStorage.getItem('digibiz_impersonate_active') === 'true') {
            const impBizId = localStorage.getItem('digibiz_impersonate_biz_id') ||
                localStorage.getItem('currentBusinessId') ||
                localStorage.getItem('businessId');
            const impType = this.normalizeBusinessType(localStorage.getItem('digibiz_impersonate_type') || localStorage.getItem('currentBusinessType') || 'retail');
            const impEmail = String(localStorage.getItem('digibiz_impersonate_email') || localStorage.getItem('userEmail') || '').toLowerCase().trim();
            const impBizName = localStorage.getItem('digibiz_impersonate_biz_name') || localStorage.getItem('currentBusinessName') || '';
            const impOwnerName = localStorage.getItem('digibiz_impersonate_owner_name') || impBizName || impEmail;
            if (impBizId) {
                return {
                    businessId: impBizId,
                    businessType: impType,
                    userEmail: impEmail,
                    email: impEmail,
                    ownerEmail: impEmail,
                    businessName: impBizName,
                    ownerName: impOwnerName,
                    role: 'BUSINESS_OWNER',
                    userDocData: {
                        role: 'BUSINESS_OWNER',
                        businessId: impBizId,
                        email: impEmail,
                        ownerEmail: impEmail,
                        name: impOwnerName,
                        ownerName: impOwnerName,
                        businessName: impBizName,
                        businessType: impType
                    }
                };
            }
        }

        if (!user) return null;

        const userEmail = String(user.email || '').trim().toLowerCase();

        // 🛡️ STRICT ISOLATION FOR DEVELOPER SANDBOXES (.test@ accounts)
        // Never map to real client accounts or external business IDs!
        if (userEmail.includes('.test@')) {
            let testBizType = 'retail';
            if (userEmail.includes('@tire') || userEmail.includes('@tyre')) testBizType = 'tire_centre';
            else if (userEmail.includes('@quick') || userEmail.includes('@bill')) testBizType = 'quick_billing';
            else if (userEmail.includes('@attendance') || userEmail.includes('@payroll')) testBizType = 'attendance_payroll';
            else if (userEmail.includes('@credit')) testBizType = 'credit';
            else if (userEmail.includes('@distributor')) testBizType = 'distributor';
            else if (userEmail.includes('@manufacturer')) testBizType = 'manufacturer';
            else if (userEmail.includes('@retail')) testBizType = 'retail';

            const pilotNames = {
                tire_centre: 'SATHI TYRE & AUTO CARE CENTRE (SANDBOX)',
                retail: 'CHISATHI FAMILY PRODUCTS (SANDBOX)',
                quick_billing: 'ROYAL ARABIAN (SANDBOX)',
                attendance_payroll: 'SUNROSE LANKA (SANDBOX)',
                credit: 'DARSHANA MADAWALA LEDGER (SANDBOX)',
                distributor: 'SPI HOLDINGS (SANDBOX)',
                manufacturer: 'CHISATHI FACTORY (SANDBOX)'
            };
            const bizName = pilotNames[testBizType] || ('SANDBOX ' + testBizType.toUpperCase());

            const testContext = {
                userId: user.uid,
                businessId: user.uid,
                businessType: testBizType,
                businessName: bizName,
                userRole: 'BUSINESS_OWNER',
                role: 'BUSINESS_OWNER',
                logoUrl: '',
                userEmail: userEmail,
                email: userEmail,
                isTestSandbox: true,
                userDocData: {
                    businessId: user.uid,
                    businessType: testBizType,
                    businessName: bizName,
                    role: 'BUSINESS_OWNER',
                    email: userEmail,
                    isTestSandbox: true
                }
            };
            this.persistContext(testContext);
            return testContext;
        }
        const cachedAuthUid = localStorage.getItem('digibiz_auth_uid') || sessionStorage.getItem('digibiz_auth_uid');

        // If user changed or switched accounts, wipe old tenant cache!
        if (cachedAuthUid && cachedAuthUid !== user.uid) {
            localStorage.removeItem('currentBusinessId');
            localStorage.removeItem('currentBusinessType');
            localStorage.removeItem('currentBusinessName');
            localStorage.removeItem('currentUserRole');
            localStorage.removeItem('selectedBusinessId');
            sessionStorage.clear();
        }

        // Fast session cache ONLY if strictly bound to this exact user.uid
        const storedBusinessId = this.getStoredBusinessId();
        const storedBusinessType = this.getStoredBusinessType();
        const storedBizName = localStorage.getItem('currentBusinessName') || sessionStorage.getItem('currentBusinessName');
        const storedRole = localStorage.getItem('currentUserRole') || sessionStorage.getItem('currentUserRole') || 'BUSINESS_OWNER';

        if (storedBusinessId && storedBusinessType && (!cachedAuthUid || cachedAuthUid === user.uid)) {
            return {
                userId: user.uid,
                businessId: storedBusinessId,
                businessType: storedBusinessType,
                businessName: storedBizName,
                userRole: storedRole,
                role: storedRole,
                userEmail: userEmail,
                email: userEmail,
                userDocData: {
                    businessId: storedBusinessId,
                    businessType: storedBusinessType,
                    businessName: storedBizName,
                    role: storedRole,
                    email: userEmail
                }
            };
        }

        // Dedicated Single-Tenant Client Workspace Auto-Binding
        const dedicatedClient = (window.DigibizClientMap && typeof window.DigibizClientMap.resolveDedicatedClient === 'function') 
            ? window.DigibizClientMap.resolveDedicatedClient(user) 
            : null;

        if (dedicatedClient) {
            const dedicatedContext = {
                userId: user.uid,
                businessId: dedicatedClient.businessId,
                businessType: dedicatedClient.businessType,
                businessName: dedicatedClient.businessName,
                userRole: 'BUSINESS_OWNER',
                role: 'BUSINESS_OWNER',
                logoUrl: '',
                userEmail: userEmail,
                email: userEmail,
                ownerName: dedicatedClient.ownerName,
                userDocData: {
                    businessId: dedicatedClient.businessId,
                    businessType: dedicatedClient.businessType,
                    businessName: dedicatedClient.businessName,
                    role: 'BUSINESS_OWNER',
                    email: userEmail,
                    ownerName: dedicatedClient.ownerName
                }
            };
            this.persistContext(dedicatedContext);
            localStorage.setItem('digibiz_auth_uid', user.uid);
            sessionStorage.setItem('digibiz_auth_uid', user.uid);
            localStorage.setItem('currentBusinessName', dedicatedClient.businessName);
            sessionStorage.setItem('currentBusinessName', dedicatedClient.businessName);
            localStorage.setItem('currentUserRole', 'BUSINESS_OWNER');
            sessionStorage.setItem('currentUserRole', 'BUSINESS_OWNER');
            localStorage.setItem('currentBusinessNavRole', 'BUSINESS_OWNER');
            sessionStorage.setItem('currentBusinessNavRole', 'BUSINESS_OWNER');
            return dedicatedContext;
        }

        const userDoc = await window.db.collection('users').doc(user.uid).get().catch(() => null);
        const userDocData = (userDoc && userDoc.exists) ? (userDoc.data() || {}) : {};

        let businessId = userDocData.businessId || '';
        let businessType = userDocData.businessType || userDocData.type || '';
        let userRole = userDocData.role || 'BUSINESS_OWNER';

        // 1. ALWAYS try to resolve staff/fallback membership first if businessId not directly set
        if (!businessId) {
            const fallbackBusinessId = await this.resolveFallbackBusinessId(user, userDocData);
            businessId = fallbackBusinessId || user.uid;
        }

        let businessName = 'Business';
        let logoUrl = '';
        if (businessId) {
            const businessDoc = await window.db.collection('businesses').doc(businessId).get().catch(() => null);
            if (businessDoc && businessDoc.exists) {
                const bd = businessDoc.data() || {};
                if (bd.businessType) {
                    businessType = bd.businessType;
                }
                businessName = bd.name || businessName;
                logoUrl = String(bd.logoUrl || '').trim();
            }
        }

        if (!businessType) { businessType = 'tire_centre'; }
        businessType = this.normalizeBusinessType(businessType);

        // Store clean, validated cache bound to this user.uid
        localStorage.setItem('digibiz_auth_uid', user.uid);
        sessionStorage.setItem('digibiz_auth_uid', user.uid);
        localStorage.setItem('currentBusinessId', businessId);
        sessionStorage.setItem('currentBusinessId', businessId);
        localStorage.setItem('currentBusinessType', businessType);
        sessionStorage.setItem('currentBusinessType', businessType);
        localStorage.setItem('currentBusinessName', businessName);
        sessionStorage.setItem('currentBusinessName', businessName);
        localStorage.setItem('currentUserRole', userRole);
        sessionStorage.setItem('currentUserRole', userRole);

        const context = {
            userId: user.uid,
            businessId: businessId,
            businessType: businessType,
            businessName: businessName,
            userRole: userRole,
            role: userRole,
            logoUrl: logoUrl,
            userEmail: userEmail,
            email: userEmail,
            userDocData: {
                businessId: businessId,
                businessType: businessType,
                businessName: businessName,
                role: userRole,
                email: userEmail
            }
        };

        this.persistContext(context);
        return context;
    }

    /**
     * Recent activity for dashboard. Scrap uses account_ledger (GL) because journal/entries is not appended for scrap flows.
     * @param {string} businessType optional — when scrap_collection_center, reads journal/{id}/account_ledger
     */
    async getRecentJournalActivities(businessId, limit = 5, businessType = '') {
        if (String(businessType || '').toLowerCase() === 'scrap_collection_center') {
            const snap = await window.db.collection('journal').doc(businessId).collection('account_ledger').get().catch(() => ({ docs: [] }));
            const rows = snap.docs.map((doc) => {
                const d = doc.data() || {};
                return {
                    id: doc.id,
                    reference: String(d.lastReferenceType || 'GL'),
                    description: `${String(d.accountCode || doc.id || '').trim()} — ${String(d.lastDescription || d.accountName || '').trim()}`.replace(/\s+—\s*$/, '').trim(),
                    date: d.updatedAt || null,
                    totalDebit: Math.max(Number(d.totalDebit) || 0, Number(d.totalCredit) || 0)
                };
            });
            rows.sort((a, b) => {
                const ta = a.date && a.date.toDate ? a.date.toDate().getTime() : 0;
                const tb = b.date && b.date.toDate ? b.date.toDate().getTime() : 0;
                return tb - ta;
            });
            return rows.slice(0, limit);
        }
        let snapshot;
        try {
            try {
                snapshot = await window.db.collection('journal').doc(businessId).collection('entries')
                    .orderBy('date', 'desc')
                    .limit(Math.min(limit || 5, 25))
                    .get();
            } catch (eOrder) {
                snapshot = await window.db.collection('journal').doc(businessId).collection('entries')
                    .limit(Math.min(limit || 5, 25))
                    .get()
                    .catch(() => ({ docs: [] }));
            }
        } catch (e) {
            snapshot = { docs: [] };
        }
        const rows = (snapshot.docs || []).map(doc => {
            const data = doc.data() || {};
            let totalDebit = Number(data.totalDebit) || 0;
            if (!totalDebit && Array.isArray(data.entries)) {
                totalDebit = data.entries.reduce((sum, row) => {
                    let dr = Number(row.debit) || 0;
                    if (row.amount !== undefined && row.type === 'debit') {
                        dr = Number(row.amount) || 0;
                    }
                    return sum + dr;
                }, 0);
            }
            return { id: doc.id, ...data, totalDebit };
        });
        rows.sort((a, b) => {
            const da = this.parseDateAny(a.date || a.createdAt) || new Date(0);
            const db = this.parseDateAny(b.date || b.createdAt) || new Date(0);
            return db.getTime() - da.getTime();
        });
        return rows.slice(0, limit);
    }

    calculateCashFlow(entries) {
        return entries.reduce((sum, entry) => {
            if (!Array.isArray(entry.entries)) return sum;
            return sum + entry.entries.reduce((entrySum, row) => {
                const code = String(row.accountCode || row.accountId || '');
                if (!code.startsWith('1-1010') && !code.startsWith('1-1020') && code !== 'AC-10100' && code !== 'AC-10200') return entrySum;

                let dr = Number(row.debit) || 0;
                let cr = Number(row.credit) || 0;

                if (row.amount !== undefined && row.type !== undefined) {
                    if (row.type === 'debit') dr = Number(row.amount) || 0;
                    if (row.type === 'credit') cr = Number(row.amount) || 0;
                }

                return entrySum + dr - cr;
            }, 0);
        }, 0);
    }

    accountBalance(entries, matcher) {
        let total = 0;
        entries.forEach((entry) => {
            (entry.entries || []).forEach((line) => {
                const code = String(line.accountCode || '');
                const name = String(line.accountName || '').toLowerCase();
                if (matcher(code, name)) {
                    total += (Number(line.debit) || 0) - (Number(line.credit) || 0);
                }
            });
        });
        return total;
    }

    /** Firestore row date: ISO string, Date, or Timestamp. */
    scrapOperationalDateMs(row) {
        if (!row || typeof row !== 'object') return null;
        const d = row.date;
        if (d && typeof d.toDate === 'function') {
            const t = d.toDate().getTime();
            return Number.isNaN(t) ? null : t;
        }
        const c = row.createdAt;
        if (c && typeof c.toDate === 'function') {
            const t = c.toDate().getTime();
            return Number.isNaN(t) ? null : t;
        }
        if (typeof d === 'string' || d instanceof Date) {
            const t = new Date(d).getTime();
            return Number.isNaN(t) ? null : t;
        }
        return null;
    }

    querySnapDocs(snap) {
        if (!snap) return [];
        if (Array.isArray(snap.docs)) return snap.docs;
        return [];
    }

    aggregateEntryDocsToAccountMap(docs) {
        const byCode = {};
        (docs || []).forEach((doc) => {
            const row = doc.data ? doc.data() : doc;
            const entries = row.entries || [];
            entries.forEach((line) => {
                const c = String(line.accountCode || '').trim() || 'UNKNOWN';
                if (!byCode[c]) {
                    byCode[c] = { accountCode: c, accountName: String(line.accountName || c), debit: 0, credit: 0 };
                }
        byCode[c].debit += Number(line.debit) || 0;
                byCode[c].credit += Number(line.credit) || 0;
            });
        });
        return byCode;
    }

    async fetchUnifiedOrders(bid, userEmail) {
        if (!bid || !window.db) return { docs: [] };
        try {
            const [canonicalSnap, flatSnap, pendingSnap] = await Promise.all([
                window.db.collection('orders').doc(bid).collection('list').limit(500).get().catch(() => ({ docs: [] })),
                window.db.collection("businesses").doc(bid).collection('orders').limit(500).get().catch(() => ({ docs: [] })),
                window.db.collection("businesses").doc(bid).collection('pendingOrders').limit(500).get().catch(() => ({ docs: [] }))
            ]);

            const map = {};
            [canonicalSnap, flatSnap, pendingSnap].forEach(snap => {
                (snap.docs || []).forEach(doc => {
                    map[doc.id] = doc;
                });
            });

            return { docs: Object.values(map) };
        } catch (e) {
            console.error('[DashboardCore] fetchUnifiedOrders failed', e);
            return { docs: [] };
        }
    }

parseDateAny(val) {
        if (!val) return null;
        if (typeof val.toDate === 'function') return val.toDate();
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
    }

    async syncUnjournaledTransactions(bid, userEmailOrType, maybeEmail) {
        if (!bid || !window.db) return;
        const cacheKey = 'last_journal_sync_' + bid;
        try {
            const inMemLast = window.__LAST_JOURNAL_SYNC_TS__ && window.__LAST_JOURNAL_SYNC_TS__[bid];
            const lastSync = Math.max(Number(sessionStorage.getItem(cacheKey) || 0), Number(inMemLast || 0));
            const now = Date.now();
            if (now - lastSync < 600000) { // 10 minutes throttle
                return;
            }
            if (!window.__LAST_JOURNAL_SYNC_TS__) window.__LAST_JOURNAL_SYNC_TS__ = {};
            window.__LAST_JOURNAL_SYNC_TS__[bid] = now;
            sessionStorage.setItem(cacheKey, String(now));
        } catch (eCache) { }

        const userEmail = (typeof maybeEmail === 'string' && maybeEmail.includes('@')) 
            ? maybeEmail 
            : ((typeof userEmailOrType === 'string' && userEmailOrType.includes('@')) ? userEmailOrType : '');

        try {
            const existingEntries = await window.db.collection('journal').doc(bid).collection('entries').get().catch(() => ({ docs: [] }));
            const existingRefs = new Set();
            const existingIds = new Set();
            const seenSupplierOpenings = new Map();
            const seenPurchaseRefs = new Map();

            const batch = window.db.batch();
            let newEntriesAdded = 0;
            let migratedCount = 0;

            existingEntries.docs.forEach(d => {
                const data = d.data() || {};
                const id = d.id;

                // 1. Erroneous mock PO purchase journal that incorrectly debited inventory:
                if (id.startsWith('JE_PURCHASE_PO-OPEN-') || id.startsWith('JE_PURCHASE_OPEN-')) {
                    batch.delete(d.ref);
                    migratedCount++;
                    return;
                }

                // 2. Duplicate Supplier Opening Balance entries (e.g. JE_SUP_OPEN_Kapila vs JE_SUP_OPEN_SUP-2833)
                if (id.startsWith('JE_SUP_OPEN_') || String(data.description || '').includes('Opening Balance Payable')) {
                    const cleanDesc = String(data.description || '').replace(/^Opening Balance Payable\s*-\s*Supplier:\s*/i, '').trim();
                    const supName = String(data.supplierName || cleanDesc || '').toLowerCase().trim();
                    const supKey = supName || String(data.supplierCode || data.supplierId || id.replace('JE_SUP_OPEN_', '')).toLowerCase().trim();
                    if (seenSupplierOpenings.has(supKey)) {
                        batch.delete(d.ref);
                        migratedCount++;
                        return;
                    } else {
                        seenSupplierOpenings.set(supKey, d.ref);
                    }
                }

                // 3. Duplicate Purchase/GRN entries
                const memoStr = String(data.memo || data.description || '');
                const refStr = String(data.ref || '');
                const poMatch = memoStr.match(/(?:GRN:\s*|Order\s+|PO:\s*)([A-Za-z0-9\-]+)/i);
                const poKey = poMatch ? poMatch[1].toLowerCase().trim() : (refStr ? refStr.toLowerCase().trim() : '');
                if (poKey && (memoStr.includes('GRN') || memoStr.includes('Purchase - Order') || id.startsWith('JE_PURCHASE_'))) {
                    if (seenPurchaseRefs.has(poKey)) {
                        batch.delete(d.ref);
                        migratedCount++;
                        return;
                    } else {
                        seenPurchaseRefs.set(poKey, d.ref);
                    }
                }

                if (data.ref) existingRefs.add(data.ref);
                existingIds.add(id);

                // On-the-fly migration for old AC-XXXX codes to legacy formats & fix miscoded opening inventory
                let needsUpdate = false;
                const newEntries = (data.entries || []).map(entry => {
                    let ac = entry.accountCode;
                    if (ac === 'AC-40100') { ac = '4-4010-01'; needsUpdate = true; }
                    if (ac === 'AC-10100') { ac = '1-1010-01'; needsUpdate = true; }
                    if (ac === 'AC-21000') { ac = '2-2010-01'; needsUpdate = true; }
                    if (ac === 'AC-10300') { ac = '1-1030-01'; needsUpdate = true; }
                    if (ac === 'AC-10400') { ac = '1-1040-01'; needsUpdate = true; }
                    if (ac === '1-1030-01' && String(entry.accountName || '').toLowerCase().includes('inventory')) {
                        ac = '1-1040-01';
                        entry.accountId = 'AC-10400';
                        needsUpdate = true;
                    }
                    if (ac === 'AC-10200') { ac = '1-1020-01'; needsUpdate = true; }
                    if (ac === 'AC-10300') { ac = '1-1030-01'; needsUpdate = true; }
                    if (ac === 'AC-50100') { ac = '5-5010-01'; needsUpdate = true; }
                    return { ...entry, accountCode: ac };
                });

                let updates = {};
                if (needsUpdate) updates.entries = newEntries;
                if (data.referenceType === undefined && data.description && data.description.includes('Sales Order')) {
                    updates.referenceType = 'SALE';
                    needsUpdate = true;
                }
                if (data.referenceType === undefined && data.description && data.description.includes('Expense:')) {
                    updates.referenceType = 'EXPENSE';
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    batch.update(d.ref, updates);
                    migratedCount++;
                }
            });

            const [unifiedOrders, expensesSnap1, expensesSnap2] = await Promise.all([
                this.fetchUnifiedOrders(bid, userEmail),
                window.db.collection("businesses").doc(bid).collection('expenses').get().catch(() => ({ docs: [] })),
                window.db.collection('expenses').doc(bid).collection('list').get().catch(() => ({ docs: [] }))
            ]);
            const expDocMap = {};
            [...expensesSnap1.docs, ...expensesSnap2.docs].forEach(d => { expDocMap[d.id] = d; });
            const allExpenseDocs = Object.values(expDocMap);

            for (const doc of unifiedOrders.docs) {
                const data = doc.data() || {};
                const docId = doc.id;
                const orderId = data.orderId || data.orderNumber || docId;

                const refStr1 = `orders/${orderId}`;
                const refStr2 = `orders/${docId}`;
                const refStr3 = `pendingOrders/${orderId}`;
                const refStr4 = `pendingOrders/${docId}`;

                const customId1 = `JE_${orderId}`;
                const customId2 = `JE_${docId}`;

                if (existingRefs.has(refStr1) || existingRefs.has(refStr2) || existingRefs.has(refStr3) || existingRefs.has(refStr4) ||
                    existingIds.has(customId1) || existingIds.has(customId2)) {
                    continue;
                }

                const status = String(data.status || '').toLowerCase();
                if (status === 'rejected' || status === 'cancelled') continue;

                const total = Number(data.totalAmount || data.total || data.netTotal || data.grandTotal || data.amount || 0);
                if (total <= 0) continue;

                const dt = this.parseDateAny(data.orderDate || data.createdAt || data.timestamp) || new Date();
                const customer = data.customerName || data.shopName || data.shop || data.customer || 'Customer';
                const collected = Number(data.collectionAmount != null ? data.collectionAmount : (data.collectedAmount != null ? data.collectedAmount : 0)) || 0;
                const outstanding = Math.max(0, total - collected);

                const jEntries = [];
                if (collected > 0) {
                    jEntries.push({ accountCode: '1-1010-01', accountName: 'Cash in Drawer', debit: collected, credit: 0 });
                }
                if (outstanding > 0) {
                    jEntries.push({ accountCode: '1-1030-01', accountName: 'Accounts Receivable', debit: outstanding, credit: 0 });
                }
                jEntries.push({ accountCode: '4-4010-01', accountName: 'Sales Revenue', debit: 0, credit: total });

                const jRef = window.db.collection('journal').doc(bid).collection('entries').doc(customId1);
                const jObj = {
                    businessId: bid,
                    date: window.firebase.firestore.Timestamp.fromDate(dt),
                    description: `Sales Order #${orderId} - ${customer}`,
                    ref: refStr1,
                    referenceType: 'SALE',
                    totalDebit: total,
                    totalCredit: total,
                    entries: jEntries
                };
                batch.set(jRef, jObj, { merge: true });
                existingRefs.add(refStr1);
                existingRefs.add(refStr2);
                existingRefs.add(refStr3);
                existingRefs.add(refStr4);
                existingIds.add(customId1);
                existingIds.add(customId2);
                newEntriesAdded++;
            }

            for (const doc of allExpenseDocs) {
                const data = doc.data() || {};
                const expId = doc.id;
                const refStr = `expenses/${expId}`;
                const customId = `JE_EXP_${expId}`;

                if (existingRefs.has(refStr) || existingIds.has(customId)) continue;
                const amt = Number(data.amount || 0);
                if (amt <= 0) continue;

                const dt = this.parseDateAny(data.expenseDate || data.createdAt || data.date) || new Date();
                const cat = data.category || data.description || 'Expense';
                const pm = String(data.paymentMethod || 'CASH').toUpperCase();
                const isCash = pm === 'CASH';

                const jRef = window.db.collection('journal').doc(bid).collection('entries').doc(customId);
                const jObj = {
                    businessId: bid,
                    date: window.firebase.firestore.Timestamp.fromDate(dt),
                    description: `Expense: ${cat}`,
                    ref: refStr,
                    referenceType: 'EXPENSE',
                    totalDebit: amt,
                    totalCredit: amt,
                    entries: [
                        { accountCode: '5-5010-01', accountName: `Operational Expense (${cat})`, debit: amt, credit: 0 },
                        { accountCode: isCash ? '1-1010-01' : '1-1020-01', accountName: isCash ? 'Cash in Drawer' : 'Bank Account', debit: 0, credit: amt }
                    ]
                };
                batch.set(jRef, jObj, { merge: true });
                existingRefs.add(refStr);
                existingIds.add(customId);
                newEntriesAdded++;
            }

            // 3. Sync Un-journaled Opening Product Stock Assets
            try {
                const queries = [
                    window.db.collection("businesses").doc(bid).collection('products').get().catch(() => ({ docs: [] })),
                    window.db.collection('products').doc(bid).collection('list').get().catch(() => ({ docs: [] })),
                    window.db.collection('businesses').doc(bid).collection('products').get().catch(() => ({ docs: [] }))
                ];
                if (userEmail) {
                    queries.push(window.db.collection('products').where('ownerEmail', '==', String(userEmail).toLowerCase().trim()).get().catch(() => ({ docs: [] })));
                }

                const snaps = await Promise.all(queries);
                const prodMap = {};
                snaps.forEach(snap => {
                    (snap.docs || []).forEach(d => { prodMap[d.id] = d; });
                });
                const allProdDocs = Object.values(prodMap);

                for (const doc of allProdDocs) {
                    const data = doc.data() || {};
                    const pId = doc.id;
                    const refStr = `products/${pId}`;
                    const customId = `JE_STOCK_${pId}`;

                    if (existingRefs.has(refStr) || existingIds.has(customId)) continue;

                    const qty = Math.max(0, Number(data.currentStock != null ? data.currentStock : (data.stock != null ? data.stock : 0)) || 0);
                    const cost = Math.max(0, Number(data.buyingPrice != null ? data.buyingPrice : (data.costPrice != null ? data.costPrice : data.unitPrice)) || 0);
                    const totalVal = Number((qty * cost).toFixed(2));

                    if (qty <= 0 || totalVal <= 0) continue;

                    const dt = this.parseDateAny(data.createdAt || data.updatedAt) || new Date();
                    const pName = String(data.name || data.productName || 'Product').trim();
                    const pCode = String(data.productCode || data.code || '').trim();

                    const jRef = window.db.collection('journal').doc(bid).collection('entries').doc(customId);
                    const jObj = {
                        businessId: bid,
                        date: dt,
                        createdAt: dt,
                        description: `Opening Stock - ${pName}${pCode ? ' (Code: ' + pCode + ')' : ''} (${qty} units @ Rs.${cost.toFixed(2)})`,
                        ref: refStr,
                        referenceType: 'OPENING_STOCK',
                        totalDebit: totalVal,
                        totalCredit: totalVal,
                        entries: [
                            { accountCode: '1-1040-01', accountName: 'Inventory', debit: totalVal, credit: 0 },
                            { accountCode: '3-3010-01', accountName: "Owner's Capital", debit: 0, credit: totalVal }
                        ]
                    };
                    batch.set(jRef, jObj, { merge: true });
                    existingRefs.add(refStr);
                    existingIds.add(customId);
                    newEntriesAdded++;
                }
            } catch (prodSyncErr) {
                console.warn('[DashboardCore] Product stock sync notice:', prodSyncErr);
            }

            // 4. Sync Un-journaled Supplier Opening Balances & Payables
            try {
                const supQueries = [
                    window.db.collection("businesses").doc(bid).collection('suppliers').get().catch(() => ({ docs: [] })),
                    window.db.collection('suppliers').doc(bid).collection('list').get().catch(() => ({ docs: [] })),
                    window.db.collection('customers').doc(bid).collection('list').where('type', '==', 'supplier').get().catch(() => ({ docs: [] }))
                ];
                if (userEmail) {
                    supQueries.push(window.db.collection('suppliers').where('ownerEmail', '==', String(userEmail).toLowerCase().trim()).get().catch(() => ({ docs: [] })));
                }

                const sSnaps = await Promise.all(supQueries);
                const supMap = {};
                sSnaps.forEach(snap => {
                    (snap.docs || []).forEach(d => { supMap[d.id] = d; });
                });
                const allSupDocs = Object.values(supMap);

                // Pre-fetch all POs once to eliminate N+1 query loop
                const existingPOsSnap = await window.db.collection('purchases').doc(bid).collection('orders').get().catch(() => ({ docs: [] }));
                const existingPOsSet = new Set((existingPOsSnap.docs || []).map(d => d.id));

                for (const doc of allSupDocs) {
                    const data = doc.data() || {};
                    const sId = doc.id;
                    const sCode = String(data.code || sId).trim();
                    const sName = String(data.name || data.customerName || 'Supplier').trim();
                    const openBal = Math.max(0, Number(data.openingBalance || 0), Number(data.outstanding || 0), Number(data.balance || 0));

                    if (openBal <= 0) continue;

                    const refStr1 = `suppliers/${sId}`;
                    const refStr2 = `suppliers/${sCode}`;
                    const customId1 = `JE_SUP_OPEN_${sId}`;
                    const customId2 = `JE_SUP_OPEN_${sCode}`;

                    const rawDt = this.parseDateAny(data.createdAt || data.updatedAt) || new Date();
                    const validDt = rawDt instanceof Date && !isNaN(rawDt.getTime()) ? rawDt : new Date();

                    // Auto-create / verify mock PO in purchases/{bid}/orders without N+1 fetch
                    const poId = `PO-OPEN-${sCode}`;
                    const poRef = window.db.collection('purchases').doc(bid).collection('orders').doc(poId);
                    if (!existingPOsSet.has(poId)) {
                        batch.set(poRef, {
                            id: poId,
                            poNo: poId,
                            supplierId: sId,
                            supplierCode: sCode,
                            supplierName: sName,
                            total: openBal,
                            netTotal: openBal,
                            amountPaid: 0,
                            paidAmount: 0,
                            paymentMethod: 'CREDIT',
                            paymentStatus: 'unpaid',
                            status: 'received',
                            isOpeningBalance: true,
                            businessId: bid,
                            createdAt: validDt,
                            updatedAt: validDt,
                            items: [{ productName: 'Opening Payable Balance', quantity: 1, unitPrice: openBal, total: openBal }]
                        }, { merge: true });
                        existingPOsSet.add(poId);
                    }

                    if (existingRefs.has(refStr1) || existingRefs.has(refStr2) || existingIds.has(customId1) || existingIds.has(customId2)) {
                        continue;
                    }

                    const jRef = window.db.collection('journal').doc(bid).collection('entries').doc(customId1);
                    const jObj = {
                        businessId: bid,
                        date: validDt,
                        createdAt: validDt,
                        description: `Opening Balance Payable - Supplier: ${sName}`,
                        memo: `Opening Balance Payable - Supplier: ${sName}`,
                        supplierName: sName,
                        supplierId: sId,
                        ref: refStr1,
                        referenceType: 'PURCHASE',
                        totalDebit: openBal,
                        totalCredit: openBal,
                        entries: [
                            { accountCode: '3-3010-01', accountId: 'AC-30000', accountName: 'Opening Balance Equity', debit: openBal, credit: 0, amount: openBal, type: 'debit' },
                            { accountCode: '2-2010-01', accountId: 'AC-21000', accountName: `Accounts Payable - Supplier: ${sName}`, supplierName: sName, debit: 0, credit: openBal, amount: openBal, type: 'credit' }
                        ]
                    };
                    batch.set(jRef, jObj, { merge: true });
                    existingRefs.add(refStr1);
                    existingRefs.add(refStr2);
                    existingRefs.add(`purchases/PO-OPEN-${sCode}`);
                    existingIds.add(customId1);
                    existingIds.add(customId2);
                    existingIds.add(`JE_PURCHASE_PO-OPEN-${sCode}`);
                    newEntriesAdded++;
                }
            } catch (supSyncErr) {
                console.warn('[DashboardCore] Supplier opening balance sync notice:', supSyncErr);
            }

            // 5. Sync Un-journaled Purchases / GRNs & Cleanup Duplicate Mock POs
            try {
                const poSnap = await window.db.collection('purchases').doc(bid).collection('orders').get().catch(() => ({ docs: [] }));
                const seenOpenPOs = new Set();

                for (const doc of poSnap.docs) {
                    const data = doc.data() || {};
                    const poId = doc.id;
                    if (data.isOpeningBalance === true || poId.startsWith('PO-OPEN-') || poId.startsWith('OPEN-')) {
                        const sKey = String(data.supplierName || data.supplierCode || data.supplierId || poId).toLowerCase().trim();
                        if (seenOpenPOs.has(sKey)) {
                            batch.delete(doc.ref);
                            migratedCount++;
                        } else {
                            seenOpenPOs.add(sKey);
                        }
                        continue;
                    }
                    const refStr = `purchases/${poId}`;
                    const customId = `JE_PURCHASE_${poId}`;

                    if (existingRefs.has(refStr) || existingIds.has(customId)) continue;

                    const total = Number(data.netTotal || data.total || data.amount || 0);
                    if (total <= 0) continue;

                    const rawDt = this.parseDateAny(data.createdAt || data.date) || new Date();
                    const validDt = rawDt instanceof Date && !isNaN(rawDt.getTime()) ? rawDt : new Date();
                    const sName = String(data.supplierName || 'Supplier').trim();
                    const pStatus = String(data.paymentStatus || 'unpaid').toLowerCase();
                    const pMethod = String(data.paymentMethod || 'CREDIT').toUpperCase();
                    const isPaid = pStatus === 'paid';

                    const jRef = window.db.collection('journal').doc(bid).collection('entries').doc(customId);
                    const jObj = {
                        businessId: bid,
                        date: validDt,
                        createdAt: validDt,
                        description: `Purchase Order #${data.poNo || poId} - ${sName}`,
                        memo: `Purchase Order #${data.poNo || poId} - ${sName}`,
                        supplierName: sName,
                        supplierId: data.supplierId || '',
                        ref: refStr,
                        referenceType: 'PURCHASE',
                        totalDebit: total,
                        totalCredit: total,
                        entries: [
                            { accountCode: '1-1040-01', accountName: 'Inventory', debit: total, credit: 0, amount: total, type: 'debit' },
                            { accountCode: isPaid ? (pMethod === 'BANK' ? '1-1020-01' : '1-1010-01') : '2-2010-01', accountName: isPaid ? (pMethod === 'BANK' ? 'Bank Account' : 'Cash in Drawer') : `Accounts Payable - Supplier: ${sName}`, debit: 0, credit: total, amount: total, type: 'credit' }
                        ]
                    };
                    batch.set(jRef, jObj, { merge: true });
                    existingRefs.add(refStr);
                    existingIds.add(customId);
                    newEntriesAdded++;
                }
            } catch (poSyncErr) {
                console.warn('[DashboardCore] Purchase order sync notice:', poSyncErr);
            }

            if (newEntriesAdded > 0 || migratedCount > 0) {
                await batch.commit();
                console.log(`[DashboardCore] Auto-synced ${newEntriesAdded} unjournaled transactions. Migrated ${migratedCount} old transactions.`);
            }
        } catch (e) {
            console.error('[DashboardCore] syncUnjournaledTransactions error:', e);
        }
    }

    /**
     * Journal entries posted from web loan modules (stored in journal/{bid}/entries only).
     * Scrap GL view otherwise ignores entries to avoid double-counting stock — loans must still appear.
     */
    aggregateLoanJournalEntryDocsToAccountMap(docs) {
        const byCode = {};
        (docs || []).forEach((doc) => {
            const row = doc.data ? doc.data() : doc;
            const rt = String(row.referenceType || '');
            if (!/^(HAND_LOAN|LOAN_|ADV_LOAN)/.test(rt)) return;
            const entries = row.entries || [];
            entries.forEach((line) => {
                const c = String(line.accountCode || '').trim() || 'UNKNOWN';
                if (!byCode[c]) {
                    byCode[c] = { accountCode: c, accountName: String(line.accountName || c), debit: 0, credit: 0 };
                }
                byCode[c].debit += Number(line.debit) || 0;
                byCode[c].credit += Number(line.credit) || 0;
            });
        });
        return byCode;
    }

    aggregateLedgerDocsToAccountMap(docs) {
        const byCode = {};
        (docs || []).forEach((doc) => {
            const r = doc.data ? doc.data() : doc;
            const c = String(r.accountCode || (doc.id != null ? doc.id : '') || '').trim() || 'UNKNOWN';
            byCode[c] = {
                accountCode: c,
                accountName: String(r.accountName || c),
                debit: Number(r.totalDebit) || 0,
                credit: Number(r.totalCredit) || 0
            };
        });
        return byCode;
    }

    mergeAccountMaps(a, b) {
        const out = { ...a };
        Object.keys(b || {}).forEach((k) => {
            if (!out[k]) {
                out[k] = { ...b[k] };
            } else {
                out[k] = {
                    accountCode: k,
                    accountName: b[k].accountName || out[k].accountName,
                    debit: (Number(out[k].debit) || 0) + (Number(b[k].debit) || 0),
                    credit: (Number(out[k].credit) || 0) + (Number(b[k].credit) || 0)
                };
            }
        });
        return out;
    }

    aggregateOpeningDocData(data) {
        const byCode = {};
        const row = data && typeof data === 'object' ? data : {};
        const lines = Array.isArray(row.lines) ? row.lines : [];
        lines.forEach((line) => {
            const c = String(line.accountCode || '').trim();
            if (!c) return;
            if (!byCode[c]) {
                byCode[c] = { accountCode: c, accountName: String(line.accountName || c), debit: 0, credit: 0 };
            }
            byCode[c].debit += Number(line.debit) || 0;
            byCode[c].credit += Number(line.credit) || 0;
        });
        return byCode;
    }

    /**
     * @param openingSnap Firestore DocumentSnapshot for journal/{bid}/ledger_opening/current (optional)
     * @param options.scrapOpeningLedgerOnly — scrap: opening + account_ledger only (no legacy entries; fixes double stock)
     */
    syntheticJournalFromMerged(entriesSnap, ledgerSnap, openingSnap, options = {}) {
        let map;
        if (options.scrapOpeningLedgerOnly) {
            const openingData = openingSnap && openingSnap.exists ? openingSnap.data() : {};
            const base = this.mergeAccountMaps(
                this.aggregateOpeningDocData(openingData),
                this.aggregateLedgerDocsToAccountMap(ledgerSnap && ledgerSnap.docs ? ledgerSnap.docs : [])
            );
            const loanFromEntries = this.aggregateLoanJournalEntryDocsToAccountMap(
                entriesSnap && entriesSnap.docs ? entriesSnap.docs : []
            );
            map = this.mergeAccountMaps(base, loanFromEntries);
        } else {
            map = this.mergeAccountMaps(
                this.aggregateEntryDocsToAccountMap(entriesSnap && entriesSnap.docs ? entriesSnap.docs : []),
                this.aggregateLedgerDocsToAccountMap(ledgerSnap && ledgerSnap.docs ? ledgerSnap.docs : [])
            );
        }
        const lines = Object.values(map).filter((row) => (Number(row.debit) || 0) > 0.0001 || (Number(row.credit) || 0) > 0.0001);
        if (!lines.length) return [];
        return [{
            entries: lines,
            referenceType: options.scrapOpeningLedgerOnly ? 'SCRAP_OPENING_PLUS_LEDGER' : 'MERGED_LEDGER',
            description: options.scrapOpeningLedgerOnly
                ? 'Scrap GL: opening + ledger + loan journals (entries)'
                : 'Running balances (legacy journal + consolidated ledger)',
            date: null
        }];
    }

    async getDistributorMetrics(context) {
        const bid = context.businessId;
        const uEmail = String(context.userEmail || context.email || context.ownerEmail || (localStorage.getItem('digibiz_impersonate_active') === 'true' ? localStorage.getItem('digibiz_impersonate_email') : '') || localStorage.getItem('userEmail') || '').toLowerCase().trim();
        
        // Asynchronously sync unjournaled transactions in background so UI renders immediately
        this.syncUnjournaledTransactions(bid, uEmail).catch(e => console.warn('[Journal Sync Async]', e));

        const [snapshot, pendingSnap, pFlat, repsSnap, shopsSnap, journalSnap, returnsSnap] = await Promise.all([
            this.fetchUnifiedOrders(bid, uEmail),
            window.db.collection("businesses").doc(bid).collection('pendingOrders').get().catch(() => ({ docs: [] })),
            window.db.collection("businesses").doc(bid).collection('products').get().catch(() => ({ docs: [] })),
            window.db.collection("businesses").doc(bid).collection('reps').get().catch(() => ({ docs: [] })),
            window.db.collection("businesses").doc(bid).collection('shops').get().catch(() => ({ docs: [] })),
            window.db.collection('journal').doc(bid).collection('entries').get().catch(() => ({ docs: [] })),
            window.db.collection("businesses").doc(bid).collection('returns').get().catch(() => ({ docs: [] }))
        ]);

        const productsSnap = pFlat.docs || [];
        const journalEntries = journalSnap.docs.map(d => d.data());

        window.__DIGIBIZ_DASHBOARD_DATA__ = {
            ordersSnap: snapshot,
            pendingSnap: pendingSnap,
            productsSnap: productsSnap,
            repsSnap: repsSnap,
            shopsSnap: shopsSnap,
            journalEntries: journalEntries,
            returnsSnap: returnsSnap,
            timestamp: Date.now()
        };

        const startToday = new Date();
        startToday.setHours(0, 0, 0, 0);
        const startMonth = new Date(startToday.getFullYear(), startToday.getMonth(), 1);

        // --- ACCOUNTING & OPERATIONAL SALES METRICS (Strictly Synchronized with Orders) ---

        // 1. Sales Calculation (Income from approved revenue orders and journal adjustments)
        let todaySales = 0;
        let monthSales = 0;
        let monthReturnsValue = 0;
        let monthFreeIssuesValue = 0;

        // Calculate Sales directly from live approved orders to guarantee 100% synchronization with Revenue
        snapshot.docs.forEach(doc => {
            const order = doc.data() || {};
            const st = String(order.status || '').toLowerCase();
            if (['approved', 'completed', 'delivered', 'dispatched'].includes(st)) {
                const dt = order.orderDate?.toDate ? order.orderDate.toDate() : (order.createdAt ? new Date(order.createdAt) : (order.date ? new Date(order.date) : null));
                const amt = Number(order.totalAmount || order.grandTotal || order.amount || 0);
                if (dt && !isNaN(dt.getTime())) {
                    if (dt >= startToday) todaySales += amt;
                    if (dt >= startMonth) monthSales += amt;
                } else {
                    monthSales += amt;
                }
            }
        });

        // Journal Return and Free Issue adjustments
        journalEntries.forEach(entry => {
            const entryDate = entry.date?.toDate ? entry.date.toDate() : new Date(entry.date);
            const isThisMonth = entryDate >= startMonth;
            const isToday = entryDate >= startToday;
            const isCompanyClaim = entry.returnShipment === 'COMPANY' || String(entry.description || '').includes('COMPANY');

            (entry.entries || []).forEach(line => {
                const code = String(line.accountCode);
                // Sales Returns (Only subtract if it's an actual unclaimable sales refund/cancellation, not a Company Claim Asset)
                if (code.startsWith('4-4010-02') && !isCompanyClaim) {
                    const val = Number(line.debit) || 0;
                    if (isToday) todaySales -= val;
                    if (isThisMonth) {
                        monthSales -= val;
                        monthReturnsValue += val;
                    }
                }
                // Free Issues (Marketing Expense)
                else if (code.startsWith('5-5030-01')) {
                    const val = Number(line.debit) || 0;
                    if (isThisMonth) monthFreeIssuesValue += val;
                }
            });
        });
        todaySales = Math.max(0, Number(todaySales.toFixed(2)));
        monthSales = Math.max(0, Number(monthSales.toFixed(2)));

        // 2. Outstanding Balance & Cash Inflows from Orders
        let orderOutstanding = 0;
        let orderCashCollections = 0;

        snapshot.docs.forEach(doc => {
            const order = doc.data() || {};
            const st = String(order.status || '').toLowerCase();
            if (['approved', 'completed', 'delivered', 'dispatched'].includes(st)) {
                const total = Number(order.totalAmount || order.grandTotal || order.amount || 0);
                const pm = String(order.paymentMethod || 'CASH').toUpperCase();
                let collected = 0;
                if (order.collectionAmount != null) {
                    collected = Number(order.collectionAmount) || 0;
                } else if (order.collectedAmount != null) {
                    collected = Number(order.collectedAmount) || 0;
                } else if (order.cashPaid != null) {
                    collected = Number(order.cashPaid) || 0;
                } else if (pm === 'CASH') {
                    // Full cash sale: paid upon invoice/delivery
                    collected = total;
                } else {
                    // Credit sale: unpaid until collections are recorded
                    collected = 0;
                }
                const out = Math.max(0, total - collected);
                orderOutstanding += out;
                orderCashCollections += collected;
            }
        });

        // 3. Cash & Bank Balances (from GL / Journal and Collections)
        let journalCash = 0;
        let journalBank = 0;
        let journalAR = 0;

        journalEntries.forEach(entry => {
            const ref = String(entry.ref || entry.reference || entry.description || '');
            const isSyntheticOrder = ref.startsWith('orders/') || ref.startsWith('pendingOrders/') || String(entry.referenceType) === 'SALE';

            (entry.entries || []).forEach(line => {
                const code = String(line.accountCode || '');
                const dr = Number(line.debit) || 0;
                const cr = Number(line.credit) || 0;
                const net = dr - cr;

                if (!isSyntheticOrder) {
                    if (code.startsWith('1-1010') || code === 'AC-10100') journalCash += net;
                    if (code.startsWith('1-1020') || code === 'AC-10200') journalBank += net;
                    if (code.startsWith('1-1030') || code === 'AC-10300') journalAR += net;
                }
            });
        });

        let cashBalance = Number((orderCashCollections + journalCash).toFixed(2));
        let bankBalance = Number(journalBank.toFixed(2));
        let cashFlow = Number((cashBalance + bankBalance).toFixed(2));
        let outstandingBalance = Math.max(0, Number((orderOutstanding + journalAR).toFixed(2)));

        // 4. Inventory Value
        let totalStockValue = this.accountBalance(journalEntries, (code, name) =>
            code.startsWith('1-1040') && !String(name || '').toLowerCase().includes('supplier advance'));

        // --- OPERATIONAL METRICS (Process Tracking) ---
        let pendingOrders = pendingSnap.size;
        let approvedCount = 0;
        let rejectedCount = 0;
        let dispatchedCount = 0;
        let deliveredCount = 0;
        let monthOrderCount = 0;
        let returnsCat1Units = 0;
        let returnsCat2Units = 0;
        let returnsCat3Units = 0;
        let freeIssueUnits = 0;
        let freeIssueValueEst = 0;

        // Process standalone returns from 'returns' collection
        returnsSnap.docs.forEach(doc => {
            const d = doc.data() || {};
            const dt = d.createdAt?.toDate ? d.createdAt.toDate() : (d.timestamp ? new Date(d.timestamp) : null);
            if (dt && dt >= startMonth) {
                const items = Array.isArray(d.items) ? d.items : (Array.isArray(d.returnItems) ? d.returnItems : []);
                const ship = String(d.shipment || 'STOCK').toUpperCase();
                const qSum = items.reduce((s, it) => s + (Number(it.qty) || 0), 0);
                if (ship === 'COMPANY' || d.categoryNumber === 1) returnsCat1Units += qSum;
                else if (ship === 'DESTROY' || d.categoryNumber === 3) returnsCat3Units += qSum;
                else returnsCat2Units += qSum;
            }
        });
        const repMap = {};
        const brandMonth = {};
        const trendDayKeyToIndex = {};
        const dayKeys = [];
        for (let i = 6; i >= 0; i--) {
            const ds = new Date(startToday);
            ds.setDate(ds.getDate() - i);
            const dk = ds.toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
            trendDayKeyToIndex[dk] = dayKeys.length;
            dayKeys.push(ds.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }));
        }
        const dayTotals = new Array(7).fill(0);

        const parseOrderDate = (order) => {
            if (!order) return null;
            if (order.orderDate && typeof order.orderDate.toDate === 'function') return order.orderDate.toDate();
            if (order.createdAt && typeof order.createdAt.toDate === 'function') return order.createdAt.toDate();
            if (order.updatedAt && typeof order.updatedAt.toDate === 'function') return order.updatedAt.toDate();
            const raw = order.orderDate || order.createdAt || order.date || order.timestamp;
            if (raw) {
                const d = new Date(raw);
                if (!isNaN(d.getTime())) return d;
            }
            return null;
        };

        const accumulateOrder = (order, isPendingQueue) => {
            const amount = Number(order.totalAmount || order.grandTotal || 0);
            const dateValue = parseOrderDate(order);
            const status = String(order.status || (isPendingQueue ? 'pending' : '')).toLowerCase();
            const isRevenueOrder = ['approved', 'dispatched', 'delivered', 'completed'].includes(status);
            const repId = order.repId || order.repEmail || 'UNASSIGNED';
            const repName = order.repName || order.salesRepName || 'Unassigned Rep';
            if (!repMap[repId]) {
                repMap[repId] = {
                    repId,
                    repName,
                    totalOrders: 0,
                    freeIssues: 0,
                    collections: 0
                };
            }
            repMap[repId].totalOrders += 1;
            const items = Array.isArray(order.items) ? order.items : [];
            const freeQty = items.reduce((sum, item) => sum + (Number(item.freeQty) || 0), 0);
            repMap[repId].freeIssues += freeQty;
            repMap[repId].collections += Number(order.collectionAmount) || Number(order.collectedAmount) || 0;

            if (dateValue && dateValue >= startMonth) {
                monthOrderCount += 1;
                items.forEach((item) => {
                    returnsCat1Units += Number(item.returnCompanyQty) || 0;
                    returnsCat2Units += Number(item.returnResellQty) || 0;
                    const fq = Number(item.freeQty) || 0;
                    if (fq > 0) {
                        freeIssueUnits += fq;
                        const fCost = Number(item.buyingPrice || item.buyingPriceRaw || item.costPrice) || ((Number(item.unitPrice) || 0) * 0.93);
                        freeIssueValueEst += fq * fCost;
                    }
                    const brand = (item.productBrand || '').trim() || 'Unbranded';
                    const line = (Number(item.orderedQty) || 0) * (Number(item.unitPrice) || 0)
                        + fq * (Number(item.unitPrice) || 0);
                    brandMonth[brand] = (brandMonth[brand] || 0) + line;
                });
            }

            if (isRevenueOrder) {
                if (status === 'approved') approvedCount++;
                else if (status === 'dispatched') dispatchedCount++;
                else if (status === 'delivered' || status === 'completed') deliveredCount++;
            } else if (status === 'rejected' || status === 'cancelled') {
                rejectedCount++;
            }

            if (dateValue && isRevenueOrder) {
                const dk = dateValue.toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
                const di = trendDayKeyToIndex[dk];
                if (di != null) dayTotals[di] += amount;
            }
        };

        pendingSnap.docs.forEach((doc) => accumulateOrder(doc.data(), true));
        snapshot.docs.forEach((doc) => accumulateOrder(doc.data(), false));

        let outOfStockCount = 0;
        let lowStockAlertCount = 0;
        const lowStockList = [];
        const topProductLines = [];
        productsSnap.forEach((doc) => {
            const p = doc.data();
            const q = Number(p.currentStock != null ? p.currentStock : p.stock) || 0;
            const buyPrice = Number(p.buyingPrice || p.buyingPriceRaw || p.costPrice) || ((Number(p.unitPrice) || 0) * 0.93);
            if (q === 0) outOfStockCount++;
            else if (q <= (Number(p.minStockLevel) || 10)) lowStockAlertCount++;
            if (q === 0 || (q > 0 && q <= (Number(p.minStockLevel) || 10))) {
                lowStockList.push({ name: p.name || '—', brand: p.brand || '', q });
            }
            topProductLines.push({
                name: p.name || '—',
                brand: p.brand || '',
                v: q * buyPrice
            });
        });
        lowStockList.sort((a, b) => a.q - b.q);
        topProductLines.sort((a, b) => b.v - a.v);

        let newCustomers = 0;
        shopsSnap.forEach((doc) => {
            const c = doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : null;
            if (c && c >= startMonth) newCustomers++;
        });

        const repSummary = Object.values(repMap).sort((a, b) => b.totalOrders - a.totalOrders);
        const brandLabels = Object.keys(brandMonth).sort((a, b) => (brandMonth[b] || 0) - (brandMonth[a] || 0)).slice(0, 8);
        const brandValues = brandLabels.map((k) => brandMonth[k] || 0);
        const repLeaderLabels = repSummary.slice(0, 8).map((r) => r.repName);
        const repLeaderValues = repSummary.slice(0, 8).map((r) => r.collections || 0);

        const recentOrdersList = snapshot.docs.map((d) => {
            const data = d.data() || {};
            const dtObj = parseOrderDate(data);
            const formattedDate = dtObj ? dtObj.toLocaleString('en-GB', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true
            }) : '-';
            return {
                id: d.id,
                ...data,
                _dtObj: dtObj,
                orderDateFormatted: formattedDate
            };
        })
        .sort((a, b) => {
            const ta = a._dtObj ? a._dtObj.getTime() : 0;
            const tb = b._dtObj ? b._dtObj.getTime() : 0;
            return tb - ta;
        })
        .slice(0, 15);

        return {
            todaySales,
            monthSales,
            pendingOrders,
            approvedCount,
            rejectedCount,
            dispatchedCount,
            deliveredCount,
            totalStockValue,
            outOfStockCount,
            lowStockAlertCount,
            returnsCat1Units,
            returnsCat2Units,
            returnsCat3Units,
            freeIssueUnits,
            freeIssueValueEst,
            outstandingBalance,
            activeReps: repsSnap.size,
            newCustomers,
            monthOrderCount,
            cashFlow,
            cashBalance,
            bankBalance,
            monthReturnsValue,
            monthFreeIssuesValue,
            repSummary,
            repFilterOptions: repSummary.map((rep) => ({ repId: rep.repId, repName: rep.repName })),
            distributorTrendLabels: dayKeys,
            distributorTrendData: dayTotals,
            distributorBrandLabels: brandLabels,
            distributorBrandData: brandValues,
            distributorRepLeaderLabels: repLeaderLabels,
            distributorRepLeaderData: repLeaderValues,
            lowStockList: lowStockList.slice(0, 15),
            topProductLines: topProductLines.slice(0, 12),
            recentOrdersList
        };
    }

    async getRetailMetrics(context) {
        const startToday = new Date();
        startToday.setHours(0, 0, 0, 0);
        const startMonth = new Date(startToday.getFullYear(), startToday.getMonth(), 1);

        this.syncUnjournaledTransactions(context.businessId, context.userEmail).catch(() => {});

        // Concurrently fetch unified orders, products (flat + subcollection), and journal entries
        const [orderSnapshot, pFlat, pNested, journalSnapshot] = await Promise.all([
            this.fetchUnifiedOrders(context.businessId, context.userEmail),
            window.db.collection("businesses").doc(context.businessId).collection('products').limit(1000).get().catch(() => ({ docs: [] })),
            window.db.collection('products').doc(context.businessId).collection('list').limit(1000).get().catch(() => ({ docs: [] })),
            window.db.collection('journal').doc(context.businessId).collection('entries')
                .orderBy('date', 'desc')
                .limit(500)
                .get()
                .catch(() => ({ docs: [] }))
        ]);

        const prodMap = {};
        [...(pFlat.docs || []), ...(pNested.docs || [])].forEach(d => { prodMap[d.id] = d; });
        const productSnapshot = { docs: Object.values(prodMap) };

        let pendingOrders = 0;
        (orderSnapshot.docs || []).forEach(doc => {
            const order = doc.data() || {};
            if (['pending', 'hold', 'credit'].includes(order.status)) pendingOrders++;
        });

        let lowStock = 0;
        let computedStockValue = 0;
        (productSnapshot.docs || []).forEach(doc => {
            const data = doc.data() || {};
            const stock = Number(data.stock) || 0;
            if (stock > 0 && stock <= 10) lowStock++;
            const cost = Number(data.cost) || Number(data.price) || 0;
            if (stock > 0 && cost > 0) computedStockValue += (stock * cost);
        });

        const allEntries = (journalSnapshot.docs || []).map(doc => doc.data());

        const monthEntries = allEntries.filter(entry => {
            if (!entry.date) return false;
            const entryDate = entry.date.toDate ? entry.date.toDate() : new Date(entry.date);
            return entryDate >= startMonth;
        });

        let monthSales = 0;
        let todaySales = 0;

        orderSnapshot.docs.forEach(doc => {
            const order = doc.data() || {};
            const st = String(order.status || '').toLowerCase();
            const isRev = order.isReversed === true || st === 'cancelled' || st === 'reversed' || st === 'void';
            if (!isRev) {
                const amount = Number(order.totalAmount || order.grandTotal || order.total || order.amount || 0);
                const dt = order.orderDate?.toDate ? order.orderDate.toDate() : (order.createdAt ? new Date(order.createdAt) : (order.date ? new Date(order.date) : null));
                if (dt && !isNaN(dt.getTime())) {
                    if (dt >= startToday) todaySales += amount;
                    if (dt >= startMonth) monthSales += amount;
                } else {
                    monthSales += amount;
                }
            }
        });

        const cashFlow = this.calculateCashFlow(monthEntries);
        const cashBalance = monthEntries.reduce((sum, entry) => {
            if (!Array.isArray(entry.entries)) return sum;
            return sum + entry.entries.reduce((entrySum, row) => {
                const code = String(row.accountCode || row.accountId || '');
                if (!code.startsWith('1-1010') && code !== 'AC-10100') return entrySum;
                let dr = Number(row.debit) || 0;
                let cr = Number(row.credit) || 0;
                if (row.amount !== undefined && row.type !== undefined) {
                    if (row.type === 'debit') dr = Number(row.amount) || 0;
                    if (row.type === 'credit') cr = Number(row.amount) || 0;
                }
                return entrySum + dr - cr;
            }, 0);
        }, 0);
        const bankBalance = monthEntries.reduce((sum, entry) => {
            if (!Array.isArray(entry.entries)) return sum;
            return sum + entry.entries.reduce((entrySum, row) => {
                const code = String(row.accountCode || row.accountId || '');
                if (!code.startsWith('1-1020') && code !== 'AC-10200') return entrySum;
                let dr = Number(row.debit) || 0;
                let cr = Number(row.credit) || 0;
                if (row.amount !== undefined && row.type !== undefined) {
                    if (row.type === 'debit') dr = Number(row.amount) || 0;
                    if (row.type === 'credit') cr = Number(row.amount) || 0;
                }
                return entrySum + dr - cr;
            }, 0);
        }, 0);

        let w1 = 0, w2 = 0, w3 = 0, w4 = 0;
        monthEntries.forEach(entry => {
            const entryDate = entry.date?.toDate ? entry.date.toDate() : new Date(entry.date);
            const day = entryDate.getDate();
            let net = 0;
            if (Array.isArray(entry.entries)) {
                entry.entries.forEach(row => {
                    const code = String(row.accountCode || row.accountId || '');
                    if (!code.startsWith('1-1010') && !code.startsWith('1-1020') && code !== 'AC-10100' && code !== 'AC-10200') return;
                    let dr = Number(row.debit) || 0;
                    let cr = Number(row.credit) || 0;
                    if (row.amount !== undefined && row.type !== undefined) {
                        if (row.type === 'debit') dr = Number(row.amount) || 0;
                        if (row.type === 'credit') cr = Number(row.amount) || 0;
                    }
                    net += dr - cr;
                });
            }
            if (day <= 7) w1 += net;
            else if (day <= 14) w2 += net;
            else if (day <= 21) w3 += net;
            else w4 += net;
        });

        const cashFlowWeeks = [w1, w1 + w2, w1 + w2 + w3, w1 + w2 + w3 + w4];

        let stockValue = 0;
        let supplierOutstanding = 0;
        let customerOutstanding = 0;

        const glBalances = {};
        allEntries.forEach(entry => {
            if (entry.isReversed || entry.reversalOf) return;
            (entry.entries || []).forEach(row => {
                const code = row.accountCode || row.accountId || '';
                if (!code) return;

                let dr = Number(row.debit) || 0;
                let cr = Number(row.credit) || 0;
                if (row.amount !== undefined && row.type !== undefined) {
                    if (row.type === 'debit') dr = Number(row.amount) || 0;
                    if (row.type === 'credit') cr = Number(row.amount) || 0;
                }

                if (!glBalances[code]) {
                    glBalances[code] = { debit: 0, credit: 0 };
                }
                glBalances[code].debit += dr;
                glBalances[code].credit += cr;
            });
        });

        if (glBalances['1-1040-01']) {
            stockValue = glBalances['1-1040-01'].debit - glBalances['1-1040-01'].credit;
        }
        if (!stockValue || stockValue <= 0) {
            stockValue = computedStockValue;
        }
        if (glBalances['1-1030-01']) {
            customerOutstanding = glBalances['1-1030-01'].debit - glBalances['1-1030-01'].credit;
        }
        if (glBalances['2-2010-01']) {
            supplierOutstanding = glBalances['2-2010-01'].credit - glBalances['2-2010-01'].debit;
        }

        return { todaySales, monthSales, pendingOrders, lowStock, cashFlow, cashBalance, bankBalance, cashFlowWeeks, stockValue, supplierOutstanding, customerOutstanding };
    }

    async getTireCentreMetrics(context) {
        if (context && context.businessId) {
            this.syncUnjournaledTransactions(context.businessId, context.userEmail).catch(() => {});
        }
        const extractDate = (val) => {
            if (!val) return null;
            if (typeof val.toDate === 'function') {
                const d = val.toDate();
                return isNaN(d.getTime()) ? null : d;
            }
            if (val.seconds !== undefined) {
                const d = new Date(val.seconds * 1000);
                return isNaN(d.getTime()) ? null : d;
            }
            if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
            if (typeof val === 'number') {
                const d = new Date(val);
                return isNaN(d.getTime()) ? null : d;
            }
            if (typeof val === 'string') {
                if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                    const [y, m, day] = val.split('-').map(Number);
                    return new Date(y, m - 1, day, 12, 0, 0);
                }
                const d = new Date(val);
                return isNaN(d.getTime()) ? null : d;
            }
            return null;
        };

        const toLocalDateStr = (d) => {
            if (!d || isNaN(d.getTime())) return '';
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };

        const now = new Date();
        const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const startMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        const todayStr = toLocalDateStr(now);
        const monthStr = todayStr.slice(0, 7);

        // 1. Fetch Orders / Sales
        let todaySales = 0;
        let monthSales = 0;
        let completedOrdersCount = 0;
        let pendingOrdersCount = 0;
        let creditOrdersSum = 0;
        let cashSales = 0;
        let bankSales = 0;

        let dailyAgg = null;
        let monthlyAgg = null;
        if (window.AggregateUtils) {
            try {
                [dailyAgg, monthlyAgg] = await Promise.all([
                    window.AggregateUtils.getDailyAggregate(window.db, context.businessId),
                    window.AggregateUtils.getMonthlyAggregate(window.db, context.businessId)
                ]);
            } catch (eAgg) {
                console.warn('[DashboardCore] Tire Centre aggregates notice:', eAgg);
            }
        }

        const hasPrecomputedSales = (dailyAgg && typeof dailyAgg.sales_amount === 'number' && monthlyAgg && typeof monthlyAgg.sales_amount === 'number');
        if (hasPrecomputedSales) {
            todaySales = dailyAgg.sales_amount || 0;
            monthSales = monthlyAgg.sales_amount || 0;
        }

        try {
            const orderSnapshot = await window.db.collection('orders').doc(context.businessId).collection('list').get();
            orderSnapshot.docs.forEach(doc => {
                const order = doc.data() || {};
                if (order.isReversed === true || order.status === 'cancelled') return;

                let lineTotal = 0;
                if (Array.isArray(order.items)) {
                    order.items.forEach(item => {
                        const q = Number(item.quantity || item.qty || 0);
                        const p = Number(item.price || item.unitPrice || 0);
                        lineTotal += (q * p);
                    });
                }
                const amt = Number(order.total ?? order.netTotal ?? order.grandTotal ?? order.amount ?? lineTotal ?? 0);
                const oDate = extractDate(order.createdAt) || extractDate(order.date) || extractDate(order.invoiceDate) || extractDate(order.orderDate) || extractDate(order.timestamp);
                const oDateStr = toLocalDateStr(oDate);

                if (!hasPrecomputedSales && oDateStr) {
                    if (oDateStr.startsWith(monthStr)) monthSales += amt;
                    if (oDateStr === todayStr) todaySales += amt;
                }

                const pm = String(order.paymentMethod || 'cash').toLowerCase().trim();
                const pStatus = String(order.paymentStatus || order.status || '').toLowerCase().trim();
                const dueAmt = Number(order.balanceDue !== undefined ? order.balanceDue : (order.amountPaid ? Math.max(0, amt - Number(order.amountPaid)) : amt));
                const isCreditOrder = (order.status === 'credit' || pStatus === 'unpaid' || pStatus === 'credit' || pStatus === 'pending' || pm === 'credit') && dueAmt > 0 && order.status !== 'completed';

                if (!isCreditOrder) {
                    if (pm === 'bank' || pm === 'card' || pm === 'online' || pm === 'bank_transfer') {
                        bankSales += amt;
                    } else if (pm === 'cheque') {
                        // Cheque sales: uncleared until deposited
                    } else {
                        cashSales += amt;
                    }
                }

                if (isCreditOrder || ['pending', 'hold', 'credit', 'unpaid'].includes(pStatus)) {
                    if (dueAmt > 0 && order.status !== 'completed') {
                        pendingOrdersCount++;
                        creditOrdersSum += dueAmt;
                    } else {
                        completedOrdersCount++;
                    }
                } else {
                    completedOrdersCount++;
                }
            });
        } catch (e) {
            console.warn('[Dashboard] Tire Centre orders fetch error:', e);
        }

        // Also check journal entries for SALE refType
        try {
            const journalSnapshot = await window.db.collection('journal').doc(context.businessId).collection('entries').get();
            journalSnapshot.docs.forEach(doc => {
                const entry = doc.data() || {};
                if (entry.isReversed || (entry.refType !== 'SALE' && entry.referenceType !== 'SALE')) return;
                const amt = Number(entry.totalCredit || entry.totalDebit || entry.amount) || 0;
                const eDate = extractDate(entry.date) || extractDate(entry.createdAt);
                const eDateStr = toLocalDateStr(eDate);

                if (eDateStr) {
                    if (eDateStr.startsWith(monthStr) && monthSales === 0) monthSales += amt;
                    if (eDateStr === todayStr && todaySales === 0) todaySales += amt;
                }
            });
        } catch (e) { }

        // 2. Fetch Products / Inventory
        let lowStock = 0;
        let stockValue = 0;
        let totalTireSkus = 0;

        try {
            const productSnapshot = await window.db.collection('products').doc(context.businessId).collection('list').get();
            productSnapshot.docs.forEach(doc => {
                const p = doc.data();
                if (p.isService === true) return; // Skip service items

                totalTireSkus++;
                const stock = Number(p.stock) || 0;
                const restockLevel = Number(p.restockLevel) || 5;
                if (stock <= restockLevel) lowStock++;

                const cost = Number(p.cost) || Number(p.price) || 0;
                if (stock > 0 && cost > 0) {
                    stockValue += (stock * cost);
                }
            });
        } catch (e) {
            console.warn('[Dashboard] Tire Centre products fetch error:', e);
        }

        // 3. Fetch Appointments
        let todayAppointments = 0;
        try {
            const apptSnapshot = await window.db.collection('appointments').doc(context.businessId).collection('list').get();
            apptSnapshot.docs.forEach(doc => {
                const appt = doc.data();
                let aDate = null;
                if (appt.date) aDate = appt.date.toDate ? appt.date.toDate() : new Date(appt.date);
                else if (appt.createdAt) aDate = appt.createdAt.toDate ? appt.createdAt.toDate() : new Date(appt.createdAt);

                if (aDate && !isNaN(aDate.getTime()) && aDate >= startToday && aDate <= endToday) {
                    todayAppointments++;
                }
            });
        } catch (e) {
            console.warn('[Dashboard] Tire Centre appointments fetch error:', e);
        }

        // 4. Fetch Expenses & Cash/Bank split
        let monthExpenses = 0;
        let cashExpenses = 0;
        let bankExpenses = 0;
        try {
            const [expSnapshot1, expSnapshot2] = await Promise.all([
                window.db.collection('expenses').doc(context.businessId).collection('list').get().catch(() => ({ docs: [] })),
                window.db.collection("businesses").doc(context.businessId).collection('expenses').get().catch(() => ({ docs: [] }))
            ]);
            const expDocMap = {};
            [...expSnapshot1.docs, ...expSnapshot2.docs].forEach(d => { expDocMap[d.id] = d.data() || {}; });

            Object.values(expDocMap).forEach(exp => {
                if (exp.isDeleted === true) return;
                const amt = Number(exp.amount) || 0;
                if (amt <= 0) return;

                const eDate = extractDate(exp.expenseDate) || extractDate(exp.createdAt) || extractDate(exp.date);
                const eDateStr = toLocalDateStr(eDate);
                if (eDateStr && eDateStr.startsWith(monthStr)) {
                    monthExpenses += amt;
                }

                const payMethod = String(exp.paymentMethod || 'cash').toUpperCase().trim();
                const isBankExp = payMethod === 'BANK' || payMethod === 'BANK_TRANSFER' || payMethod === 'CARD' || payMethod === 'ONLINE';
                const isChequeExp = payMethod === 'CHEQUE';
                const isCashExp = payMethod === 'CASH' || (!isBankExp && !isChequeExp);

                if (isBankExp) {
                    bankExpenses += amt;
                } else if (isChequeExp) {
                    // Outbound Cheque payable liability, uncleared until passed by bank
                } else if (isCashExp) {
                    cashExpenses += amt;
                }
            });
        } catch (e) {
            console.warn('[Dashboard] Tire Centre expenses fetch error:', e);
        }

        // 5. Fetch Onboarding balances from businesses/{businessId} and journal/{businessId}/entries (Non-Demo Only)
        let initCash = 0;
        let initBank = 0;
        const isDemo = String(context.email || '').toLowerCase().startsWith('test@')
            || String(context.status || '').toUpperCase() === 'DEMO'
            || String(context.plan || '').toUpperCase() === 'DEMO'
            || (window.DemoCleaner && typeof window.DemoCleaner.isStrictlyDemoEmail === 'function' && window.DemoCleaner.isStrictlyDemoEmail(context.email || (window.auth && window.auth.currentUser && window.auth.currentUser.email)));

        if (!isDemo) {
            try {
                const bizDoc = await window.db.collection('businesses').doc(context.businessId).get();
                if (bizDoc.exists && bizDoc.data().onboardingBalances) {
                    const b = bizDoc.data().onboardingBalances;
                    initCash = Number(b.cash) || 0;
                    initBank = Number(b.bank) || 0;
                }

                // Also check journal entries with refType === 'ONBOARDING'
                const journalSnap = await window.db.collection('journal').doc(context.businessId).collection('entries')
                    .where('refType', '==', 'ONBOARDING').get();
                journalSnap.docs.forEach(doc => {
                    const d = doc.data();
                    const ref = String(d.ref || '');
                    (d.entries || []).forEach(row => {
                        const code = String(row.accountCode || row.accountId || '');
                        const amt = Number(row.amount) || Number(row.debit) || 0;
                        if (ref === 'onboarding_cash' || code.startsWith('1-1010')) {
                            if (!initCash) initCash = amt;
                        }
                        if (ref === 'onboarding_bank' || code.startsWith('1-1020')) {
                            if (!initBank) initBank = amt;
                        }
                    });
                });
            } catch (e) {
                console.warn('[Dashboard] Onboarding balance fetch error:', e);
            }
        }

        // 6. Fetch Purchases / GRNs
        let cashPurchases = 0;
        let bankPurchases = 0;
        let unpaidPurchasesSum = 0;
        try {
            const poSnapshot = await window.db.collection('purchases').doc(context.businessId).collection('orders').get();
            poSnapshot.docs.forEach(doc => {
                const po = doc.data() || {};
                if (po.isDeleted === true || po.isReversed === true || po.isOpeningBalance === true || doc.id.startsWith('PO-OPEN-') || doc.id.startsWith('OPEN-')) return;
                const amt = Number(po.netTotal || po.total || po.amount) || 0;
                if (amt <= 0) return;

                const payMethod = String(po.paymentMethod || 'credit').toUpperCase().trim();
                const payStatus = String(po.paymentStatus || 'unpaid').toLowerCase().trim();
                const amtPaid = Number(po.amountPaid || po.paidAmount || (payStatus === 'paid' ? amt : 0)) || 0;
                const outstandingAmt = Math.max(0, amt - amtPaid);

                if (outstandingAmt > 0 && payStatus !== 'paid') {
                    unpaidPurchasesSum += outstandingAmt;
                }

                if (amtPaid > 0 || payStatus === 'paid') {
                    const actualPaid = amtPaid > 0 ? amtPaid : amt;
                    const isCheque = payMethod === 'CHEQUE' || payStatus === 'paid_by_cheque';
                    const isBank = payMethod === 'BANK' || payMethod === 'BANK_TRANSFER' || payMethod === 'CARD' || payMethod === 'ONLINE';
                    
                    if (isCheque) {
                        // Outbound Cheque payable liability
                    } else if (isBank) {
                        bankPurchases += actualPaid;
                    } else {
                        cashPurchases += actualPaid;
                    }
                }
            });
        } catch (e) {
            console.warn('[Dashboard] Purchases fetch error:', e);
        }

        // 7. Bank Transactions for Cash Deposits, Withdrawals, Cheques, Loans

        // 7b. Fetch Bank Transactions for Cash Deposits, Withdrawals, Cheques, Loans
        let cashDepositsTotal = 0;
        let cashWithdrawalsTotal = 0;
        let chequeDepositsTotal = 0;
        let bankLoanAdditions = 0;
        let bankLoanRepayments = 0;
        let bankOpeningTotal = 0;
        try {
            const bankTxSnap = await window.db.collection('banks').doc(context.businessId).collection('transactions').get();
            bankTxSnap.docs.forEach(doc => {
                const tx = doc.data() || {};
                const amt = Number(tx.amount) || 0;
                const type = String(tx.type || '').toUpperCase();
                if (type === 'CASH_DEPOSIT') {
                    cashDepositsTotal += amt;
                } else if (type === 'OPENING_BALANCE' || type === 'INITIAL_BALANCE') {
                    bankOpeningTotal += amt;
                } else if (type === 'CASH_WITHDRAWAL' || type === 'WITHDRAWAL') {
                    cashWithdrawalsTotal += amt;
                } else if (type === 'CHEQUE_DEPOSIT' || type === 'CHEQUE_CLEARANCE') {
                    chequeDepositsTotal += amt;
                } else if (type === 'LOAN' || type === 'LINK_LOAN' || type === 'LOAN_ADDITION') {
                    if (tx.isExistingLiabilityOnly !== true) {
                        bankLoanAdditions += amt;
                    }
                } else if (type === 'LOAN_REPAYMENT' || type === 'REPAY_LOAN') {
                    bankLoanRepayments += amt;
                }
            });
        } catch (e) { }

        const cashInflows = cashSales + cashWithdrawalsTotal;
        const cashOutflows = cashExpenses + cashPurchases + cashDepositsTotal;
        const cashBalance = Number((initCash + cashInflows - cashOutflows).toFixed(2));

        const bankInflows = bankSales + cashDepositsTotal + chequeDepositsTotal + bankLoanAdditions + bankOpeningTotal;
        const bankOutflows = bankExpenses + bankPurchases + cashWithdrawalsTotal + bankLoanRepayments;
        const bankBalance = Number((initBank + bankInflows - bankOutflows).toFixed(2));
        const cashFlow = Number((cashBalance + bankBalance).toFixed(2));

        // 8. Receivables & Payables
        let customerListSum = 0;
        let supplierListSum = 0;
        try {
            const [custSnap1, custSnap2] = await Promise.all([
                window.db.collection('customers').doc(context.businessId).collection('list').get().catch(() => ({ docs: [] })),
                window.db.collection("businesses").doc(context.businessId).collection('customers').get().catch(() => ({ docs: [] }))
            ]);
            const custMap = {};
            [...custSnap1.docs, ...custSnap2.docs].forEach(d => { custMap[d.id] = d; });
            Object.values(custMap).forEach(doc => {
                const c = doc.data() || {};
                if (c.type === 'supplier' || c.isActive === false) return;
                const bal = (c.outstanding !== undefined) ? Number(c.outstanding || 0) : (c.balance !== undefined ? Number(c.balance || 0) : (c.balanceDue !== undefined ? Number(c.balanceDue || 0) : Number(c.openingBalance || 0)));
                customerListSum += Math.max(0, bal);
            });
        } catch (e) { }

        try {
            const [supSnap1, supSnap2, supSnap3] = await Promise.all([
                window.db.collection('suppliers').doc(context.businessId).collection('list').get().catch(() => ({ docs: [] })),
                window.db.collection("businesses").doc(context.businessId).collection('suppliers').get().catch(() => ({ docs: [] })),
                window.db.collection('customers').doc(context.businessId).collection('list').where('type', '==', 'supplier').get().catch(() => ({ docs: [] }))
            ]);
            const supMap = {};
            [...supSnap1.docs, ...supSnap2.docs, ...supSnap3.docs].forEach(d => { supMap[d.id] = d; });
            Object.values(supMap).forEach(doc => {
                const s = doc.data() || {};
                const bal = Math.max(0, Number(s.openingBalance || 0), Number(s.outstanding || 0), Number(s.balance || 0));
                supplierListSum += bal;
            });
        } catch (e) { }

        let hasGL = false;
        let glCashBalance = 0;
        let glBankBalance = 0;
        let glCustomerOutstanding = 0;
        let glSupplierOutstanding = 0;
        let glStockValue = 0;
        let glHasSupplierEntries = false;
        let glHasCustomerEntries = false;

        try {
            const journalSnap = await window.db.collection('journal').doc(context.businessId).collection('entries').get();
            if (!journalSnap.empty) {
                hasGL = true;
                const glBalances = {};
                journalSnap.docs.forEach(doc => {
                    const entry = doc.data();
                    if (entry.isReversed || entry.reversalOf) return;
                    (entry.entries || []).forEach(row => {
                        const code = row.accountCode || row.accountId || '';
                        if (!code) return;
                        let dr = Number(row.debit) || 0;
                        let cr = Number(row.credit) || 0;
                        if (row.amount !== undefined && row.type !== undefined) {
                            if (row.type === 'debit') dr = Number(row.amount) || 0;
                            if (row.type === 'credit') cr = Number(row.amount) || 0;
                        }
                        if (!glBalances[code]) glBalances[code] = { debit: 0, credit: 0 };
                        glBalances[code].debit += dr;
                        glBalances[code].credit += cr;
                    });
                });

                for (const code in glBalances) {
                    if (code.startsWith('1-1010') || code === 'AC-10100') {
                        glCashBalance += (glBalances[code].debit - glBalances[code].credit);
                    }
                    if (code.startsWith('1-1020') || code === 'AC-10200') {
                        glBankBalance += (glBalances[code].debit - glBalances[code].credit);
                    }
                    if (code.startsWith('1-1030') || code === 'AC-10300') {
                        const accName = String(glBalances[code]?.name || '').toLowerCase();
                        if (!accName.includes('inventory') && !accName.includes('stock') && !accName.includes('à¶­à·œà¶œ') && !accName.includes('asset')) {
                            glHasCustomerEntries = true;
                            glCustomerOutstanding += Math.max(0, glBalances[code].debit - glBalances[code].credit);
                        } else {
                            glStockValue += Math.max(0, glBalances[code].debit - glBalances[code].credit);
                        }
                    }
                    if (code.startsWith('2-2010') || code.startsWith('2-1010') || code === 'AC-21000') {
                        glHasSupplierEntries = true;
                        glSupplierOutstanding += Math.max(0, glBalances[code].credit - glBalances[code].debit);
                    }
                }
                if (glBalances['1-1040-01']) glStockValue = Math.max(0, glBalances['1-1040-01'].debit - glBalances['1-1040-01'].credit);
            }
        } catch (e) { }

        let totalPaidToSuppliers = 0;
        try {
            const supPaySnap = await window.db.collection('supplier_payments').doc(context.businessId).collection('list').get();
            supPaySnap.docs.forEach(doc => {
                const p = doc.data() || {};
                if (p.status !== 'bounced' && p.status !== 'cancelled') {
                    totalPaidToSuppliers += Number(p.amount) || 0;
                }
            });
        } catch (e) {}
        let bankAccountsSum = 0;
        let hasBankAccounts = false;
        try {
            const bAccSnap = await window.db.collection('banks').doc(context.businessId).collection('accounts').get();
            if (!bAccSnap.empty) {
                hasBankAccounts = true;
                bAccSnap.docs.forEach(doc => {
                    const acc = doc.data() || {};
                    if (acc.isActive !== false && acc.status !== 'inactive' && acc.status !== 'closed') {
                        const bal = Number(acc.balance !== undefined ? acc.balance : (acc.currentBalance !== undefined ? acc.currentBalance : acc.openingBalance || 0));
                        bankAccountsSum += bal;
                    }
                });
            }
        } catch (e) {}

        const finalCashBalance = cashBalance;
        const finalBankBalance = hasBankAccounts ? Number(bankAccountsSum.toFixed(2)) : (hasGL && glBankBalance !== 0 ? Number(glBankBalance.toFixed(2)) : bankBalance);
        const finalCashFlow = Number((finalCashBalance + finalBankBalance).toFixed(2));

        const customerOutstanding = glHasCustomerEntries ? glCustomerOutstanding : Math.max(customerListSum, creditOrdersSum);
        const computedSupplierOutstanding = Math.max(0, (supplierListSum + unpaidPurchasesSum) - totalPaidToSuppliers);
        let supplierOutstanding = glHasSupplierEntries ? Math.min(glSupplierOutstanding, computedSupplierOutstanding > 0 ? computedSupplierOutstanding : glSupplierOutstanding) : computedSupplierOutstanding;
        if (glSupplierOutstanding === 0 && glHasSupplierEntries) {
            supplierOutstanding = 0;
        }

        if (totalTireSkus > 0 && stockValue === 0 && glStockValue > 0) stockValue = glStockValue;

        const cashFlowWeeks = [
            Math.round(finalCashFlow * 0.25),
            Math.round(finalCashFlow * 0.50),
            Math.round(finalCashFlow * 0.75),
            Math.round(finalCashFlow)
        ];

        return {
            todaySales,
            monthSales,
            todayAppointments,
            lowStock,
            cashFlow: finalCashFlow,
            cashBalance: finalCashBalance,
            bankBalance: finalBankBalance,
            cashInflows,
            cashOutflows,
            bankInflows,
            bankOutflows,
            cashDepositsTotal,
            cashWithdrawalsTotal,
            chequeDepositsTotal,
            bankLoanAdditions,
            bankLoanRepayments,
            cashSales,
            bankSales,
            cashExpenses,
            bankExpenses,
            cashPurchases,
            bankPurchases,
            cashFlowWeeks,
            stockValue,
            supplierOutstanding,
            customerOutstanding,
            totalTireSkus,
            pendingOrdersCount,
            completedOrdersCount
        };
    }

    async getPharmacyMetrics(context) {
        const startToday = new Date();
        startToday.setHours(0, 0, 0, 0);
        const in30Days = new Date(startToday);
        in30Days.setDate(in30Days.getDate() + 30);

        const productSnapshot = await window.db.collection('products').doc(context.businessId).collection('list').get();
        let lowStock = 0;
        let expiringSoon = 0;
        let expiredCount = 0;
        const categories = {};

        productSnapshot.docs.forEach((doc) => {
            const item = doc.data();
            const stock = Number(item.stock) || 0;
            if (stock > 0 && stock <= 10) lowStock++;
            const category = (item.drugCategory || item.category || 'Uncategorized').trim();
            categories[category] = (categories[category] || 0) + 1;
            const expiryDate = item.expiryDate?.toDate ? item.expiryDate.toDate() : (item.expiryDate ? new Date(item.expiryDate) : null);
            if (expiryDate && !Number.isNaN(expiryDate.getTime())) {
                if (expiryDate < startToday) expiredCount++;
                else if (expiryDate <= in30Days) expiringSoon++;
            }
        });

        let prescriptionUploads = 0;
        try {
            const rxSnapshot = await window.db.collection("businesses").doc(context.businessId).collection('prescriptions')
                .get();
            prescriptionUploads = rxSnapshot.size;
        } catch (error) {
            console.warn('Prescription collection unavailable:', error?.message || error);
        }

        const baseMetrics = await this.getRetailMetrics(context);
        return {
            ...baseMetrics,
            expiringSoon,
            expiredCount,
            drugCategories: Object.keys(categories).length,
            topDrugCategories: Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5),
            prescriptionUploads,
            dashboardStructure: ['sales', 'expiryAlerts', 'drugCategories', 'prescriptionQueue', 'lowStock', 'cashFlow']
        };
    }

    async getHardwareMetrics(context) {
        const productSnapshot = await window.db.collection('products').doc(context.businessId).collection('list').get();
        let convertibleItems = 0;
        let weightPricedItems = 0;
        let bulkItems = 0;
        let inventoryUnitsTracked = 0;

        productSnapshot.docs.forEach((doc) => {
            const item = doc.data();
            const unit = String(item.sellingUnit || item.stockUnit || item.unit || '').toLowerCase();
            const altUnits = Array.isArray(item.altUnits) ? item.altUnits.length : 0;
            if (['ft', 'feet', 'inch', 'inches', 'mm', 'cm', 'm'].includes(unit) || altUnits > 0) convertibleItems++;
            if (item.pricePerKg || item.pricePerTon || item.weightPricing === true) weightPricedItems++;
            if (item.isBulk === true || ['kg', 'ton', 'cft', 'cube'].includes(unit)) bulkItems++;
            if (unit) inventoryUnitsTracked++;
        });

        const baseMetrics = await this.getRetailMetrics(context);
        const ordersSnapshot = await this.fetchUnifiedOrders(context.businessId, context.userEmail);
        let quotationCount = 0;
        let convertedCount = 0;
        let invoiceCount = 0;
        const now = new Date();
        ordersSnapshot.docs.forEach((doc) => {
            const row = doc.data();
            if (row.businessType !== 'hardware') return;
            if (row.status === 'QUOTATION') {
                const validUntil = row.validUntil ? new Date(row.validUntil) : null;
                const isActive = !validUntil || (validUntil >= now);
                if (isActive) quotationCount++;
            }
            if (row.status === 'CONVERTED') convertedCount++;
            if (row.status === 'INVOICE') invoiceCount++;
        });
        const issuedQuotes = quotationCount + convertedCount;
        const quoteConversionRate = issuedQuotes > 0 ? (convertedCount / issuedQuotes) * 100 : 0;

        return {
            ...baseMetrics,
            unitConvertibleItems: convertibleItems,
            bulkWeightPricedItems: weightPricedItems,
            bulkItems,
            inventoryUnitsTracked,
            quotationCount,
            quoteConversionRate,
            hardwareSalesVsQuotations: {
                sales: invoiceCount,
                quotations: issuedQuotes
            },
            dashboardStructure: ['sales', 'inventory', 'unitConversions', 'weightPricing', 'bulkItems', 'quotationCount', 'quoteConversionRate', 'cashFlow']
        };
    }

    async getServiceMetrics(context) {
        const startToday = new Date();
        startToday.setHours(0, 0, 0, 0);
        const endToday = new Date(startToday);
        endToday.setDate(endToday.getDate() + 1);

        let todayAppointments = 0;
        let upcomingAppointments = 0;
        let completedToday = 0;
        let serviceBills = 0;
        let clients = 0;

        try {
            const apptSnapshot = await window.db.collection("businesses").doc(context.businessId).collection('appointments')
                .get();
            apptSnapshot.docs.forEach((doc) => {
                const appt = doc.data();
                const when = appt.date?.toDate ? appt.date.toDate() : (appt.date ? new Date(appt.date) : null);
                if (!when || Number.isNaN(when.getTime())) return;
                const status = String(appt.status || '').toLowerCase();
                if (when >= startToday && when < endToday) {
                    todayAppointments++;
                    if (status === 'completed') completedToday++;
                } else if (when >= endToday) {
                    upcomingAppointments++;
                }
            });
        } catch (error) {
            console.warn('Appointments collection unavailable:', error?.message || error);
        }

        try {
            const billSnapshot = await window.db.collection("businesses").doc(context.businessId).collection('serviceBills')
                .get();
            serviceBills = billSnapshot.size;
        } catch (error) {
            console.warn('Service billing collection unavailable:', error?.message || error);
        }

        try {
            const clientsSnapshot = await window.db.collection("businesses").doc(context.businessId).collection('clients')
                .get();
            clients = clientsSnapshot.size;
        } catch (error) {
            console.warn('Clients collection unavailable:', error?.message || error);
        }

        const monthJournal = await window.db.collection('journal').doc(context.businessId).collection('entries').get();
        const entries = monthJournal.docs.map((doc) => doc.data());
        const serviceRevenue = entries
            .filter((entry) => ['SALE', 'SERVICE_BILL'].includes(entry.referenceType))
            .reduce((sum, entry) => sum + (Number(entry.totalCredit) || 0), 0);
        const cashFlow = this.calculateCashFlow(entries);
        const utilization = todayAppointments > 0 ? (completedToday / todayAppointments) * 100 : 0;

        return {
            todaySales: serviceRevenue,
            monthSales: serviceRevenue,
            pendingOrders: Math.max(upcomingAppointments, 0),
            cashFlow,
            todayAppointments,
            upcomingAppointments,
            serviceBills,
            clients,
            utilization,
            dashboardStructure: ['todayAppointments', 'upcoming', 'serviceRevenue', 'serviceBills', 'utilization', 'clients']
        };
    }

    async getScrapMetrics(context) {
        const bid = context.businessId;
        this.syncUnjournaledTransactions(bid, context.userEmail).catch(() => {});
        const startToday = new Date();
        startToday.setHours(0, 0, 0, 0);
        const startMonth = new Date(startToday.getFullYear(), startToday.getMonth(), 1);
        const startTodayMs = startToday.getTime();
        const startMonthMs = startMonth.getTime();

        const yearAgo = new Date();
        yearAgo.setDate(yearAgo.getDate() - 364);
        yearAgo.setHours(0, 0, 0, 0);
        const yearAgoMs = yearAgo.getTime();

        const isScrap = String(context.businessType || '').toLowerCase() === 'scrap_collection_center';
        const emptySnap = () => ({ docs: [] });
        const [itemsSnap, buySnap, sellSnap, loanSnap, allJournalSnap, journalLedgerSnap, openingSnap, extSnap, advSnap, incomeSnap] = await Promise.all([
            window.db.collection("businesses").doc(bid).collection('scrap_items').get().catch(() => emptySnap()),
            window.db.collection("businesses").doc(bid).collection('buying_history').get().catch(() => emptySnap()),
            window.db.collection("businesses").doc(bid).collection('selling_history').get().catch(() => emptySnap()),
            window.db.collection("businesses").doc(bid).collection('scrap_loans').get().catch(() => emptySnap()),
            window.db.collection('journal').doc(bid).collection('entries').get().catch(() => emptySnap()),
            window.db.collection('journal').doc(bid).collection('account_ledger').get().catch(() => emptySnap()),
            window.db.collection('journal').doc(bid).collection('ledger_opening').doc('current').get().catch(() => ({ exists: false, data: () => ({}) })),
            window.db.collection("businesses").doc(bid).collection('scrap_external_settlements').get().catch(() => emptySnap()),
            window.db.collection("businesses").doc(bid).collection('scrap_advances').get().catch(() => emptySnap()),
            window.db.collection("businesses").doc(bid).collection('scrap_income').get().catch(() => emptySnap())
        ]);
        const legacyEntries = this.querySnapDocs(allJournalSnap).map((doc) => doc.data());
        const todayEntries = legacyEntries.filter((entry) => {
            const dt = entry.date?.toDate ? entry.date.toDate() : (entry.date ? new Date(entry.date) : null);
            return dt && !Number.isNaN(dt.getTime()) && dt >= startToday;
        });
        const monthEntries = legacyEntries.filter((entry) => {
            const dt = entry.date?.toDate ? entry.date.toDate() : (entry.date ? new Date(entry.date) : null);
            return dt && !Number.isNaN(dt.getTime()) && dt >= startMonth;
        });
        const mergedSynthetic = isScrap
            ? this.syntheticJournalFromMerged(allJournalSnap, journalLedgerSnap, openingSnap, { scrapOpeningLedgerOnly: true })
            : this.syntheticJournalFromMerged(allJournalSnap, journalLedgerSnap, openingSnap, {});
        const allEntries = isScrap
            ? (mergedSynthetic.length ? mergedSynthetic : [])
            : (mergedSynthetic.length ? mergedSynthetic : legacyEntries);

        let stockValue = 0;
        let lowStock = 0;
        this.querySnapDocs(itemsSnap).forEach((doc) => {
            const r = doc.data();
            const stock = Number(r.currentStock) || 0;
            const cp = Number(r.costPrice);
            const cost = (Number.isFinite(cp) && cp > 0) ? cp : 0;
            stockValue += stock * cost;
            if (stock > 0 && stock <= 10) lowStock += 1;
        });

        // Map of selling prices for margin calculation
        const sellPriceMap = {};
        this.querySnapDocs(itemsSnap).forEach(doc => {
            const r = doc.data();
            sellPriceMap[doc.id] = Number(r.sellingPrice) || 0;
        });

        // Dynamic Range Calculation
        const allSnaps = [buySnap, sellSnap, incomeSnap];
        let minTms = startTodayMs;
        const getUniversalDate = (row) => this.scrapOperationalDateMs(row) || (row.incomeDate ? new Date(row.incomeDate).getTime() : null);

        allSnaps.forEach(snap => {
            this.querySnapDocs(snap).forEach(doc => {
                const t = getUniversalDate(doc.data());
                if (t && t < minTms && t >= yearAgoMs) minTms = t;
            });
        });

        const diffMs = startTodayMs - minTms;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        // End at Yesterday, Start at Earliest
        // If diffDays is 2 (May 11, 12), displayDays should be 2.
        const displayDays = Math.max(1, Math.min(365, diffDays));

        // Dynamic Aggregation Maps
        const buy365Map = {};
        const sell365Map = {};
        const profit365Map = {};
        const dateLabels365 = [];
        const dateKeys365 = [];

        // Helper for zero-padding: 5 -> "05"
        const pad = (n) => String(n).padStart(2, '0');

        for (let i = displayDays; i >= 1; i--) {
            const d = new Date(startToday);
            d.setDate(d.getDate() - i);
            const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
            dateKeys365.push(key);
            buy365Map[key] = 0;
            sell365Map[key] = 0;
            profit365Map[key] = 0;
            dateLabels365.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
        }

        const getDayKey = (row) => {
            const tms = getUniversalDate(row);
            if (tms == null) return null;
            const d = new Date(tms);
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        };

        let todayBuying = 0;
        let monthBuying = 0;
        let todayStockIn = 0;
        let monthStockIn = 0;
        let buyMatchedCount = 0;

        this.querySnapDocs(buySnap).forEach((doc) => {
            const r = doc.data();
            const amount = Number(r.totalAmount) || 0;
            const weight = Number(r.totalWeight) || 0;
            const tms = this.scrapOperationalDateMs(r);
            if (tms == null) return;

            if (tms >= startMonthMs) {
                monthBuying += amount;
                monthStockIn += weight;
            }
            if (tms >= startTodayMs) {
                todayBuying += amount;
                todayStockIn += weight;
            }

            // Aggregation for 365 Days Charts
            const k = getDayKey(r);
            if (dateKeys365.includes(k)) {
                if (buy365Map[k] !== undefined) {
                    buy365Map[k] += amount;
                    buyMatchedCount++;
                }

                // Profit components: Buying Margin + Vehicle Hire
                let m = 0;
                const items = Array.isArray(r.items) ? r.items : [];
                items.forEach((line) => {
                    const w = Number(line.weight) || 0;
                    const bp = Number(line.buyingPrice) || 0;
                    const sp = sellPriceMap[line.itemId] || 0;
                    m += w * Math.max(0, sp - bp);
                });
                const vh = Number(r.vehicleHireApplied || 0);
                profit365Map[k] += (m + vh);
            }
        });

        // Add Additional Income from scrap_income
        this.querySnapDocs(incomeSnap).forEach((doc) => {
            const r = doc.data();
            const k = getDayKey(r);
            if (k && profit365Map[k] !== undefined) {
                profit365Map[k] += (Number(r.amount) || 0);
            }
        });

        let todaySales = 0;
        let monthSales = 0;
        let todayStockOut = 0;
        let monthStockOut = 0;
        let sellMatchedCount = 0;

        this.querySnapDocs(sellSnap).forEach((doc) => {
            const r = doc.data();
            const amount = Number(r.totalAmount) || 0;
            const qty = Number(r.qty) || 0;
            const tms = this.scrapOperationalDateMs(r);
            if (tms == null) return;

            if (tms >= startMonthMs) {
                monthSales += amount;
                monthStockOut += qty;
            }
            if (tms >= startTodayMs) {
                todaySales += amount;
                todayStockOut += qty;
            }

            const k = getDayKey(r);
            if (dateKeys365.includes(k)) {
                if (sell365Map[k] !== undefined) {
                    sell365Map[k] += amount;
                    sellMatchedCount++;
                }
            }
        });

        console.log(`[Scrap-Sync] Days:${displayDays}, Matched Buy:${buyMatchedCount}, Sell:${sellMatchedCount}`);

        let outstandingLoans = 0;
        this.querySnapDocs(loanSnap).forEach((doc) => {
            const row = doc.data() || {};
            const bal = Number(row.balance) || 0;
            if (bal > 0) outstandingLoans += bal;
        });
        let externalSettlementNet = 0;
        this.querySnapDocs(extSnap).forEach((doc) => {
            const row = doc.data();
            const tms = this.scrapOperationalDateMs(row);
            if (tms == null || tms < startMonthMs) return;
            externalSettlementNet += Number(row.amount) || 0;
        });
        let advanceOutstanding = 0;
        this.querySnapDocs(advSnap).forEach((doc) => {
            const row = doc.data();
            advanceOutstanding += Number(row.balance != null ? row.balance : row.amount) || 0;
        });
        /* Cash + bank: merged GL when available; else legacy journal lines (calculateCashFlow only looked at 1-1010-01). */
        const cashFlow = mergedSynthetic.length
            ? this.accountBalance(allEntries, (code) => String(code || '').startsWith('1-1010'))
            : this.accountBalance(legacyEntries, (code) => String(code || '').startsWith('1-1010'));
        const accountingTodaySales = todayEntries.reduce((sum, entry) => {
            const ref = String(entry.referenceType || '').toUpperCase();
            if (!['SCRAP_BILL', 'SCRAP_SELL'].includes(ref)) return sum;
            return sum + (Number(entry.totalCredit) || 0);
        }, 0);
        const accountingTodayBuying = todayEntries.reduce((sum, entry) => {
            const ref = String(entry.referenceType || '').toUpperCase();
            if (ref !== 'SCRAP_BUYING') return sum;
            return sum + (Number(entry.totalDebit) || 0);
        }, 0);
        const accountingMonthSales = monthEntries.reduce((sum, entry) => {
            const ref = String(entry.referenceType || '').toUpperCase();
            if (!['SCRAP_BILL', 'SCRAP_SELL'].includes(ref)) return sum;
            return sum + (Number(entry.totalCredit) || 0);
        }, 0);
        const accountingMonthBuying = monthEntries.reduce((sum, entry) => {
            const ref = String(entry.referenceType || '').toUpperCase();
            if (ref !== 'SCRAP_BUYING') return sum;
            return sum + (Number(entry.totalDebit) || 0);
        }, 0);

        return {
            todaySales: todaySales || accountingTodaySales,
            monthSales: monthSales || accountingMonthSales,
            todayBuying: todayBuying || accountingTodayBuying,
            monthBuying: monthBuying || accountingMonthBuying,
            todayStockIn,
            monthStockIn,
            todayStockOut,
            monthStockOut,
            stockValue,
            lowStock,
            cashFlow,
            outstandingLoans,
            externalSettlementNet,
            advanceOutstanding,
            chart365: {
                labels: dateLabels365,
                buy: dateKeys365.map(k => buy365Map[k] || 0),
                sell: dateKeys365.map(k => sell365Map[k] || 0),
                profit: dateKeys365.map(k => profit365Map[k] || 0)
            },
            dashboardStructure: ['todayBuying', 'todaySales', 'stockValue', 'cashFlow', 'monthBuying', 'monthSales', 'outstandingLoans', 'advanceOutstanding']
        };
    }

    async getManufacturerMetrics(context) {
        const bid = context.businessId;
        this.syncUnjournaledTransactions(bid, context.userEmail).catch(() => {});
        const startToday = new Date();
        startToday.setHours(0, 0, 0, 0);
        const startMonth = new Date(startToday.getFullYear(), startToday.getMonth(), 1);
        const start30 = new Date(startToday);
        start30.setDate(start30.getDate() - 29);
        const dayKeys = [];
        const dayIdx = {};
        for (let i = 0; i < 30; i++) {
            const d = new Date(start30);
            d.setDate(start30.getDate() + i);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            dayIdx[key] = i;
            dayKeys.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
        }
        const purchases30 = new Array(30).fill(0);
        const sales30 = new Array(30).fill(0);
        const production30 = new Array(30).fill(0);
        const profit30 = new Array(30).fill(0);
        const purchaseSplit30 = new Array(30).fill(0).map(() => ({ cash: 0, credit: 0, cheque: 0 }));
        const salesSplit30 = new Array(30).fill(0).map(() => ({ cash: 0, credit: 0, cheque: 0 }));

        const parseDate = (val) => {
            if (!val) return null;
            if (typeof val.toDate === 'function') return val.toDate();
            if (val.seconds !== undefined) return new Date(val.seconds * 1000);
            if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
            if (typeof val === 'number') return new Date(val);
            if (typeof val === 'string') {
                const d = new Date(val);
                return isNaN(d.getTime()) ? null : d;
            }
            return null;
        };

        const collPrefix = context.businessType === 'bakery' ? 'bakery_' : 'manufacturer_';

        const [rmSnap, fgSnap, prodSnap, prodRunsSnap, opSnap, sideSnap, journalSnap, mapSnap, payableSnap, receivableSnap, rawHistSnap, salesHistSnap] = await Promise.all([
            window.db.collection("businesses").doc(bid).collection(`${collPrefix}raw_materials`).get().catch(() => ({ docs: [] })),
            window.db.collection("businesses").doc(bid).collection(`${collPrefix}finished_products`).get().catch(() => ({ docs: [] })),
            window.db.collection("businesses").doc(bid).collection(`${collPrefix}production_batches`).get().catch(() => ({ docs: [] })),
            window.db.collection("businesses").doc(bid).collection(`${collPrefix}production_runs`).get().catch(() => ({ docs: [] })),
            window.db.collection("businesses").doc(bid).collection(`${collPrefix}expenses`).get().catch(() => ({ docs: [] })),
            window.db.collection("businesses").doc(bid).collection(`${collPrefix}side_income`).get().catch(() => ({ docs: [] })),
            window.db.collection('journal').doc(bid).collection('entries').get().catch(() => ({ docs: [] })),
            window.db.collection("businesses").doc(bid).collection(`${collPrefix}transformations`).get().catch(() => ({ docs: [] })),
            window.db.collection("businesses").doc(bid).collection(`${collPrefix}raw_material_history`).where('paymentStatus', 'in', ['PENDING', 'PENDING_CLEARANCE']).get().catch(() => ({ docs: [] })),
            window.db.collection("businesses").doc(bid).collection(`${collPrefix}sales`).where('paymentStatus', 'in', ['PENDING', 'PENDING_CLEARANCE']).get().catch(() => ({ docs: [] })),
            window.db.collection("businesses").doc(bid).collection(`${collPrefix}raw_material_history`).get().catch(() => ({ docs: [] })),
            window.db.collection("businesses").doc(bid).collection(`${collPrefix}sales`).get().catch(() => ({ docs: [] }))
        ]);

        let rmStockValue = 0;
        rmSnap.docs.forEach((doc) => {
            const d = doc.data() || {};
            if (d.isActive === false) return;
            rmStockValue += (Number(d.stockQty) || 0) * (Number(d.lastUnitCost || d.unitCost || 0));
        });

        let fgStockValue = 0;
        fgSnap.docs.forEach((doc) => {
            const d = doc.data() || {};
            if (d.isActive === false) return;
            const q = Math.max(0, Number(d.stockQty) || 0);
            const cost = Number(d.unitCost || d.unitPrice || 0);
            fgStockValue += q * cost;
        });

        let productionRuns = 0;
        let productionCostMonth = 0;
        const allProdDocs = [...prodSnap.docs, ...prodRunsSnap.docs];
        const processedBatchIds = new Set();

        allProdDocs.forEach((doc) => {
            if (processedBatchIds.has(doc.id)) return;
            processedBatchIds.add(doc.id);
            const d = doc.data() || {};
            const t = parseDate(d.createdAt || d.date);
            if (t && t >= startMonth) {
                productionRuns += 1;
                productionCostMonth += Number(d.totalBatchCost || d.processingCost || 0);
            }
            if (t && t >= start30) {
                const k = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
                const i = dayIdx[k];
                if (i != null) {
                    production30[i] += Number(d.producedQty || 0);
                    profit30[i] -= Number(d.totalBatchCost || d.processingCost || 0);
                }
            }
        });

        let operationalCostMonth = 0;
        opSnap.docs.forEach((doc) => {
            const d = doc.data() || {};
            if (d.isActive === false) return;
            const t = parseDate(d.createdAt || d.expenseDate);
            if (t && t >= startMonth) {
                operationalCostMonth += Number(d.amount || 0);
            }
            if (t && t >= start30) {
                const k = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
                const i = dayIdx[k];
                if (i != null) profit30[i] -= Number(d.amount || 0);
            }
        });

        let sideIncomeMonth = 0;
        sideSnap.docs.forEach((doc) => {
            const d = doc.data() || {};
            if (d.isActive === false) return;
            const t = parseDate(d.date || d.createdAt);
            if (t && t >= startMonth) {
                sideIncomeMonth += Number(d.amount || 0);
            }
            if (t && t >= start30) {
                const k = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
                const i = dayIdx[k];
                if (i != null) profit30[i] += Number(d.amount || 0);
            }
        });

        let rmPurchaseMonth = 0;
        rawHistSnap.docs.forEach((doc) => {
            const d = doc.data() || {};
            if (d.isActive === false) return;
            const t = parseDate(d.createdAt || d.purchaseDate);
            const amt = Number(d.amount || 0);
            if (t && t >= startMonth) {
                rmPurchaseMonth += amt;
            }
            if (t && t >= start30) {
                const k = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
                const i = dayIdx[k];
                if (i != null) {
                    purchases30[i] += amt;
                    profit30[i] -= amt;
                    const m = String(d.paymentMode || '').toUpperCase();
                    if (m === 'CREDIT') purchaseSplit30[i].credit += amt;
                    else if (m === 'CHEQUE') purchaseSplit30[i].cheque += amt;
                    else purchaseSplit30[i].cash += amt;
                }
            }
        });

        let todaySales = 0;
        let todayCogs = 0;
        let todayProfit = 0;
        let monthSales = 0;
        let monthCogs = 0;
        let monthProfitFromSales = 0;
        let overdueCollectablesCount = 0;
        let overdueCollectablesAmount = 0;
        const overdueList = [];
        const todayMs = new Date().getTime();

        salesHistSnap.docs.forEach((doc) => {
            const d = doc.data() || {};
            if (d.isActive === false) return;
            const t = parseDate(d.createdAt || d.saleDate);
            if (!t) return;

            const amt = Number(d.amount || 0);
            const cogs = Number(d.cogsAmount || (Number(d.qty || 0) * Number(d.fgUnitCost || 0)));
            const profit = amt - cogs;

            if (t >= startToday) {
                todaySales += amt;
                todayCogs += cogs;
                todayProfit += profit;
            }
            if (t >= startMonth) {
                monthSales += amt;
                monthCogs += cogs;
                monthProfitFromSales += profit;
            }

            if (t >= start30) {
                const k = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
                const i = dayIdx[k];
                if (i != null) {
                    sales30[i] += amt;
                    profit30[i] += profit;
                    const m = String(d.paymentMode || '').toUpperCase();
                    if (m === 'CREDIT') salesSplit30[i].credit += amt;
                    else if (m === 'CHEQUE') salesSplit30[i].cheque += amt;
                    else salesSplit30[i].cash += amt;
                }
            }
        });

        receivableSnap.docs.forEach((doc) => {
            const d = doc.data() || {};
            if (d.isActive === false) return;
            const isCredit = d.paymentMode === 'CREDIT';
            const isCheque = d.paymentMode === 'CHEQUE';
            const dueStr = isCredit ? d.dueDate : (isCheque ? d.chequeClearanceDate : null);
            const amt = Number(d.amount || 0);

            let isOverdue = false;
            if (dueStr) {
                const dueMs = new Date(dueStr + 'T23:59:59').getTime();
                if (!isNaN(dueMs) && dueMs < todayMs) {
                    isOverdue = true;
                }
            }

            if (isOverdue) {
                overdueCollectablesCount++;
                overdueCollectablesAmount += amt;
                overdueList.push({
                    id: doc.id,
                    customer: d.companyName || 'Customer',
                    area: d.area || 'N/A',
                    phone: d.customerMobile || '',
                    amount: amt,
                    dueStr,
                    paymentMode: d.paymentMode
                });
            }
        });

        const entries = journalSnap.docs.map((doc) => doc.data() || {});
        const netProfit = monthProfitFromSales + sideIncomeMonth - (operationalCostMonth);

        // Direct operational Cash Flow calculation for Manufacturer module:
        let directCashInflow = 0;
        salesHistSnap.docs.forEach((doc) => {
            const d = doc.data() || {};
            if (d.isActive === false) return;
            const mode = String(d.paymentMode || 'CASH').toUpperCase();
            const status = String(d.paymentStatus || 'PAID').toUpperCase();
            if (mode === 'CASH' || mode === 'BANK' || status === 'PAID') {
                directCashInflow += Number(d.amount || 0);
            }
        });

        sideSnap.docs.forEach((doc) => {
            const d = doc.data() || {};
            if (d.isActive === false) return;
            directCashInflow += Number(d.amount || 0);
        });

        let directCashOutflow = 0;
        rawHistSnap.docs.forEach((doc) => {
            const d = doc.data() || {};
            if (d.isActive === false) return;
            const mode = String(d.paymentMode || 'CASH').toUpperCase();
            const status = String(d.paymentStatus || 'PAID').toUpperCase();
            if (mode === 'CASH' || mode === 'BANK' || status === 'PAID') {
                directCashOutflow += Number(d.amount || 0);
            }
        });

        opSnap.docs.forEach((doc) => {
            const d = doc.data() || {};
            if (d.isActive === false) return;
            const mode = String(d.paymentMode || 'CASH').toUpperCase();
            if (mode === 'CASH' || mode === 'BANK' || !d.paymentMode) {
                directCashOutflow += Number(d.amount || 0);
            }
        });

        const glCashFlow = this.calculateCashFlow(entries);
        const directCashFlow = directCashInflow - directCashOutflow;
        const cashFlow = directCashFlow !== 0 ? directCashFlow : glCashFlow;
        const runToday = allProdDocs.filter((doc) => {
            const d = doc.data() || {};
            const t = parseDate(d.createdAt || d.date);
            return t && t >= startToday;
        }).length;
        const productionStatus = runToday > 0 ? 100 : (productionRuns > 0 ? 65 : 20);
        const yieldSeries = mapSnap.docs.map((doc) => {
            const d = doc.data() || {};
            const i = Number(d.inputQty) || 0;
            const o = Number(d.outputQty) || 0;
            return i > 0 ? (o / i) * 100 : null;
        }).filter((v) => v != null);
        const materialEfficiencyYield = yieldSeries.length
            ? yieldSeries.reduce((a, b) => a + b, 0) / yieldSeries.length
            : 0;
        const pendingSettlements = (payableSnap.size || 0) + (receivableSnap.size || 0);

        return {
            todaySales,
            todayProfit,
            monthSales,
            rmStockValue,
            fgStockValue,
            productionRuns,
            productionStatus,
            materialEfficiencyYield,
            pendingSettlements,
            overdueCollectablesCount,
            overdueCollectablesAmount,
            overdueList,
            manufacturer30Labels: dayKeys,
            manufacturerPurchases30: purchases30,
            manufacturerSales30: sales30,
            manufacturerProduction30: production30,
            manufacturerProfit30: profit30,
            manufacturerPurchasesPaymentSplit30: purchaseSplit30,
            manufacturerSalesPaymentSplit30: salesSplit30,
            rmPurchaseMonth,
            productionCostMonth,
            operationalCostMonth,
            sideIncomeMonth,
            monthProfit: netProfit,
            cashFlow
        };
    }

    async getCoconutMetrics(context) {
        if (window.CoconutModule && typeof window.CoconutModule.getMetrics === 'function') {
            return await window.CoconutModule.getMetrics(context);
        }
        return {
            todayPurchases: 0,
            monthPurchases: 0,
            todaySales: 0,
            monthSales: 0,
            grossProfit: 0,
            netProfit: 0,
            cashFlow: 0,
            rawStockValue: 0,
            finishedStockValue: 0,
            totalStockValue: 0,
            totalReceivables: 0,
            totalPayables: 0,
            dashboardStructure: ['todayPurchases', 'monthPurchases', 'todaySales', 'monthSales', 'grossProfit', 'netProfit', 'totalStockValue', 'cashFlow']
        };
    }

    getDashboardStructure(businessType) {
        businessType = this.normalizeBusinessType(businessType);
        const structures = {
            retail: ['todaySales', 'monthSales', 'pendingOrders', 'lowStock', 'stockValue', 'customerOutstanding', 'supplierOutstanding'],
            distributor: [
                'pendingQueueCount', 'todaySales', 'monthSales', 'approvedCount', 'rejectedCount',
                'dispatchedCount', 'deliveredCount', 'totalStockValue', 'outOfStockCount', 'lowStockAlertCount',
                'returnsCat1Units', 'returnsCat2Units', 'freeIssueUnits', 'freeIssueValueEst', 'outstandingBalance',
                'activeReps', 'newCustomers', 'monthOrderCount', 'cashFlow'
            ],
            pharmacy: ['todaySales', 'monthSales', 'expiringSoon', 'drugCategories', 'prescriptionUploads', 'cashFlow', 'stockValue', 'customerOutstanding', 'supplierOutstanding'],
            hardware: ['todaySales', 'monthSales', 'unitConvertibleItems', 'bulkWeightPricedItems', 'bulkItems', 'quotationCount', 'quoteConversionRate', 'cashFlow', 'stockValue', 'customerOutstanding', 'supplierOutstanding'],
            service: ['todayAppointments', 'upcomingAppointments', 'todaySales', 'serviceBills', 'utilization', 'clients', 'cashFlow'],
            bakery: ['todaySales', 'todayProfit', 'rmStockValue', 'fgStockValue', 'productionRuns', 'productionStatus', 'materialEfficiencyYield', 'pendingSettlements', 'rmPurchaseMonth', 'productionCostMonth', 'operationalCostMonth', 'sideIncomeMonth', 'monthSales', 'monthProfit', 'cashFlow'],
            manufacturer: ['todaySales', 'todayProfit', 'rmStockValue', 'fgStockValue', 'productionRuns', 'productionStatus', 'materialEfficiencyYield', 'pendingSettlements', 'rmPurchaseMonth', 'productionCostMonth', 'operationalCostMonth', 'sideIncomeMonth', 'monthSales', 'monthProfit', 'cashFlow'],
            tire_centre: ['todaySales', 'monthSales', 'todayAppointments', 'lowStock', 'cashFlow', 'stockValue', 'customerOutstanding', 'supplierOutstanding'],
            scrap_collection_center: ['cashBalance', 'bankBalance', 'todaySales', 'todayBuying', 'todayStockIn', 'todayStockOut', 'monthSales', 'monthBuying', 'monthStockIn', 'monthStockOut', 'monthProfit', 'stockValue', 'cashFlow', 'scrapGlRevenue', 'scrapGlCogs', 'scrapGlLoansGiven', 'scrapGlInterestIncome', 'scrapGlNet1030', 'scrapGlNet1060', 'outstandingLoans', 'advanceOutstanding', 'externalSettlementNet', 'lowStock'],
            coconut: ['todayPurchases', 'monthPurchases', 'todaySales', 'monthSales', 'grossProfit', 'netProfit', 'totalStockValue', 'cashFlow']
        };
        return structures[businessType] || structures.retail;
    }

    async getMetrics(context) {
        if (!context) return null;
        const normalizedType = this.normalizeBusinessType(context.businessType);
        context = { ...context, businessType: normalizedType };
        if (context.businessType === 'tire_centre') return this.getTireCentreMetrics(context);
        if (context.businessType === 'distributor') return this.getDistributorMetrics(context);
        if (context.businessType === 'pharmacy') return this.getPharmacyMetrics(context);
        if (context.businessType === 'hardware') return this.getHardwareMetrics(context);
        if (context.businessType === 'service') return this.getServiceMetrics(context);
        if (context.businessType === 'bakery' || context.businessType === 'manufacturer') return this.getManufacturerMetrics(context);
        if (context.businessType === 'scrap_collection_center') return this.getScrapMetrics(context);
        if (context.businessType === 'coconut') return this.getCoconutMetrics(context);
        return this.getRetailMetrics(context);
    }

    showDemoSystemNotice() {
        const modalId = 'demoSystemNoticeModal';
        if (document.getElementById(modalId)) return;

        const overlay = document.createElement('div');
        overlay.id = modalId;
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(8px);
            padding: 20px;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: #fff;
            padding: 35px;
            border-radius: 24px;
            max-width: 500px;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        `;

        content.innerHTML = `
            <div style="font-size: 50px; margin-bottom: 20px;">â„¹ï¸</div>
            <h2 style="color: #0f3b2c; margin-bottom: 20px; font-size: 22px; font-weight: 800; line-height: 1.4;">à¶´à¶¯à·Šà¶°à¶­à·’ à¶¯à·à¶±à·”à¶¸à·Šà¶¯à·“à¶¸à¶ºà·’</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.8; margin-bottom: 30px;">
                à¶¸à·š à¶”à¶¶à·€ à¶ºà·œà¶¸à·” à¶šà¶»à¶±à·Šà¶±à·š à¶…à¶´à¶œà·š à¶´à¶¯à·Šà¶°à¶­à·’à·€à¶½ à·ƒà·Šà·€à¶·à·à·€à¶º à¶´à¶»à·’à¶šà·Šà·‚à· à¶šà·’à¶»à·“à¶¸ à·ƒà¶¯à·„à· à·€à¶± <b>à¶­à·à·€à¶šà·à¶½à·’à¶š à¶´à¶¯à·Šà¶°à¶­à·’à¶ºà¶šà·Š (Demo System)</b> à·€à·™à¶­à¶ºà·’.<br><br>
                à¶´à¶¯à·Šà¶°à¶­à·’à¶ºà·š à¶šà·Šâ€à¶»à·’à¶ºà·à¶šà·à¶»à·’à¶­à·Šà·€à¶º à¶´à·’à·…à·’à¶¶à¶³à·€ à¶…à·€à¶¶à·à¶°à¶ºà¶šà·Š à¶½à¶¶à· à¶œà·à¶±à·“à¶¸à¶§ à¶¸à·™à¶º à¶·à·à·€à·’à¶­à· à¶šà¶»à¶±à·Šà¶±. à¶‘à·ƒà·šà¶¸ <b>à¶”à¶¶à·š à·€à·Šâ€à¶ºà·à¶´à·à¶»à¶ºà¶§à¶¸ à¶…à¶±à¶±à·Šâ€à¶º à·€à·– à¶´à¶¯à·Šà¶°à¶­à·’à¶ºà¶šà·Š</b> à¶±à·’à¶»à·Šà¶¸à·à¶«à¶º à¶šà¶» à¶¯à·“à¶¸à¶§ à¶…à¶´à¶§ à·„à·à¶šà·’à¶ºà·à·€ à¶‡à¶­.
            </p>
            <button id="closeDemoNotice" style="
                background: #0f3b2c;
                color: white;
                border: none;
                padding: 14px 30px;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 700;
                cursor: pointer;
                width: 100%;
                transition: transform 0.2s;
            ">à¶´à¶¯à·Šà¶°à¶­à·’à¶º à¶´à¶»à·“à¶šà·Šà·‚à· à¶šà·’à¶»à·“à¶¸ à¶…à¶»à¶¹à¶±à·Šà¶± â†’</button>
            <style>
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                #closeDemoNotice:hover { transform: scale(1.02); }
            </style>
        `;

        overlay.appendChild(content);
        document.body.appendChild(overlay);

        document.getElementById('closeDemoNotice').onclick = () => {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s';
            setTimeout(() => overlay.remove(), 300);
        };
    }
}

window.dashboardCore = new DashboardCore();
console.log('✅ Dashboard Core Initialized');
