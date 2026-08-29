/**
 * DIGIBIZ — Aggregated Counters & Cost Optimization Utility
 * Reduces read-heavy collection full-scans on dashboards into single point-reads.
 * Non-destructive, incremental, fire-and-forget with automatic legacy fallback.
 */

(function(window) {
    'use strict';

    function todayKey(d = new Date()) {
        const dateObj = (d instanceof Date) ? d : new Date(d);
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function monthKey(d = new Date()) {
        const dateObj = (d instanceof Date) ? d : new Date(d);
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
    }

    const AggregateUtils = {
        todayKey,
        monthKey,

        /**
         * Atomically increments daily & monthly aggregate counter documents.
         * Fire-and-forget execution with zero disruption to main transaction flow.
         */
        async bumpAggregates({ businessId, type, value = 0, profit = 0, count = 1, cost = 0, customFields = {} }) {
            if (!businessId || !type) return false;
            const db = window.db || (window.firebase && window.firebase.firestore ? window.firebase.firestore() : null);
            if (!db) return false;

            const numVal = Number(value) || 0;
            const numProfit = Number(profit) || 0;
            const numCount = Number(count) || 1;
            const numCost = Number(cost) || 0;

            const dKey = todayKey();
            const mKey = monthKey();

            const dayRef = db.collection('settings').doc(businessId)
                .collection('aggregates').doc('daily')
                .collection('v').doc(dKey);

            const monthRef = db.collection('settings').doc(businessId)
                .collection('aggregates').doc('monthly')
                .collection('v').doc(mKey);

            const fv = (window.firebase && window.firebase.firestore && window.firebase.firestore.FieldValue) ? window.firebase.firestore.FieldValue : null;
            if (!fv) {
                console.warn('[AggregateUtils] Firebase FieldValue not available, skipping bump.');
                return false;
            }

            const payload = {
                updatedAt: fv.serverTimestamp()
            };

            const upperType = String(type).toUpperCase();
            if (upperType === 'SALE' || upperType === 'INVOICE') {
                payload.sales_amount = fv.increment(numVal);
                payload.sales_count = fv.increment(numCount);
                if (numProfit !== 0) payload.sales_profit = fv.increment(numProfit);
                if (numCost !== 0) payload.sales_cogs = fv.increment(numCost);
            } else if (upperType === 'EXPENSE') {
                payload.expense_amount = fv.increment(numVal);
                payload.expense_count = fv.increment(numCount);
            } else if (upperType === 'PURCHASE' || upperType === 'GRN') {
                payload.purchase_amount = fv.increment(numVal);
                payload.purchase_count = fv.increment(numCount);
            } else if (upperType === 'COCONUT_PURCHASE') {
                payload.coconut_purchase_amount = fv.increment(numVal);
                payload.coconut_purchase_count = fv.increment(numCount);
                payload.purchase_amount = fv.increment(numVal);
            } else if (upperType === 'HUSK_PURCHASE') {
                payload.husk_purchase_amount = fv.increment(numVal);
                payload.husk_purchase_count = fv.increment(numCount);
                payload.purchase_amount = fv.increment(numVal);
            } else if (upperType === 'PRODUCTION') {
                payload.production_count = fv.increment(numCount);
                payload.production_cost = fv.increment(numVal);
            }

            // Merge any additional custom counter increments
            if (customFields && typeof customFields === 'object') {
                Object.keys(customFields).forEach(k => {
                    const cVal = Number(customFields[k]) || 0;
                    payload[k] = fv.increment(cVal);
                });
            }

            try {
                await Promise.all([
                    dayRef.set({ date: dKey, ...payload }, { merge: true }),
                    monthRef.set({ period: mKey, ...payload }, { merge: true })
                ]);
                return true;
            } catch (err) {
                console.warn('[AggregateUtils] bumpAggregates failed (non-critical):', err);
                return false;
            }
        },

        /**
         * Point-read a daily aggregate document for a specific business and date.
         */
        async getDailyAggregate(db, businessId, dateStr = todayKey()) {
            if (!businessId) return null;
            try {
                const targetDb = db || window.db || (window.firebase && window.firebase.firestore ? window.firebase.firestore() : null);
                if (!targetDb) return null;

                const docSnap = await targetDb.collection('settings').doc(businessId)
                    .collection('aggregates').doc('daily')
                    .collection('v').doc(dateStr).get();

                return docSnap.exists ? docSnap.data() : null;
            } catch (err) {
                console.warn('[AggregateUtils] getDailyAggregate fallback needed:', err);
                return null;
            }
        },

        /**
         * Point-read a monthly aggregate document for a specific business and month.
         */
        async getMonthlyAggregate(db, businessId, monthStr = monthKey()) {
            if (!businessId) return null;
            try {
                const targetDb = db || window.db || (window.firebase && window.firebase.firestore ? window.firebase.firestore() : null);
                if (!targetDb) return null;

                const docSnap = await targetDb.collection('settings').doc(businessId)
                    .collection('aggregates').doc('monthly')
                    .collection('v').doc(monthStr).get();

                return docSnap.exists ? docSnap.data() : null;
            } catch (err) {
                console.warn('[AggregateUtils] getMonthlyAggregate fallback needed:', err);
                return null;
            }
        }
    };

    window.AggregateUtils = AggregateUtils;
})(typeof window !== 'undefined' ? window : global);
