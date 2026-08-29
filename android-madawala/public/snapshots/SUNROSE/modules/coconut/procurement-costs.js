/**
 * Coconut Wholesale Module — Procurement Cost Analytics Logic
 */

let appCtx = null;

document.addEventListener('DOMContentLoaded', async () => {
    appCtx = await window.CoconutModule.guardCoconutPage();
    if (!appCtx) return;

    window.CoconutModule.renderNav('procurement-costs');

    await loadProcurementAnalytics();
    await loadBenchmarkSettings();

    document.getElementById('benchmarkForm').addEventListener('submit', handleSaveBenchmarks);
});

async function loadProcurementAnalytics() {
    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;
    const startMonth = window.CoconutModule.startOfMonth();

    try {
        const [cSnap, hSnap, sSnap] = await Promise.all([
            db.collection('coconut_purchases').where('businessId', '==', bid).get(),
            db.collection('coconut_husk_purchases').where('businessId', '==', bid).get(),
            db.collection('coconut_suppliers').where('businessId', '==', bid).get()
        ]);

        const supplierMap = {};
        sSnap.docs.forEach(d => {
            const s = d.data() || {};
            supplierMap[d.id] = {
                name: s.name || 'Supplier',
                area: s.area || s.estateLocation || '-',
                coconutQty: 0,
                coconutSpend: 0,
                huskQty: 0,
                huskSpend: 0,
                totalSpend: 0
            };
        });

        let monthCoconutQty = 0;
        let monthCoconutSpend = 0;
        let coconutRates = [];
        let monthHuskQty = 0;
        let monthHuskSpend = 0;
        let huskRates = [];
        let totalTransport = 0;
        let totalSpendAll = 0;
        let batchCount = 0;

        const allLogs = [];

        // 1. Process Fresh Coconut Purchases
        cSnap.docs.forEach(doc => {
            const p = doc.data() || {};
            if (p.isActive === false) return;
            const dt = window.CoconutModule.parseDateAny(p.date || p.createdAt);
            const qty = Number(p.quantity || (Number(p.gradeA_qty || 0) + Number(p.gradeB_qty || 0) + Number(p.gradeC_qty || 0))) || 0;
            const trans = Number(p.transportCost) || 0;
            const total = Number(p.totalCost || p.amount) || 0;
            const rate = qty > 0 ? (total - trans) / qty : (Number(p.unitCost || p.ratePerNut) || 0);
            const supId = p.supplierId;
            const supName = p.supplierName || 'Coconut Supplier';

            allLogs.push({
                date: dt,
                type: '🥥 Fresh Coconut',
                supplierName: supName,
                paymentMode: p.paymentMode || 'CASH',
                quantity: `${window.CoconutModule.fmt(qty, 0)} nuts`,
                unitRate: rate,
                transport: trans,
                totalCost: total
            });

            if (dt && dt >= startMonth) {
                monthCoconutQty += qty;
                monthCoconutSpend += (total - trans);
                if (rate > 0) coconutRates.push(rate);
                totalTransport += trans;
                totalSpendAll += total;
                batchCount++;
            }

            const targetKey = supId || supName.trim().toLowerCase();
            if (!supplierMap[targetKey]) {
                supplierMap[targetKey] = {
                    name: supName,
                    area: p.supplierArea || '-',
                    coconutQty: 0,
                    coconutSpend: 0,
                    huskQty: 0,
                    huskSpend: 0,
                    totalSpend: 0
                };
            }
            supplierMap[targetKey].coconutQty += qty;
            supplierMap[targetKey].coconutSpend += total;
            supplierMap[targetKey].totalSpend += total;
        });

        // 2. Process Raw Husk Purchases
        hSnap.docs.forEach(doc => {
            const h = doc.data() || {};
            if (h.isActive === false) return;
            const dt = window.CoconutModule.parseDateAny(h.date || h.createdAt);
            const qty = Number(h.huskCount || h.quantityKg || h.quantity || h.stockHuskCount) || 0;
            const trans = Number(h.transportCost) || 0;
            const total = Number(h.totalCost || h.amount) || 0;
            const rate = qty > 0 ? (total - trans) / qty : (Number(h.costPerHusk || h.costPerKg || h.rate) || 0);
            const supId = h.supplierId;
            const supName = h.supplierName || 'Husk Supplier';

            allLogs.push({
                date: dt,
                type: '🟤 Raw Husk',
                supplierName: supName,
                paymentMode: h.paymentMode || 'CASH',
                quantity: `${window.CoconutModule.fmt(qty, 0)} husks`,
                unitRate: rate,
                transport: trans,
                totalCost: total
            });

            if (dt && dt >= startMonth) {
                monthHuskQty += qty;
                monthHuskSpend += (total - trans);
                if (rate > 0) huskRates.push(rate);
                totalTransport += trans;
                totalSpendAll += total;
                batchCount++;
            }

            const targetKey = supId || supName.trim().toLowerCase();
            if (!supplierMap[targetKey]) {
                supplierMap[targetKey] = {
                    name: supName,
                    area: h.supplierArea || '-',
                    coconutQty: 0,
                    coconutSpend: 0,
                    huskQty: 0,
                    huskSpend: 0,
                    totalSpend: 0
                };
            }
            supplierMap[targetKey].huskQty += qty;
            supplierMap[targetKey].huskSpend += total;
            supplierMap[targetKey].totalSpend += total;
        });

        // Update KPIs
        const avgCoconut = monthCoconutQty > 0 ? (monthCoconutSpend / monthCoconutQty) : 0;
        const minCoconut = coconutRates.length ? Math.min(...coconutRates) : 0;
        const maxCoconut = coconutRates.length ? Math.max(...coconutRates) : 0;

        document.getElementById('kpiAvgCoconutRate').textContent = `Rs. ${window.CoconutModule.fmt(avgCoconut, 2)}`;
        document.getElementById('kpiMinMaxCoconut').textContent = `Min: Rs. ${window.CoconutModule.fmt(minCoconut, 2)} / Max: Rs. ${window.CoconutModule.fmt(maxCoconut, 2)} (${window.CoconutModule.fmt(monthCoconutQty, 0)} nuts)`;

        const avgHusk = monthHuskQty > 0 ? (monthHuskSpend / monthHuskQty) : 0;
        const minHusk = huskRates.length ? Math.min(...huskRates) : 0;
        const maxHusk = huskRates.length ? Math.max(...huskRates) : 0;

        document.getElementById('kpiAvgHuskRate').textContent = `Rs. ${window.CoconutModule.fmt(avgHusk, 2)} / husk`;
        document.getElementById('kpiMinMaxHusk').textContent = `Min: Rs. ${window.CoconutModule.fmt(minHusk, 2)} / Max: Rs. ${window.CoconutModule.fmt(maxHusk, 2)} (${window.CoconutModule.fmt(monthHuskQty, 0)} husks)`;

        document.getElementById('kpiTotalTransportCost').textContent = window.CoconutModule.fmtLKR(totalTransport);
        const transShare = totalSpendAll > 0 ? ((totalTransport / totalSpendAll) * 100).toFixed(1) : 0;
        document.getElementById('kpiTransportShare').textContent = `${transShare}% of landed procurement`;

        document.getElementById('kpiTotalProcurementSpend').textContent = window.CoconutModule.fmtLKR(totalSpendAll);
        document.getElementById('kpiProcurementBatches').textContent = `${batchCount} batches recorded this month`;

        // 3. Render Combined Procurement Inflow Log
        const logBody = document.getElementById('procurementLogTableBody');
        allLogs.sort((a, b) => {
            const ta = a.date ? a.date.getTime() : 0;
            const tb = b.date ? b.date.getTime() : 0;
            return tb - ta;
        });

        if (!allLogs.length) {
            logBody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:20px; color:var(--c-text-muted);">No procurement records found.</td></tr>';
        } else {
            logBody.innerHTML = allLogs.map(l => {
                const dt = window.CoconutModule.formatDateTime(l.date);
                return `
                    <tr>
                        <td style="font-size:12px; color:var(--c-text-muted);">${dt}</td>
                        <td><strong>${window.CoconutModule.esc(l.type)}</strong></td>
                        <td><strong>${window.CoconutModule.esc(l.supplierName)}</strong></td>
                        <td><span class="c-badge c-badge-neutral">${window.CoconutModule.esc(l.paymentMode)}</span></td>
                        <td class="text-right" style="font-weight:700;">${l.quantity}</td>
                        <td class="text-right">Rs. ${window.CoconutModule.fmt(l.unitRate, 2)}</td>
                        <td class="text-right" style="color:var(--c-warning);">Rs. ${window.CoconutModule.fmt(l.transport, 2)}</td>
                        <td class="text-right" style="font-weight:800; color:var(--c-primary);">${window.CoconutModule.fmtLKR(l.totalCost)}</td>
                    </tr>
                `;
            }).join('');
        }

        // 4. Render Supplier Table
        const sBody = document.getElementById('supplierCostTableBody');
        const activeSuppliers = Object.values(supplierMap).filter(s => s.totalSpend > 0).sort((a, b) => b.totalSpend - a.totalSpend);

        if (!activeSuppliers.length) {
            sBody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding:20px; color:var(--c-text-muted);">No supplier purchases recorded yet.</td></tr>';
            return;
        }

        sBody.innerHTML = activeSuppliers.map(s => {
            const avgNut = s.coconutQty > 0 ? (s.coconutSpend / s.coconutQty) : 0;
            const avgHuskVal = s.huskQty > 0 ? (s.huskSpend / s.huskQty) : 0;

            return `
                <tr>
                    <td><strong>${window.CoconutModule.esc(s.name)}</strong></td>
                    <td>${window.CoconutModule.esc(s.area)}</td>
                    <td class="text-right">${s.coconutQty > 0 ? `${window.CoconutModule.fmt(s.coconutQty, 0)} nuts` : '-'}</td>
                    <td class="text-right">${s.coconutQty > 0 ? `Rs. ${window.CoconutModule.fmt(avgNut, 2)}` : '-'}</td>
                    <td class="text-right">${s.huskQty > 0 ? `${window.CoconutModule.fmt(s.huskQty, 0)} husks` : '-'}</td>
                    <td class="text-right">${s.huskQty > 0 ? `Rs. ${window.CoconutModule.fmt(avgHuskVal, 2)}` : '-'}</td>
                    <td class="text-right" style="font-weight:800; color:var(--c-primary);">${window.CoconutModule.fmtLKR(s.totalSpend)}</td>
                </tr>
            `;
        }).join('');

    } catch (e) {
        console.error('Procurement analytics error:', e);
    }
}

