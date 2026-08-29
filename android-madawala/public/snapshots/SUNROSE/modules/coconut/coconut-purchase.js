/**
 * Coconut Wholesale Module — Coconut Purchase Management (Strictly Count-Based: Nuts)
 */

let appCtx = null;
let allPurchases = [];
let allSuppliers = [];

document.addEventListener('DOMContentLoaded', async () => {
    appCtx = await window.CoconutModule.guardCoconutPage();
    if (!appCtx) return;

    window.CoconutModule.renderNav('coconut-purchase');

    // Default Date to Today
    document.getElementById('pDate').value = window.CoconutModule.toLocalDateStr(new Date());

    setupEventHandlers();
    await loadSuppliers();
    await loadStockSummary();
    await loadPurchasesHistory();
});

function setupEventHandlers() {
    const qtyInput = document.getElementById('pQty');
    const unitCostInput = document.getElementById('pUnitCost');
    const transportInput = document.getElementById('pTransport');
    const modeSelect = document.getElementById('pPaymentMode');

    function updatePreview() {
        const qty = Number(qtyInput.value) || 0;
        const ratePerNut = Number(unitCostInput.value) || 0;
        const trans = Number(transportInput.value) || 0;

        const baseCost = qty * ratePerNut;
        const totalCost = baseCost + trans;
        const effectiveRatePerNut = qty > 0 ? (totalCost / qty) : 0;

        document.getElementById('prevBaseCost').textContent = window.CoconutModule.fmtLKR(baseCost);
        document.getElementById('prevTransport').textContent = window.CoconutModule.fmtLKR(trans);
        document.getElementById('prevTotalCost').textContent = window.CoconutModule.fmtLKR(totalCost);
        document.getElementById('prevEquivalent').textContent = `${window.CoconutModule.fmt(qty, 0)} nuts`;
        document.getElementById('prevEffectiveRate').textContent = `Rs. ${window.CoconutModule.fmt(effectiveRatePerNut, 2)} / nut`;
    }

    qtyInput.addEventListener('input', updatePreview);
    unitCostInput.addEventListener('input', updatePreview);
    transportInput.addEventListener('input', updatePreview);

    modeSelect.addEventListener('change', () => {
        const val = modeSelect.value;
        document.getElementById('chequeFields').style.display = val === 'CHEQUE' ? 'block' : 'none';
        document.getElementById('creditFields').style.display = val === 'CREDIT' ? 'block' : 'none';
    });

    // Form Submit
    document.getElementById('purchaseForm').addEventListener('submit', handleSavePurchase);

    // Quick Supplier Modal
    const modal = document.getElementById('supplierModal');
    document.getElementById('btnQuickAddSupplier').onclick = () => { modal.classList.add('open'); };
    document.getElementById('btnCloseSupplierModal').onclick = () => { modal.classList.remove('open'); };
    document.getElementById('btnCancelSupplier').onclick = () => { modal.classList.remove('open'); };
    document.getElementById('quickSupplierForm').addEventListener('submit', handleSaveQuickSupplier);

    // Edit Purchase Modal
    const editModal = document.getElementById('editPurchaseModal');
    if (editModal) {
        document.getElementById('btnCloseEditPurchaseModal').onclick = () => { editModal.classList.remove('open'); };
        document.getElementById('btnCancelEditPurchase').onclick = () => { editModal.classList.remove('open'); };
        document.getElementById('editPurchaseForm').addEventListener('submit', handleSaveEditPurchase);
    }

    // Search filter
    document.getElementById('searchPurchase').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        renderPurchasesTable(allPurchases.filter(p =>
            (p.supplierName && p.supplierName.toLowerCase().includes(query)) ||
            (p.category && p.category.toLowerCase().includes(query)) ||
            (p.notes && p.notes.toLowerCase().includes(query))
        ));
    });
}

async function loadSuppliers() {
    const db = window.CoconutModule.getDb();
    const select = document.getElementById('pSupplier');
    try {
        const snap = await db.collection('coconut_suppliers')
            .where('businessId', '==', appCtx.businessId)
            .get();

        allSuppliers = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(s => s.isActive !== false);
        select.innerHTML = '<option value="">Select Supplier...</option>' +
            allSuppliers.map(s => `<option value="${s.id}">${window.CoconutModule.esc(s.name)} ${s.area ? '(' + window.CoconutModule.esc(s.area) + ')' : ''}</option>`).join('');
    } catch (e) {
        console.warn('Suppliers load error:', e);
    }
}

