/**
 * Coconut Wholesale Module — Raw Husk Purchase Management (Strictly Count-Based: Husks)
 */

let appCtx = null;
let allPurchases = [];
let allSuppliers = [];

document.addEventListener('DOMContentLoaded', async () => {
    appCtx = await window.CoconutModule.guardCoconutPage();
    if (!appCtx) return;

    window.CoconutModule.renderNav('husk-purchase');

    // Default Date
    document.getElementById('hDate').value = window.CoconutModule.toLocalDateStr(new Date());

    setupEventHandlers();
    await loadSuppliers();
    await loadLiveHuskStock();
    await loadHuskPurchases();
});

function setupEventHandlers() {
    const countInput = document.getElementById('hCount');
    const unitCostInput = document.getElementById('hUnitCost');
    const transportInput = document.getElementById('hTransport');

    function updatePreview() {
        const count = Number(countInput.value) || 0;
        const ratePerHusk = Number(unitCostInput.value) || 0;
        const trans = Number(transportInput.value) || 0;

        const baseCost = count * ratePerHusk;
        const totalCost = baseCost + trans;
        const effectiveCostPerHusk = count > 0 ? (totalCost / count) : 0;

        document.getElementById('prevHuskBase').textContent = window.CoconutModule.fmtLKR(baseCost);
        document.getElementById('prevHuskTrans').textContent = window.CoconutModule.fmtLKR(trans);
        document.getElementById('prevHuskTotal').textContent = window.CoconutModule.fmtLKR(totalCost);
        document.getElementById('prevHuskEquivalent').textContent = `${window.CoconutModule.fmt(count, 0)} husks`;
        document.getElementById('prevEffectiveHuskRate').textContent = `Rs. ${window.CoconutModule.fmt(effectiveCostPerHusk, 2)} / husk`;
    }

    countInput.addEventListener('input', updatePreview);
    unitCostInput.addEventListener('input', updatePreview);
    transportInput.addEventListener('input', updatePreview);

    document.getElementById('huskForm').addEventListener('submit', handleSaveHuskPurchase);

    // Quick Supplier Modal
    const modal = document.getElementById('supplierModal');
    document.getElementById('btnQuickAddSupplier').onclick = () => { modal.classList.add('open'); };
    document.getElementById('btnCloseSupplierModal').onclick = () => { modal.classList.remove('open'); };
    document.getElementById('btnCancelSupplier').onclick = () => { modal.classList.remove('open'); };
    document.getElementById('quickSupplierForm').addEventListener('submit', handleSaveQuickSupplier);

    // Edit Husk Modal
    const editModal = document.getElementById('editHuskModal');
    if (editModal) {
        document.getElementById('btnCloseEditHuskModal').onclick = () => { editModal.classList.remove('open'); };
        document.getElementById('btnCancelEditHusk').onclick = () => { editModal.classList.remove('open'); };
        document.getElementById('editHuskForm').addEventListener('submit', handleSaveEditHusk);
    }
}

async function loadSuppliers() {
    const db = window.CoconutModule.getDb();
    const select = document.getElementById('hSupplier');
    try {
        const snap = await db.collection('coconut_suppliers')
            .where('businessId', '==', appCtx.businessId)
            .get();

        allSuppliers = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(s => s.isActive !== false);
        select.innerHTML = '<option value="">Select Supplier...</option>' +
            allSuppliers.map(s => `<option value="${s.id}">${window.CoconutModule.esc(s.name)} ${s.area ? '(' + window.CoconutModule.esc(s.area) + ')' : ''}</option>`).join('');
    } catch (e) {
        console.warn('Husk suppliers load error:', e);
    }
}

