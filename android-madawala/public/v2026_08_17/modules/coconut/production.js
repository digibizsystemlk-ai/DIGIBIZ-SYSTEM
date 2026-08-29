/**
 * Coconut Wholesale Module — Production Management Logic (Pure Count-Based Raw Material Consumption)
 */

let appCtx = null;
let allRecipes = [];
let allProducts = [];
let liveHuskStock = { husks: 0, avgCostPerHusk: 0 };
let liveCoconutStock = { totalQty: 0, avgCost: 0 };

document.addEventListener('DOMContentLoaded', async () => {
    appCtx = await window.CoconutModule.guardCoconutPage();
    if (!appCtx) return;

    window.CoconutModule.renderNav('production');
    document.getElementById('prDate').value = window.CoconutModule.toLocalDateStr(new Date());

    setupEventHandlers();
    await loadProductsDropdown();
    await loadHuskAndCoconutStocks();
    await loadRecipes();
    await loadProductionHistory();
});

function setupEventHandlers() {
    const recipeSelect = document.getElementById('prRecipe');
    const prodSelect = document.getElementById('prProduct');
    const producedQtyInput = document.getElementById('prProducedQty');
    const huskCountInput = document.getElementById('prHuskCount');
    const coconutQtyInput = document.getElementById('prCoconutQty');
    const procCostInput = document.getElementById('prProcessingCost');

    recipeSelect.addEventListener('change', () => {
        const rId = recipeSelect.value;
        const recipe = allRecipes.find(x => x.id === rId);
        if (recipe) {
            if (recipe.productId) prodSelect.value = recipe.productId;
            if (recipe.inputQty && producedQtyInput.value) {
                const qty = Number(producedQtyInput.value) || 1;
                if (recipe.inputType === 'HUSK_COUNT' || recipe.inputType === 'HUSK_KG') {
                    huskCountInput.value = Math.round(qty * recipe.inputQty);
                } else if (recipe.inputType === 'COCONUT') {
                    coconutQtyInput.value = Math.round(qty * recipe.inputQty);
                }
            }
            if (recipe.processingCost) {
                const qty = Number(producedQtyInput.value) || 1;
                procCostInput.value = (qty * recipe.processingCost).toFixed(2);
            }
            calculateProductionCost();
        }
    });

    producedQtyInput.addEventListener('input', () => {
        const rId = recipeSelect.value;
        const recipe = allRecipes.find(x => x.id === rId);
        const qty = Number(producedQtyInput.value) || 0;
        if (recipe && qty > 0) {
            if (recipe.inputType === 'HUSK_COUNT' || recipe.inputType === 'HUSK_KG') {
                huskCountInput.value = Math.round(qty * recipe.inputQty);
            } else if (recipe.inputType === 'COCONUT') {
                coconutQtyInput.value = Math.round(qty * recipe.inputQty);
            }
            if (recipe.processingCost) {
                procCostInput.value = (qty * recipe.processingCost).toFixed(2);
            }
        }
        calculateProductionCost();
    });

    huskCountInput.addEventListener('input', calculateProductionCost);
    coconutQtyInput.addEventListener('input', calculateProductionCost);
    procCostInput.addEventListener('input', calculateProductionCost);

    // Form
    document.getElementById('productionRunForm').addEventListener('submit', handleExecuteProductionRun);

    // Recipe Modal
    const rModal = document.getElementById('recipeModal');
    document.getElementById('btnOpenRecipeModal').onclick = () => rModal.classList.add('open');
    document.getElementById('btnCloseRecipeModal').onclick = () => rModal.classList.remove('open');
    document.getElementById('btnCancelRecipe').onclick = () => rModal.classList.remove('open');
    document.getElementById('recipeForm').addEventListener('submit', handleSaveRecipe);
}