async function loadStockSummary() {
    const db = window.CoconutModule.getDb();
    const body = document.getElementById('stockSummaryBody');
    try {
        const snap = await db.collection('coconut_raw_coconuts')
            .doc(appCtx.businessId)
            .collection('items')
            .get();

        if (snap.empty) {
            body.innerHTML = '<tr><td colspan="4" class="text-center" style="color:var(--c-text-muted);">No stock recorded yet.</td></tr>';
            return;
        }

        let totalQty = 0;
        let totalVal = 0;
        let rows = '';

        snap.docs.forEach(doc => {
            const data = doc.data() || {};
            const q = Number(data.stockQty) || 0;
            const c = Number(data.avgCostPerUnit || data.lastUnitCost) || 0;
            const val = q * c;
            totalQty += q;
            totalVal += val;

            rows += `
                <tr>
                    <td><strong>${window.CoconutModule.esc(data.category || doc.id)}</strong></td>
                    <td class="text-right" style="font-weight:700;">${window.CoconutModule.fmt(q, 0)} nuts</td>
                    <td class="text-right">Rs. ${window.CoconutModule.fmt(c, 2)}</td>
                    <td class="text-right" style="font-weight:700;">${window.CoconutModule.fmtLKR(val)}</td>
                </tr>
            `;
        });

        rows += `
            <tr style="background:#f8fafc; font-weight:800; border-top:2px solid var(--c-border);">
                <td>TOTAL</td>
                <td class="text-right">${window.CoconutModule.fmt(totalQty, 0)} nuts</td>
                <td class="text-right">Avg Rs. ${window.CoconutModule.fmt(totalQty > 0 ? totalVal / totalQty : 0, 2)}</td>
                <td class="text-right" style="color:var(--c-primary);">${window.CoconutModule.fmtLKR(totalVal)}</td>
            </tr>
        `;

        body.innerHTML = rows;
    } catch (e) {
        body.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading stock summary</td></tr>';
    }
}

async function loadPurchasesHistory() {
    const db = window.CoconutModule.getDb();
    const body = document.getElementById('purchaseHistoryBody');
    try {
        const snap = await db.collection('coconut_raw_material_history')
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

        renderPurchasesTable(allPurchases);
    } catch (e) {
        console.error(e);
        body.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Error loading purchase records</td></tr>';
    }
}

