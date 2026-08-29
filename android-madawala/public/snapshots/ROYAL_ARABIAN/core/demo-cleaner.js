/**
 * DIGIBIZ — Global Demo Auto-Purge Runner
 * Runs automatically on page load to purge demo account test data older than 1 hour.
 * ZERO IMPACT ON REAL CLIENTS: Exits immediately for Trial & PRO accounts.
 */

(function() {
    'use strict';
    if (typeof window === 'undefined') return;

    const OFFICIAL_DEMO_EMAILS = [
        'test@retail.com', 'test@hardware.com', 'test@pharmacy.com', 'test@tire.com',
        'test@tyrecentre.com', 'test@tirecentre.com', 'test@tyre.com', 'test@autocare.com',
        'test@distributor.com', 'test@bakery.com', 'test@factory.com', 'test@manufacturer.com',
        'test@garment.com', 'test@restaurant.com', 'test@salon.com', 'test@service.com',
        'test@coconut.com', 'test@attendance.com', 'test@easybill.com', 'test@quickbill.com',
        'test@scrap.com', 'test@teafactory.com', 'test@tea.com', 'demo@digibiz.lk'
    ];

    function isDemoUser(user) {
        if (!user || !user.email) return false;
        const e = String(user.email).trim().toLowerCase();
        if (e === 'biz.sirimal@gmail.com' || e === 'test@bill.com') return false;
        return OFFICIAL_DEMO_EMAILS.includes(e) || (e.startsWith('test@') && e.endsWith('.com'));
    }

    let _demoPurgeInterval = null;

    function initDemoCleaner() {
        if (!window.firebase || !firebase.auth) {
            setTimeout(initDemoCleaner, 500);
            return;
        }

        firebase.auth().onAuthStateChanged(async (user) => {
            if (_demoPurgeInterval) {
                clearInterval(_demoPurgeInterval);
                _demoPurgeInterval = null;
            }

            if (!user || !isDemoUser(user)) {
                // Not a demo user — 100% untouched
                return;
            }

            const db = (typeof db !== 'undefined' && db) || window.db || (firebase.firestore && firebase.firestore());
            if (!db) return;

            const bid = user.uid;
            console.log(`[DemoCleaner] 🚀 Initializing 1-hour auto-purge guardian for demo user (${user.email})...`);

            if (window.DemoSeeder && typeof window.DemoSeeder.purgeExpiredDemoData === 'function') {
                await window.DemoSeeder.purgeExpiredDemoData(db, bid, user.email);
            }

            // Run scan every 10 minutes to auto-remove records that cross the 1-hour mark
            _demoPurgeInterval = setInterval(() => {
                if (window.DemoSeeder && typeof window.DemoSeeder.purgeExpiredDemoData === 'function') {
                    window.DemoSeeder.purgeExpiredDemoData(db, bid, user.email);
                }
            }, 10 * 60 * 1000);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDemoCleaner);
    } else {
        initDemoCleaner();
    }
})();
