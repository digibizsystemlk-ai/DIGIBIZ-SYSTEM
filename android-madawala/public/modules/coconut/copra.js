/**
 * DigiBiz Coconut Module — Dedicated Copra Management & P&L Hub
 */

let appCtx = null;
let currentCoconutStock = {};
let readyCopraProduct = null;
let allCustomers = [];
let allCopraSales = [];
let allCopraTransfers = [];
let allCopraRuns = [];

document.addEventListener('DOMContentLoaded', async () => {
    const auth = window.CoconutModule.getAuth();
    if (!auth) return;

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = '/modules/coconut/login.html';
            return;
        }

        try {
            appCtx = await window.CoconutModule.resolveContext(user);
            setupTabs();
            setupEventHandlers();
            await loadCopraHubData();
        } catch (err) {
            console.error('Failed to init Copra Hub:', err);
            window.CoconutModule.showToast('Initialization error: ' + err.message, 'error');
        }
    });
});

function setupTabs() {
    const tabBtns = document.querySelectorAll('.copra-tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active', 'c-btn-primary');
                b.classList.add('c-btn-secondary');
            });
            btn.classList.add('active', 'c-btn-primary');
            btn.classList.remove('c-btn-secondary');

            const targetId = btn.dataset.tab;
            document.querySelectorAll('.copra-tab-content').forEach(c => c.style.display = 'none');
            const targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.style.display = 'block';
        });
    });

    const searchInput = document.getElementById('searchCopraLogs');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.toLowerCase().trim();
            filterCurrentTabTables(q);
        });
    }
}

function setupEventHandlers() {
    // 1. Transfer Modal
    const trModal = document.getElementById('transferModal');
    document.getElementById('btnOpenTransferModal').onclick = () => {
        document.getElementById('trDate').value = window.CoconutModule.toLocalDateStr(new Date());
        updateTrPreview();
        trModal.classList.add('open');
    };
    document.getElementById('btnCloseTransferModal').onclick = () => trModal.classList.remove('open');
    document.getElementById('btnCancelTransfer').onclick = () => trModal.classList.remove('open');
    document.getElementById('trSourceCat').addEventListener('change', updateTrPreview);
    document.getElementById('trQty').addEventListener('input', updateTrPreview);
    document.getElementById('transferForm').addEventListener('submit', handleSaveTransfer);

    // 2. Convert / Process Modal
    const cvModal = document.getElementById('convertModal');
    document.getElementById('btnOpenConvertModal').onclick = () => {
        document.getElementById('cvDate').value = window.CoconutModule.toLocalDateStr(new Date());
        updateCvPreview();
        cvModal.classList.add('open');
    };
    document.getElementById('btnCloseConvertModal').onclick = () => cvModal.classList.remove('open');
    document.getElementById('btnCancelConvert').onclick = () => cvModal.classList.remove('open');
    document.getElementById('cvNutsQty').addEventListener('input', updateCvPreview);
    document.getElementById('cvProcCost').addEventListener('input', updateCvPreview);
    document.getElementById('cvCopraKg').addEventListener('input', updateCvPreview);
    document.getElementById('convertForm').addEventListener('submit', handleSaveConvert);

    // 3. Sale Modal
    const slModal = document.getElementById('saleModal');
    document.getElementById('btnOpenSaleModal').onclick = () => {
        document.getElementById('slDate').value = window.CoconutModule.toLocalDateStr(new Date());
        updateSlPreview();
        slModal.classList.add('open');
    };
    document.getElementById('btnCloseSaleModal').onclick = () => slModal.classList.remove('open');
    document.getElementById('btnCancelSale').onclick = () => slModal.classList.remove('open');
    document.getElementById('slQtyKg').addEventListener('input', updateSlPreview);
    document.getElementById('slPricePerKg').addEventListener('input', updateSlPreview);
    document.getElementById('saleForm').addEventListener('submit', handleSaveSale);
}

function updateTrPreview() {
    const srcCat = document.getElementById('trSourceCat').value;
    const qty = Number(document.getElementById('trQty').value) || 0;
    const catData = currentCoconutStock[srcCat] || { qty: 0, avgCost: 0 };

    document.getElementById('trAvailDisplay').textContent = `${window.CoconutModule.fmt(catData.qty, 0)} nuts`;
    document.getElementById('trCostDisplay').textContent = `Rs. ${window.CoconutModule.fmt(catData.avgCost, 2)}`;

    const totalAssetVal = qty * (catData.avgCost || 0);
    document.getElementById('trAssetValDisplay').textContent = window.CoconutModule.fmtLKR(totalAssetVal);
}

