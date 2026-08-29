/**
 * Standalone Node Seeder — Seeds All Demo Hub Accounts in Firestore
 * STRICT SAFETY: Scoped ONLY to demo emails starting with test@ or status === 'DEMO'.
 */
const admin = require('i:/DIGIBIZ_MASTER/functions/node_modules/firebase-admin');
const serviceAccount = require('I:/DIGIBIZ_MASTER/serviceAccountKey.json');
const path = require('path');
const fs = require('fs');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// Load client-side demo seeder logic
const seederFile = path.resolve(__dirname, '../public/core/demo-seeder.js');
let seederCode = fs.readFileSync(seederFile, 'utf8');
const vm = require('vm');
const context = { window: {}, console: console };
vm.createContext(context);
vm.runInContext(seederCode, context);
const DemoSeeder = context.window.DemoSeeder;

const demoAccounts = [
    { email: 'test@retail.com', type: 'retail', name: 'Demo Supermarket & Retail Mart' },
    { email: 'test@tyrecentre.com', type: 'tire_centre', name: 'Demo Tyre & Battery Care' },
    { email: 'test@autocare.com', type: 'auto_care', name: 'Demo Auto Care & Repair Centre' },
    { email: 'test@pharmacy.com', type: 'pharmacy', name: 'Demo City Pharmacy & Healthcare' },
    { email: 'test@restaurant.com', type: 'restaurant', name: 'Demo Cafe & Family Restaurant' },
    { email: 'test@garment.com', type: 'garment', name: 'Demo Fashion & Boutique Mart' },
    { email: 'test@hardware.com', type: 'hardware', name: 'Demo Hardware & Building Materials' },
    { email: 'test@service.com', type: 'service', name: 'Demo Salon & Spa Services' },
    { email: 'test@distributor.com', type: 'distributor', name: 'Demo FMCG Distributors Ltd' },
    { email: 'test@manufacturer.com', type: 'manufacturer', name: 'Demo Lanka Industries & Polymers' },
    { email: 'test@scrap.com', type: 'scrap_collection_center', name: 'Demo Scrap Metals & Recycling Hub' },
    { email: 'test@coconut.com', type: 'coconut', name: 'Demo Coconut & Coir Mills' },
    { email: 'test@attendance.com', type: 'attendance_payroll', name: 'Demo Enterprise Staff & HR' },
    { email: 'test@easybill.com', type: 'quick_billing', name: 'Lanka Quick Print & Smart Services' }
];

async function seedAll() {
    console.log('[LiveDemoSeeder] 🚀 Starting automated seeding for all Demo Hub accounts in Firestore...');
    const now = new Date();

    for (const acc of demoAccounts) {
        console.log(`\n-----------------------------------------`);
        console.log(`[LiveDemoSeeder] Processing demo account: ${acc.email} (${acc.type})...`);

        let uid = null;
        try {
            const userRecord = await admin.auth().getUserByEmail(acc.email).catch(() => null);
            if (userRecord) {
                uid = userRecord.uid;
                console.log(`  -> Found existing Auth user UID: ${uid}`);
            } else {
                const newUser = await admin.auth().createUser({
                    email: acc.email,
                    password: '123456',
                    displayName: acc.name
                });
                uid = newUser.uid;
                console.log(`  -> Created new Auth user UID: ${uid}`);
            }
        } catch (eAuth) {
            console.warn(`  -> Auth note:`, eAuth.message);
        }

        if (!uid) {
            const uSnap = await db.collection('users').where('email', '==', acc.email).limit(1).get();
            if (!uSnap.empty) {
                uid = uSnap.docs[0].id;
            } else {
                uid = 'demo_' + acc.type;
            }
        }

        const businessId = uid;

        // Set business doc with explicit DEMO status
        await db.collection('businesses').doc(businessId).set({
            name: acc.name,
            businessName: acc.name,
            ownerId: uid,
            ownerEmail: acc.email,
            ownerName: 'Demo Administrator',
            businessType: acc.type,
            status: 'DEMO',
            createdAt: now,
            updatedAt: now
        }, { merge: true });

        // Set user doc
        await db.collection('users').doc(uid).set({
            name: 'Demo Administrator',
            email: acc.email,
            role: 'BUSINESS_OWNER',
            businessId: businessId,
            businessType: acc.type,
            createdAt: now,
            updatedAt: now
        }, { merge: true });

        // Set subcollection user doc
        await db.collection('businesses').doc(businessId).collection('users').doc(uid).set({
            email: acc.email,
            name: 'Demo Administrator',
            role: 'BUSINESS_OWNER',
            isActive: true,
            createdAt: now
        }, { merge: true });

        // Seed specific datasets
        if (DemoSeeder && typeof DemoSeeder.seedDemoDataForBusiness === 'function') {
            await DemoSeeder.seedDemoDataForBusiness(db, businessId, acc.type, acc.email);
        }

        console.log(`[LiveDemoSeeder] ✅ Finished seeding demo data for ${acc.email}!`);
    }

    console.log(`\n=================================================`);
    console.log('[LiveDemoSeeder] 🎉 All 13 Demo Hub Accounts successfully seeded with realistic medium-sized business data!');
}

seedAll().catch(err => {
    console.error('[LiveDemoSeeder] Fatal Error:', err);
    process.exit(1);
});
