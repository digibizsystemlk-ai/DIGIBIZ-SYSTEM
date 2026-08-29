// Auto finalization engine (7-day lock-down for draft/pending records)
(function () {
    const DAYS = 7;
    const MS = DAYS * 24 * 60 * 60 * 1000;
    const TARGETS = [
        { collection: 'manufacturer_raw_material_history', dateField: 'createdAt' },
        { collection: 'manufacturer_sales', dateField: 'createdAt' },
        { collection: 'manufacturer_expenses', dateField: 'createdAt' },
        { collection: 'pendingOrders', dateField: 'createdAt' },
        { collection: 'orders', dateField: 'createdAt' }
    ];

    function asDate(v) {
        if (!v) return null;
        if (typeof v.toDate === 'function') return v.toDate();
        const d = new Date(v);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    async function finalizeBusinessRecords(businessId) {
        const firestoreDb = window.db || (window.firebase && typeof firebase.firestore === 'function' ? firebase.firestore() : null);
        if (!firestoreDb || !businessId) return { finalized: 0 };
        const now = Date.now();
        let finalized = 0;
        for (let i = 0; i < TARGETS.length; i++) {
            const target = TARGETS[i];
            let snap;
            try {
                snap = await firestoreDb.collection(target.collection)
                    .where('businessId', '==', businessId)
                    .limit(300)
                    .get();
            } catch (_) {
                continue;
            }
            for (const doc of snap.docs) {
                const row = doc.data() || {};
                if (row.finalized === true) continue;
                const status = String(row.status || '').toLowerCase();
                const isDraftLike = status === 'draft' || status === 'pending' || status === 'pending_clearance' || row.paymentStatus === 'PENDING' || row.paymentStatus === 'PENDING_CLEARANCE';
                if (!isDraftLike) continue;
                const dt = asDate(row[target.dateField] || row.createdAt || row.date);
                if (!dt) continue;
                if ((now - dt.getTime()) < MS) continue;
                const patch = {
                    status: 'finalized',
                    finalized: true,
                    finalizedAt: new Date(),
                    lockEdit: true,
                    lockDelete: true,
                    immutable: true
                };
                try {
                    await firestoreDb.collection(target.collection).doc(doc.id).set(patch, { merge: true });
                    await firestoreDb.collection('finalized_records').doc(`${target.collection}_${doc.id}`).set({
                        businessId,
                        sourceCollection: target.collection,
                        sourceId: doc.id,
                        finalizedAt: new Date(),
                        amount: Number(row.amount || row.totalAmount || 0),
                        referenceType: String(row.referenceType || target.collection).toUpperCase()
                    }, { merge: true });
                    finalized += 1;
                } catch (_) {}
            }
        }
        return { finalized };
    }

    async function runAutoFinalizationForCurrentUser() {
        try {
            const authObj = window.auth || (window.firebase && typeof firebase.auth === 'function' ? firebase.auth() : null);
            const u = authObj ? authObj.currentUser : null;
            if (!u) return { finalized: 0 };
            const firestoreDb = window.db || (window.firebase && typeof firebase.firestore === 'function' ? firebase.firestore() : null);
            if (!firestoreDb) return { finalized: 0 };
            let bid = localStorage.getItem('currentBusinessId') || sessionStorage.getItem('currentBusinessId');
            if (!bid) {
                const userDoc = await firestoreDb.collection('users').doc(u.uid).get();
                bid = userDoc.exists ? (userDoc.data().businessId || u.uid) : u.uid;
            }
            return await finalizeBusinessRecords(bid);
        } catch (_) {
            return { finalized: 0 };
        }
    }

    window.FinalizationEngine = {
        finalizeBusinessRecords,
        runAutoFinalizationForCurrentUser
    };
})();
