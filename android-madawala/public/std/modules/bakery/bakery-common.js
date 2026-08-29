/**
 * Bakery / Confectionery Module — Shared Helper Library
 * Standalone, self-contained business module layer for DigiBiz platform.
 */

window.BakeryModule = (function () {
    const API = {};
    API.businessId = null;
    API.context = null;

    API.money = function (n) {
        return (Number(n) || 0).toFixed(2);
    };

    API.baseStyles = `
        body { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .mfg-wrap { padding: 24px; max-width: 1380px; margin: 0 auto; box-sizing: border-box; }
        @media (max-width: 768px) { .mfg-wrap { padding: 12px; } }
        .mfg-head { margin-bottom: 20px; }
        .mfg-head h2 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; letter-spacing: -0.5px; }
        .mfg-head p { font-size: 13px; color: #64748b; margin: 0; }
        .mfg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
        @media (max-width: 1024px) { .mfg-grid { grid-template-columns: 1fr; } }
        .mfg-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px; box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05); box-sizing: border-box; overflow: hidden; }
        @media (max-width: 640px) { .mfg-card { padding: 14px; border-radius: 10px; } }
        .mfg-card h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
        .mfg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .mfg-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
        @media (max-width: 640px) { .mfg-row, .mfg-row3 { grid-template-columns: 1fr; gap: 10px; } }
        .mfg-card label { display: block; font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
        .mfg-card input, .mfg-card select, .mfg-card textarea { width: 100%; box-sizing: border-box; padding: 10px 14px; font-size: 14px; font-family: inherit; color: #0f172a; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; transition: all 0.2s ease; }
        .mfg-card input:focus, .mfg-card select:focus, .mfg-card textarea:focus { background-color: #ffffff; border-color: #d97706; box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15); }
        .mfg-card select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 16px; padding-right: 36px; cursor: pointer; }
        .mfg-msg { margin-top: 10px; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; display: none; }
        .mfg-msg:not(:empty) { display: block; }
        .mfg-msg.err { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
        .mfg-msg:not(.err) { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
        .mfg-card table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
        th { background: #f1f5f9; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; padding: 10px 12px; text-align: left; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
        td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
        tr:hover td { background: #f8fafc; }
        .mfg-card > table { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; }
    `;

    API.formatDate = function (v) {
        if (!v) return '-';
        if (typeof v.toDate === 'function') return v.toDate().toLocaleString();
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return '-';
        return d.toLocaleString();
    };

    API.uuid = function (prefix) {
        return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    };

    API.init = async function (activeKey) {
        return new Promise((resolve) => {
            firebase.auth().onAuthStateChanged(async (u) => {
                if (!u) {
                    window.location.href = '/auth/login.html';
                    return;
                }
                const ctx = window.dashboardCore && window.dashboardCore.getContext
                    ? await window.dashboardCore.getContext(u)
                    : null;
                API.context = ctx || {};
                const rawBid = (ctx && ctx.businessId) || localStorage.getItem('currentBusinessId') || u.uid;
                API.businessId = rawBid != null ? String(rawBid) : null;
                const head = document.getElementById('mfgBusinessCtx');
                if (head) head.textContent = `Bakery Business: ${API.businessId}`;
                resolve(API.businessId);
            });
        });
    };

    API.publishEvent = function (type, data) {
        if (window.eventBus && typeof window.eventBus.publish === 'function') {
            window.eventBus.publish(type, data);
        }
    };

    API.firstName = function (fullName) {
        const clean = String(fullName || '').trim().replace(/\s+/g, ' ');
        return clean ? clean.split(' ')[0] : '';
    };

    API.template = function (tpl, data) {
        let s = String(tpl || '');
        Object.keys(data).forEach((k) => {
            const val = data[k];
            s = s.split(`{${k}}`).join(val != null ? val : '');
            s = s.split(`[${k}]`).join(val != null ? val : '');
        });
        return s;
    };

    API.defaultSmsManager = function () {
        return {
            tplSales: '[BRAND] - Hello {Name}, your bakery bill of Rs.{Amount} is confirmed. Bal: Rs.{Balance}.',
            tplInbound: '[BRAND] - {Material} {Qty} ingredients purchased today. Value: Rs.{Amount}. {PaymentDetails}',
            tplOutbound: '[BRAND] - {Product} {Qty} bakery items sold today. Value: Rs.{Amount}. {PaymentDetails}',
            tplPayment: '[BRAND] - Hi {Name}, received payment Rs.{Amount}. Remaining: Rs.{Balance}.',
            tplDebt: '[BRAND] - Dear {Name}, a friendly reminder of your outstanding Rs.{Amount}. Please settle soon.',
            autoDebtReminders: false,
            events: { inbound: true, outbound: true, payment: true, debt: true }
        };
    };

    API.smsEventAllowed = function (smsManager, smsType) {
        const ev = (smsManager && smsManager.events) || {};
        if (smsType === 'INBOUND_PURCHASE') return ev.inbound !== false;
        if (smsType === 'OUTBOUND_SALE') return ev.outbound !== false;
        if (smsType === 'PAYMENT_CONFIRMATION') return ev.payment !== false;
        if (smsType === 'DEBT_REMINDER') return ev.debt !== false;
        if (smsType === 'SALE_CONFIRMATION') return ev.outbound !== false || ev.sales !== false;
        return true;
    };

    let digibizRtdbLoadPromise = null;
    API.ensureFirebaseDatabaseLoaded = function () {
        if (typeof firebase !== 'undefined' && typeof firebase.database === 'function') {
            return Promise.resolve();
        }
        if (digibizRtdbLoadPromise) return digibizRtdbLoadPromise;
        digibizRtdbLoadPromise = new Promise((resolve) => {
            const existing = document.querySelector('script[data-digibiz-rtdb-compat]');
            if (existing) {
                (async () => {
                    for (let i = 0; i < 60; i++) {
                        if (typeof firebase !== 'undefined' && typeof firebase.database === 'function') break;
                        await new Promise((r) => setTimeout(r, 50));
                    }
                    resolve();
                })();
                return;
            }
            const s = document.createElement('script');
            s.src = 'https://www.gstatic.com/firebasejs/12.11.0/firebase-database-compat.js';
            s.async = true;
            s.setAttribute('data-digibiz-rtdb-compat', '1');
            s.onload = () => resolve();
            s.onerror = () => resolve();
            document.head.appendChild(s);
        });
        return digibizRtdbLoadPromise;
    };

    API.ensureSmsWalletSeeded = async function (businessId) {
        if (!businessId || !window.db) return;
        if (window.SmsWalletCore && typeof window.SmsWalletCore.ensureSeeded === 'function') {
            await window.SmsWalletCore.ensureSeeded(String(businessId));
            return;
        }
        const settingsRef = db.collection('settings').doc(businessId);
        const snap = await settingsRef.get().catch(() => null);
        const data = snap && snap.exists ? (snap.data() || {}) : {};
        const wallet = data.smsWallet || {};
        const bal = Number(wallet.smsBalance ?? data.smsBalance ?? 0);
        if (bal > 0) return;
        const TRIAL = (window.subscriptionManager && Number(window.subscriptionManager.TRIAL_SMS_CREDITS)) || 300;
        const UNIT = (window.subscriptionManager && Number(window.subscriptionManager.SMS_UNIT_PRICE)) || 1;
        const FEE = (window.subscriptionManager && Number(window.subscriptionManager.MONTHLY_FEE)) || 1000;
        await settingsRef.set({
            smsWallet: {
                smsBalance: TRIAL,
                lowBalanceThreshold: 50,
                unitPrice: UNIT,
                monthlyFee: FEE,
                trialCreditsGranted: true,
                updatedAt: new Date().toISOString()
            },
            smsBalance: TRIAL,
            smsManager: { ...API.defaultSmsManager(), ...(data.smsManager || {}) }
        }, { merge: true });
    };

    API.enqueueSms = async function (smsType, message, opts = {}) {
        const bizIdStr = API.businessId;
        if (!bizIdStr) return { ok: false, error: 'no_business_id' };

        const settingsSnap = await db.collection('settings').doc(bizIdStr).get().catch(() => null);
        const settingsData = settingsSnap && settingsSnap.exists ? settingsSnap.data() || {} : {};
        const smsManager = { ...API.defaultSmsManager(), ...(settingsData.smsManager || {}) };
        
        if (!API.smsEventAllowed(smsManager, smsType)) {
            return { ok: false, skipped: 'sms_event_disabled' };
        }

        const header = String(settingsData.smsHeader || 'BAKERY').trim().replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 10);
        const to = String(opts.mobile || '').trim();
        if (to.length < 9) return { ok: false, skipped: 'no_mobile' };

        let totalBalance = Number(opts.balance || 0);
        if (opts.customerId) {
            const snapshot = await API.getCustomerFinanceSnapshot(bizIdStr, opts.customerId);
            const currentAmount = Number(opts.amount || 0);
            const applyDelta = opts.applyDelta !== false;
            totalBalance = Number(snapshot.netBalance || 0);

            if (applyDelta && smsType === 'INBOUND_PURCHASE') {
                totalBalance -= currentAmount;
            } else if (applyDelta && smsType === 'OUTBOUND_SALE') {
                totalBalance += currentAmount;
            } else if (applyDelta && smsType === 'PAYMENT_CONFIRMATION') {
                if (opts.type === 'PAYMENT_GIVEN') totalBalance += currentAmount;
                else totalBalance -= currentAmount;
            }
        }

        let tpl = '';
        if (smsType === 'INBOUND_PURCHASE') tpl = smsManager.tplInbound;
        else if (smsType === 'OUTBOUND_SALE') tpl = smsManager.tplOutbound;
        else if (smsType === 'PAYMENT_CONFIRMATION') tpl = smsManager.tplPayment;
        else if (smsType === 'DEBT_REMINDER') tpl = smsManager.tplDebt;
        else tpl = String(message || '').trim();

        const amount = Number(opts.amount || 0).toFixed(2);
        const balanceDisp = Math.abs(totalBalance).toFixed(2);
        const balanceSign = totalBalance > 0 ? ' (To Receive)' : (totalBalance < 0 ? ' (To Pay)' : '');
        const first = API.firstName(opts.name || '');
        
        let paymentDetails = '';
        if (smsType === 'INBOUND_PURCHASE' || smsType === 'OUTBOUND_SALE') {
            const isPaid = opts.paymentStatus === 'PAID';
            if (isPaid) {
                paymentDetails = `We paid you Rs.${amount} (Cash).`;
                if (smsType === 'OUTBOUND_SALE') paymentDetails = `Payment of Rs.${amount} received (Cash).`;
            } else {
                const dateStr = opts.dueDate ? new Date(opts.dueDate).toLocaleDateString() : 'a later date';
                paymentDetails = `Amount not paid today. Expecting to settle on ${dateStr}.`;
                if (smsType === 'OUTBOUND_SALE') paymentDetails = `Payment pending. Expecting to receive on ${dateStr}.`;
            }
        }

        const data = {
            BRAND: header,
            Name: first || 'Customer',
            Amount: amount,
            Balance: `${balanceDisp}${balanceSign}`,
            Material: opts.materialName || 'Ingredients',
            Product: opts.productName || 'Bakery Item',
            Qty: opts.qty || '',
            PaymentDetails: paymentDetails,
            ...opts
        };

        let branded = API.template(tpl, data);
        if (!branded.startsWith('[')) branded = `[${header}] - ${branded}`;

        const rtdbId = `sms_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        try {
            await API.ensureFirebaseDatabaseLoaded();
            if (typeof firebase !== 'undefined' && typeof firebase.database === 'function') {
                await firebase.database().ref(`sms_gateway/${bizIdStr}/pending_sms/${rtdbId}`).set({
                    businessId: bizIdStr,
                    mobile: to,
                    message: branded,
                    ts: Date.now(),
                    type: smsType
                });
            }
        } catch (rtdbErr) {
            console.warn('[Bakery SMS] RTDB write warning:', rtdbErr);
        }

        try {
            const settingsRef = db.collection('settings').doc(bizIdStr);
            const isolatedRef = db.collection('businesses').doc(bizIdStr).collection('pending_sms').doc(rtdbId);
            
            const updatePayload = {
                smsBalance: firebase.firestore.FieldValue.increment(-1),
                "smsWallet.smsBalance": firebase.firestore.FieldValue.increment(-1),
                "smsWallet.updatedAt": new Date().toISOString()
            };

            const historyPayload = {
                businessId: bizIdStr,
                type: smsType,
                message: branded,
                mobile: to,
                status: 'sent_via_rtdb',
                creditCharged: 1,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await Promise.all([
                settingsRef.update(updatePayload).catch(e => console.warn('Balance update failed:', e.message)),
                isolatedRef.set(historyPayload).catch(e => console.warn('History log failed:', e.message))
            ]);

            return { ok: true, via: 'rtdb' };
        } catch (e) {
            return { ok: true, fallback: true };
        }
    };

    API.getCustomerBalance = async function (bid, cid) {
        if (!bid || !cid) return 0;
        try {
            const snap = await db.collection('journal').doc(bid).collection('entries').get();
            let bal = 0;
            snap.docs.forEach(doc => {
                const entry = doc.data();
                (entry.entries || []).forEach(line => {
                    if (line.customerId === cid || line.supplierId === cid) {
                        bal += (Number(line.debit) || 0) - (Number(line.credit) || 0);
                    }
                });
            });
            return bal;
        } catch (e) {
            console.warn('[Bakery] Balance fetch failed:', e);
            return 0;
        }
    };

    API.getCustomerFinanceSnapshot = async function (bid, cid, optFullName) {
        const empty = {
            payableTotal: 0,
            receivableTotal: 0,
            paymentGivenTotal: 0,
            paymentReceivedTotal: 0,
            netBalance: 0
        };
        if (!bid || !cid) return empty;

        try {
            const inboundColl = 'bakery_raw_material_history';
            const outboundColl = 'bakery_sales';

            let resolvedName = optFullName || cid;

            const [inboundSnap, outboundSnap, financeSnap] = await Promise.all([
                db.collection(inboundColl)
                    .where('businessId', '==', bid)
                    .where('customerId', '==', resolvedName)
                    .get()
                    .catch(() => ({ docs: [] })),
                db.collection(outboundColl)
                    .where('businessId', '==', bid)
                    .where('customerId', '==', resolvedName)
                    .get()
                    .catch(() => ({ docs: [] })),
                db.collection('finance_transactions')
                    .where('businessId', '==', bid)
                    .where('customerId', '==', cid)
                    .get()
                    .catch(() => ({ docs: [] }))
            ]);

            const payableTotal = inboundSnap.docs.reduce((sum, d) => {
                const x = d.data() || {};
                if (!['PENDING', 'PENDING_CLEARANCE'].includes(x.paymentStatus)) return sum;
                return sum + (Number(x.totalAmount || x.amount) || 0);
            }, 0);
            
            const receivableTotal = outboundSnap.docs.reduce((sum, d) => {
                const x = d.data() || {};
                if (!['PENDING', 'PENDING_CLEARANCE'].includes(x.paymentStatus)) return sum;
                return sum + (Number(x.totalAmount || x.amount) || 0);
            }, 0);

            const paymentGivenTotal = financeSnap.docs.reduce((sum, d) => {
                const x = d.data() || {};
                if (x.isActive === false) return sum;
                return x.type === 'PAYMENT_GIVEN' ? sum + (Number(x.amount) || 0) : sum;
            }, 0);
            const paymentReceivedTotal = financeSnap.docs.reduce((sum, d) => {
                const x = d.data() || {};
                if (x.isActive === false) return sum;
                return x.type === 'PAYMENT_RECEIVED' ? sum + (Number(x.amount) || 0) : sum;
            }, 0);

            const netBalance = (receivableTotal - paymentReceivedTotal) - (payableTotal - paymentGivenTotal);
            return { payableTotal, receivableTotal, paymentGivenTotal, paymentReceivedTotal, netBalance };
        } catch (err) {
            console.warn('[Bakery] Finance snapshot fetch failed:', err);
            return empty;
        }
    };

    API.saveFieldSuggestion = async function (fieldKey, value) {
        if (window.DigiBizUI) return window.DigiBizUI.saveFieldSuggestion(fieldKey, value);
        
        const raw = String(value || '').trim();
        if (!raw || !API.businessId) return;
        const id = `${fieldKey}_${raw.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        await db.collection('businesses').doc(API.businessId).collection('bakery_field_suggestions').doc(id).set({
            businessId: API.businessId,
            fieldKey: fieldKey,
            value: raw,
            updatedAt: new Date()
        }, { merge: true });
    };

    API.loadFieldSuggestions = async function (fieldKey) {
        if (window.DigiBizUI) return window.DigiBizUI.loadFieldSuggestions(fieldKey);
        
        if (!API.businessId) return [];
        const snap = await db.collection('businesses').doc(API.businessId).collection('bakery_field_suggestions')
            .where('fieldKey', '==', fieldKey)
            .orderBy('value')
            .get()
            .catch(() => ({ docs: [] }));
        return snap.docs.map((d) => (d.data() || {}).value).filter(Boolean);
    };

    API.bindAutocomplete = async function (inputId, fieldKey) {
        if (window.DigiBizUI) return window.DigiBizUI.bindAutocomplete(inputId, fieldKey);
        
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const listId = `${inputId}_datalist`;
        let datalist = document.getElementById(listId);
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = listId;
            document.body.appendChild(datalist);
        }
        input.setAttribute('list', listId);

        const refreshList = async () => {
            const suggestions = await API.loadFieldSuggestions(fieldKey);
            datalist.innerHTML = suggestions.map(s => `<option value="${s}"></option>`).join('');
        };

        await refreshList();
        
        return async () => {
            const val = input.value.trim();
            if (val) {
                await API.saveFieldSuggestion(fieldKey, val);
                await refreshList();
            }
        };
    };

    API.saveCategory = (group, name) => API.saveFieldSuggestion(group, name);
    API.loadCategories = (group) => API.loadFieldSuggestions(group);

    API.upsertFlatAccountBalance = async function (businessId, accountName, delta, when) {
        const idPart = String(accountName || '').trim();
        if (!businessId || !idPart || !window.db) return;
        const ref = window.db.collection('account_balances').doc(String(businessId) + '__' + idPart.replace(/\s+/g, '_').toUpperCase());
        await window.db.runTransaction(async (tx) => {
            const snap = await tx.get(ref);
            const cur = snap.exists ? (Number((snap.data() || {}).balance) || 0) : 0;
            const next = cur + (Number(delta) || 0);
            tx.set(ref, {
                businessId,
                account: idPart,
                balance: next,
                updatedAt: when || new Date()
            }, { merge: true });
        });
    };

    API.addSupplierLedgerRow = async function ({ businessId, supplierId, supplierName, amount, type, reference, date }) {
        if (!businessId || !window.db) return;
        const amt = Number(amount) || 0;
        if (amt <= 0) return;
        const d = date instanceof Date ? date.toISOString().slice(0, 10) : (typeof date === 'string' ? date.slice(0, 10) : new Date().toISOString().slice(0, 10));
        await window.db.collection('supplier_ledger').add({
            supplierId: supplierId || '',
            supplierName: String(supplierName || '').trim() || 'Supplier',
            amount: amt,
            type: String(type || 'credit').toLowerCase(),
            reference: String(reference || ''),
            date: d,
            businessId,
            createdAt: new Date()
        });
    };

    API.syncFlatAccountingRawMaterialPurchase = async function (data) {
        const bid = data.businessId;
        const amt = Number(data.amount) || 0;
        if (!bid || amt <= 0) return;
        const refText = 'BAKERY_ING/' + String(data.purchaseId || '');
        const postingDate = data.createdAt && data.createdAt.toDate
            ? data.createdAt.toDate().toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10);
        await API.addSupplierLedgerRow({
            businessId: bid,
            supplierId: data.customerId || '',
            supplierName: data.supplierName,
            amount: amt,
            type: 'credit',
            reference: refText,
            date: postingDate
        });
        const now = new Date();
        await Promise.all([
            API.upsertFlatAccountBalance(bid, 'Purchases', amt, now),
            API.upsertFlatAccountBalance(bid, 'Inventory', amt, now),
            API.upsertFlatAccountBalance(bid, 'SupplierOutstanding', amt, now),
            API.upsertFlatAccountBalance(bid, 'StockValue', amt, now)
        ]);
    };

    API.syncFlatAccountingFinishedGoodSale = async function (data) {
        const bid = data.businessId;
        const cogs = Number(data.cogsAmount) || 0;
        if (!bid || cogs <= 0) return;
        await API.upsertFlatAccountBalance(bid, 'StockValue', -cogs, new Date());
    };

    API.syncFlatAccountingOperationalExpense = async function (data) {
        const bid = data.businessId;
        const amt = Number(data.amount) || 0;
        if (!bid || amt <= 0) return;
        await API.upsertFlatAccountBalance(bid, 'OperatingExpenses', amt, new Date());
    };

    API.syncFlatAccountingProductionRecorded = async function (data) {
        const bid = data.businessId;
        const totalRmCost = Number(data.totalRmCost) || 0;
        const totalLaborOverhead = (Number(data.laborCost) || 0) + (Number(data.overheadCost) || 0);
        const totalBatchCost = Number(data.totalBatchCost) || (totalRmCost + totalLaborOverhead);
        if (!bid || totalBatchCost <= 0) return;
        const now = new Date();
        await Promise.all([
            API.upsertFlatAccountBalance(bid, 'RawMaterialStockValue', -totalRmCost, now),
            API.upsertFlatAccountBalance(bid, 'FinishedGoodsStockValue', totalBatchCost, now),
            API.upsertFlatAccountBalance(bid, 'StockValue', totalLaborOverhead, now)
        ]);
    };

    // ==========================================
    // BAKERY RECIPES & PRODUCTION YIELD ENGINE
    // ==========================================

    API.DEFAULT_RECIPES = [
        {
            code: 'LS',
            name: 'Lemon Sweet / Large Sweet (LS)',
            baseFlourQty: 10,
            flourUnit: 'Kg',
            ingredients: [
                { name: 'Flour', qty: 10, unit: 'Kg' },
                { name: 'Sugar', qty: 7.5, unit: 'Kg' },
                { name: 'Margarine', qty: 1, unit: 'Kg' },
                { name: 'Baking Powder', qty: 0.2, unit: 'Kg' },
                { name: 'Oil', qty: 0.2, unit: 'L' }
            ],
            expectedUnitsYield: 444.4,
            expectedPacketsYield: 8.889,
            unitsPerPacket: 50,
            estimatedValue: 7111
        },
        {
            code: 'SS',
            name: 'Short Sweet Biscuit / Sweet Pastry (SS)',
            baseFlourQty: 10,
            flourUnit: 'Kg',
            ingredients: [
                { name: 'Flour', qty: 10, unit: 'Kg' },
                { name: 'Sugar', qty: 7.5, unit: 'Kg' },
                { name: 'Margarine', qty: 1, unit: 'Kg' },
                { name: 'Baking Powder', qty: 0.2, unit: 'Kg' },
                { name: 'Oil', qty: 0.2, unit: 'L' }
            ],
            expectedUnitsYield: 1111,
            expectedPacketsYield: 111.1,
            unitsPerPacket: 10,
            estimatedValue: 11111
        },
        {
            code: 'S200',
            name: 'Sweet 200 Biscuit / Bun (S200)',
            baseFlourQty: 10,
            flourUnit: 'Kg',
            ingredients: [
                { name: 'Flour', qty: 10, unit: 'Kg' },
                { name: 'Sugar', qty: 7.5, unit: 'Kg' },
                { name: 'Margarine', qty: 1, unit: 'Kg' },
                { name: 'Baking Powder', qty: 0.2, unit: 'Kg' },
                { name: 'Oil', qty: 0.2, unit: 'L' }
            ],
            expectedUnitsYield: 1053,
            expectedPacketsYield: 58.48,
            unitsPerPacket: 18,
            estimatedValue: 9937
        },
        {
            code: 'Ro',
            name: 'Chocolate Rolls (Ro)',
            baseFlourQty: 10,
            flourUnit: 'Kg',
            ingredients: [
                { name: 'Flour', qty: 10, unit: 'Kg' },
                { name: 'Sugar', qty: 7, unit: 'Kg' },
                { name: 'Margarine', qty: 1, unit: 'Kg' },
                { name: 'Baking Powder', qty: 0.2, unit: 'Kg' },
                { name: 'Oil', qty: 0.2, unit: 'L' },
                { name: 'Chocolate Powder', qty: 0.5, unit: 'Kg' }
            ],
            expectedUnitsYield: 410,
            expectedPacketsYield: 82,
            unitsPerPacket: 5,
            estimatedValue: 10660
        },
        {
            code: 'RC',
            name: 'Ribbon Cake (RC)',
            baseFlourQty: 10,
            flourUnit: 'Kg',
            ingredients: [
                { name: 'Flour', qty: 10, unit: 'Kg' },
                { name: 'Sugar', qty: 5.8, unit: 'Kg' },
                { name: 'Cita', qty: 1, unit: 'Kg' },
                { name: 'Baking Powder', qty: 0.2, unit: 'Kg' },
                { name: 'Oil', qty: 0.15, unit: 'L' }
            ],
            expectedUnitsYield: 166,
            expectedPacketsYield: 33.2,
            unitsPerPacket: 5,
            estimatedValue: 8300
        },
        {
            code: 'WI',
            name: 'White Bread / White Loaf (WI)',
            baseFlourQty: 10,
            flourUnit: 'Kg',
            ingredients: [
                { name: 'Flour', qty: 10, unit: 'Kg' },
                { name: 'Sugar', qty: 1.8, unit: 'Kg' },
                { name: 'Margarine', qty: 0.25, unit: 'Kg' },
                { name: 'Yeast', qty: 0.04, unit: 'Kg' },
                { name: 'Salt', qty: 0.2, unit: 'Kg' },
                { name: 'Oil', qty: 0.5, unit: 'L' },
                { name: 'Corn Flour', qty: 0.2, unit: 'Kg' }
            ],
            expectedUnitsYield: 680,
            expectedPacketsYield: 75.56,
            unitsPerPacket: 9,
            estimatedValue: 8500
        },
        {
            code: 'BW',
            name: 'Brown Bread / Burger Buns (BW)',
            baseFlourQty: 10,
            flourUnit: 'Kg',
            ingredients: [
                { name: 'Flour', qty: 10, unit: 'Kg' },
                { name: 'Sugar', qty: 3, unit: 'Kg' },
                { name: 'Margarine', qty: 0.3, unit: 'Kg' },
                { name: 'Yeast', qty: 0.02, unit: 'Kg' },
                { name: 'Salt', qty: 0.2, unit: 'Kg' },
                { name: 'Oil', qty: 0.1, unit: 'L' }
            ],
            expectedUnitsYield: 1000,
            expectedPacketsYield: 100,
            unitsPerPacket: 10,
            estimatedValue: 10000
        },
        {
            code: 'FB',
            name: 'Fish Bun / Savory Pastry (FB)',
            baseFlourQty: 10,
            flourUnit: 'Kg',
            ingredients: [
                { name: 'Flour', qty: 10, unit: 'Kg' },
                { name: 'Sugar', qty: 3.5, unit: 'Kg' },
                { name: 'Margarine', qty: 1.5, unit: 'Kg' },
                { name: 'Yeast', qty: 0.2, unit: 'Kg' },
                { name: 'Salt', qty: 0.2, unit: 'Kg' },
                { name: 'Oil', qty: 0.02, unit: 'L' },
                { name: 'Coconut', qty: 0.2, unit: 'Kg' },
                { name: 'Whey Powder', qty: 10, unit: 'Kg' }
            ],
            expectedUnitsYield: 650,
            expectedPacketsYield: 108.33,
            unitsPerPacket: 6,
            estimatedValue: 10829
        },
        {
            code: '3in1',
            name: '3 in 1 Pastry Bun (3in1)',
            baseFlourQty: 10,
            flourUnit: 'Kg',
            ingredients: [
                { name: 'Flour', qty: 10, unit: 'Kg' },
                { name: 'Sugar', qty: 4, unit: 'Kg' },
                { name: 'Margarine', qty: 2, unit: 'Kg' },
                { name: 'Yeast', qty: 0.2, unit: 'Kg' },
                { name: 'Salt', qty: 0.2, unit: 'Kg' },
                { name: 'Oil', qty: 0.5, unit: 'L' },
                { name: 'Coconut', qty: 0.2, unit: 'Kg' },
                { name: 'Whey Powder', qty: 10, unit: 'Kg' }
            ],
            expectedUnitsYield: 888.9,
            expectedPacketsYield: 148.1,
            unitsPerPacket: 6,
            estimatedValue: 24444
        },
        {
            code: 'CB',
            name: 'Cream Bun / Sweet Cream Bun (CB)',
            baseFlourQty: 10,
            flourUnit: 'Kg',
            ingredients: [
                { name: 'Flour', qty: 10, unit: 'Kg' },
                { name: 'Sugar', qty: 4, unit: 'Kg' },
                { name: 'Margarine', qty: 2, unit: 'Kg' },
                { name: 'Yeast', qty: 0.2, unit: 'Kg' },
                { name: 'Salt', qty: 0.2, unit: 'Kg' },
                { name: 'Oil', qty: 0.5, unit: 'L' },
                { name: 'Coconut', qty: 0.2, unit: 'Kg' },
                { name: 'Whey Powder', qty: 10, unit: 'Kg' }
            ],
            expectedUnitsYield: 888.9,
            expectedPacketsYield: 444.4,
            unitsPerPacket: 2,
            estimatedValue: 17778
        },
        {
            code: 'WC',
            name: 'Wedding Cake / White Cake (WC)',
            baseFlourQty: 10,
            flourUnit: 'Kg',
            ingredients: [
                { name: 'Flour', qty: 10, unit: 'Kg' },
                { name: 'Sugar', qty: 10, unit: 'Kg' },
                { name: 'Margarine', qty: 6.666, unit: 'Kg' },
                { name: 'Baking Powder', qty: 0.2, unit: 'Kg' },
                { name: 'Whey Powder', qty: 106.6, unit: 'Kg' }
            ],
            expectedUnitsYield: 427,
            expectedPacketsYield: 42.7,
            unitsPerPacket: 10,
            estimatedValue: 21350
        },
        {
            code: 'Wa',
            name: 'Crispy Wafers (Wa)',
            baseFlourQty: 10,
            flourUnit: 'Kg',
            ingredients: [
                { name: 'Flour', qty: 10, unit: 'Kg' },
                { name: 'Sugar', qty: 7.5, unit: 'Kg' },
                { name: 'Baking Powder', qty: 0.2, unit: 'Kg' },
                { name: 'Yeast', qty: 0.166, unit: 'Kg' },
                { name: 'Biscuit Crumb', qty: 10, unit: 'Kg' }
            ],
            expectedUnitsYield: 186.6,
            expectedPacketsYield: 18.66,
            unitsPerPacket: 10,
            estimatedValue: 9330
        },
        {
            code: 'SC',
            name: 'Sponge Cake (SC)',
            baseFlourQty: 10,
            flourUnit: 'Kg',
            ingredients: [
                { name: 'Flour', qty: 10, unit: 'Kg' },
                { name: 'Sugar', qty: 10, unit: 'Kg' },
                { name: 'Margarine', qty: 6.666, unit: 'Kg' },
                { name: 'Baking Powder', qty: 0.2, unit: 'Kg' },
                { name: 'Whey Powder', qty: 106.6, unit: 'Kg' }
            ],
            expectedUnitsYield: 790,
            expectedPacketsYield: 79,
            unitsPerPacket: 10,
            estimatedValue: 31600
        },
        {
            code: 'RB',
            name: 'Rusk / Twice-Baked Bread (RB)',
            baseFlourQty: 10,
            flourUnit: 'Kg',
            ingredients: [
                { name: 'Flour', qty: 10, unit: 'Kg' },
                { name: 'Sugar', qty: 40, unit: 'Kg' },
                { name: 'Biscuit Crumb', qty: 80, unit: 'Kg' },
                { name: 'Egg', qty: 4, unit: 'Units' }
            ],
            expectedUnitsYield: 7600,
            expectedPacketsYield: 760,
            unitsPerPacket: 10,
            estimatedValue: 83600
        }
    ];

    API.getRecipes = async function (bid) {
        const firestoreDb = window.db || (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore());
        if (!bid || !firestoreDb) return API.DEFAULT_RECIPES;
        try {
            const snap = await firestoreDb.collection('bakery_recipes')
                .where('businessId', '==', bid)
                .get()
                .catch(() => ({ docs: [] }));

            if (!snap || !snap.docs || snap.docs.length === 0) {
                // Pre-seed default spreadsheet recipes for this business
                await API.seedDefaultRecipes(bid);
                return API.DEFAULT_RECIPES;
            }

            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            return list.length ? list : API.DEFAULT_RECIPES;
        } catch (e) {
            console.warn('[Bakery] Error loading recipes:', e);
            return API.DEFAULT_RECIPES;
        }
    };

    API.seedDefaultRecipes = async function (bid) {
        const firestoreDb = window.db || (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore());
        if (!bid || !firestoreDb) return;
        try {
            const batch = firestoreDb.batch();
            API.DEFAULT_RECIPES.forEach(r => {
                const docRef = firestoreDb.collection('bakery_recipes').doc(`${bid}_${r.code}`);
                batch.set(docRef, {
                    ...r,
                    businessId: bid,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }, { merge: true });
            });
            await batch.commit();
        } catch (e) {
            console.warn('[Bakery] Seeding recipes warning:', e);
        }
    };

    API.saveRecipe = async function (bid, recipeData) {
        const firestoreDb = window.db || (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore());
        if (!bid || !firestoreDb || !recipeData) return null;
        const code = String(recipeData.code || recipeData.name || 'REC').trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
        const docId = recipeData.id || `${bid}_${code}`;
        const payload = {
            ...recipeData,
            code: code,
            businessId: bid,
            updatedAt: new Date()
        };
        await firestoreDb.collection('bakery_recipes').doc(docId).set(payload, { merge: true });
        return { id: docId, ...payload };
    };

    API.deleteRecipe = async function (bid, recipeId) {
        const firestoreDb = window.db || (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore());
        if (!bid || !firestoreDb || !recipeId) return;
        await firestoreDb.collection('bakery_recipes').doc(recipeId).delete();
    };

    API.calculateBatch = function (recipe, flourKg) {
        const baseFlour = Number(recipe.baseFlourQty || 10) || 10;
        const flour = Number(flourKg || 0);
        const scaleFactor = flour > 0 ? (flour / baseFlour) : 1;

        const scaledIngredients = (recipe.ingredients || []).map(ing => {
            const baseQty = Number(ing.qty || 0);
            const scaledQty = Number((baseQty * scaleFactor).toFixed(3));
            return {
                name: ing.name,
                unit: ing.unit || 'Kg',
                baseQty: baseQty,
                requiredQty: scaledQty
            };
        });

        const expectedUnitsYield = Number(((Number(recipe.expectedUnitsYield || 0)) * scaleFactor).toFixed(1));
        const expectedPacketsYield = Number(((Number(recipe.expectedPacketsYield || 0)) * scaleFactor).toFixed(2));

        return {
            scaleFactor,
            scaledIngredients,
            expectedUnitsYield,
            expectedPacketsYield
        };
    };

    API.DEFAULT_RAW_MATERIALS = [
        { name: 'Flour', unit: 'Kg', stockQty: 500, minStockLevel: 50, lastUnitCost: 180, category: 'Flour & Grains' },
        { name: 'Sugar', unit: 'Kg', stockQty: 250, minStockLevel: 25, lastUnitCost: 240, category: 'Sweeteners' },
        { name: 'Margarine', unit: 'Kg', stockQty: 100, minStockLevel: 15, lastUnitCost: 650, category: 'Fats & Oils' },
        { name: 'Cita', unit: 'Kg', stockQty: 40, minStockLevel: 10, lastUnitCost: 450, category: 'Fats & Oils' },
        { name: 'Baking Powder', unit: 'Kg', stockQty: 25, minStockLevel: 5, lastUnitCost: 500, category: 'Leavening Agents' },
        { name: 'Yeast', unit: 'Kg', stockQty: 30, minStockLevel: 5, lastUnitCost: 1200, category: 'Leavening Agents' },
        { name: 'Salt', unit: 'Kg', stockQty: 50, minStockLevel: 10, lastUnitCost: 80, category: 'Seasoning' },
        { name: 'Oil', unit: 'L', stockQty: 100, minStockLevel: 20, lastUnitCost: 550, category: 'Fats & Oils' },
        { name: 'Biscuit Crumb', unit: 'Kg', stockQty: 150, minStockLevel: 20, lastUnitCost: 300, category: 'Additives' },
        { name: 'Coconut', unit: 'Kg', stockQty: 80, minStockLevel: 15, lastUnitCost: 200, category: 'Nuts & Desiccated' },
        { name: 'Whey Powder', unit: 'Kg', stockQty: 100, minStockLevel: 15, lastUnitCost: 850, category: 'Dairy & Powders' },
        { name: 'Egg', unit: 'Units', stockQty: 600, minStockLevel: 100, lastUnitCost: 38, category: 'Dairy & Eggs' },
        { name: 'Rulan', unit: 'Kg', stockQty: 50, minStockLevel: 10, lastUnitCost: 220, category: 'Flour & Grains' },
        { name: 'Chocolate Powder', unit: 'Kg', stockQty: 30, minStockLevel: 5, lastUnitCost: 1400, category: 'Flavorings' },
        { name: 'Corn Flour', unit: 'Kg', stockQty: 35, minStockLevel: 5, lastUnitCost: 320, category: 'Flour & Grains' }
    ];

    API.seedDefaultRawMaterials = async function (bid) {
        const firestoreDb = window.db || (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore());
        if (!bid || !firestoreDb) return;
        try {
            const batch = firestoreDb.batch();
            const now = new Date();
            API.DEFAULT_RAW_MATERIALS.forEach(rm => {
                const docId = `${bid}_${rm.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
                const docRef = firestoreDb.collection('bakery_raw_materials').doc(docId);
                batch.set(docRef, {
                    ...rm,
                    businessId: bid,
                    unitCost: rm.lastUnitCost,
                    isActive: true,
                    updatedAt: now,
                    createdAt: now
                }, { merge: true });
            });
            await batch.commit();
            console.log('[Bakery] Standard 15 raw materials seeded successfully for business:', bid);
        } catch (e) {
            console.warn('[Bakery] Seeding raw materials warning:', e);
        }
    };

    return API;
})();

// Backward compatibility alias inside bakery module
window.BakeryModule = window.BakeryModule;