function updateCvPreview() {
    const copraNutData = currentCoconutStock['COPRA_NUTS'] || { qty: 0, avgCost: 0 };
    document.getElementById('cvAvailNutsDisplay').textContent = `${window.CoconutModule.fmt(copraNutData.qty, 0)} nuts (Cost: Rs. ${window.CoconutModule.fmt(copraNutData.avgCost, 2)}/nut)`;

    const nutsQty = Number(document.getElementById('cvNutsQty').value) || 0;
    const procCost = Number(document.getElementById('cvProcCost').value) || 0;
    const copraKg = Number(document.getElementById('cvCopraKg').value) || 0;

    const nutCostTotal = nutsQty * (copraNutData.avgCost || 0);
    const totalBatchCost = nutCostTotal + procCost;
    const unitCostPerKg = copraKg > 0 ? (totalBatchCost / copraKg) : 0;

    document.getElementById('cvNutCostDisplay').textContent = window.CoconutModule.fmtLKR(nutCostTotal);
    document.getElementById('cvProcCostDisplay').textContent = window.CoconutModule.fmtLKR(procCost);
    document.getElementById('cvTotalCostDisplay').textContent = window.CoconutModule.fmtLKR(totalBatchCost);
    document.getElementById('cvUnitCostDisplay').textContent = `Rs. ${window.CoconutModule.fmt(unitCostPerKg, 2)} / Kg`;
}

function updateSlPreview() {
    const readyQty = readyCopraProduct ? (Number(readyCopraProduct.stockQty) || 0) : 0;
    const unitCost = readyCopraProduct ? (Number(readyCopraProduct.unitCost) || 0) : 0;
    const defaultPrice = readyCopraProduct ? (Number(readyCopraProduct.unitPrice) || 550) : 550;

    document.getElementById('slAvailKgDisplay').textContent = `${window.CoconutModule.fmt(readyQty, 2)} Kg`;
    document.getElementById('slCostRateDisplay').textContent = window.CoconutModule.fmt(unitCost, 2);

    const priceInput = document.getElementById('slPricePerKg');
    if (!priceInput.value || priceInput.dataset.autoFilled === 'true') {
        priceInput.value = defaultPrice;
        priceInput.dataset.autoFilled = 'true';
    }

    const qtyKg = Number(document.getElementById('slQtyKg').value) || 0;
    const pricePerKg = Number(priceInput.value) || 0;

    const revenue = qtyKg * pricePerKg;
    const cogs = qtyKg * unitCost;
    const profit = revenue - cogs;
    const marginPct = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0.0';

    document.getElementById('slRevenueDisplay').textContent = window.CoconutModule.fmtLKR(revenue);
    document.getElementById('slCogsDisplay').textContent = window.CoconutModule.fmtLKR(cogs);
    
    const profitEl = document.getElementById('slProfitDisplay');
    profitEl.textContent = `${window.CoconutModule.fmtLKR(profit)} (${marginPct}%)`;
    profitEl.style.color = profit >= 0 ? '#166534' : '#dc2626';
}