function calculateProductionCost() {
    const huskCount = Number(document.getElementById('prHuskCount').value) || 0;
    const coconutQty = Number(document.getElementById('prCoconutQty').value) || 0;
    const procCost = Number(document.getElementById('prProcessingCost').value) || 0;
    const producedQty = Number(document.getElementById('prProducedQty').value) || 0;

    const huskCost = huskCount * (liveHuskStock.avgCostPerHusk || 0);
    const coconutCost = coconutQty * (liveCoconutStock.avgCost || 0);
    const rmCost = huskCost + coconutCost;

    const totalBatchCost = rmCost + procCost;
    const unitProductionCost = producedQty > 0 ? (totalBatchCost / producedQty) : 0;

    document.getElementById('calcRmCost').textContent = window.CoconutModule.fmtLKR(rmCost);
    document.getElementById('calcProcCost').textContent = window.CoconutModule.fmtLKR(procCost);
    document.getElementById('calcTotalBatchCost').textContent = window.CoconutModule.fmtLKR(totalBatchCost);
    document.getElementById('calcUnitProductionCost').textContent = `Rs. ${window.CoconutModule.fmt(unitProductionCost, 2)}`;
}

async function loadProductsDropdown() {
    const db = window.CoconutModule.getDb();
    try {
        const snap = await db.collection('coconut_finished_products')
            .doc(appCtx.businessId)
            .collection('items')
            .get();

        allProducts = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.isActive !== false);

        const options = '<option value="">Select Target Product...</option>' +
            allProducts.map(p => `<option value="${p.id}">${window.CoconutModule.esc(p.name)} (${p.unitName})</option>`).join('');

        document.getElementById('prProduct').innerHTML = options;
        document.getElementById('recTargetProduct').innerHTML = options;

    } catch (e) {
        console.warn('Products dropdown error:', e);
    }
}

async function loadHuskAndCoconutStocks() {
    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const [hDoc, cSnap] = await Promise.all([
            db.collection('coconut_husk_raw').doc(bid).collection('items').doc('current').get(),
            db.collection('coconut_raw_coconuts').doc(bid).collection('items').get()
        ]);

        if (hDoc.exists) {
            const hd = hDoc.data() || {};
            const husks = Number(hd.stockHuskCount || hd.stockQtyKg || hd.stockKg) || 0;
            const rate = Number(hd.avgCostPerHusk || hd.avgCostPerKg || hd.lastCostPerHusk) || 0;
            liveHuskStock = {
                husks,
                avgCostPerHusk: rate
            };
        }

        let cQty = 0;
        let cVal = 0;
        cSnap.docs.forEach(doc => {
            const d = doc.data() || {};
            const q = Number(d.stockQty) || 0;
            const c = Number(d.avgCostPerUnit || d.lastUnitCost) || 0;
            cQty += q;
            cVal += (q * c);
        });

        liveCoconutStock = {
            totalQty: cQty,
            avgCost: cQty > 0 ? (cVal / cQty) : 0
        };

        document.getElementById('availHuskDisplay').textContent = `${window.CoconutModule.fmt(liveHuskStock.husks, 0)} husks (Avg Rs.${window.CoconutModule.fmt(liveHuskStock.avgCostPerHusk, 2)})`;

    } catch (e) {
        console.warn('Husk/Coconut load error:', e);
    }
}

async function loadRecipes() {
    const db = window.CoconutModule.getDb();
    const select = document.getElementById('prRecipe');
    const tableBody = document.getElementById('recipeListBody');

    try {
        const snap = await db.collection('coconut_transformations')
            .where('businessId', '==', appCtx.businessId)
            .get();

        allRecipes = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.isActive !== false);

        select.innerHTML = '<option value="">Select Recipe...</option>' +
            allRecipes.map(r => `<option value="${r.id}">${window.CoconutModule.esc(r.name)} (${r.inputQty} ${r.inputType === 'COCONUT' ? 'Nuts' : 'Husks'} → 1 unit)</option>`).join('');

        if (!allRecipes.length) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center" style="padding:20px; color:var(--c-text-muted);">No transformation recipes found. Click "+ Manage Recipes" to add templates.</td></tr>';
            return;
        }

        tableBody.innerHTML = allRecipes.map(r => {
            const p = allProducts.find(x => x.id === r.productId);
            const pName = p ? p.name : 'Finished Product';
            return `
                <tr>
                    <td><strong>${window.CoconutModule.esc(r.name)}</strong></td>
                    <td>${window.CoconutModule.fmt(r.inputQty, 0)} ${r.inputType === 'COCONUT' ? 'Nuts' : 'Husks'} / unit</td>
                    <td>${window.CoconutModule.esc(pName)}</td>
                    <td class="text-right" style="font-weight:700;">Rs. ${window.CoconutModule.fmt(r.processingCost, 2)}</td>
                </tr>
            `;
        }).join('');

    } catch (e) {
        console.warn('Recipes load error:', e);
    }
}