async function loadLiveHuskStock() {
    const db = window.CoconutModule.getDb();
    try {
        const doc = await db.collection('coconut_husk_raw')
            .doc(appCtx.businessId)
            .collection('items')
            .doc('current')
            .get();

        if (doc.exists) {
            const data = doc.data() || {};
            const husks = Number(data.stockHuskCount || data.stockQtyKg || data.stockKg) || 0;
            const rate = Number(data.avgCostPerHusk || data.avgCostPerKg || data.lastCostPerHusk) || 0;
            const totalVal = husks * rate;

            document.getElementById('liveHuskStockCount').textContent = `${window.CoconutModule.fmt(husks, 0)} husks`;
            document.getElementById('liveHuskAvgRate').textContent = `Rs. ${window.CoconutModule.fmt(rate, 2)} / husk`;
            document.getElementById('liveHuskTotalVal').textContent = window.CoconutModule.fmtLKR(totalVal);
        } else {
            document.getElementById('liveHuskStockCount').textContent = '0 husks';
            document.getElementById('liveHuskAvgRate').textContent = 'Rs. 0.00 / husk';
            document.getElementById('liveHuskTotalVal').textContent = 'Rs. 0.00';
        }
    } catch (e) {
        console.error('Error loading live husk stock:', e);
    }
}

