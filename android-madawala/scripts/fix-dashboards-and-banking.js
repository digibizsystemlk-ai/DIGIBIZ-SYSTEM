const fs = require('fs');

// 1. Fix Banking Modal (Ensure Opening Balance source radio buttons are permanently visible with clear styling)
const bankingFiles = [
    'public/modules/tire_centre/banking.html',
    'public/modules/retail/banking.html'
];

bankingFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');

    // Replace accOpeningBalance & accOpeningSourceWrap in HTML
    const oldWrapRegex = /<div id="accOpeningSourceWrap"[\s\S]*?<\/div>/;
    const cleanOpeningHtml = `<div id="accOpeningSourceWrap" style="margin-bottom:14px; background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:12px; padding:12px 14px;" class="radio-box-group">
                <label style="color:#0f3b2c; font-weight:800; font-size:12px; margin-bottom:8px; display:block;">
                    🏦 ආරම්භක ශේෂයේ ප්‍රභවය (Opening Balance Source):
                </label>
                <label class="radio-option" style="display:flex; align-items:flex-start; gap:10px; margin-bottom:10px; cursor:pointer; font-size:12.5px; color:#1e293b;">
                    <input type="radio" name="accOpeningDeductDrawer" value="no" checked style="margin-top:3px; accent-color:#10b981; width:auto;">
                    <span>🟢 <strong>පවතින බැංකු මුදලක් (ලාච්චුවෙන් / Cash Flow එකෙන් අඩු නොකරන්න)</strong><br><small style="color:#64748b;">මෙය දැනටමත් බැංකුවේ ඇති මුදලකි. ව්‍යාපාරයේ ලාච්චුවේ මුදලින් හෝ Cash Flow වලින් අඩු නොවේ.</small></span>
                </label>
                <label class="radio-option" style="display:flex; align-items:flex-start; gap:10px; cursor:pointer; font-size:12.5px; color:#1e293b;">
                    <input type="radio" name="accOpeningDeductDrawer" value="yes" style="margin-top:3px; accent-color:#ef4444; width:auto;">
                    <span>🔴 <strong>ලාච්චුවේ මුදල් බැංකුවට දැමීමක් (ලාච්චුවෙන් අඩු කරන්න)</strong><br><small style="color:#64748b;">ලාච්චුවේ ඇති මුදල් වලින් මෙම මුදල අඩු කර බැංකුවට එකතු වේ.</small></span>
                </label>
            </div>`;

    if (oldWrapRegex.test(html)) {
        html = html.replace(oldWrapRegex, cleanOpeningHtml);
    } else {
        const inputTag = '<input type="number" id="accOpeningBalance" placeholder="Opening Balance (Rs.)" min="0" value="0">';
        if (html.includes(inputTag)) {
            html = html.replace(inputTag, inputTag + '\n\n' + cleanOpeningHtml);
        }
    }

    // Replace saveAccBtn transaction logic
    const oldSaveRegex = /if \(openingBalance > 0\) \{[\s\S]*?ref: 'Opening Balance Setup'[\s\S]*?\}\);[\s\S]*?\}/;
    const cleanSaveLogic = `const deductDrawer = document.querySelector('input[name="accOpeningDeductDrawer"]:checked')?.value === 'yes';

            if (openingBalance > 0) {
                const trId = 'TR-' + Date.now() + '-OP';
                const trRef = db.collection('banks').doc(currentBusinessId).collection('transactions').doc(trId);
                batch.set(trRef, {
                    bankAccountId: accId,
                    type: deductDrawer ? 'CASH_DEPOSIT' : 'OPENING_BALANCE',
                    isOpeningBalance: true,
                    deductedFromDrawer: deductDrawer,
                    amount: openingBalance,
                    ref: deductDrawer ? 'Cash Deposited to Bank (Opening Setup)' : 'Opening Balance Setup',
                    createdAt: new Date()
                });
            }`;

    if (oldSaveRegex.test(html)) {
        html = html.replace(oldSaveRegex, cleanSaveLogic);
    }

    fs.writeFileSync(file, html, 'utf8');
    console.log('✅ Updated ' + file);
});

// 2. Fix Dashboards (loadCoreOwnerProfitDashboard)
const dashboardFiles = [
    'public/modules/tire_centre/dashboard.html',
    'public/modules/retail/dashboard.html',
    'public/modules/scrap_collection_center/dashboard.html'
];