function renderPurchasesTable(list) {
    const body = document.getElementById('purchaseHistoryBody');
    if (!list || !list.length) {
        body.innerHTML = '<tr><td colspan="9" class="text-center" style="padding:24px; color:var(--c-text-muted);">No coconut purchases recorded yet.</td></tr>';
        return;
    }

    body.innerHTML = list.map(p => {
        const dt = window.CoconutModule.formatDate(p.date || p.createdAt);
        const qty = Number(p.quantity) || 0;
        const trans = Number(p.transportCost) || 0;
        const total = Number(p.totalCost) || 0;
        const landedRate = Number(p.effectiveCostPerNut || (qty > 0 ? total / qty : p.unitCost)) || 0;

        let badge = 'c-badge-neutral';
        if (p.paymentMode === 'CASH') badge = 'c-badge-success';
        else if (p.paymentMode === 'CREDIT') badge = 'c-badge-warning';
        else if (p.paymentMode === 'CHEQUE') badge = 'c-badge-info';

        return `
            <tr>
                <td>${dt}</td>
                <td><strong>${window.CoconutModule.esc(p.supplierName || 'Unknown')}</strong></td>
                <td><span class="c-badge c-badge-neutral">${window.CoconutModule.esc(p.category || 'GOOD')}</span></td>
                <td class="text-right" style="font-weight:700;">
                    ${window.CoconutModule.fmt(qty, 0)} nuts
                </td>
                <td class="text-right">Rs. ${window.CoconutModule.fmt(landedRate, 2)}</td>
                <td class="text-right">Rs. ${window.CoconutModule.fmt(trans, 2)}</td>
                <td class="text-right" style="font-weight:800; color:var(--c-primary);">${window.CoconutModule.fmtLKR(total)}</td>
                <td><span class="c-badge ${badge}">${window.CoconutModule.esc(p.paymentMode || 'CASH')}</span></td>
                <td class="text-center">
                    <div style="display:inline-flex; gap:4px;">
                        <button class="c-btn c-btn-secondary c-btn-sm" onclick="openEditPurchaseModal('${p.id}')" title="Edit purchase">✏️</button>
                        <button class="c-btn c-btn-danger c-btn-sm" onclick="handleDeletePurchase('${p.id}')" title="Delete & reverse stock/GL">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openEditPurchaseModal(pId) {
    const p = allPurchases.find(x => x.id === pId);
    if (!p) return;

    document.getElementById('editPurchaseId').value = pId;
    document.getElementById('editPDate').value = window.CoconutModule.toLocalDateStr(p.date || p.createdAt);
    document.getElementById('editPPaymentMode').value = p.paymentMode || 'CASH';
    document.getElementById('editPQty').value = p.quantity || 0;
    document.getElementById('editPUnitCost').value = p.unitCost || 0;
    document.getElementById('editPTransport').value = p.transportCost || 0;
    document.getElementById('editPNotes').value = p.notes || '';

    document.getElementById('editPurchaseModal').classList.add('open');
}

async function handleSaveEditPurchase(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveEditPurchase');
    btn.disabled = true;
    btn.textContent = 'Updating...';

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;
    const pId = document.getElementById('editPurchaseId').value;
    const p = allPurchases.find(x => x.id === pId);
    if (!p) return;

    try {
        const newDateStr = document.getElementById('editPDate').value;
        const newDateObj = window.CoconutModule.parseDateAny(newDateStr) || new Date();
        const newMode = document.getElementById('editPPaymentMode').value;
        const newQty = Number(document.getElementById('editPQty').value) || 0;
        const newRate = Number(document.getElementById('editPUnitCost').value) || 0;
        const newTrans = Number(document.getElementById('editPTransport').value) || 0;
        const newNotes = document.getElementById('editPNotes').value.trim();

        const oldQty = Number(p.quantity) || 0;
        const category = p.category || 'GOOD';
        const newTotal = (newQty * newRate) + newTrans;
        const newLandedRate = newQty > 0 ? (newTotal / newQty) : newRate;

        const batch = db.batch();

        // 1. Adjust Stock
        const catStockRef = db.collection('coconut_raw_coconuts').doc(bid).collection('items').doc(category);
        const catDoc = await catStockRef.get();
        if (catDoc.exists) {
            const cd = catDoc.data() || {};
            const curQty = Number(cd.stockQty) || 0;
            const adjustedQty = Math.max(0, curQty - oldQty + newQty);
            batch.set(catStockRef, { stockQty: adjustedQty, updatedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
        }

        // 2. Update Purchase Record
        const pRef = db.collection('coconut_raw_material_history').doc(pId);
        batch.set(pRef, {
            quantity: newQty,
            unitCost: newRate,
            transportCost: newTrans,
            totalCost: newTotal,
            effectiveCostPerNut: newLandedRate,
            paymentMode: newMode,
            notes: newNotes,
            date: window.CoconutModule.tsToFirestore(newDateObj),
            updatedAt: window.CoconutModule.tsToFirestore(new Date())
        }, { merge: true });

        // 3. Remove old Journal & Post New Balanced Journal
        await window.CoconutModule.deleteJournalForRef(bid, p.purchaseId || pId);
        let creditAccountCode = newMode === 'BANK' ? '1-1020-01' : (newMode === 'CREDIT' ? '2-2010-01' : '1-1010-01');
        let creditAccountName = newMode === 'BANK' ? 'Bank Account' : (newMode === 'CREDIT' ? 'Accounts Payable / Suppliers' : 'Cash in Drawer');

        await window.CoconutModule.postJournalEntry({
            businessId: bid,
            description: `Coconut Purchase (Updated): ${newQty.toLocaleString()} nuts from ${p.supplierName || 'Supplier'}`,
            referenceType: 'COCONUT_PURCHASE',
            ref: p.purchaseId || pId,
            date: newDateObj,
            lines: [
                { accountCode: '1-1050-01', accountName: 'Raw Materials - Fresh Coconuts', debit: newTotal, credit: 0 },
                { accountCode: creditAccountCode, accountName: creditAccountName, debit: 0, credit: newTotal }
            ]
        });

        await batch.commit();

        window.CoconutModule.showToast('✅ Purchase record updated & stock/GL synced!', 'success');
        document.getElementById('editPurchaseModal').classList.remove('open');
        await loadStockSummary();
        await loadPurchasesHistory();

    } catch (err) {
        console.error(err);
        window.CoconutModule.showToast('Failed to update: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '💾 Update & Sync Stock/GL';
    }
}

async function handleSavePurchase(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSavePurchase');
    btn.disabled = true;
    btn.textContent = 'Saving & Posting Journal...';

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const dateVal = document.getElementById('pDate').value;
        const supplierId = document.getElementById('pSupplier').value;
        const supplierObj = allSuppliers.find(s => s.id === supplierId) || {};
        const supplierName = supplierObj.name || 'Direct Supplier';
        const category = document.getElementById('pCategory').value;
        const quantity = Number(document.getElementById('pQty').value) || 0;
        const unitCost = Number(document.getElementById('pUnitCost').value) || 0;
        const transportCost = Number(document.getElementById('pTransport').value) || 0;

        if (quantity <= 0 || unitCost <= 0) throw new Error('Nut Quantity and Rate per Nut must be greater than 0');

        const baseCost = quantity * unitCost;
        const totalCost = baseCost + transportCost;
        const effectiveCostPerNut = quantity > 0 ? (totalCost / quantity) : unitCost;

        const paymentMode = document.getElementById('pPaymentMode').value;
        const chequeDetails = document.getElementById('pChequeDetails').value || '';
        const dueDate = document.getElementById('pDueDate').value || '';
        const notes = document.getElementById('pNotes').value || '';

        const isDehusked = document.getElementById('pDehusked') ? document.getElementById('pDehusked').checked : true;

        const purchaseId = `CP_${window.CoconutModule.uid('raw')}`;
        const pDateObj = window.CoconutModule.parseDateAny(dateVal) || new Date();
        
        // 1. Fetch current Category Stock to recompute weighted average
        const catStockRef = db.collection('coconut_raw_coconuts').doc(bid).collection('items').doc(category);
        const catDoc = await catStockRef.get();
        let existingQty = 0;
        let existingAvgCost = 0;

        if (catDoc.exists) {
            const cd = catDoc.data() || {};
            existingQty = Number(cd.stockQty) || 0;
            existingAvgCost = Number(cd.avgCostPerUnit || cd.lastUnitCost) || 0;
        }

        const newStockQty = existingQty + quantity;
        const newTotalVal = (existingQty * existingAvgCost) + totalCost;
        const newAvgCost = newStockQty > 0 ? (newTotalVal / newStockQty) : unitCost;

        const batch = db.batch();

        // 2. Insert Purchase History Doc
        const purchaseRef = db.collection('coconut_raw_material_history').doc(purchaseId);
        batch.set(purchaseRef, {
            businessId: bid,
            purchaseId,
            unitMode: 'COUNT',
            supplierId,
            supplierName,
            category,
            quantity,
            unitCost,
            transportCost,
            totalCost,
            effectiveCostPerNut,
            isDehusked,
            huskCountGenerated: isDehusked ? quantity : 0,
            paymentMode,
            paymentStatus: paymentMode === 'CREDIT' ? 'UNPAID' : 'PAID',
            chequeDetails,
            dueDate,
            notes,
            date: window.CoconutModule.tsToFirestore(pDateObj),
            createdAt: window.CoconutModule.tsToFirestore(new Date()),
            isActive: true
        });

        // 3. Upsert Category Stock
        batch.set(catStockRef, {
            businessId: bid,
            category,
            categoryName: category === 'COPRA_NUTS' ? 'Copra Nuts (කොප්පරා සඳහා ගෙඩි)' : category,
            stockQty: newStockQty,
            avgCostPerUnit: Number(newAvgCost.toFixed(4)),
            lastUnitCost: unitCost,
            totalValuation: newTotalVal,
            updatedAt: window.CoconutModule.tsToFirestore(new Date())
        }, { merge: true });

        // 4. If de-husked, add husks to Raw Husk Yard Stock at Rs. 0.00 Cost (1:1 Ratio)
        if (isDehusked) {
            const huskStockRef = db.collection('coconut_husk_raw').doc(bid).collection('items').doc('current');
            const huskDoc = await huskStockRef.get();
            let curHuskCount = 0;
            let curHuskAvgCost = 0;
            if (huskDoc.exists) {
                const hd = huskDoc.data() || {};
                curHuskCount = Number(hd.stockHuskCount || hd.stockQtyKg || hd.stockKg) || 0;
                curHuskAvgCost = Number(hd.avgCostPerHusk || hd.avgCostPerKg || hd.lastCostPerHusk) || 0;
            }
            const newTotalHuskCount = curHuskCount + quantity;
            const curHuskValuation = curHuskCount * curHuskAvgCost; // 0 added cost
            const newAvgCostHusk = newTotalHuskCount > 0 ? (curHuskValuation / newTotalHuskCount) : 0;

            batch.set(huskStockRef, {
                businessId: bid,
                stockHuskCount: newTotalHuskCount,
                avgCostPerHusk: newAvgCostHusk,
                lastCostPerHusk: 0,
                totalValuation: curHuskValuation,
                updatedAt: window.CoconutModule.tsToFirestore(new Date())
            }, { merge: true });
        }

        // 5. If CREDIT or CHEQUE purchase, update Supplier Balance & Sub-collection Ledger
        if ((paymentMode === 'CREDIT' || paymentMode === 'CHEQUE') && supplierId) {
            const supRef = db.collection('coconut_suppliers').doc(supplierId);
            const supDoc = await supRef.get();
            const curBal = supDoc.exists ? (Number(supDoc.data()?.balance) || 0) : 0;
            const newBal = curBal + totalCost;

            batch.set(supRef, {
                balance: newBal,
                updatedAt: window.CoconutModule.tsToFirestore(new Date())
            }, { merge: true });

            const supLedgerRef = supRef.collection('ledger').doc(`LED_${purchaseId}`);
            batch.set(supLedgerRef, {
                businessId: bid,
                type: 'PURCHASE',
                referenceId: purchaseId,
                amount: totalCost,
                balanceAfter: newBal,
                description: `${paymentMode === 'CHEQUE' ? 'Cheque' : 'Credit'} Purchase: ${quantity.toLocaleString()} coconuts (${category})${chequeDetails ? ' [Cheque: ' + chequeDetails + ']' : ''}`,
                date: window.CoconutModule.tsToFirestore(pDateObj),
                createdAt: window.CoconutModule.tsToFirestore(new Date())
            });
        }

        // 6. Double-Entry Accounting Journal Posting
        // Dr 1-1050-01 (Inventory - Fresh Coconuts) : totalCost
        // Cr 1-1010-01 (Cash) OR 1-1020-01 (Bank) OR 2-2010-01 (Accounts Payable)
        let creditAccountCode = '1-1010-01';
        let creditAccountName = 'Cash in Hand';
        if (paymentMode === 'CREDIT') {
            creditAccountCode = '2-2010-01';
            creditAccountName = 'Accounts Payable / Coconut Suppliers';
        } else if (paymentMode === 'BANK') {
            creditAccountCode = '1-1020-01';
            creditAccountName = 'Bank Account';
        } else if (paymentMode === 'CHEQUE') {
            creditAccountCode = '2-2020-01';
            creditAccountName = 'Cheques Payable';
        }

        const journalLines = [
            { accountCode: '1-1050-01', accountName: 'Raw Materials - Fresh Coconuts', debit: totalCost, credit: 0 },
            { accountCode: creditAccountCode, accountName: creditAccountName, debit: 0, credit: totalCost }
        ];

        await window.CoconutModule.postJournalEntry({
            businessId: bid,
            description: `Coconut Purchase: ${quantity.toLocaleString()} nuts from ${supplierName} (${category})`,
            referenceType: 'COCONUT_PURCHASE',
            ref: purchaseId,
            date: pDateObj,
            lines: journalLines
        });

        await batch.commit();

        window.CoconutModule.showToast('✅ Coconut purchase saved & stock updated!' + (isDehusked ? ` (+${quantity.toLocaleString()} husks added @ Rs. 0)` : ''), 'success');
        document.getElementById('purchaseForm').reset();
        document.getElementById('pDate').value = window.CoconutModule.toLocalDateStr(new Date());

        await loadStockSummary();
        await loadPurchasesHistory();

    } catch (err) {
        console.error(err);
        window.CoconutModule.showToast(err.message || 'Failed to save purchase', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '💾 Save Purchase & Update Stock';
    }
}

async function handleDeletePurchase(purchaseId) {
    if (!confirm('Are you sure you want to delete this purchase record? This will adjust stock and reverse the journal entry.')) return;
    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const purchaseRef = db.collection('coconut_raw_material_history').doc(purchaseId);
        const pDoc = await purchaseRef.get();
        if (!pDoc.exists) return;
        const pData = pDoc.data() || {};

        const qty = Number(pData.quantity) || 0;
        const category = pData.category || 'GOOD';
        const totalCost = Number(pData.totalCost) || 0;
        const supplierId = pData.supplierId;
        const paymentMode = pData.paymentMode;
        const wasDehusked = pData.isDehusked === true || (pData.huskCountGenerated && pData.huskCountGenerated > 0);

        const batch = db.batch();

        // 1. Adjust Coconut Stock
        const catStockRef = db.collection('coconut_raw_coconuts').doc(bid).collection('items').doc(category);
        const catDoc = await catStockRef.get();
        if (catDoc.exists) {
            const cd = catDoc.data() || {};
            const curQty = Number(cd.stockQty) || 0;
            const newQty = Math.max(0, curQty - qty);
            batch.set(catStockRef, {
                stockQty: newQty,
                updatedAt: window.CoconutModule.tsToFirestore(new Date())
            }, { merge: true });
        }

        // 2. Adjust Husk Stock if de-husked husks were added
        if (wasDehusked) {
            const huskStockRef = db.collection('coconut_husk_raw').doc(bid).collection('items').doc('current');
            const huskDoc = await huskStockRef.get();
            if (huskDoc.exists) {
                const hd = huskDoc.data() || {};
                const curHusks = Number(hd.stockHuskCount || hd.stockQtyKg || hd.stockKg) || 0;
                batch.set(huskStockRef, {
                    stockHuskCount: Math.max(0, curHusks - qty),
                    updatedAt: window.CoconutModule.tsToFirestore(new Date())
                }, { merge: true });
            }
        }

        // 3. Reverse Supplier Credit / Cheque Balance
        if ((paymentMode === 'CREDIT' || paymentMode === 'CHEQUE') && supplierId) {
            const supRef = db.collection('coconut_suppliers').doc(supplierId);
            const sDoc = await supRef.get();
            if (sDoc.exists) {
                const curBal = Number(sDoc.data()?.balance) || 0;
                batch.set(supRef, {
                    balance: Math.max(0, curBal - totalCost),
                    updatedAt: window.CoconutModule.tsToFirestore(new Date())
                }, { merge: true });
            }
        }

        // 4. Soft-delete purchase
        batch.set(purchaseRef, {
            isActive: false,
            deletedAt: window.CoconutModule.tsToFirestore(new Date())
        }, { merge: true });

        // 5. Remove Journal Entry
        await window.CoconutModule.deleteJournalForRef(bid, purchaseId);

        await batch.commit();

        window.CoconutModule.showToast('Purchase record deleted and stock reversed', 'info');
        await loadStockSummary();
        await loadPurchasesHistory();

    } catch (e) {
        window.CoconutModule.showToast('Error deleting purchase: ' + e.message, 'error');
    }
}

async function handleSaveQuickSupplier(e) {
    e.preventDefault();
    const name = document.getElementById('supName') ? document.getElementById('supName').value.trim() : '';
    const phone = document.getElementById('supPhone') ? document.getElementById('supPhone').value.trim() : '';
    const area = document.getElementById('supArea') ? document.getElementById('supArea').value.trim() : '';
    const address = document.getElementById('supAddress') ? document.getElementById('supAddress').value.trim() : '';
    const defaultRateInput = document.getElementById('supDefaultRate');
    const defaultRate = defaultRateInput ? (Number(defaultRateInput.value) || 0) : 0;

    if (!name) {
        window.CoconutModule.showToast('Please enter supplier name', 'error');
        return;
    }

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const docRef = await db.collection('coconut_suppliers').add({
            businessId: bid,
            name,
            phone,
            area,
            address,
            defaultRate,
            balance: 0,
            isActive: true,
            createdAt: window.CoconutModule.tsToFirestore(new Date()),
            updatedAt: window.CoconutModule.tsToFirestore(new Date())
        });

        window.CoconutModule.showToast('Supplier registered successfully!', 'success');
        document.getElementById('supplierModal').classList.remove('open');
        document.getElementById('quickSupplierForm').reset();

        await loadSuppliers();
        document.getElementById('pSupplier').value = docRef.id;

    } catch (err) {
        window.CoconutModule.showToast('Failed to add supplier: ' + err.message, 'error');
    }
}