async function loadProductionHistory() {
    const db = window.CoconutModule.getDb();
    const body = document.getElementById('productionHistoryBody');

    try {
        const snap = await db.collection('coconut_production_runs')
            .where('businessId', '==', appCtx.businessId)
            .get();

        const runs = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(r => r.isActive !== false)
            .sort((a, b) => {
                const ta = a.runDate ? (a.runDate.toDate ? a.runDate.toDate().getTime() : new Date(a.runDate).getTime()) : 0;
                const tb = b.runDate ? (b.runDate.toDate ? b.runDate.toDate().getTime() : new Date(b.runDate).getTime()) : 0;
                return tb - ta;
            });

        if (!runs.length) {
            body.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:24px; color:var(--c-text-muted);">No production runs recorded yet.</td></tr>';
            return;
        }

        body.innerHTML = runs.map(r => {
            const dt = window.CoconutModule.formatDate(r.runDate || r.createdAt);
            const huskCount = Number(r.huskConsumedCount || r.huskConsumedKg) || 0;
            const nutCount = Number(r.coconutConsumedQty) || 0;
            let rmDesc = '';
            if (huskCount > 0) rmDesc += `${window.CoconutModule.fmt(huskCount, 0)} husks`;
            if (nutCount > 0) rmDesc += (rmDesc ? ', ' : '') + `${window.CoconutModule.fmt(nutCount, 0)} nuts`;

            return `
                <tr>
                    <td>${dt}</td>
                    <td><strong>${window.CoconutModule.esc(r.transformationName || 'Batch Run')}</strong></td>
                    <td>${window.CoconutModule.esc(r.productName || 'Finished Item')}</td>
                    <td class="text-right" style="font-weight:700;">${window.CoconutModule.fmt(r.producedQty, 0)} units</td>
                    <td>${rmDesc || '-'}</td>
                    <td class="text-right">Rs. ${window.CoconutModule.fmt(r.unitCost, 2)}</td>
                    <td class="text-right" style="font-weight:800; color:var(--c-primary);">${window.CoconutModule.fmtLKR(r.totalRunCost)}</td>
                    <td class="text-center">
                        <button class="c-btn c-btn-danger c-btn-sm" onclick="handleRollbackProductionRun('${r.id}')" title="Reverse batch run & stock">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (e) {
        console.error(e);
        body.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error loading production history</td></tr>';
    }
}

async function handleExecuteProductionRun(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveProduction');
    btn.disabled = true;
    btn.textContent = 'Processing Batch & Posting GL...';

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const dateVal = document.getElementById('prDate').value;
        const recipeId = document.getElementById('prRecipe').value;
        const productId = document.getElementById('prProduct').value;
        const producedQty = Number(document.getElementById('prProducedQty').value) || 0;
        const huskCount = Number(document.getElementById('prHuskCount').value) || 0;
        const coconutQty = Number(document.getElementById('prCoconutQty').value) || 0;
        const processingCost = Number(document.getElementById('prProcessingCost').value) || 0;
        const paymentMode = document.getElementById('prPaymentMode').value;
        const notes = document.getElementById('prNotes').value || '';

        if (producedQty <= 0) {
            alert('Produced Quantity must be greater than 0');
            btn.disabled = false;
            btn.textContent = '🏭 Execute Batch Run & Transfer Inventory';
            return;
        }

        const recipe = allRecipes.find(x => x.id === recipeId);
        const product = allProducts.find(x => x.id === productId);
        const recipeName = recipe ? recipe.name : 'Custom Batch Run';
        const productName = product ? product.name : 'Finished Product';

        // Calculate material cost
        const inputMaterialCost = (huskCount * liveHuskStock.avgCostPerHusk) + (coconutQty * liveCoconutStock.avgCost);
        const totalRunCost = inputMaterialCost + processingCost;
        const unitCost = producedQty > 0 ? (totalRunCost / producedQty) : 0;

        const runId = `RUN_${window.CoconutModule.uid('prod')}`;
        const runDateObj = window.CoconutModule.parseDateAny(dateVal) || new Date();

        const batch = db.batch();

        // 1. Deduct Raw Husk Stock
        if (huskCount > 0) {
            const huskRef = db.collection('coconut_husk_raw').doc(bid).collection('items').doc('current');
            const newHuskCount = Math.max(0, liveHuskStock.husks - huskCount);
            batch.set(huskRef, {
                stockHuskCount: newHuskCount,
                updatedAt: window.CoconutModule.tsToFirestore(new Date())
            }, { merge: true });
        }

        // 2. Increase Finished Product Stock & Recompute Weighted Average Unit Cost
        const prodRef = db.collection('coconut_finished_products').doc(bid).collection('items').doc(productId);
        const curProdDoc = await prodRef.get();
        let curQty = 0;
        let curUnitCost = 0;
        if (curProdDoc.exists) {
            const pd = curProdDoc.data() || {};
            curQty = Number(pd.stockQty) || 0;
            curUnitCost = Number(pd.unitCost) || 0;
        }

        const newProdQty = curQty + producedQty;
        const newTotalProdVal = (curQty * curUnitCost) + totalRunCost;
        const newUnitCost = newProdQty > 0 ? (newTotalProdVal / newProdQty) : unitCost;

        batch.set(prodRef, {
            stockQty: newProdQty,
            unitCost: Number(newUnitCost.toFixed(4)),
            updatedAt: window.CoconutModule.tsToFirestore(new Date())
        }, { merge: true });

        // 3. Save Production Run Doc
        const runRef = db.collection('coconut_production_runs').doc(runId);
        batch.set(runRef, {
            businessId: bid,
            runId,
            transformationId: recipeId || null,
            transformationName: recipeName,
            productId,
            productName,
            huskConsumedCount: huskCount,
            coconutConsumedQty: coconutQty,
            inputMaterialCost: Number(inputMaterialCost.toFixed(2)),
            processingCost: Number(processingCost.toFixed(2)),
            totalRunCost: Number(totalRunCost.toFixed(2)),
            producedQty,
            unitCost: Number(unitCost.toFixed(4)),
            paymentMode,
            notes,
            runDate: window.CoconutModule.tsToFirestore(runDateObj),
            createdAt: window.CoconutModule.tsToFirestore(new Date()),
            isActive: true
        });

        // 4. Post Balanced Double-Entry Inventory Conversion Journal
        const journalLines = [
            { accountCode: '1-1050-03', accountName: 'Inventory (Finished Goods)', debit: totalRunCost, credit: 0 }
        ];

        if (inputMaterialCost > 0) {
            journalLines.push({
                accountCode: '1-1050-02',
                accountName: 'Raw Materials (Coconut Husks & Nuts)',
                debit: 0,
                credit: inputMaterialCost
            });
        }

        if (processingCost > 0) {
            const crCode = paymentMode === 'BANK' ? '1-1020-01' : '1-1010-01';
            const crName = paymentMode === 'BANK' ? 'Bank Account' : 'Cash in Hand';
            journalLines.push({
                accountCode: crCode,
                accountName: crName,
                debit: 0,
                credit: processingCost
            });
        }

        await window.CoconutModule.postJournalEntry({
            businessId: bid,
            description: `Production Run: ${producedQty} units of ${productName} (${recipeName})`,
            referenceType: 'PRODUCTION_CONVERSION',
            ref: runId,
            date: runDateObj,
            lines: journalLines
        });

        await batch.commit();

        window.CoconutModule.showToast(`✅ Production Run completed! Added ${producedQty} ${productName} to inventory.`, 'success');
        document.getElementById('productionRunForm').reset();
        document.getElementById('prDate').value = window.CoconutModule.toLocalDateStr(new Date());

        await loadHuskAndCoconutStocks();
        await loadProductionHistory();

    } catch (err) {
        console.error(err);
        window.CoconutModule.showToast('Production Run failed: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '🏭 Execute Batch Run & Transfer Inventory';
    }
}

async function handleRollbackProductionRun(runId) {
    if (!confirm('Are you sure you want to rollback this production run? This will deduct the finished product and restore the raw materials.')) return;
    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const runRef = db.collection('coconut_production_runs').doc(runId);
        const rDoc = await runRef.get();
        if (!rDoc.exists) return;
        const rd = rDoc.data() || {};

        const huskCount = Number(rd.huskConsumedCount || rd.huskConsumedKg) || 0;
        const prodQty = Number(rd.producedQty) || 0;
        const prodId = rd.productId;

        const batch = db.batch();

        // 1. Restore Raw Husks
        if (huskCount > 0) {
            const huskRef = db.collection('coconut_husk_raw').doc(bid).collection('items').doc('current');
            const hDoc = await huskRef.get();
            if (hDoc.exists) {
                const hd = hDoc.data() || {};
                const curHusks = Number(hd.stockHuskCount || hd.stockQtyKg || hd.stockKg) || 0;
                batch.set(huskRef, {
                    stockHuskCount: curHusks + huskCount,
                    updatedAt: window.CoconutModule.tsToFirestore(new Date())
                }, { merge: true });
            }
        }

        // 2. Deduct Finished Product
        if (prodId && prodQty > 0) {
            const prodRef = db.collection('coconut_finished_products').doc(bid).collection('items').doc(prodId);
            const pDoc = await prodRef.get();
            if (pDoc.exists) {
                const pd = pDoc.data() || {};
                const curQty = Number(pd.stockQty) || 0;
                batch.set(prodRef, {
                    stockQty: Math.max(0, curQty - prodQty),
                    updatedAt: window.CoconutModule.tsToFirestore(new Date())
                }, { merge: true });
            }
        }

        // 3. Mark Run Cancelled
        batch.set(runRef, {
            isActive: false,
            cancelledAt: window.CoconutModule.tsToFirestore(new Date())
        }, { merge: true });

        await batch.commit();

        // 4. Remove Journal Entry
        await window.CoconutModule.deleteJournalForRef(bid, runId);

        window.CoconutModule.showToast('Production Run reverted successfully', 'info');
        await loadHuskAndCoconutStocks();
        await loadProductionHistory();

    } catch (err) {
        window.CoconutModule.showToast('Rollback failed: ' + err.message, 'error');
    }
}

async function handleSaveRecipe(e) {
    e.preventDefault();
    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    const name = document.getElementById('recName').value.trim();
    const inputType = document.getElementById('recInputType').value;
    const inputQty = Number(document.getElementById('recInputQty').value) || 0;
    const productId = document.getElementById('recTargetProduct').value;
    const processingCost = Number(document.getElementById('recProcCost').value) || 0;

    try {
        await db.collection('coconut_transformations').add({
            businessId: bid,
            name,
            inputType,
            inputQty,
            productId,
            processingCost,
            isActive: true,
            createdAt: window.CoconutModule.tsToFirestore(new Date())
        });

        window.CoconutModule.showToast('Transformation recipe saved!', 'success');
        document.getElementById('recipeForm').reset();
        document.getElementById('recipeModal').classList.remove('open');

        await loadRecipes();

    } catch (err) {
        window.CoconutModule.showToast('Failed to save recipe: ' + err.message, 'error');
    }
}