const completeProfitAndExpenseFunction = `        async function loadCoreOwnerProfitDashboard() {
            const sec = document.getElementById('coreOwnerProfitSection');
            const u = firebase.auth().currentUser;
            const bid = (dashboardContext && dashboardContext.businessId) || localStorage.getItem('currentBusinessId') || localStorage.getItem('selectedBusinessId') || (u && u.uid);
            if (!bid) return;

            if (sec) sec.style.display = 'block';

            try {
                const db = firebase.firestore();
                const opt = navigator.onLine ? {} : { source: 'cache' };

                const userEmail = (dashboardContext && (dashboardContext.userEmail || dashboardContext.email || dashboardContext.ownerEmail)) ||
                                  (localStorage.getItem('digibiz_impersonate_active') === 'true' ? localStorage.getItem('digibiz_impersonate_email') : '') ||
                                  localStorage.getItem('userEmail') ||
                                  (u && u.email ? String(u.email).trim().toLowerCase() : null);

                const oOwnerPromise = userEmail ? db.collection('orders').where('ownerEmail', '==', userEmail).limit(1000).get(opt).catch(() => ({ docs: [] })) : Promise.resolve({ docs: [] });
                const oUserPromise = userEmail ? db.collection('orders').where('userEmail', '==', userEmail).limit(1000).get(opt).catch(() => ({ docs: [] })) : Promise.resolve({ docs: [] });
                const pOwnerPromise = userEmail ? db.collection('products').where('ownerEmail', '==', userEmail).limit(1000).get(opt).catch(() => ({ docs: [] })) : Promise.resolve({ docs: [] });
                const eOwnerPromise = userEmail ? db.collection('expenses').where('ownerEmail', '==', userEmail).limit(1000).get(opt).catch(() => ({ docs: [] })) : Promise.resolve({ docs: [] });

                const [pFlat, pNested, pBiz, oFlat, oPending, oNested, oBiz, eFlat, eNested, eBiz, oOwner, oUser, pOwner, eOwner] = await Promise.all([
                    db.collection('products').where('businessId', '==', bid).get(opt).catch(() => ({ docs: [] })),
                    db.collection('products').doc(bid).collection('list').get(opt).catch(() => ({ docs: [] })),
                    db.collection('businesses').doc(bid).collection('products').get(opt).catch(() => ({ docs: [] })),
                    db.collection('orders').where('businessId', '==', bid).limit(1000).get(opt).catch(() => ({ docs: [] })),
                    db.collection('pendingOrders').where('businessId', '==', bid).limit(1000).get(opt).catch(() => ({ docs: [] })),
                    db.collection('orders').doc(bid).collection('list').limit(1000).get(opt).catch(() => ({ docs: [] })),
                    db.collection('businesses').doc(bid).collection('orders').limit(1000).get(opt).catch(() => ({ docs: [] })),
                    db.collection('expenses').where('businessId', '==', bid).limit(1000).get(opt).catch(() => ({ docs: [] })),
                    db.collection('expenses').doc(bid).collection('list').limit(1000).get(opt).catch(() => ({ docs: [] })),
                    db.collection('businesses').doc(bid).collection('expenses').limit(1000).get(opt).catch(() => ({ docs: [] })),
                    oOwnerPromise,
                    oUserPromise,
                    pOwnerPromise,
                    eOwnerPromise
                ]);

                const prodMap = {};
                [...pFlat.docs, ...pNested.docs, ...pBiz.docs, ...pOwner.docs].forEach(d => {
                    const data = d.data() || {};
                    prodMap[d.id] = data;
                    if (data.productCode) prodMap[String(data.productCode).trim()] = data;
                });

                const orderDocsMap = {};
                [...oFlat.docs, ...oPending.docs, ...oNested.docs, ...oBiz.docs, ...oOwner.docs, ...oUser.docs].forEach(d => { orderDocsMap[d.id] = d; });
                const allOrderDocs = Object.values(orderDocsMap);

                const expDocsMap = {};
                [...eFlat.docs, ...eNested.docs, ...eBiz.docs, ...eOwner.docs].forEach(d => { expDocsMap[d.id] = d; });
                const allExpDocs = Object.values(expDocsMap);

                const now = new Date();
                const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const dayOfWeek = now.getDay();
                const diffToMon = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
                const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon);
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const startOfYear = new Date(now.getFullYear(), 0, 1);

                let profitToday = 0, profitWeek = 0, profitMonth = 0, profitYear = 0;

                function parseDateAny(v) {
                    if (!v) return null;
                    if (typeof v.toDate === 'function') return v.toDate();
                    if (v.seconds) return new Date(v.seconds * 1000);
                    if (typeof v === 'number') return new Date(v);
                    if (typeof v === 'string') {
                        const trimmed = v.trim();
                        if (/^\\d{4}-\\d{2}-\\d{2}$/.test(trimmed)) {
                            const [y, m, d] = trimmed.split('-').map(Number);
                            return new Date(y, m - 1, d, 12, 0, 0);
                        }
                        const d = new Date(trimmed);
                        return isNaN(d.getTime()) ? null : d;
                    }
                    if (v instanceof Date) return v;
                    return null;
                }

                function getCost(pRef, item) {
                    if (item) {
                        if (item.cost != null && !isNaN(Number(item.cost)) && Number(item.cost) >= 0) return Number(item.cost);
                        if (item.buyingPrice != null && !isNaN(Number(item.buyingPrice)) && Number(item.buyingPrice) >= 0) return Number(item.buyingPrice);
                        if (item.costPrice != null && !isNaN(Number(item.costPrice)) && Number(item.costPrice) >= 0) return Number(item.costPrice);
                    }
                    if (pRef) {
                        if (pRef.cost != null && !isNaN(Number(pRef.cost)) && Number(pRef.cost) >= 0) return Number(pRef.cost);
                        if (pRef.buyingPrice != null && !isNaN(Number(pRef.buyingPrice)) && Number(pRef.buyingPrice) >= 0) return Number(pRef.buyingPrice);
                        if (pRef.buyPrice != null && !isNaN(Number(pRef.buyPrice)) && Number(pRef.buyPrice) >= 0) return Number(pRef.buyPrice);
                        if (pRef.costPrice != null && !isNaN(Number(pRef.costPrice)) && Number(pRef.costPrice) >= 0) return Number(pRef.costPrice);
                    }
                    const unitP = Number(item && (item.price ?? item.unitPrice) || pRef && (pRef.price ?? pRef.unitPrice) || 0);
                    return unitP > 0 ? unitP * 0.70 : 0;
                }

                allOrderDocs.forEach(doc => {
                    const b = doc.data() || {};
                    const status = String(b.status || '').toLowerCase();
                    if (status === 'rejected' || status === 'cancelled') return;

                    const dt = parseDateAny(b.orderDate || b.createdAt || b.date);
                    if (!dt || isNaN(dt.getTime())) return;
                    if (dt < startOfYear) return;

                    let orderRevenue = 0, orderCogs = 0;
                    const items = Array.isArray(b.items) ? b.items : [];
                    items.forEach(line => {
                        const soldQty = Math.max(0, Number(line.quantity != null ? line.quantity : (line.orderedQty != null ? line.orderedQty : line.qty)) || 0);
                        const freeQty = Math.max(0, Number(line.freeQty) || 0);
                        const returnQty = Math.max(0, Number(line.returnResellQty != null ? line.returnResellQty : line.returnQty) || 0);
                        const billedQty = Math.max(0, soldQty - returnQty);
                        const unitPrice = Number(line.price != null ? line.price : (line.unitPrice != null ? line.unitPrice : 0)) || 0;
                        const isService = line.isService === true || line.category === 'Services' || String(line.category || '').toLowerCase().includes('service');

                        const pRef = prodMap[line.productId] || prodMap[line.productCode] || prodMap[line.id];
                        const buyPrice = isService ? 0 : getCost(pRef, line);

                        orderRevenue += billedQty * unitPrice;
                        orderCogs += (billedQty + freeQty) * buyPrice;
                    });

                    const orderTotal = Number(b.total ?? b.totalAmount ?? b.netTotal ?? b.orderLinesTotal ?? orderRevenue ?? 0);
                    const grossMargin = isNaN(orderTotal - orderCogs) ? 0 : Math.max(0, orderTotal - orderCogs);

                    if (dt >= startOfYear) profitYear += grossMargin;
                    if (dt >= startOfMonth) profitMonth += grossMargin;
                    if (dt >= startOfWeek) profitWeek += grossMargin;
                    if (dt >= startOfToday) profitToday += grossMargin;
                });

                const mfgSalesSnap = await db.collection('manufacturer_sales').where('businessId', '==', bid).get().catch(() => ({ docs: [] }));
                mfgSalesSnap.docs.forEach(doc => {
                    const r = doc.data() || {};
                    if (r.isActive === false) return;
                    const dt = parseDateAny(r.createdAt);
                    if (!dt || isNaN(dt.getTime())) return;
                    if (dt < startOfYear) return;

                    const amt = Number(r.amount || 0);
                    const cogs = Number(r.cogsAmount || (Number(r.qty || 0) * Number(r.fgUnitCost || 0)));
                    const grossProfit = amt - cogs;

                    if (dt >= startOfYear) profitYear += grossProfit;
                    if (dt >= startOfMonth) profitMonth += grossProfit;
                    if (dt >= startOfWeek) profitWeek += grossProfit;
                    if (dt >= startOfToday) profitToday += grossProfit;
                });

                let expToday = 0, expWeek = 0, expMonth = 0, expYear = 0;
                allExpDocs.forEach(doc => {
                    const r = doc.data() || {};
                    if (r.isDeleted === true || r.status === 'cancelled' || r.isActive === false) return;
                    const dt = parseDateAny(r.expenseDate || r.date || r.createdAt);
                    if (!dt || isNaN(dt.getTime())) return;
                    if (dt < startOfYear) return;
                    const amt = Number(r.amount) || 0;
                    if (amt <= 0) return;

                    if (dt >= startOfYear) { profitYear -= amt; expYear += amt; }
                    if (dt >= startOfMonth) { profitMonth -= amt; expMonth += amt; }
                    if (dt >= startOfWeek) { profitWeek -= amt; expWeek += amt; }
                    if (dt >= startOfToday) { profitToday -= amt; expToday += amt; }
                });

                const fmtProfit = (v) => {
                    const val = Math.round(v);
                    const cls = val >= 0 ? '#166534' : '#991b1b';
                    const sign = val >= 0 ? 'Rs. ' : '-Rs. ';
                    return \`<span style="color:\${cls}">\${sign}\${Math.abs(val).toLocaleString()}</span>\`;
                };

                const fmtExpense = (v) => {
                    const val = Math.round(v);
                    return \`<span style="color:#991b1b">Rs. \${val.toLocaleString()}</span>\`;
                };

                if (document.getElementById('coreStatTodayProfit')) document.getElementById('coreStatTodayProfit').innerHTML = fmtProfit(profitToday);
                if (document.getElementById('coreStatWeekProfit')) document.getElementById('coreStatWeekProfit').innerHTML = fmtProfit(profitWeek);
                if (document.getElementById('coreStatMonthProfit')) document.getElementById('coreStatMonthProfit').innerHTML = fmtProfit(profitMonth);
                if (document.getElementById('coreStatYearProfit')) document.getElementById('coreStatYearProfit').innerHTML = fmtProfit(profitYear);

                if (document.getElementById('coreStatTodayExpense')) document.getElementById('coreStatTodayExpense').innerHTML = fmtExpense(expToday);
                if (document.getElementById('coreStatWeekExpense')) document.getElementById('coreStatWeekExpense').innerHTML = fmtExpense(expWeek);
                if (document.getElementById('coreStatMonthExpense')) document.getElementById('coreStatMonthExpense').innerHTML = fmtExpense(expMonth);
                if (document.getElementById('coreStatYearExpense')) document.getElementById('coreStatYearExpense').innerHTML = fmtExpense(expYear);
            } catch (e) {
                console.warn('Core owner profit error:', e);
            }
        }`;

dashboardFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');

    // Replace loadCoreOwnerProfitDashboard function
    const startIdx = html.indexOf('async function loadCoreOwnerProfitDashboard()');
    const endMarker = 'async function clearCoreTestOrders()';
    const endIdx = html.indexOf(endMarker);

    if (startIdx !== -1 && endIdx !== -1) {
        html = html.slice(0, startIdx) + completeProfitAndExpenseFunction.trim() + '\n\n        ' + html.slice(endIdx);
        fs.writeFileSync(file, html, 'utf8');
        console.log('✅ Injected complete loadCoreOwnerProfitDashboard in ' + file);
    } else {
        console.log('⚠️ Could not locate boundaries in ' + file);
    }
});
