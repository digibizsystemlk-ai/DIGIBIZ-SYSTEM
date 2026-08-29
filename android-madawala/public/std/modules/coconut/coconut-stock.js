/**
 * Coconut Wholesale Module — Raw Stock Management Logic (Strictly Count-Based: Nuts & Husks)
 */

let appCtx = null;
let currentCoconutStock = {};
let currentHuskStock = { husks: 0, avgCostPerHusk: 0 };

document.addEventListener('DOMContentLoaded', async () => {
    appCtx = await window.CoconutModule.guardCoconutPage();
    if (!appCtx) return;

    window.CoconutModule.renderNav('coconut-stock');

    setupEventHandlers();
    await loadAllStocks();
    await loadAdjustmentLogs();
});

function setupEventHandlers() {
    const modal = document.getElementById('adjustmentModal');
    document.getElementById('btnOpenAdjustment').onclick = () => modal.classList.add('open');
    document.getElementById('btnCloseAdjModal').onclick = () => modal.classList.remove('open');
    document.getElementById('btnCancelAdj').onclick = () => modal.classList.remove('open');
    document.getElementById('adjustmentForm').addEventListener('submit', handleSaveAdjustment);

    // Copra Divert Modal
    const copraModal = document.getElementById('copraDivertModal');
    const openCopraBtn = document.getElementById('btnOpenDivertCopra');
    if (openCopraBtn) {
        openCopraBtn.onclick = () => {
            document.getElementById('divDate').value = window.CoconutModule.toLocalDateStr(new Date());
            updateDivAvail();
            copraModal.classList.add('open');
        };
    }
    document.getElementById('btnCloseCopraModal').onclick = () => copraModal.classList.remove('open');
    document.getElementById('btnCancelCopra').onclick = () => copraModal.classList.remove('open');
    document.getElementById('copraDivertForm').addEventListener('submit', handleSaveCopraDivert);

    document.getElementById('divSourceCat').addEventListener('change', updateDivAvail);
}

function updateDivAvail() {
    const srcCat = document.getElementById('divSourceCat').value;
    const curData = currentCoconutStock[srcCat] || { qty: 0 };
    document.getElementById('divAvailDisplay').textContent = `${window.CoconutModule.fmt(curData.qty, 0)} nuts`;
}

function quickDivertToCopra(cat) {
    const copraModal = document.getElementById('copraDivertModal');
    document.getElementById('divSourceCat').value = cat;
    document.getElementById('divDate').value = window.CoconutModule.toLocalDateStr(new Date());
    updateDivAvail();
    copraModal.classList.add('open');
}

