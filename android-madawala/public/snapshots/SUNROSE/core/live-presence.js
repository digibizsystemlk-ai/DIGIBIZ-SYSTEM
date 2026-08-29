/**
 * DIGIBIZ Real-Time Live Presence & Activity Telemetry Engine
 * Tracks active users, current pages, and actions in real-time.
 * Designed for zero-cost operation (Firebase RTDB + Firestore Fallback + Smart Throttling).
 * Note: Excludes biz.sirimal@gmail.com and Super Admin Impersonation / Direct Access.
 */
(function () {
    'use strict';

    if (typeof window === 'undefined') return;
    if (window.__DIGIBIZ_LIVE_PRESENCE_INITIALIZED__) return;
    window.__DIGIBIZ_LIVE_PRESENCE_INITIALIZED__ = true;

    // Do not track on static public assets or error pages
    const path = (window.location.pathname || '').toLowerCase();
    if (path.endsWith('.json') || path.endsWith('.png') || path.endsWith('.svg') || path.endsWith('.css')) {
        return;
    }

    // Session Unique Key per Browser Tab
    let _tabSessionId = sessionStorage.getItem('digibiz_tab_session_id');
    if (!_tabSessionId) {
        _tabSessionId = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
        try { sessionStorage.setItem('digibiz_tab_session_id', _tabSessionId); } catch (e) { }
    }

    let _currentUser = null;
    let _userContext = {};
    let _heartbeatTimer = null;
    let _idleTimer = null;
    let _isIdle = false;
    let _isTabHidden = false;
    let _lastAction = 'Browsing ' + (document.title || 'DigiBiz');
    let _lastActionTime = Date.now();
    let _rtdbRef = null;
    let _isUsingRtdb = false;
    let _lastPresenceWriteTime = 0;
    const THROTTLE_ACTION_MS = 3000; // Max 1 action write every 3s
    const HEARTBEAT_INTERVAL_MS = 45000; // 45 seconds heartbeat
    const IDLE_TIMEOUT_MS = 120000; // 2 minutes inactivity marks as idle

    // Detect if current session is Chinthaka (Super Admin) or Impersonating Direct Access
    function isIgnoredAdminOrImpersonating(user) {
        const authEmail = (user && user.email) ? String(user.email).toLowerCase().trim() : '';
        const storedEmail = String(localStorage.getItem('userEmail') || localStorage.getItem('activeUserEmail') || '').toLowerCase().trim();
        if (authEmail === 'biz.sirimal@gmail.com' || storedEmail === 'biz.sirimal@gmail.com') return true;
        if (typeof window.isImpersonating === 'function' && window.isImpersonating()) return true;
        if (localStorage.getItem('digibiz_impersonate_active') === 'true') return true;
        if (sessionStorage.getItem('digibiz_impersonate_active') === 'true') return true;
        try {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('impersonate') === 'true' || urlParams.get('impersonate')) return true;
        } catch (e) { }
        return false;
    }

    // Detect Environment & Device Info
    function getEnvironmentDetails() {
        const ua = navigator.userAgent || '';
        let deviceType = 'Desktop';
        if (/Mobi|Android/i.test(ua)) deviceType = 'Mobile';
        if (/Tablet|iPad/i.test(ua)) deviceType = 'Tablet';

        let os = 'Unknown OS';
        if (/Windows/i.test(ua)) os = 'Windows';
        else if (/Android/i.test(ua)) os = 'Android';
        else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
        else if (/Mac/i.test(ua)) os = 'macOS';
        else if (/Linux/i.test(ua)) os = 'Linux';

        let browser = 'Unknown Browser';
        if (/Edg/i.test(ua)) browser = 'Edge';
        else if (/Chrome/i.test(ua)) browser = 'Chrome';
        else if (/Firefox/i.test(ua)) browser = 'Firefox';
        else if (/Safari/i.test(ua)) browser = 'Safari';

        return {
            deviceType: deviceType,
            os: os,
            browser: browser,
            screenWidth: window.innerWidth || screen.width || 0,
            screenHeight: window.innerHeight || screen.height || 0,
            isPwa: window.matchMedia('(display-mode: standalone)').matches || !!navigator.standalone
        };
    }

    // Convert technical Business Type into clear Sinhala
    function getSinhalaBusinessType(type) {
        const t = String(type || '').toLowerCase().trim();
        if (t.includes('tire') || t.includes('tyre')) return '🛞 ටයර් සෙන්ටර් (Tire Centre)';
        if (t.includes('auto') || t.includes('vehicle') || t.includes('repair') || t.includes('care')) return '🚗 ඔටෝ කෙයාර් (Auto Care)';
        if (t.includes('scrap')) return '♻️ පරණ යකඩ හා ලෝහ (Scrap Merchant)';
        if (t.includes('grocery') || t.includes('retail') || t.includes('pos') || t.includes('supermarket')) return '🛒 සිල්ලර / සුපර්මාර්කට් (Retail)';
        if (t.includes('bakery')) return '🍞 බේකරි නිෂ්පාදන (Bakery)';
        if (t.includes('pharmacy')) return '💊 ඖෂධ සැල් (Pharmacy)';
        if (t.includes('restaurant') || t.includes('cafe') || t.includes('food') || t.includes('hotel')) return '🍽️ ආපනශාලා / හෝටල් (Restaurant)';
        if (t.includes('hardware')) return '🔨 හාඩ්වෙයාර් (Hardware)';
        if (t.includes('textile') || t.includes('fashion') || t.includes('clothing')) return '👗 රෙදිපිළි / ඇඟලුම් (Textile)';
        if (t.includes('distributor') || t.includes('agency')) return '🚚 බෙදාහැරීම් (Distributor)';
        if (t.includes('attendance') || t.includes('payroll')) return '👥 වැටුප් හා පැමිණීම් (Payroll)';
        if (t.includes('manufacturing')) return '🏭 නිෂ්පාදන කර්මාන්ත (Manufacturing)';
        if (t.includes('service') || t.includes('salon')) return '💇 සේවා / සැලෝන් (Services)';
        if (t.includes('coconut')) return '🥥 පොල් හා කොහු නිෂ්පාදන (Coconut)';
        if (t.includes('jewel') || t.includes('gold')) return '💎 ස්වර්ණාභරණ (Jewellery)';
        if (t.includes('book') || t.includes('stationery')) return '📚 පොත්පත් / ලිපිද්‍රව්‍ය (Bookshop)';
        if (t.includes('electronic') || t.includes('mobile')) return '📱 ඉලෙක්ට්‍රොනික්ස් / මොබයිල් (Electronics)';
        return '🏢 සාමාන්‍ය ව්‍යාපාර (General)';
    }

    // Convert technical telemetry into clear, warm, simple Sinhala
    function formatSinhalaAction(actionText, sess) {
        if (!actionText) return 'පද්ධතියේ සැරිසරමින් සිටී (Browsing Platform)';
        const text = String(actionText).trim();

        // 1. Scrap Buying Bill patterns
        if (text.startsWith('Scrap Bill:') || text.startsWith('Buying Scrap:')) {
            const match = text.match(/Scrap Bill:\s*(.*?)\s*\((.*?)\)/i);
            if (match) {
                const supplier = match[1].trim() || 'සාමාන්‍ය පාරිභෝගිකයා (Walk-in)';
                const details = match[2].replace('items', 'භාණ්ඩ').replace('item', 'භාණ්ඩය');
                return `<strong>පරණ යකඩ බිලක් හදමින් සිටී</strong> — (සැපයුම්කරු: <span style="color:#38bdf8;">${supplier}</span> | ${details})`;
            }
            const sup = text.replace('Buying Scrap:', '').replace('Scrap Bill:', '').trim();
            return `<strong>පරණ යකඩ බිලක් හදමින් සිටී</strong> ${sup ? `(සැපයුම්කරු: <span style="color:#38bdf8;">${sup}</span>)` : ''}`;
        }

        if (text.includes('Finalizing Scrap Bill')) {
            return `<strong>පරණ යකඩ බිල්පත අවසන් කර</strong> මුදල් ගෙවීමට සූදානම් වේ`;
        }
        if (text.includes('Scrap Loans') || text.includes('scrap-loans') || text.includes('scrap-weekly') || text.includes('scrap-daily')) {
            return `ණය සහ අත්තිකාරම් ශේෂයන් (Loans & Advances) පරීක්ෂා කරයි`;
        }
        if (text.includes('Scrap Banking') || text.includes('scrap-banking')) {
            return `බැංකු සහ අතැති මුදල් ගිණුම් (Banking & Cash) පරීක්ෂා කරයි`;
        }
        if (text.includes('Scrap Selling') || text.includes('scrap-sell')) {
            return `පරණ යකඩ විකුණුම් හා පැටවීම් (Selling & Delivery) සටහන් කරයි`;
        }
        if (text.includes('Scrap Expenses') || text.includes('scrap-expenses')) {
            return `දෛනික වියදම් (Expenses) සටහන් කරමින් සිටී`;
        }
        if (text.includes('Scrap Revenue') || text.includes('scrap-revenue')) {
            return `ආදායම් විශ්ලේෂණ වාර්තා (Revenue Analytics) නිරීක්ෂණය කරයි`;
        }
        if (text.includes('Cash Counting') || text.includes('cash-counting')) {
            return `භෞතික අතැති මුදල් ගණනය කිරීම (Physical Cash Count) සිදු කරයි`;
        }

        // 2. Retail, GRN, POS & General Billing
        if (text.includes('Billing Terminal') || text.includes('quick_billing') || text.includes('billing')) {
            return `<strong>නව විකුණුම් බිල්පතක් (POS Sale)</strong> නිකුත් කරමින් සිටී`;
        }
        if (text.includes('GRN') || text.includes('Stock Purchases') || text.includes('purchases')) {
            return `<strong>තොග මිලදී ගැනීම් (GRN Purchases)</strong> ඇතුළත් කරමින් සිටී`;
        }
        if (text.includes('Customer Credit') || text.includes('credit')) {
            return `පාරිභෝගික ණය ගිණුම් (Customer Credit) පරීක්ෂා කරමින් සිටී`;
        }
        if (text.includes('Finance Ledger') || text.includes('finance-ledger')) {
            return `මූල්‍ය ලෙජරය (Finance Ledger) පරීක්ෂා කරමින් සිටී`;
        }
        if (text.includes('Stock') || text.includes('stock')) {
            return `භාණ්ඩ තොග ශේෂයන් (Stock Balance) පරීක්ෂා කරමින් සිටී`;
        }
        if (text.includes('Staff Attendance') || text.includes('attendance')) {
            return `කාර්ය මණ්ඩල පැමිණීමේ වාර්තා (Staff Attendance) බලමින් සිටී`;
        }
        if (text.includes('Dashboard')) {
            return `ප්‍රධාන පුවරුව (Dashboard Overview) නරඹමින් සිටී`;
        }
        if (text.startsWith('Page Loaded:') || text.startsWith('Viewing ') || text.startsWith('Browsing ')) {
            const pTitle = text.replace(/^(Page Loaded:\s*|Viewing\s*|Browsing\s*)/i, '').trim();
            return `පද්ධතියට ලොග් වී <strong>"${pTitle}"</strong> පිටුව නරඹමින් සිටී`;
        }

        return text;
    }

    // Get Human-Readable Page Title
    function getCleanPageTitle() {
        let title = (document.title || '').trim();
        if (title) {
            title = title.replace(/\s*-\s*DIGIBIZ.*$/i, '').replace(/\s*\(v\d+.*\)/i, '').trim();
        }
        if (!title || title === 'DIGIBIZ') {
            const p = window.location.pathname.toLowerCase();
            if (p.includes('scrap-buying')) title = 'Scrap Buying Bill';
            else if (p.includes('scrap-banking')) title = 'Scrap Banking';
            else if (p.includes('scrap-loans') || p.includes('scrap-weekly') || p.includes('scrap-daily')) title = 'Scrap Loans & Advances';
            else if (p.includes('scrap-expenses')) title = 'Scrap Expenses';
            else if (p.includes('scrap-revenue')) title = 'Scrap Revenue';
            else if (p.includes('scrap-sell')) title = 'Scrap Selling & Delivery';
            else if (p.includes('cash-counting')) title = 'Cash Counting';
            else if (p.includes('finance-ledger')) title = 'Finance Ledger';
            else if (p.includes('dashboard')) title = 'Dashboard Overview';
            else if (p.includes('quick_billing') || p.includes('billing')) title = 'Billing Terminal';
            else if (p.includes('attendance')) title = 'Staff Attendance';
            else title = p.split('/').pop().replace('.html', '') || 'Home';
        }
        return title;
    }

    // Extract User & Business Identity Context
    async function resolveUserContext(user) {
        if (!user) return null;
        const uid = user.uid;
        const email = String(user.email || '').toLowerCase().trim();

        let businessId = localStorage.getItem('currentBusinessId') || sessionStorage.getItem('currentBusinessId') || uid;
        let businessName = localStorage.getItem('currentBusinessName') || sessionStorage.getItem('currentBusinessName') || '';
        let userName = user.displayName || localStorage.getItem('currentUserName') || email.split('@')[0];
        let userPhone = user.phoneNumber || localStorage.getItem('currentUserPhone') || '';
        let userRole = localStorage.getItem('currentUserRole') || sessionStorage.getItem('currentUserRole') || 'STAFF';
        let businessType = localStorage.getItem('currentBusinessType') || 'general';
        let plan = localStorage.getItem(`digibiz_user_plan_${uid}`) || localStorage.getItem(`digibiz_cached_plan_${businessId}`) || 'PRO';

        // Check if Demo Account
        const isDemo = plan.toUpperCase() === 'LIVE_DEMO' || email.startsWith('test@') || email === 'demo@digibiz.lk';

        // Fetch Firestore profile if businessName is missing
        if (window.db && (!businessName || businessName === 'My Business' || businessId === uid)) {
            try {
                const uDoc = await window.db.collection('users').doc(uid).get().catch(() => null);
                if (uDoc && uDoc.exists) {
                    const uData = uDoc.data() || {};
                    businessId = uData.businessId || businessId;
                    userName = uData.name || uData.displayName || userName;
                    userPhone = uData.phone || userPhone;
                    userRole = uData.role || userRole;
                    businessType = uData.businessType || businessType;
                }
                if (businessId) {
                    const bDoc = await window.db.collection('businesses').doc(businessId).get().catch(() => null);
                    if (bDoc && bDoc.exists) {
                        const bData = bDoc.data() || {};
                        businessName = bData.name || bData.businessName || businessName;
                        businessType = bData.businessType || businessType;
                    }
                }
            } catch (e) { }
        }

        if (!businessType || businessType === 'general') {
            const loc = window.location.pathname.toLowerCase();
            if (loc.includes('/tire_centre/')) businessType = 'tire_centre';
            else if (loc.includes('/scrap_collection_center/') || loc.includes('/admin/scrap-')) businessType = 'scrap_collection_center';
            else if (loc.includes('/auto_care/')) businessType = 'auto_care';
            else if (loc.includes('/retail/') || loc.includes('/quick_billing') || loc.includes('/pos')) businessType = 'retail';
            else if (loc.includes('/pharmacy/')) businessType = 'pharmacy';
            else if (loc.includes('/bakery/')) businessType = 'bakery';
            else if (loc.includes('/restaurant/') || loc.includes('/hotel/')) businessType = 'restaurant';
            else if (loc.includes('/hardware/')) businessType = 'hardware';
            else if (loc.includes('/textile/')) businessType = 'textile';
            else if (loc.includes('/distributor/')) businessType = 'distributor';
            else if (loc.includes('/coconut/')) businessType = 'coconut';
        }

        businessName = businessName || (isDemo ? 'Demo Store' : 'Main Branch');

        return {
            uid: uid,
            email: email,
            name: userName,
            phone: userPhone,
            role: String(userRole).toUpperCase(),
            businessId: businessId,
            businessName: businessName,
            businessType: businessType,
            plan: String(plan).toUpperCase(),
            isDemo: isDemo
        };
    }

    // Build Current Payload
    function buildPresencePayload(status) {
        const env = getEnvironmentDetails();
        const cleanTitle = getCleanPageTitle();
        const now = Date.now();

        return {
            sessionId: _tabSessionId,
            status: status || (_isTabHidden ? 'idle' : (_isIdle ? 'idle' : 'active')),
            uid: _userContext.uid || 'anon',
            name: _userContext.name || 'User',
            email: _userContext.email || '',
            phone: _userContext.phone || '',
            role: _userContext.role || 'STAFF',
            businessId: _userContext.businessId || '',
            businessName: _userContext.businessName || '',
            businessType: _userContext.businessType || 'general',
            plan: _userContext.plan || 'PRO',
            isDemo: !!_userContext.isDemo,
            pageTitle: cleanTitle,
            path: window.location.pathname || '',
            url: window.location.href || '',
            currentAction: _lastAction || ('Viewing ' + cleanTitle),
            lastActionAt: _lastActionTime || now,
            lastPing: now,
            deviceType: env.deviceType,
            os: env.os,
            browser: env.browser,
            screenWidth: env.screenWidth,
            screenHeight: env.screenHeight,
            isPwa: env.isPwa
        };
    }

    // Write Presence State to Database
    async function updatePresence(status, force = false) {
        if (!_currentUser || !_userContext.uid) return;

        // Mandate: DO NOT write presence for Super Admin biz.sirimal@gmail.com or Impersonation sessions!
        if (isIgnoredAdminOrImpersonating(_currentUser)) {
            markOffline();
            return;
        }

        const now = Date.now();
        if (!force && now - _lastPresenceWriteTime < 3000) {
            return; // Prevent high-frequency write storms
        }
        _lastPresenceWriteTime = now;

        const payload = buildPresencePayload(status);

        // 1. Try Firebase Realtime Database (Zero Cost Bandwidth Model)
        if (typeof firebase !== 'undefined' && firebase.database) {
            try {
                if (!_rtdbRef) {
                    const rtdb = firebase.database();
                    _rtdbRef = rtdb.ref('system_presence/' + _tabSessionId);
                    
                    // Setup Server-side disconnect hook
                    _rtdbRef.onDisconnect().set({
                        ...payload,
                        status: 'offline',
                        lastPing: firebase.database.ServerValue.TIMESTAMP
                    });
                }
                await _rtdbRef.set({
                    ...payload,
                    lastPing: firebase.database.ServerValue.TIMESTAMP
                });
                _isUsingRtdb = true;
            } catch (err) {
                // Fallback to Firestore
                _isUsingRtdb = false;
            }
        }

        // 2. Dual-channel Firestore Presence (Single Document per User Session)
        if (window.db) {
            try {
                await window.db.collection('system_live_sessions').doc(_tabSessionId).set({
                    ...payload,
                    lastPing: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } catch (err) {
                // Ignore silent persistence errors
            }
        }
    }

    // Mark Session Offline / Remove on Cleanup
    function markOffline() {
        if (!_tabSessionId) return;

        if (_rtdbRef) {
            try {
                _rtdbRef.set({
                    status: 'offline',
                    lastPing: Date.now()
                });
            } catch (e) { }
        }

        if (window.db) {
            try {
                window.db.collection('system_live_sessions').doc(_tabSessionId).update({
                    status: 'offline',
                    lastPing: firebase.firestore.FieldValue.serverTimestamp()
                }).catch(() => {});
            } catch (e) { }
        }
    }

    // Reset Inactivity Timer
    function recordActivity(actionDescription) {
        _isIdle = false;
        if (actionDescription) {
            _lastAction = actionDescription;
            _lastActionTime = Date.now();
        }

        clearTimeout(_idleTimer);
        _idleTimer = setTimeout(() => {
            _isIdle = true;
            updatePresence('idle');
        }, IDLE_TIMEOUT_MS);
    }

    // Publish Custom Action (e.g. from Scrap Buying: "Adding Scrap Items")
    function setAction(actionText) {
        if (!actionText) return;
        const now = Date.now();
        _lastAction = String(actionText).slice(0, 150);
        _lastActionTime = now;
        recordActivity();

        // Throttle action updates to avoid spamming
        if (now - _lastPresenceWriteTime >= THROTTLE_ACTION_MS) {
            updatePresence(null, true);
        }
    }

    // Visibility Listener (Pause when tab is hidden)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            _isTabHidden = true;
            updatePresence('idle');
        } else {
            _isTabHidden = false;
            recordActivity();
            updatePresence('active', true);
        }
    });

    // User Interaction Listeners (Debounced)
    let _interactionDebounce = null;
    function handleUserInteraction() {
        if (_isIdle) {
            _isIdle = false;
            recordActivity();
            updatePresence('active');
            return;
        }
        if (!_interactionDebounce) {
            _interactionDebounce = setTimeout(() => {
                _interactionDebounce = null;
                recordActivity();
            }, 3000);
        }
    }

    window.addEventListener('mousemove', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });
    window.addEventListener('click', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });

    // Page Unload Listeners
    window.addEventListener('beforeunload', markOffline);
    window.addEventListener('pagehide', markOffline);

    // Initialize Presence for User
    async function startPresenceTracking(user) {
        if (!user) return;
        _currentUser = user;
        _userContext = await resolveUserContext(user);

        // If Super Admin or Impersonating, skip presence writing entirely
        if (isIgnoredAdminOrImpersonating(user)) {
            markOffline();
            return;
        }

        // Send Initial Ping
        await updatePresence('active', true);

        // Start Periodic Heartbeat
        if (_heartbeatTimer) clearInterval(_heartbeatTimer);
        _heartbeatTimer = setInterval(() => {
            if (!_isTabHidden && !_isIdle) {
                updatePresence('active');
            }
        }, HEARTBEAT_INTERVAL_MS);

        recordActivity('Page Loaded: ' + getCleanPageTitle());
    }

    // Auto-listen to Auth State
    function initAuth() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    startPresenceTracking(user);
                } else {
                    _currentUser = null;
                    if (_heartbeatTimer) clearInterval(_heartbeatTimer);
                }
            });
        } else {
            setTimeout(initAuth, 300);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuth);
    } else {
        initAuth();
    }

    // Filter sessions to strictly remove biz.sirimal@gmail.com, Impersonators, and Stale/Phantom records
    function sanitizeSessions(rawSessions) {
        const now = Date.now();
        let activeCount = 0;
        let idleCount = 0;
        const validSessions = [];

        (rawSessions || []).forEach((sess) => {
            if (!sess) return;
            const email = String(sess.email || '').toLowerCase().trim();
            if (email === 'biz.sirimal@gmail.com') return; // Exclude Chinthaka
            if (sess.isSuperAdminObserver || sess.isImpersonating) return;

            let lastPingMillis = 0;
            if (sess.lastPing) {
                if (typeof sess.lastPing === 'number') lastPingMillis = sess.lastPing;
                else if (typeof sess.lastPing.toMillis === 'function') lastPingMillis = sess.lastPing.toMillis();
                else if (typeof sess.lastPing.toDate === 'function') lastPingMillis = sess.lastPing.toDate().getTime();
                else if (sess.lastPing.seconds) lastPingMillis = sess.lastPing.seconds * 1000;
            }
            if (!lastPingMillis && sess.lastActionAt) {
                if (typeof sess.lastActionAt === 'number') lastPingMillis = sess.lastActionAt;
                else if (typeof sess.lastActionAt.toMillis === 'function') lastPingMillis = sess.lastActionAt.toMillis();
                else if (typeof sess.lastActionAt.toDate === 'function') lastPingMillis = sess.lastActionAt.toDate().getTime();
                else if (sess.lastActionAt.seconds) lastPingMillis = sess.lastActionAt.seconds * 1000;
            }

            // Reject if no valid timestamp exists on record (prevents phantom users)
            if (!lastPingMillis || isNaN(lastPingMillis)) return;

            const diff = now - lastPingMillis;
            // Reject any stale sessions older than 5 minutes or invalid future pings
            if (diff >= 300000 || diff < -15000) return;

            if (diff < 120000) {
                activeCount++;
                validSessions.push({ ...sess, lastPing: lastPingMillis, lastActionAt: sess.lastActionAt || lastPingMillis, computedStatus: 'active' });
            } else {
                idleCount++;
                validSessions.push({ ...sess, lastPing: lastPingMillis, lastActionAt: sess.lastActionAt || lastPingMillis, computedStatus: 'idle' });
            }
        });

        return {
            activeCount: activeCount,
            idleCount: idleCount,
            totalOnline: activeCount + idleCount,
            sessions: validSessions
        };
    }

    // Public Global API for other modules to consume
    window.DigiBizPresence = {
        setAction: setAction,
        getUserContext: () => ({ ..._userContext }),
        getSessionId: () => _tabSessionId,
        getSinhalaBusinessType: getSinhalaBusinessType,
        formatSinhalaAction: formatSinhalaAction,

        // Subscribe to live active count (used in bill badges and mini tickers)
        listenToActiveCount: function (callback) {
            if (typeof callback !== 'function') return () => {};

            // 1. Try Firebase Realtime Database
            if (typeof firebase !== 'undefined' && firebase.database) {
                try {
                    const rtdb = firebase.database();
                    const ref = rtdb.ref('system_presence');
                    const handler = ref.on('value', (snapshot) => {
                        const val = snapshot.val() || {};
                        const rawList = Object.keys(val).map(k => val[k]);
                        callback(sanitizeSessions(rawList));
                    });

                    return () => ref.off('value', handler);
                } catch (e) { }
            }

            // 2. Fallback to Firestore snapshot
            if (window.db) {
                try {
                    const unsub = window.db.collection('system_live_sessions')
                        .where('status', 'in', ['active', 'idle'])
                        .onSnapshot((snap) => {
                            const rawList = [];
                            snap.forEach(doc => rawList.push(doc.data()));
                            callback(sanitizeSessions(rawList));
                        }, (err) => {
                            console.warn('[DigiBizPresence] Active count listener warning:', err);
                        });

                    return unsub;
                } catch (e) { }
            }

            return () => {};
        }
    };

    console.log('⚡ DigiBiz Real-Time Live Presence Engine Initialized');
})();