async function loadCopraHubData() {
    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        // 1. Fetch Coconut Stock
        const cSnap = await db.collection('coconut_raw_coconuts').doc(bid).collection('items').get();
        currentCoconutStock = {};
        cSnap.docs.forEach(d => {
            const data = d.data() || {};
            const cat = data.category || d.id;
            currentCoconutStock[cat] = {
                qty: Number(data.stockQty) || 0,
                avgCost: Number(data.avgCostPerUnit || data.lastUnitCost) || 0,
                lastCost: Number(data.lastUnitCost) || 0,
                totalVal: Number(data.totalValuation) || 0
            };
        });

        // 2. Fetch Finished Copra Product
        const fpRef = db.collection('coconut_finished_products').doc(bid).collection('items').doc('FP_COPRA_G1');
        const fpDoc = await fpRef.get();
        if (fpDoc.exists) {
            readyCopraProduct = { id: fpDoc.id, ...fpDoc.data() };
        } else {
            // Auto seed default Copra product
            const defaultCopra = {
                businessId: bid,
                name: 'Copra Grade 1 (කොප්පරා)',
                sku: 'COPRA-G1',
                unitName: 'Kg',
                stockQty: 0,
                unitCost: 400.00,
                unitPrice: 550.00,
                reorderLevel: 50,
                isActive: true,
                createdAt: window.CoconutModule.tsToFirestore(new Date())
            };
            await fpRef.set(defaultCopra);
            readyCopraProduct = { id: 'FP_COPRA_G1', ...defaultCopra };
        }

        // 3. Fetch Customers
        const custSnap = await db.collection('coconut_customers').where('businessId', '==', bid).get();
        allCustomers = custSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        populateCustomerSelect();

        // 4. Fetch Copra Sales
        const salesSnap = await db.collection('coconut_sales')
            .where('businessId', '==', bid)
            .get();

        allCopraSales = [];
        salesSnap.docs.forEach(d => {
            const s = { id: d.id, ...d.data() };
            if (s.isActive === false) return;
            const items = s.items || [];
            const copraItem = items.find(i => (i.itemType === 'PRODUCT' && (i.refId === 'FP_COPRA_G1' || (i.name && i.name.toLowerCase().includes('copra')))) || i.refId === 'COPRA_NUTS');
            if (copraItem || s.isCopraSale) {
                const soldKg = copraItem ? Number(copraItem.qty) : (Number(s.copraQtyKg) || 0);
                const rate = copraItem ? Number(copraItem.unitPrice) : (Number(s.pricePerKg) || 0);
                const lineRev = copraItem ? Number(copraItem.lineTotal) : Number(s.amount);
                const lineCogs = copraItem ? Number(copraItem.cogsAmount) : Number(s.cogsAmount || 0);
                const lineProfit = lineRev - lineCogs;
                allCopraSales.push({
                    id: s.id,
                    invoiceNo: s.invoiceNo || s.id,
                    customerName: s.customerName || 'Direct Cash Buyer',
                    soldKg,
                    rate,
                    revenue: lineRev,
                    cogs: lineCogs,
                    profit: lineProfit,
                    marginPct: lineRev > 0 ? ((lineProfit / lineRev) * 100).toFixed(1) : '0.0',
                    paymentMode: s.paymentMode || 'CASH',
                    paymentStatus: s.paymentStatus || 'PAID',
                    date: window.CoconutModule.parseDateAny(s.date || s.createdAt)
                });
            }
        });
        allCopraSales.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));

        // 5. Fetch Transfers History (coconut_stock_adjustments where itemType === 'DIVERT_TO_COPRA')
        const trSnap = await db.collection('coconut_stock_adjustments')
            .where('businessId', '==', bid)
            .get();
        allCopraTransfers = [];
        trSnap.docs.forEach(d => {
            const data = { id: d.id, ...d.data() };
            if (data.reason === 'DIVERT_TO_COPRA' || data.itemType === 'DIVERT_TO_COPRA') {
                allCopraTransfers.push({
                    id: data.id,
                    date: window.CoconutModule.parseDateAny(data.date || data.createdAt),
                    sourceCat: data.itemName?.replace('Divert ', '')?.replace(' → COPRA_NUTS', '') || 'WHOLE_STOCK',
                    qty: Number(data.qtyDeducted) || 0,
                    costValue: Number(data.costValue) || 0,
                    unitCost: data.qtyDeducted > 0 ? (Number(data.costValue) / Number(data.qtyDeducted)) : 0,
                    notes: data.notes || ''
                });
            }
        });
        allCopraTransfers.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));

        // 6. Fetch Production / Drying runs
        const runSnap = await db.collection('coconut_production_runs')
            .where('businessId', '==', bid)
            .get();
        allCopraRuns = [];
        runSnap.docs.forEach(d => {
            const r = { id: d.id, ...d.data() };
            if (r.isActive === false) return;
            const rName = (r.transformationName || '').toLowerCase();
            if (rName.includes('copra') || r.producedProductId === 'FP_COPRA_G1') {
                allCopraRuns.push({
                    id: r.id,
                    name: r.transformationName || 'Copra Drying Batch',
                    date: window.CoconutModule.parseDateAny(r.runDate || r.createdAt),
                    nutsConsumed: Number(r.rawInputQty) || 0,
                    nutCost: Number(r.rawCost) || 0,
                    laborCost: Number(r.laborCost) || 0,
                    totalCost: Number(r.totalRunCost) || 0,
                    producedKg: Number(r.producedQty) || 0,
                    unitCostKg: Number(r.unitCostProduced) || 0
                });
            }
        });
        allCopraRuns.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));

        // 7. Update KPIs & Tables
        renderKpis();
        renderSalesTable(allCopraSales);
        renderTransfersTable(allCopraTransfers);
        renderProcessingTable(allCopraRuns);

    } catch (err) {
        console.error(err);
        window.CoconutModule.showToast('Failed to load Copra data: ' + err.message, 'error');
    }
}

function populateCustomerSelect() {
    const sel = document.getElementById('slCustomer');
    if (!sel) return;
    sel.innerHTML = '<option value="">Direct Walk-in Buyer (අත්පිට ගැනුම්කරු)</option>' +
        allCustomers.map(c => `<option value="${c.id}">${window.CoconutModule.esc(c.name)} (${c.phone || 'No phone'})</option>`).join('');
}