async function loadHuskPurchases() {
    const db = window.CoconutModule.getDb();
    const body = document.getElementById('huskHistoryBody');
    try {
        const snap = await db.collection('coconut_husk_purchases')
            .where('businessId', '==', appCtx.businessId)
            .get();

        allPurchases = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(p => p.isActive !== false)
            .sort((a, b) => {
                const ta = a.date ? (a.date.toDate ? a.date.toDate().getTime() : new Date(a.date).getTime()) : 0;
                const tb = b.date ? (b.date.toDate ? b.date.toDate().getTime() : new Date(b.date).getTime()) : 0;
                return tb - ta;
            });

        if (!allPurchases.length) {
            body.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:24px; color:var(--c-text-muted);">No husk purchases recorded yet.</td></tr>';
            return;
        }

        body.innerHTML = allPurchases.map(p => {
            const dt = window.CoconutModule.formatDate(p.date || p.createdAt);
            const husks = Number(p.huskCount || p.quantityKg) || 0;
            const trans = Number(p.transportCost) || 0;
            const total = Number(p.totalCost) || 0;
            const landedHusk = Number(p.effectiveCostPerHusk || (husks > 0 ? total / husks : p.costPerHusk)) || 0;

            let badge = 'c-badge-neutral';
            if (p.paymentMode === 'CASH') badge = 'c-badge-success';
            else if (p.paymentMode === 'CREDIT') badge = 'c-badge-warning';
            else if (p.paymentMode === 'CHEQUE') badge = 'c-badge-info';

            return `
                <tr>
                    <td>${dt}</td>
                    <td><strong>${window.CoconutModule.esc(p.supplierName || 'Unknown')}</strong></td>
                    <td class="text-right" style="font-weight:700;">
                        ${window.CoconutModule.fmt(husks, 0)} husks
                    </td>
                    <td class="text-right">Rs. ${window.CoconutModule.fmt(landedHusk, 2)} / husk</td>
                    <td class="text-right">Rs. ${window.CoconutModule.fmt(trans, 2)}</td>
                    <td class="text-right" style="font-weight:800; color:var(--c-primary);">${window.CoconutModule.fmtLKR(total)}</td>
                    <td><span class="c-badge ${badge}">${window.CoconutModule.esc(p.paymentMode || 'CASH')}</span></td>
                    <td class="text-center">
                        <div style="display:inline-flex; gap:4px;">
                            <button class="c-btn c-btn-secondary c-btn-sm" onclick="openEditHuskModal('${p.id}')" title="Edit husk purchase">✏️</button>
                            <button class="c-btn c-btn-danger c-btn-sm" onclick="handleDeleteHuskPurchase('${p.id}')" title="Reverse purchase & stock">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        body.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error loading husk purchases</td></tr>';
    }
}

function openEditHuskModal(pId) {
    const p = allPurchases.find(x => x.id === pId);
    if (!p) return;

    document.getElementById('editHuskId').value = pId;
    document.getElementById('editHDate').value = window.CoconutModule.toLocalDateStr(p.date || p.createdAt);
    document.getElementById('editHPaymentMode').value = p.paymentMode || 'CASH';
    document.getElementById('editHCount').value = p.huskCount || p.quantityKg || 0;
    document.getElementById('editHUnitCost').value = p.costPerHusk || p.unitCost || 0;
    document.getElementById('editHTransport').value = p.transportCost || 0;
    document.getElementById('editHNotes').value = p.notes || '';

    document.getElementById('editHuskModal').classList.add('open');
}

async function handleSaveEditHusk(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveEditHusk');
    btn.disabled = true;
    btn.textContent = 'Updating...';

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;
    const pId = document.getElementById('editHuskId').value;
    const p = allPurchases.find(x => x.id === pId);
    if (!p) return;

    try {
        const newDateStr = document.getElementById('editHDate').value;
        const newDateObj = window.CoconutModule.parseDateAny(newDateStr) || new Date();
        const newMode = document.getElementById('editHPaymentMode').value;
        const newCount = Number(document.getElementById('editHCount').value) || 0;
        const newRate = Number(document.getElementById('editHUnitCost').value) || 0;
        const newTrans = Number(document.getElementById('editHTransport').value) || 0;
        const newNotes = document.getElementById('editHNotes').value.trim();

        const oldCount = Number(p.huskCount || p.quantityKg) || 0;
        const newTotal = (newCount * newRate) + newTrans;
        const newLandedRate = newCount > 0 ? (newTotal / newCount) : newRate;

        const batch = db.batch();

        // 1. Stock Adjustment
        const huskStockRef = db.collection('coconut_husk_raw').doc(bid).collection('items').doc('current');
        const hDoc = await huskStockRef.get();
        if (hDoc.exists) {
            const hd = hDoc.data() || {};
            const curHusks = Number(hd.stockHuskCount || hd.stockQtyKg || hd.stockKg) || 0;
            const adjustedHusks = Math.max(0, curHusks - oldCount + newCount);
            batch.set(huskStockRef, { stockHuskCount: adjustedHusks, updatedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
        }

        // 2. Update Purchase Record
        const pRef = db.collection('coconut_husk_purchases').doc(pId);
        batch.set(pRef, {
            huskCount: newCount,
            costPerHusk: newRate,
            transportCost: newTrans,
            totalCost: newTotal,
            effectiveCostPerHusk: newLandedRate,
            paymentMode: newMode,
            notes: newNotes,
            date: window.CoconutModule.tsToFirestore(newDateObj),
            updatedAt: window.CoconutModule.tsToFirestore(new Date())
        }, { merge: true });

        // 3. Update Journal
        await window.CoconutModule.deleteJournalForRef(bid, p.purchaseId || pId);
        let creditAccountCode = newMode === 'BANK' ? '1-1020-01' : (newMode === 'CREDIT' ? '2-2010-01' : '1-1010-01');
        let creditAccountName = newMode === 'BANK' ? 'Bank Account' : (newMode === 'CREDIT' ? 'Accounts Payable / Husk Suppliers' : 'Cash in Hand');

        await window.CoconutModule.postJournalEntry({
            businessId: bid,
            description: `Raw Husk Purchase (Updated): ${newCount.toLocaleString()} husks from ${p.supplierName || 'Supplier'}`,
            referenceType: 'HUSK_PURCHASE',
            ref: p.purchaseId || pId,
            date: newDateObj,
            lines: [
                { accountCode: '1-1050-02', accountName: 'Raw Materials - Coconut Husks', debit: newTotal, credit: 0 },
                { accountCode: creditAccountCode, accountName: creditAccountName, debit: 0, credit: newTotal }
            ]
        });

        await batch.commit();

        window.CoconutModule.showToast('✅ Husk purchase updated & stock synced!', 'success');
        document.getElementById('editHuskModal').classList.remove('open');
        await loadLiveHuskStock();
        await loadHuskPurchases();

    } catch (err) {
        console.error(err);
        window.CoconutModule.showToast('Failed to update: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '💾 Update & Sync Yard Stock/GL';
    }
}

async function handleSaveHuskPurchase(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveHusk');
    btn.disabled = true;
    btn.textContent = 'Saving Husk Purchase...';

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const dateVal = document.getElementById('hDate').value;
        const supplierId = document.getElementById('hSupplier').value;
        const supplierObj = allSuppliers.find(s => s.id === supplierId) || {};
        const supplierName = supplierObj.name || 'Direct Supplier';
        const huskCount = Number(document.getElementById('hCount').value) || 0;
        const costPerHusk = Number(document.getElementById('hUnitCost').value) || 0;
        const transportCost = Number(document.getElementById('hTransport').value) || 0;

        if (huskCount <= 0 || costPerHusk <= 0) throw new Error('Husk Count and Rate per Husk must be greater than 0');

        const baseCost = huskCount * costPerHusk;
        const totalCost = baseCost + transportCost;
        const effectiveCostPerHusk = huskCount > 0 ? (totalCost / huskCount) : costPerHusk;

        const paymentMode = document.getElementById('hPaymentMode').value;
        const notes = document.getElementById('hNotes').value || '';

        const purchaseId = `HP_${window.CoconutModule.uid('husk')}`;
        const pDateObj = window.CoconutModule.parseDateAny(dateVal) || new Date();

        // 1. Fetch current Husk Stock to recompute weighted average
        const huskStockRef = db.collection('coconut_husk_raw').doc(bid).collection('items').doc('current');
        const huskDoc = await huskStockRef.get();
        let existingHusks = 0;
        let existingAvgCost = 0;

        if (huskDoc.exists) {
            const hd = huskDoc.data() || {};
            existingHusks = Number(hd.stockHuskCount || hd.stockQtyKg || hd.stockKg) || 0;
            existingAvgCost = Number(hd.avgCostPerHusk || hd.avgCostPerKg || hd.lastCostPerHusk) || 0;
        }

        const newStockHusks = existingHusks + huskCount;
        const newTotalVal = (existingHusks * existingAvgCost) + totalCost;
        const newAvgCostHusk = newStockHusks > 0 ? (newTotalVal / newStockHusks) : costPerHusk;

        const batch = db.batch();

        // 2. Insert Husk Purchase Doc
        const purchaseRef = db.collection('coconut_husk_purchases').doc(purchaseId);
        batch.set(purchaseRef, {
            businessId: bid,
            purchaseId,
            unitMode: 'COUNT',
            supplierId,
            supplierName,
            huskCount,
            costPerHusk,
            transportCost,
            totalCost,
            effectiveCostPerHusk,
            paymentMode,
            notes,
            date: window.CoconutModule.tsToFirestore(pDateObj),
            createdAt: window.CoconutModule.tsToFirestore(new Date()),
            isActive: true
        });

        // 3. Upsert Live Husk Stock Doc
        batch.set(huskStockRef, {
            businessId: bid,
            stockHuskCount: newStockHusks,
            avgCostPerHusk: newAvgCostHusk,
            lastCostPerHusk: costPerHusk,
            totalValuation: newTotalVal,
            updatedAt: window.CoconutModule.tsToFirestore(new Date())
        }, { merge: true });

        // 4. Double-Entry Accounting Journal Posting
        // Dr 1-1050-02 (Inventory - Raw Husks) : totalCost
        // Cr 1-1010-01 (Cash) OR 1-1020-01 (Bank) OR 2-2010-01 (Accounts Payable)
        let creditAccountCode = '1-1010-01';
        let creditAccountName = 'Cash in Hand';
        if (paymentMode === 'CREDIT') {
            creditAccountCode = '2-2010-01';
            creditAccountName = 'Accounts Payable / Husk Suppliers';
        } else if (paymentMode === 'BANK') {
            creditAccountCode = '1-1020-01';
            creditAccountName = 'Bank Account';
        } else if (paymentMode === 'CHEQUE') {
            creditAccountCode = '2-2020-01';
            creditAccountName = 'Cheques Payable';
        }

        const journalLines = [
            { accountCode: '1-1050-02', accountName: 'Raw Materials - Coconut Husks', debit: totalCost, credit: 0 },
            { accountCode: creditAccountCode, accountName: creditAccountName, debit: 0, credit: totalCost }
        ];

        await window.CoconutModule.postJournalEntry({
            businessId: bid,
            description: `Raw Husk Purchase: ${huskCount.toLocaleString()} husks from ${supplierName}`,
            referenceType: 'HUSK_PURCHASE',
            ref: purchaseId,
            date: pDateObj,
            lines: journalLines
        });

        await batch.commit();

        window.CoconutModule.showToast('✅ Husk purchase recorded & yard stock updated!', 'success');
        document.getElementById('huskForm').reset();
        document.getElementById('hDate').value = window.CoconutModule.toLocalDateStr(new Date());

        await loadLiveHuskStock();
        await loadHuskPurchases();

    } catch (err) {
        console.error(err);
        window.CoconutModule.showToast(err.message || 'Failed to save husk purchase', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '💾 Save Husk Purchase & Update Stock';
    }
}

async function handleDeleteHuskPurchase(purchaseId) {
    if (!confirm('Are you sure you want to delete this husk purchase? Stock and journal will be reversed.')) return;
    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const pRef = db.collection('coconut_husk_purchases').doc(purchaseId);
        const pDoc = await pRef.get();
        if (!pDoc.exists) return;
        const pData = pDoc.data() || {};

        const husks = Number(pData.huskCount || pData.quantityKg) || 0;

        // 1. Reverse Stock
        const huskStockRef = db.collection('coconut_husk_raw').doc(bid).collection('items').doc('current');
        const hDoc = await huskStockRef.get();
        if (hDoc.exists) {
            const hd = hDoc.data() || {};
            const curHusks = Number(hd.stockHuskCount || hd.stockQtyKg || hd.stockKg) || 0;
            await huskStockRef.set({
                stockHuskCount: Math.max(0, curHusks - husks),
                updatedAt: window.CoconutModule.tsToFirestore(new Date())
            }, { merge: true });
        }

        // 2. Soft-delete purchase
        await pRef.set({
            isActive: false,
            deletedAt: window.CoconutModule.tsToFirestore(new Date())
        }, { merge: true });

        // 3. Remove GL Journal
        const jSnap = await db.collection('journal').doc(bid).collection('entries')
            .where('ref', '==', purchaseId)
            .get();

        jSnap.docs.forEach(async doc => {
            await doc.ref.delete();
        });

        window.CoconutModule.showToast('Husk purchase deleted & stock reversed', 'info');
        await loadLiveHuskStock();
        await loadHuskPurchases();

    } catch (e) {
        window.CoconutModule.showToast('Error deleting husk purchase: ' + e.message, 'error');
    }
}

async function handleSaveQuickSupplier(e) {
    e.preventDefault();
    const name = document.getElementById('supName').value.trim();
    const phone = document.getElementById('supPhone').value.trim();
    const area = document.getElementById('supArea').value.trim();

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const docRef = await db.collection('coconut_suppliers').add({
            businessId: bid,
            name,
            phone,
            area,
            isActive: true,
            createdAt: window.CoconutModule.tsToFirestore(new Date())
        });

        window.CoconutModule.showToast('Supplier added!', 'success');
        document.getElementById('supplierModal').classList.remove('open');
        document.getElementById('quickSupplierForm').reset();

        await loadSuppliers();
        document.getElementById('hSupplier').value = docRef.id;

    } catch (err) {
        window.CoconutModule.showToast('Failed to add supplier: ' + err.message, 'error');
    }
}