async function loadAllStocks() {
    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const [cSnap, hDoc] = await Promise.all([
            db.collection('coconut_raw_coconuts').doc(bid).collection('items').get(),
            db.collection('coconut_husk_raw').doc(bid).collection('items').doc('current').get()
        ]);

        let totalCoconutCount = 0;
        let totalCoconutVal = 0;
        const cBody = document.getElementById('coconutStockTableBody');

        currentCoconutStock = {};
        if (cSnap.empty) {
            cBody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding:20px; color:var(--c-text-muted);">No coconut stock recorded. Record a purchase to initialize.</td></tr>';
        } else {
            let rows = '';
            cSnap.docs.forEach(doc => {
                const d = doc.data() || {};
                const cat = d.category || doc.id;
                const qty = Number(d.stockQty) || 0;
                const avgCost = Number(d.avgCostPerUnit || d.lastUnitCost) || 0;
                const lastCost = Number(d.lastUnitCost) || avgCost;
                const val = qty * avgCost;

                currentCoconutStock[cat] = { qty, avgCost, lastCost };
                totalCoconutCount += qty;
                totalCoconutVal += val;

                const isCopra = cat === 'COPRA_NUTS';
                const copraBtn = !isCopra ? `<button class="c-btn c-btn-sm" style="background:#fffbeb; color:#92400e; border:1px solid #fde68a; margin-right:4px;" onclick="quickDivertToCopra('${cat}')" title="Divert to Copra">🥥 To Copra</button>` : '';

                rows += `
                    <tr>
                        <td><strong>${window.CoconutModule.esc(cat === 'COPRA_NUTS' ? 'COPRA_NUTS (කොප්පරා සඳහා ගෙඩි)' : cat)}</strong></td>
                        <td class="text-right" style="font-weight:700; ${isCopra ? 'color:#92400e;' : ''}">
                            ${window.CoconutModule.fmt(qty, 0)} nuts
                        </td>
                        <td class="text-right">Rs. ${window.CoconutModule.fmt(avgCost, 2)}</td>
                        <td class="text-right">Rs. ${window.CoconutModule.fmt(lastCost, 2)}</td>
                        <td class="text-right" style="font-weight:800; color:var(--c-primary);">${window.CoconutModule.fmtLKR(val)}</td>
                        <td class="text-center">
                            ${copraBtn}
                            <button class="c-btn c-btn-secondary c-btn-sm" onclick="quickAdjustCategory('${cat}')">Adjust</button>
                        </td>
                    </tr>
                `;
            });
            cBody.innerHTML = rows;
        }

        // Raw Husk Stock (Count-based)
        let huskCount = 0;
        let huskAvgCost = 0;
        let huskLastCost = 0;
        if (hDoc.exists) {
            const hd = hDoc.data() || {};
            huskCount = Number(hd.stockHuskCount || hd.stockQtyKg || hd.stockKg) || 0;
            huskAvgCost = Number(hd.avgCostPerHusk || hd.avgCostPerKg || hd.lastCostPerHusk) || 0;
            huskLastCost = Number(hd.lastCostPerHusk || hd.lastCostPerKg) || huskAvgCost;
        }
        currentHuskStock = { husks: huskCount, avgCostPerHusk: huskAvgCost, lastCost: huskLastCost };
        const huskVal = huskCount * huskAvgCost;

        const hBody = document.getElementById('huskStockTableBody');
        hBody.innerHTML = `
            <tr>
                <td><strong>Raw Husks (Yard Bulk)</strong></td>
                <td class="text-right" style="font-weight:700;">
                    ${window.CoconutModule.fmt(huskCount, 0)} husks
                </td>
                <td class="text-right">Rs. ${window.CoconutModule.fmt(huskAvgCost, 2)}</td>
                <td class="text-right">Rs. ${window.CoconutModule.fmt(huskLastCost, 2)}</td>
                <td class="text-right" style="font-weight:800; color:var(--c-primary);">${window.CoconutModule.fmtLKR(huskVal)}</td>
                <td class="text-center">
                    <button class="c-btn c-btn-secondary c-btn-sm" onclick="quickAdjustHusk()">Adjust</button>
                </td>
            </tr>
        `;

        // Update Hero Cards
        document.getElementById('totalCoconutCount').textContent = `${window.CoconutModule.fmt(totalCoconutCount, 0)} nuts`;
        document.getElementById('totalCoconutVal').textContent = window.CoconutModule.fmtLKR(totalCoconutVal);

        const huskCardEl = document.getElementById('totalHuskCount') || document.getElementById('totalHuskKg');
        if (huskCardEl) huskCardEl.textContent = `${window.CoconutModule.fmt(huskCount, 0)} husks`;
        document.getElementById('totalHuskVal').textContent = window.CoconutModule.fmtLKR(huskVal);

        document.getElementById('combinedRawVal').textContent = window.CoconutModule.fmtLKR(totalCoconutVal + huskVal);

    } catch (e) {
        console.error(e);
        window.CoconutModule.showToast('Failed to load raw stock: ' + e.message, 'error');
    }
}