function renderKpis() {
    // 1. Raw Copra Nuts in stock
    const copraData = currentCoconutStock['COPRA_NUTS'] || { qty: 0, avgCost: 0, totalVal: 0 };
    const copraNutVal = copraData.qty * (copraData.avgCost || 0);
    document.getElementById('kpiCopraNutsCount').textContent = `${window.CoconutModule.fmt(copraData.qty, 0)} nuts`;
    document.getElementById('kpiCopraNutsVal').textContent = window.CoconutModule.fmtLKR(copraNutVal);

    // 2. Ready Copra in stock
    const readyQty = readyCopraProduct ? (Number(readyCopraProduct.stockQty) || 0) : 0;
    const readyUnitCost = readyCopraProduct ? (Number(readyCopraProduct.unitCost) || 0) : 0;
    const readyVal = readyQty * readyUnitCost;
    document.getElementById('kpiCopraKgCount').textContent = `${window.CoconutModule.fmt(readyQty, 2)} Kg`;
    document.getElementById('kpiCopraKgVal').textContent = window.CoconutModule.fmtLKR(readyVal);

    // 3. Sales Totals
    const totalRev = allCopraSales.reduce((s, x) => s + x.revenue, 0);
    const totalCogs = allCopraSales.reduce((s, x) => s + x.cogs, 0);
    const totalProfit = totalRev - totalCogs;
    const marginPct = totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : '0.0';

    document.getElementById('kpiCopraRevenue').textContent = window.CoconutModule.fmtLKR(totalRev);
    document.getElementById('kpiCopraCogs').textContent = window.CoconutModule.fmtLKR(totalCogs);
    document.getElementById('kpiCopraProfit').textContent = window.CoconutModule.fmtLKR(totalProfit);
    document.getElementById('kpiCopraMarginPct').textContent = `${marginPct}%`;
}