async function loadBenchmarkSettings() {
    const db = window.CoconutModule.getDb();
    try {
        const doc = await db.collection('businesses').doc(appCtx.businessId).get();
        if (doc.exists) {
            const b = doc.data().coconutBenchmarks || {};
            if (b.targetGradeA) document.getElementById('targetGradeA').value = b.targetGradeA;
            if (b.targetGradeB) document.getElementById('targetGradeB').value = b.targetGradeB;
            if (b.targetHuskKg) document.getElementById('targetHuskKg').value = b.targetHuskKg;
        }
    } catch (e) { }
}

async function handleSaveBenchmarks(e) {
    e.preventDefault();
    const db = window.CoconutModule.getDb();
    const targetGradeA = Number(document.getElementById('targetGradeA').value) || 0;
    const targetGradeB = Number(document.getElementById('targetGradeB').value) || 0;
    const targetHuskKg = Number(document.getElementById('targetHuskKg').value) || 0;

    try {
        await db.collection('businesses').doc(appCtx.businessId).set({
            coconutBenchmarks: { targetGradeA, targetGradeB, targetHuskKg },
            updatedAt: window.CoconutModule.tsToFirestore(new Date())
        }, { merge: true });

        window.CoconutModule.showToast('Benchmark rates saved!', 'success');
    } catch (e) {
        window.CoconutModule.showToast('Failed to save benchmarks: ' + e.message, 'error');
    }
}