async function loadAdjustmentLogs() {
    const db = window.CoconutModule.getDb();
    const body = document.getElementById('adjustmentLogBody');
    try {
        const snap = await db.collection('coconut_stock_adjustments')
            .where('businessId', '==', appCtx.businessId)
            .get();

        const logs = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => {
                const ta = a.date ? (a.date.toDate ? a.date.toDate().getTime() : new Date(a.date).getTime()) : 0;
                const tb = b.date ? (b.date.toDate ? b.date.toDate().getTime() : new Date(b.date).getTime()) : 0;
                return tb - ta;
            });

        if (!logs.length) {
            body.innerHTML = '<tr><td colspan="6" class="text-center" style="padding:20px; color:var(--c-text-muted);">No stock adjustments on record.</td></tr>';
            return;
        }

        body.innerHTML = logs.map(l => {
            const dt = window.CoconutModule.formatDateTime(l.date || l.createdAt);
            const lossVal = Number(l.costValue) || 0;
            return `
                <tr>
                    <td>${dt}</td>
                    <td><strong>${window.CoconutModule.esc(l.itemName || l.itemType)}</strong></td>
                    <td class="text-right" style="color:var(--c-danger); font-weight:700;">-${window.CoconutModule.fmt(l.qtyDeducted, 0)} ${l.unit || 'nuts'}</td>
                    <td class="text-right" style="font-weight:700;">${window.CoconutModule.fmtLKR(lossVal)}</td>
                    <td><span class="c-badge c-badge-danger">${window.CoconutModule.esc(l.reason)}</span></td>
                    <td>${window.CoconutModule.esc(l.notes || '-')}</td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        console.warn(e);
    }
}

function quickAdjustCategory(cat) {
    const sel = document.getElementById('adjItemType');
    sel.value = `COCONUT_${cat}`;
    document.getElementById('adjustmentModal').classList.add('open');
}

function quickAdjustHusk() {
    const sel = document.getElementById('adjItemType');
    sel.value = 'HUSK_RAW';
    document.getElementById('adjustmentModal').classList.add('open');
}

async function handleSaveAdjustment(e) {
    e.preventDefault();
    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    const itemType = document.getElementById('adjItemType').value;
    const qty = Number(document.getElementById('adjQty').value) || 0;
    const reason = document.getElementById('adjReason').value;
    const notes = document.getElementById('adjNotes').value;

    if (qty <= 0) {
        alert('Deduction quantity must be greater than 0');
        return;
    }

    try {
        let unitCost = 0;
        let itemName = '';
        let unit = 'nuts';

        const batch = db.batch();
        const adjId = `ADJ_${window.CoconutModule.uid('adj')}`;

        if (itemType.startsWith('COCONUT_')) {
            const cat = itemType.replace('COCONUT_', '');
            itemName = `Coconut (${cat})`;
            const curData = currentCoconutStock[cat] || { qty: 0, avgCost: 0 };
            unitCost = curData.avgCost || 0;
            const newQty = Math.max(0, curData.qty - qty);

            const catRef = db.collection('coconut_raw_coconuts').doc(bid).collection('items').doc(cat);
            batch.set(catRef, {
                stockQty: newQty,
                updatedAt: window.CoconutModule.tsToFirestore(new Date())
            }, { merge: true });

        } else if (itemType === 'HUSK_RAW') {
            itemName = 'Raw Husks';
            unit = 'husks';
            unitCost = currentHuskStock.avgCostPerHusk || 0;
            const newHusks = Math.max(0, currentHuskStock.husks - qty);

            const huskRef = db.collection('coconut_husk_raw').doc(bid).collection('items').doc('current');
            batch.set(huskRef, {
                stockHuskCount: newHusks,
                updatedAt: window.CoconutModule.tsToFirestore(new Date())
            }, { merge: true });
        }

        const costValue = Number((qty * unitCost).toFixed(2));

        // 1. Insert Adjustment Log
        const adjRef = db.collection('coconut_stock_adjustments').doc(adjId);
        batch.set(adjRef, {
            businessId: bid,
            itemType,
            itemName,
            qtyDeducted: qty,
            unit,
            unitCost,
            costValue,
            reason,
            notes,
            date: window.CoconutModule.tsToFirestore(new Date()),
            createdAt: window.CoconutModule.tsToFirestore(new Date())
        });

        // 2. Post Balanced Journal for Inventory Shrinkage/Loss
        if (costValue > 0) {
            await window.CoconutModule.postJournalEntry({
                businessId: bid,
                description: `Stock Loss / Spoilage: ${itemName} (-${qty} ${unit}) [${reason}]`,
                referenceType: 'STOCK_ADJUSTMENT_LOSS',
                ref: `coconut_stock_adjustments/${adjId}`,
                date: new Date(),
                lines: [
                    { accountCode: '5-5010-01', accountName: 'Operational Expense (Spoilage & Loss)', debit: costValue, credit: 0 },
                    { accountCode: '1-1050-01', accountName: 'Raw Material Inventory Assets', debit: 0, credit: costValue }
                ],
                batch
            });
        }

        await batch.commit();

        window.CoconutModule.showToast('Stock adjustment recorded and GL updated!', 'success');
        document.getElementById('adjustmentForm').reset();
        document.getElementById('adjustmentModal').classList.remove('open');

        await loadAllStocks();
        await loadAdjustmentLogs();

    } catch (err) {
        console.error(err);
        window.CoconutModule.showToast('Failed to record adjustment: ' + err.message, 'error');
    }
}

async function handleSaveCopraDivert(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveCopraDivert');
    btn.disabled = true;
    btn.textContent = 'Transferring to Copra...';

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const srcCat = document.getElementById('divSourceCat').value;
        const qty = Number(document.getElementById('divQty').value) || 0;
        const dateVal = document.getElementById('divDate').value;
        const notes = document.getElementById('divNotes').value || '';
        const dDateObj = window.CoconutModule.parseDateAny(dateVal) || new Date();

        if (qty <= 0) {
            alert('Please specify a valid nut quantity to transfer');
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

        // 3. Record Audit Log in history
        const logId = `DIV_${window.CoconutModule.uid('copra')}`;
        const logRef = db.collection('coconut_stock_adjustments').doc(logId);
        batch.set(logRef, {
            businessId: bid,
            logId,
            itemType: `DIVERT_TO_COPRA`,
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
        document.getElementById('copraDivertForm').reset();
        document.getElementById('copraDivertModal').classList.remove('open');

        await loadAllStocks();
        await loadAdjustmentLogs();

    } catch (err) {
        console.error(err);
        window.CoconutModule.showToast('Transfer failed: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '🥥 Transfer to Copra Stock';
    }
}