function renderSalesTable(salesList) {
    const tbody = document.getElementById('copraSalesTableBody');
    if (!salesList.length) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center" style="padding:24px; color:var(--c-text-muted);">No Copra sales recorded yet. Click "+ Sell Copra" to record your first sale.</td></tr>';
        return;
    }

    tbody.innerHTML = salesList.map(s => {
        const isProfitPositive = s.profit >= 0;
        const profitColor = isProfitPositive ? '#166534' : '#dc2626';
        const profitBadge = isProfitPositive ? 'background:#f0fdf4; color:#166534;' : 'background:#fef2f2; color:#dc2626;';

        return `
            <tr>
                <td>${window.CoconutModule.formatDate(s.date)}</td>
                <td><strong>${window.CoconutModule.esc(s.invoiceNo)}</strong></td>
                <td>${window.CoconutModule.esc(s.customerName)}</td>
                <td class="text-right" style="font-weight:700;">${window.CoconutModule.fmt(s.soldKg, 2)} Kg</td>
                <td class="text-right">Rs. ${window.CoconutModule.fmt(s.rate, 2)}</td>
                <td class="text-right" style="font-weight:800; color:#0284c7;">${window.CoconutModule.fmtLKR(s.revenue)}</td>
                <td class="text-right" style="color:var(--c-text-muted);">${window.CoconutModule.fmtLKR(s.cogs)}</td>
                <td class="text-right" style="font-weight:800; color:${profitColor};">${window.CoconutModule.fmtLKR(s.profit)}</td>
                <td class="text-center">
                    <span style="display:inline-block; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:700; ${profitBadge}">
                        ${s.marginPct}%
                    </span>
                </td>
                <td class="text-center">
                    <span class="c-badge c-badge-${s.paymentMode === 'CREDIT' ? 'unpaid' : 'paid'}">
                        ${s.paymentMode}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

function renderTransfersTable(trList) {
    const tbody = document.getElementById('copraTransfersTableBody');
    if (!trList.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding:24px; color:var(--c-text-muted);">No stock transfers to Copra recorded yet.</td></tr>';
        return;
    }

    tbody.innerHTML = trList.map(t => `
        <tr>
            <td>${window.CoconutModule.formatDate(t.date)}</td>
            <td><strong style="color:var(--c-primary);">${window.CoconutModule.esc(t.sourceCat)}</strong></td>
            <td class="text-right" style="font-weight:700; color:#92400e;">${window.CoconutModule.fmt(t.qty, 0)} nuts</td>
            <td class="text-right">Rs. ${window.CoconutModule.fmt(t.unitCost, 2)}</td>
            <td class="text-right" style="font-weight:800; color:#0369a1;">${window.CoconutModule.fmtLKR(t.costValue)}</td>
            <td>${window.CoconutModule.esc(t.notes || '-')}</td>
        </tr>
    `).join('');
}

function renderProcessingTable(runsList) {
    const tbody = document.getElementById('copraProcessingTableBody');
    if (!runsList.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:24px; color:var(--c-text-muted);">No drying batches recorded yet. Click "+ Process / Dry Copra" to convert nuts.</td></tr>';
        return;
    }

    tbody.innerHTML = runsList.map(r => `
        <tr>
            <td>${window.CoconutModule.formatDate(r.date)}</td>
            <td><strong>${window.CoconutModule.esc(r.name)}</strong></td>
            <td class="text-right" style="font-weight:700; color:#92400e;">${window.CoconutModule.fmt(r.nutsConsumed, 0)} nuts</td>
            <td class="text-right">${window.CoconutModule.fmtLKR(r.nutCost)}</td>
            <td class="text-right">${window.CoconutModule.fmtLKR(r.laborCost)}</td>
            <td class="text-right" style="font-weight:800;">${window.CoconutModule.fmtLKR(r.totalCost)}</td>
            <td class="text-right" style="font-weight:700; color:#16a34a;">${window.CoconutModule.fmt(r.producedKg, 2)} Kg</td>
            <td class="text-right" style="font-weight:800; color:var(--c-primary);">Rs. ${window.CoconutModule.fmt(r.unitCostKg, 2)} / Kg</td>
        </tr>
    `).join('');
}

function filterCurrentTabTables(q) {
    if (!q) {
        renderSalesTable(allCopraSales);
        renderTransfersTable(allCopraTransfers);
        renderProcessingTable(allCopraRuns);
        return;
    }

    const filteredSales = allCopraSales.filter(s =>
        s.invoiceNo.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.paymentMode.toLowerCase().includes(q)
    );
    renderSalesTable(filteredSales);

    const filteredTr = allCopraTransfers.filter(t =>
        t.sourceCat.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q)
    );
    renderTransfersTable(filteredTr);

    const filteredRuns = allCopraRuns.filter(r =>
        r.name.toLowerCase().includes(q)
    );
    renderProcessingTable(filteredRuns);
}

// ==========================================
// 1. Handle Save Nut Transfer
// ==========================================
async function handleSaveTransfer(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveTransfer');
    btn.disabled = true;
    btn.textContent = 'Transferring...';

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const srcCat = document.getElementById('trSourceCat').value;
        const qty = Number(document.getElementById('trQty').value) || 0;
        const dateVal = document.getElementById('trDate').value;
        const notes = document.getElementById('trNotes').value || '';
        const dDateObj = window.CoconutModule.parseDateAny(dateVal) || new Date();

        if (qty <= 0) {
            alert('Please specify a valid nut quantity');
            return;
        }

        const srcData = currentCoconutStock[srcCat] || { qty: 0, avgCost: 0 };
        if (qty > srcData.qty) {
            if (!confirm(`⚠️ Nut count (${qty}) exceeds available stock in ${srcCat} (${srcData.qty}). Continue anyway?`)) return;
        }

        const unitCost = srcData.avgCost || 0;
        const totalTransferVal = qty * unitCost;

        const batch = db.batch();

        // 1. Deduct from Source Category
        const newSrcQty = Math.max(0, srcData.qty - qty);
        const srcRef = db.collection('coconut_raw_coconuts').doc(bid).collection('items').doc(srcCat);
        batch.set(srcRef, {
            stockQty: newSrcQty,
            updatedAt: window.CoconutModule.tsToFirestore(new Date())
        }, { merge: true });

        // 2. Add to COPRA_NUTS
        const copraRef = db.collection('coconut_raw_coconuts').doc(bid).collection('items').doc('COPRA_NUTS');
        const copraDoc = await copraRef.get();
        let curCopraQty = 0;
        let curCopraAvgCost = 0;
        if (copraDoc.exists) {
            const cd = copraDoc.data() || {};
            curCopraQty = Number(cd.stockQty) || 0;
            curCopraAvgCost = Number(cd.avgCostPerUnit || cd.lastUnitCost) || 0;
        }

        const newCopraQty = curCopraQty + qty;
        const newCopraVal = (curCopraQty * curCopraAvgCost) + totalTransferVal;
        const newCopraAvgCost = newCopraQty > 0 ? (newCopraVal / newCopraQty) : unitCost;

        batch.set(copraRef, {
            businessId: bid,
            category: 'COPRA_NUTS',
            categoryName: 'Copra Nuts (කොප්පරා සඳහා ගෙඩි)',
            stockQty: newCopraQty,
            avgCostPerUnit: Number(newCopraAvgCost.toFixed(4)),
            lastUnitCost: unitCost,
            totalValuation: newCopraVal,
            updatedAt: window.CoconutModule.tsToFirestore(new Date())
        }, { merge: true });

        // 3. Record Audit Log
        const logId = `DIV_${window.CoconutModule.uid('copra')}`;
        const logRef = db.collection('coconut_stock_adjustments').doc(logId);
        batch.set(logRef, {
            businessId: bid,
            logId,
            itemType: 'DIVERT_TO_COPRA',
            itemName: `Divert ${srcCat} → COPRA_NUTS`,
            unit: 'nuts',
            qtyDeducted: qty,
            costValue: totalTransferVal,
            reason: 'DIVERT_TO_COPRA',
            notes: notes || `Direct transfer from ${srcCat} to Copra nuts stock`,
            date: window.CoconutModule.tsToFirestore(dDateObj),
            createdAt: window.CoconutModule.tsToFirestore(new Date())
        });

        // 4. Double Entry Balanced Journal
        if (totalTransferVal > 0) {
            await window.CoconutModule.postJournalEntry({
                businessId: bid,
                description: `Stock Divert: ${qty} nuts transferred from ${srcCat} to Copra Raw Stock`,
                referenceType: 'COPRA_STOCK_TRANSFER',
                ref: logId,
                date: dDateObj,
                lines: [
                    { accountCode: '1-1040-01', accountName: 'Inventory (Copra Raw Nuts)', debit: totalTransferVal, credit: 0 },
                    { accountCode: '1-1040-01', accountName: `Inventory (Raw Coconut - ${srcCat})`, debit: 0, credit: totalTransferVal }
                ],
                batch
            });
        }

        await batch.commit();

        window.CoconutModule.showToast(`✅ ${qty} nuts transferred to Copra stock successfully!`, 'success');
        document.getElementById('transferForm').reset();
        document.getElementById('transferModal').classList.remove('open');

        await loadCopraHubData();

    } catch (err) {
        console.error(err);
        window.CoconutModule.showToast('Transfer failed: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '🔄 Execute Nut Transfer';
    }
}

// ==========================================
// 2. Handle Save Copra Conversion / Drying
// ==========================================
async function handleSaveConvert(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveConvert');
    btn.disabled = true;
    btn.textContent = 'Processing Batch...';

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const nutsQty = Number(document.getElementById('cvNutsQty').value) || 0;
        const procCost = Number(document.getElementById('cvProcCost').value) || 0;
        const copraKg = Number(document.getElementById('cvCopraKg').value) || 0;
        const dateVal = document.getElementById('cvDate').value;
        const notes = document.getElementById('cvNotes').value || '';
        const dDateObj = window.CoconutModule.parseDateAny(dateVal) || new Date();

        if (nutsQty <= 0 || copraKg <= 0) {
            alert('Please specify valid consumed nut count and produced Copra weight');
            return;
        }

        const copraNutData = currentCoconutStock['COPRA_NUTS'] || { qty: 0, avgCost: 0 };
        if (nutsQty > copraNutData.qty) {
            if (!confirm(`⚠️ Copra nuts consumed (${nutsQty}) exceeds available stock (${copraNutData.qty}). Continue anyway?`)) return;
        }

        const nutUnitCost = copraNutData.avgCost || 0;
        const nutCostTotal = nutsQty * nutUnitCost;
        const totalBatchCost = nutCostTotal + procCost;
        const unitCostPerKg = totalBatchCost / copraKg;

        const runId = `RUN_${window.CoconutModule.uid('copra')}`;
        const batch = db.batch();

        // 1. Deduct COPRA_NUTS
        const newCopraNutsQty = Math.max(0, copraNutData.qty - nutsQty);
        const copraNutRef = db.collection('coconut_raw_coconuts').doc(bid).collection('items').doc('COPRA_NUTS');
        batch.set(copraNutRef, {
            stockQty: newCopraNutsQty,
            updatedAt: window.CoconutModule.tsToFirestore(new Date())
        }, { merge: true });

        // 2. Add to Finished Copra Product (FP_COPRA_G1)
        const fpRef = db.collection('coconut_finished_products').doc(bid).collection('items').doc('FP_COPRA_G1');
        const fpDoc = await fpRef.get();
        let curFgQty = 0;
        let curFgAvgCost = 0;
        if (fpDoc.exists) {
            const fd = fpDoc.data() || {};
            curFgQty = Number(fd.stockQty) || 0;
            curFgAvgCost = Number(fd.unitCost) || 0;
        }

        const newFgQty = curFgQty + copraKg;
        const newFgTotalVal = (curFgQty * curFgAvgCost) + totalBatchCost;
        const newFgAvgCost = newFgQty > 0 ? (newFgTotalVal / newFgQty) : unitCostPerKg;

        batch.set(fpRef, {
            businessId: bid,
            name: 'Copra Grade 1 (කොප්පරා)',
            sku: 'COPRA-G1',
            unitName: 'Kg',
            stockQty: Number(newFgQty.toFixed(2)),
            unitCost: Number(newFgAvgCost.toFixed(2)),
            unitPrice: readyCopraProduct?.unitPrice || 550,
            updatedAt: window.CoconutModule.tsToFirestore(new Date())
        }, { merge: true });

        // 3. Insert Production Run Doc
        const runRef = db.collection('coconut_production_runs').doc(runId);
        batch.set(runRef, {
            businessId: bid,
            runId,
            transformationName: 'Copra Drying & Processing (කොප්පරා වේලීම)',
            producedProductId: 'FP_COPRA_G1',
            rawInputQty: nutsQty,
            rawInputCategory: 'COPRA_NUTS',
            rawCost: Number(nutCostTotal.toFixed(2)),
            laborCost: Number(procCost.toFixed(2)),
            totalRunCost: Number(totalBatchCost.toFixed(2)),
            producedQty: Number(copraKg.toFixed(2)),
            unitCostProduced: Number(unitCostPerKg.toFixed(2)),
            notes,
            runDate: window.CoconutModule.tsToFirestore(dDateObj),
            createdAt: window.CoconutModule.tsToFirestore(new Date()),
            isActive: true
        });

        // 4. Double Entry Balanced Journal
        const journalLines = [
            { accountCode: '1-1040-01', accountName: 'Inventory (Finished Copra)', debit: totalBatchCost, credit: 0 },
            { accountCode: '1-1040-01', accountName: 'Inventory (Copra Raw Nuts)', debit: 0, credit: nutCostTotal }
        ];
        if (procCost > 0) {
            journalLines.push({ accountCode: '1-1010-01', accountName: 'Cash / Direct Processing Labor Expense', debit: 0, credit: procCost });
        }

        await window.CoconutModule.postJournalEntry({
            businessId: bid,
            description: `Copra Drying Batch: ${nutsQty} nuts converted to ${copraKg} Kg Dried Copra`,
            referenceType: 'COPRA_PRODUCTION_RUN',
            ref: `coconut_production_runs/${runId}`,
            date: dDateObj,
            lines: journalLines,
            batch
        });

        await batch.commit();

        window.CoconutModule.showToast(`✅ Copra drying batch saved! Added ${copraKg} Kg to Ready Copra stock.`, 'success');
        document.getElementById('convertForm').reset();
        document.getElementById('convertModal').classList.remove('open');

        await loadCopraHubData();

    } catch (err) {
        console.error(err);
        window.CoconutModule.showToast('Batch execution failed: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '🏭 Save Batch & Add to Ready Copra';
    }
}

// ==========================================
// 3. Handle Save Copra Sale & Profit Posting
// ==========================================
async function handleSaveSale(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveSale');
    btn.disabled = true;
    btn.textContent = 'Processing Sale & Calculating Profit...';

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const customerId = document.getElementById('slCustomer').value;
        const customerObj = allCustomers.find(c => c.id === customerId) || {};
        const customerName = customerObj.name || 'Direct Walk-in Buyer';
        const dateVal = document.getElementById('slDate').value;
        const qtyKg = Number(document.getElementById('slQtyKg').value) || 0;
        const pricePerKg = Number(document.getElementById('slPricePerKg').value) || 0;
        const paymentMode = document.getElementById('slPaymentMode').value;
        const notes = document.getElementById('slNotes').value || '';
        const dDateObj = window.CoconutModule.parseDateAny(dateVal) || new Date();

        if (qtyKg <= 0 || pricePerKg <= 0) {
            alert('Please specify valid sale weight and selling price');
            return;
        }

        const readyStockQty = readyCopraProduct ? (Number(readyCopraProduct.stockQty) || 0) : 0;
        if (qtyKg > readyStockQty) {
            if (!confirm(`⚠️ Sale quantity (${qtyKg} Kg) exceeds ready stock (${readyStockQty} Kg). Continue anyway?`)) return;
        }

        const unitCost = readyCopraProduct ? (Number(readyCopraProduct.unitCost) || 0) : 0;
        const revenue = Number((qtyKg * pricePerKg).toFixed(2));
        const cogs = Number((qtyKg * unitCost).toFixed(2));
        const profit = Number((revenue - cogs).toFixed(2));

        const saleId = `SALE_${window.CoconutModule.uid('copra')}`;
        const invoiceNo = `CPR-${Date.now().toString().slice(-6)}`;

        const batch = db.batch();

        // 1. Deduct Ready Copra Stock
        const newFgQty = Math.max(0, readyStockQty - qtyKg);
        const fpRef = db.collection('coconut_finished_products').doc(bid).collection('items').doc('FP_COPRA_G1');
        batch.set(fpRef, {
            stockQty: Number(newFgQty.toFixed(2)),
            updatedAt: window.CoconutModule.tsToFirestore(new Date())
        }, { merge: true });

        // 2. Insert Sale Document
        const saleRef = db.collection('coconut_sales').doc(saleId);
        const cartItem = {
            itemType: 'PRODUCT',
            refId: 'FP_COPRA_G1',
            name: 'Copra Grade 1 (කොප්පරා)',
            unitName: 'Kg',
            qty: qtyKg,
            unitPrice: pricePerKg,
            lineTotal: revenue,
            cogsUnit: unitCost,
            cogsAmount: cogs
        };

        batch.set(saleRef, {
            businessId: bid,
            saleId,
            invoiceNo,
            isCopraSale: true,
            customerId,
            customerName,
            items: [cartItem],
            copraQtyKg: qtyKg,
            pricePerKg,
            amount: revenue,
            cogsAmount: cogs,
            profit: profit,
            paymentMode,
            paymentStatus: paymentMode === 'CREDIT' ? 'UNPAID' : 'PAID',
            notes,
            date: window.CoconutModule.tsToFirestore(dDateObj),
            createdAt: window.CoconutModule.tsToFirestore(new Date()),
            isActive: true
        });

        // 3. Update Customer Balance if Credit
        if (paymentMode === 'CREDIT' && customerId) {
            const custRef = db.collection('coconut_customers').doc(customerId);
            const custLedgerRef = custRef.collection('ledger').doc(`LED_${saleId}`);
            const curBal = Number(customerObj.balance) || 0;

            batch.set(custRef, {
                balance: curBal + revenue,
                updatedAt: window.CoconutModule.tsToFirestore(new Date())
            }, { merge: true });

            batch.set(custLedgerRef, {
                businessId: bid,
                type: 'SALE',
                referenceId: saleId,
                invoiceNo,
                amount: revenue,
                balanceAfter: curBal + revenue,
                description: `Copra Invoice #${invoiceNo} (${qtyKg} Kg @ Rs. ${pricePerKg})`,
                date: window.CoconutModule.tsToFirestore(dDateObj),
                createdAt: window.CoconutModule.tsToFirestore(new Date())
            });
        }

        // 4. Post Balanced Revenue Journal
        const revLines = [];
        if (paymentMode === 'CASH') {
            revLines.push({ accountCode: '1-1010-01', accountName: 'Cash in Drawer', debit: revenue, credit: 0 });
        } else if (paymentMode === 'BANK') {
            revLines.push({ accountCode: '1-1020-01', accountName: 'Bank Account', debit: revenue, credit: 0 });
        } else {
            revLines.push({ accountCode: '1-1030-01', accountName: 'Accounts Receivable (Customers)', debit: revenue, credit: 0 });
        }
        revLines.push({ accountCode: '4-4010-01', accountName: 'Sales Revenue (Copra)', debit: 0, credit: revenue });

        await window.CoconutModule.postJournalEntry({
            businessId: bid,
            description: `Copra Sales Invoice #${invoiceNo} — ${customerName}`,
            referenceType: 'COCONUT_SALE',
            ref: `coconut_sales/${saleId}`,
            date: dDateObj,
            lines: revLines,
            batch
        });

        // 5. Post COGS Journal
        if (cogs > 0) {
            await window.CoconutModule.postJournalEntry({
                businessId: bid,
                description: `COGS Recognized for Copra Invoice #${invoiceNo}`,
                referenceType: 'COCONUT_SALE_COGS',
                ref: `coconut_sales/${saleId}`,
                date: dDateObj,
                lines: [
                    { accountCode: '5-5020-01', accountName: 'Cost of Goods Sold (COGS - Copra)', debit: cogs, credit: 0 },
                    { accountCode: '1-1040-01', accountName: 'Inventory (Finished Copra Stock)', debit: 0, credit: cogs }
                ],
                batch
            });
        }

        await batch.commit();

        window.CoconutModule.showToast(`✅ Copra sale recorded! Invoiced Rs. ${window.CoconutModule.fmt(revenue, 2)} with Rs. ${window.CoconutModule.fmt(profit, 2)} Net Profit.`, 'success');
        document.getElementById('saleForm').reset();
        document.getElementById('saleModal').classList.remove('open');

        await loadCopraHubData();

    } catch (err) {
        console.error(err);
        window.CoconutModule.showToast('Sale recording failed: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '🛒 Complete Copra Sale & Post Profit';
    }
}
