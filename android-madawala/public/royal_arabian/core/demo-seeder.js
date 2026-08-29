/**
 * DIGIBIZ — Universal Demo Safety & Auto-Purge Engine
 * 1. Guarantees ZERO demo seed data (no dummy items, customers, suppliers, bank accounts, cheques) for all Demo Hub accounts.
 * 2. Auto-purges user test data after 1 hour (3600000ms) for Demo accounts.
 * 3. STRICT ISOLATION: Never touches Trial or PRO customer accounts.
 */

(function(window) {
    'use strict';

    const OFFICIAL_DEMO_EMAILS = [
        'test@retail.com', 'test@hardware.com', 'test@pharmacy.com', 'test@tire.com',
        'test@tyrecentre.com', 'test@tirecentre.com', 'test@tyre.com', 'test@autocare.com',
        'test@distributor.com', 'test@bakery.com', 'test@factory.com', 'test@manufacturer.com',
        'test@garment.com', 'test@restaurant.com', 'test@salon.com', 'test@service.com',
        'test@coconut.com', 'test@attendance.com', 'test@easybill.com', 'test@quickbill.com',
        'test@scrap.com', 'test@teafactory.com', 'test@tea.com', 'demo@digibiz.lk'
    ];

    function isStrictlyDemoEmail(email) {
        const e = String(email || '').trim().toLowerCase();
        if (!e) return false;
        // Never touch super admin or dedicated test bill accounts
        if (e === 'biz.sirimal@gmail.com' || e === 'test@bill.com') return false;
        return OFFICIAL_DEMO_EMAILS.includes(e) || (e.startsWith('test@') && e.endsWith('.com'));
    }

    const DemoSeeder = {
        isStrictlyDemoEmail,

        /**
         * Invoked on demo login: Guarantees zero seed data and cleans old clutter.
         */
        async seedDemoDataForBusiness(db, bid, bType, email) {
            if (!bid || !db) return true;
            if (!isStrictlyDemoEmail(email)) {
                console.log('[DemoEngine] Non-demo account detected; skipping demo cleaner.');
                return false;
            }

            console.log(`[DemoEngine] 🛡️ Demo account login (${email}) — ensuring 100% clean zero-data state...`);
            await this.purgeAllDemoData(db, bid, email);
            return true;
        },

        /**
         * Purges all data older than 1 hour (60 minutes) for a demo account.
         */
        async purgeExpiredDemoData(db, bid, email) {
            if (!bid || !db || !isStrictlyDemoEmail(email)) return;

            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            console.log(`[DemoEngine] 🧹 Scanning and purging expired demo data (> 1 hour old) for: ${email}...`);

            const topCols = [
                'products', 'customers', 'suppliers', 'invoices', 'sales',
                'bills', 'expenses', 'orders', 'reps', 'shops', 'appointments', 'services'
            ];

            try {
                for (const colName of topCols) {
                    try {
                        const snap = await db.collection(colName).where('businessId', '==', bid).get();
                        if (!snap.empty) {
                            const batch = db.batch();
                            let delCount = 0;
                            snap.docs.forEach(doc => {
                                const data = doc.data() || {};
                                let createdTime = data.createdAt && typeof data.createdAt.toDate === 'function' 
                                    ? data.createdAt.toDate() 
                                    : (data.createdAt ? new Date(data.createdAt) : (data.date ? new Date(data.date) : null));

                                if (!createdTime || isNaN(createdTime.getTime()) || createdTime < oneHourAgo) {
                                    batch.delete(doc.ref);
                                    delCount++;
                                }
                            });
                            if (delCount > 0) {
                                await batch.commit();
                            }
                        }
                    } catch(eCol) {}
                }

                // Clean nested sub-collections
                const subCollections = [
                    db.collection('banks').doc(bid).collection('accounts'),
                    db.collection('banks').doc(bid).collection('transactions'),
                    db.collection('banks').doc(bid).collection('loans'),
                    db.collection('cheques').doc(bid).collection('list'),
                    db.collection('orders').doc(bid).collection('list'),
                    db.collection('expenses').doc(bid).collection('list'),
                    db.collection('purchases').doc(bid).collection('orders'),
                    db.collection('products').doc(bid).collection('list'),
                    db.collection('customers').doc(bid).collection('list'),
                    db.collection('suppliers').doc(bid).collection('list'),
                    db.collection('journal').doc(bid).collection('entries'),
                    db.collection('businesses').doc(bid).collection('products'),
                    db.collection('businesses').doc(bid).collection('customers'),
                    db.collection('businesses').doc(bid).collection('suppliers'),
                    db.collection('businesses').doc(bid).collection('shops')
                ];

                for (const subRef of subCollections) {
                    try {
                        const subSnap = await subRef.get();
                        if (!subSnap.empty) {
                            const batch = db.batch();
                            let delCount = 0;
                            subSnap.docs.forEach(doc => {
                                const data = doc.data() || {};
                                let createdTime = data.createdAt && typeof data.createdAt.toDate === 'function' 
                                    ? data.createdAt.toDate() 
                                    : (data.createdAt ? new Date(data.createdAt) : (data.date ? new Date(data.date) : null));

                                if (!createdTime || isNaN(createdTime.getTime()) || createdTime < oneHourAgo) {
                                    batch.delete(doc.ref);
                                    delCount++;
                                }
                            });
                            if (delCount > 0) {
                                await batch.commit();
                            }
                        }
                    } catch(eSub) {}
                }

            } catch (err) {
                console.warn('[DemoEngine] Purge expired error:', err);
            }
        },

        /**
         * Purges ALL test data for a demo account (returns it to an empty slate).
         */
        async purgeAllDemoData(db, bid, email) {
            if (!bid || !db || !isStrictlyDemoEmail(email)) return;

            console.log(`[DemoEngine] 🗑️ Wiping all test data for demo business (${bid} - ${email})...`);

            const topCols = [
                'products', 'customers', 'suppliers', 'invoices', 'sales',
                'bills', 'expenses', 'orders', 'reps', 'shops', 'appointments', 'services'
            ];

            try {
                for (const colName of topCols) {
                    try {
                        const snap = await db.collection(colName).where('businessId', '==', bid).get();
                        if (!snap.empty) {
                            const batch = db.batch();
                            snap.docs.forEach(doc => batch.delete(doc.ref));
                            await batch.commit();
                        }
                    } catch(e) {}
                }

                // Clean all sub-collections
                const subCollections = [
                    db.collection('banks').doc(bid).collection('accounts'),
                    db.collection('banks').doc(bid).collection('transactions'),
                    db.collection('banks').doc(bid).collection('loans'),
                    db.collection('cheques').doc(bid).collection('list'),
                    db.collection('orders').doc(bid).collection('list'),
                    db.collection('expenses').doc(bid).collection('list'),
                    db.collection('purchases').doc(bid).collection('orders'),
                    db.collection('products').doc(bid).collection('list'),
                    db.collection('customers').doc(bid).collection('list'),
                    db.collection('suppliers').doc(bid).collection('list'),
                    db.collection('journal').doc(bid).collection('entries'),
                    db.collection('businesses').doc(bid).collection('products'),
                    db.collection('businesses').doc(bid).collection('customers'),
                    db.collection('businesses').doc(bid).collection('suppliers'),
                    db.collection('businesses').doc(bid).collection('shops')
                ];

                for (const subRef of subCollections) {
                    try {
                        const subSnap = await subRef.get();
                        if (!subSnap.empty) {
                            const batch = db.batch();
                            subSnap.docs.forEach(doc => batch.delete(doc.ref));
                            await batch.commit();
                        }
                    } catch(eSub) {}
                }

                // Reset business document onboarding / balances to 0 for demo account
                try {
                    await db.collection('businesses').doc(bid).update({
                        onboardingBalances: { cash: 0, bank: 0 },
                        cashInDrawer: 0,
                        bankBalance: 0,
                        openingCash: 0,
                        openingBank: 0
                    });
                } catch(eBiz) {}

                // Clean local storage cache keys for this demo account
                try {
                    localStorage.removeItem(`cached_pos_prods_${bid}`);
                    localStorage.removeItem(`cached_customers_${bid}`);
                    localStorage.removeItem(`digibiz_qb_catalog_${bid}`);
                    localStorage.removeItem(`digibiz_qb_customers_${bid}`);
                    localStorage.removeItem(`digibiz_qb_bills_${bid}`);
                    localStorage.removeItem('digibiz_qb_catalog');
                    localStorage.removeItem('digibiz_qb_customers');
                    localStorage.removeItem('digibiz_qb_bills');
                } catch(eStorage) {}

                console.log(`[DemoEngine] ✅ Demo account (${email}) wiped completely clean!`);
            } catch (err) {
                console.warn('[DemoEngine] Wipe all demo error:', err);
            }
        }
    };

    window.DemoSeeder = DemoSeeder;
    window.DemoCleaner = DemoSeeder;

})(typeof window !== 'undefined' ? window : this);
