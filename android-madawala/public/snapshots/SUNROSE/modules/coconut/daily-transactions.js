/**
 * Coconut Wholesale Module — Daily Transactions Hub Engine
 * Consolidated multi-stream audit ledger with instant rollback, edit, and GL sync.
 */

let appCtx = null;
let rawTransactionsList = [];
let activeStream = 'ALL';

document.addEventListener('DOMContentLoaded', async () => {
    appCtx = await window.CoconutModule.guardCoconutPage();
    if (!appCtx) return;

    window.CoconutModule.renderNav('daily-transactions');

    const todayStr = window.CoconutModule.toLocalDateStr(new Date());
    document.getElementById('filterStartDate').value = todayStr;
    document.getElementById('filterEndDate').value = todayStr;

    setupEventHandlers();
    await loadAllTransactions();
});

function setupEventHandlers() {
    // Stream Tab Chips
    document.querySelectorAll('.tx-tab-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.tx-tab-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeStream = chip.dataset.stream;
            filterAndRender();
        });
    });

    // Date Presets
    const presetSelect = document.getElementById('datePresetFilter');
    presetSelect.addEventListener('change', () => {
        const val = presetSelect.value;
        const customStart = document.getElementById('customDateGroup');
        const customEnd = document.getElementById('customDateEndGroup');

        if (val === 'CUSTOM') {
            customStart.style.display = 'block';
            customEnd.style.display = 'block';
        } else {
            customStart.style.display = 'none';
            customEnd.style.display = 'none';
        }
        filterAndRender();
    });

    document.getElementById('filterStartDate').addEventListener('change', filterAndRender);
    document.getElementById('filterEndDate').addEventListener('change', filterAndRender);
    document.getElementById('paymentFilter').addEventListener('change', filterAndRender);
    document.getElementById('searchTxInput').addEventListener('input', filterAndRender);
    document.getElementById('btnRefreshTx').addEventListener('click', loadAllTransactions);

    // Print Daily Report
    document.getElementById('btnPrintDailyReport').addEventListener('click', () => window.print());

    // View Modal
    document.getElementById('btnCloseViewModal').onclick = () => document.getElementById('viewTxModal').classList.remove('open');
    document.getElementById('btnCloseViewBtn').onclick = () => document.getElementById('viewTxModal').classList.remove('open');

    // Edit Modal
    document.getElementById('btnCloseEditModal').onclick = () => document.getElementById('editTxModal').classList.remove('open');
    document.getElementById('btnCancelEdit').onclick = () => document.getElementById('editTxModal').classList.remove('open');
    document.getElementById('editTxForm').addEventListener('submit', handleSaveTransactionEdit);
}

async function loadAllTransactions() {
    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;
    const body = document.getElementById('txTableBody');
    body.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:28px;">Loading transactions from all streams...</td></tr>';

    try {
        const [
            cSnap,
            hSnap,
            sSnap,
            pSnap,
            eSnap,
            paySnap,
            advSnap,
            salSnap,
            finSnap
        ] = await Promise.all([
            db.collection('coconut_raw_material_history').where('businessId', '==', bid).get(),
            db.collection('coconut_husk_purchases').where('businessId', '==', bid).get(),
            db.collection('coconut_sales').where('businessId', '==', bid).get(),
            db.collection('coconut_production_runs').where('businessId', '==', bid).get(),
            db.collection('coconut_expenses').where('businessId', '==', bid).get(),
            db.collection('coconut_payments').where('businessId', '==', bid).get(),
            db.collection('coconut_employee_advances').where('businessId', '==', bid).get(),
            db.collection('coconut_payroll_records').where('businessId', '==', bid).get(),
            db.collection('coconut_finance_transactions').where('businessId', '==', bid).get()
        ]);

        const all = [];

        // 1. Coconut Purchases
        cSnap.docs.forEach(d => {
            const data = d.data() || {};
            if (data.isActive === false) return;
            const dateObj = window.CoconutModule.parseDateAny(data.date || data.createdAt);
            const total = Number(data.totalCost || data.amount) || 0;
            const qty = Number(data.quantity) || 0;
            all.push({
                docId: d.id,
                stream: 'COCONUT_PURCHASE',
                streamName: '🥥 Coconut Purchase',
                badgeClass: 'c-badge-neutral',
                date: dateObj,
                ref: data.purchaseId || d.id,
                title: `${qty.toLocaleString()} Nuts (${data.category || 'GOOD'})`,
                partyName: data.supplierName || 'Direct Coconut Supplier',
                paymentMode: data.paymentMode || 'CASH',
                outflow: total,
                inflow: 0,
                notes: data.notes || '',
                rawData: data
            });
        });

        // 2. Husk Purchases
        hSnap.docs.forEach(d => {
            const data = d.data() || {};
            if (data.isActive === false) return;
            const dateObj = window.CoconutModule.parseDateAny(data.date || data.createdAt);
            const total = Number(data.totalCost || data.amount) || 0;
            const husks = Number(data.huskCount || data.quantityKg) || 0;
            all.push({
                docId: d.id,
                stream: 'HUSK_PURCHASE',
                streamName: '🟤 Husk Purchase',
                badgeClass: 'c-badge-warning',
                date: dateObj,
                ref: data.purchaseId || d.id,
                title: `${husks.toLocaleString()} Husks Yard Bulk`,
                partyName: data.supplierName || 'Husk Supplier',
                paymentMode: data.paymentMode || 'CASH',
                outflow: total,
                inflow: 0,
                notes: data.notes || '',
                rawData: data
            });
        });

        // 3. Sales Invoices
        sSnap.docs.forEach(d => {
            const data = d.data() || {};
            if (data.isActive === false) return;
            const dateObj = window.CoconutModule.parseDateAny(data.date || data.createdAt);
            const amt = Number(data.amount || data.totalAmount) || 0;
            const itemCount = Array.isArray(data.items) ? data.items.length : 1;
            all.push({
                docId: d.id,
                stream: 'SALE',
                streamName: '🛒 Sales Invoice',
                badgeClass: 'c-badge-success',
                date: dateObj,
                ref: data.invoiceNo ? `INV #${data.invoiceNo}` : (data.saleId || d.id),
                title: `Invoice (${itemCount} Line Items)`,
                partyName: data.customerName || 'Direct Customer',
                paymentMode: data.paymentMode || 'CASH',
                outflow: 0,
                inflow: amt,
                notes: data.notes || '',
                rawData: data
            });
        });

        // 4. Production Runs
        pSnap.docs.forEach(d => {
            const data = d.data() || {};
            if (data.isActive === false) return;
            const dateObj = window.CoconutModule.parseDateAny(data.runDate || data.date || data.createdAt);
            const procCost = Number(data.processingCost) || 0;
            const producedQty = Number(data.producedQty) || 0;
            all.push({
                docId: d.id,
                stream: 'PRODUCTION',
                streamName: '🏭 Production Run',
                badgeClass: 'c-badge-info',
                date: dateObj,
                ref: data.runId || d.id,
                title: `${producedQty} units of ${data.productName || 'Finished Goods'}`,
                partyName: data.transformationName || 'Batch Conversion',
                paymentMode: data.paymentMode || 'INTERNAL',
                outflow: procCost,
                inflow: 0,
                notes: data.notes || '',
                rawData: data
            });
        });

        // 5. Operating Expenses
        eSnap.docs.forEach(d => {
            const data = d.data() || {};
            if (data.isActive === false) return;
            const dateObj = window.CoconutModule.parseDateAny(data.date || data.createdAt);
            const amt = Number(data.amount) || 0;
            all.push({
                docId: d.id,
                stream: 'EXPENSE',
                streamName: '🧾 Expense',
                badgeClass: 'c-badge-danger',
                date: dateObj,
                ref: data.expId || d.id,
                title: data.description || 'Operational Expense',
                partyName: data.category || 'General',
                paymentMode: data.paymentMode || 'CASH',
                outflow: amt,
                inflow: 0,
                notes: data.notes || '',
                rawData: data
            });
        });

        // 6. Payments & Receipts
        paySnap.docs.forEach(d => {
            const data = d.data() || {};
            if (data.isActive === false) return;
            const dateObj = window.CoconutModule.parseDateAny(data.date || data.createdAt);
            const amt = Number(data.amount) || 0;
            const isReceipt = data.type === 'CUSTOMER_RECEIPT';
            all.push({
                docId: d.id,
                stream: 'PAYMENT',
                streamName: isReceipt ? '📥 Customer Receipt' : '📤 Supplier Payment',
                badgeClass: isReceipt ? 'c-badge-success' : 'c-badge-danger',
                date: dateObj,
                ref: d.id,
                title: isReceipt ? 'Debt Collection / Receipt' : 'Supplier Balance Settlement',
                partyName: data.partyName || (isReceipt ? 'Customer' : 'Supplier'),
                paymentMode: data.paymentMode || 'CASH',
                outflow: isReceipt ? 0 : amt,
                inflow: isReceipt ? amt : 0,
                notes: data.notes || '',
                rawData: data
            });
        });

        // 7. Employee Advances
        advSnap.docs.forEach(d => {
            const data = d.data() || {};
            if (data.isActive === false) return;
            const dateObj = window.CoconutModule.parseDateAny(data.date || data.createdAt);
            const amt = Number(data.amount) || 0;
            all.push({
                docId: d.id,
                stream: 'ADVANCE_PAYROLL',
                streamName: '💸 Staff Advance',
                badgeClass: 'c-badge-warning',
                date: dateObj,
                ref: data.advanceId || d.id,
                title: `Advance to ${data.staffName || 'Staff'}`,
                partyName: data.staffName || 'Staff Worker',
                paymentMode: data.mode || 'CASH',
                outflow: amt,
                inflow: 0,
                notes: data.remarks || '',
                rawData: data
            });
        });

        // 8. Payroll Records
        salSnap.docs.forEach(d => {
            const data = d.data() || {};
            if (data.isActive === false) return;
            const dateObj = window.CoconutModule.parseDateAny(data.date || data.settledAt || data.createdAt);
            const netAmt = Number(data.netPayable) || 0;
            all.push({
                docId: d.id,
                stream: 'ADVANCE_PAYROLL',
                streamName: '💵 Salary Settlement',
                badgeClass: 'c-badge-info',
                date: dateObj,
                ref: data.payrollRecordId || d.id,
                title: `Salary for ${data.monthStr} (${data.staffName})`,
                partyName: data.staffName || 'Staff',
                paymentMode: data.paymentMode || 'CASH',
                outflow: netAmt,
                inflow: 0,
                notes: `Gross: Rs.${data.grossWage} - Adv: Rs.${data.advancesDeducted}`,
                rawData: data
            });
        });

        // 9. Finance / Bank Transfers
        finSnap.docs.forEach(d => {
            const data = d.data() || {};
            if (data.isActive === false) return;
            const dateObj = window.CoconutModule.parseDateAny(data.date || data.createdAt);
            const amt = Number(data.amount) || 0;
            const isDeposit = data.type === 'DEPOSIT';
            all.push({
                docId: d.id,
                stream: 'BANKING',
                streamName: isDeposit ? '🏦 Bank Deposit' : '🏧 Cash Withdrawal',
                badgeClass: 'c-badge-neutral',
                date: dateObj,
                ref: d.id,
                title: data.description || (isDeposit ? 'Cash Deposit to Bank' : 'Bank ATM Withdrawal'),
                partyName: 'Internal Banking',
                paymentMode: 'TRANSFER',
                outflow: 0,
                inflow: 0,
                notes: data.notes || '',
                rawData: data
            });
        });

        // Sort Descending Chronological
        rawTransactionsList = all.sort((a, b) => {
            const ta = a.date ? a.date.getTime() : 0;
            const tb = b.date ? b.date.getTime() : 0;
            return tb - ta;
        });

        filterAndRender();

    } catch (err) {
        console.error('Error loading daily transactions:', err);
        body.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error loading transactions: ${err.message}</td></tr>`;
    }
}

function filterAndRender() {
    const preset = document.getElementById('datePresetFilter').value;
    const paymentMode = document.getElementById('paymentFilter').value;
    const search = document.getElementById('searchTxInput').value.toLowerCase().trim();

    const now = new Date();
    const todayStr = window.CoconutModule.toLocalDateStr(now);

    let startFilter = null;
    let endFilter = null;

    if (preset === 'TODAY') {
        startFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        endFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (preset === 'YESTERDAY') {
        const y = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        startFilter = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0);
        endFilter = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59);
    } else if (preset === 'THIS_WEEK') {
        const day = now.getDay() || 7;
        const monday = new Date(now.getTime() - (day - 1) * 24 * 60 * 60 * 1000);
        startFilter = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0);
        endFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (preset === 'THIS_MONTH') {
        startFilter = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        endFilter = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (preset === 'CUSTOM') {
        const sVal = document.getElementById('filterStartDate').value;
        const eVal = document.getElementById('filterEndDate').value;
        if (sVal) startFilter = new Date(sVal + 'T00:00:00');
        if (eVal) endFilter = new Date(eVal + 'T23:59:59');
    }

    const filtered = rawTransactionsList.filter(tx => {
        // Stream Filter
        if (activeStream !== 'ALL' && tx.stream !== activeStream) return false;

        // Payment Mode Filter
        if (paymentMode !== 'ALL') {
            const m = String(tx.paymentMode || '').toUpperCase();
            if (m !== paymentMode) return false;
        }

        // Date Filter
        if (startFilter && tx.date && tx.date < startFilter) return false;
        if (endFilter && tx.date && tx.date > endFilter) return false;

        // Search Filter
        if (search) {
            const match = (tx.ref && tx.ref.toLowerCase().includes(search)) ||
                (tx.partyName && tx.partyName.toLowerCase().includes(search)) ||
                (tx.title && tx.title.toLowerCase().includes(search)) ||
                (tx.notes && tx.notes.toLowerCase().includes(search)) ||
                (tx.streamName && tx.streamName.toLowerCase().includes(search));
            if (!match) return false;
        }

        return true;
    });

    // Update Ribbon KPIs
    let totalInflow = 0;
    let totalOutflow = 0;

    filtered.forEach(t => {
        totalInflow += t.inflow;
        totalOutflow += t.outflow;
    });

    const netCashFlow = totalInflow - totalOutflow;

    document.getElementById('kpiTotalInflow').textContent = window.CoconutModule.fmtLKR(totalInflow);
    document.getElementById('kpiTotalOutflow').textContent = window.CoconutModule.fmtLKR(totalOutflow);
    const elNet = document.getElementById('kpiNetCashFlow');
    elNet.textContent = window.CoconutModule.fmtLKR(netCashFlow);
    elNet.style.color = netCashFlow >= 0 ? '#059669' : '#dc2626';
    document.getElementById('kpiTxCount').textContent = filtered.length;

    renderTableRows(filtered);
}

function renderTableRows(list) {
    const body = document.getElementById('txTableBody');
    if (!list.length) {
        body.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:28px; color:var(--c-text-muted);">No transactions match the selected filters.</td></tr>';
        return;
    }

    body.innerHTML = list.map((tx, idx) => {
        const dt = window.CoconutModule.formatDateTime(tx.date);
        const hasOutflow = tx.outflow > 0;
        const hasInflow = tx.inflow > 0;

        return `
            <tr>
                <td style="font-size:12px; color:var(--c-text-muted); white-space:nowrap;">${dt}</td>
                <td><span class="c-badge ${tx.badgeClass}">${tx.streamName}</span></td>
                <td><strong style="font-family:monospace; font-size:12px;">${window.CoconutModule.esc(tx.ref)}</strong></td>
                <td>
                    <strong>${window.CoconutModule.esc(tx.partyName)}</strong>
                    <div style="font-size:11.5px; color:#64748b;">${window.CoconutModule.esc(tx.title)}</div>
                </td>
                <td><span class="c-badge c-badge-neutral">${tx.paymentMode}</span></td>
                <td class="text-right" style="font-weight:700; color:${hasOutflow ? '#dc2626' : '#94a3b8'};">
                    ${hasOutflow ? '-' + window.CoconutModule.fmtLKR(tx.outflow) : '-'}
                </td>
                <td class="text-right" style="font-weight:700; color:${hasInflow ? '#059669' : '#94a3b8'};">
                    ${hasInflow ? '+' + window.CoconutModule.fmtLKR(tx.inflow) : '-'}
                </td>
                <td class="text-center">
                    <div class="action-btn-group">
                        <button type="button" class="c-btn c-btn-secondary c-btn-sm" onclick="viewTransactionDetails('${tx.stream}', '${tx.docId}')" title="View details & journal">👁️</button>
                        <button type="button" class="c-btn c-btn-secondary c-btn-sm" onclick="openEditTransactionModal('${tx.stream}', '${tx.docId}')" title="Edit record">✏️</button>
                        <button type="button" class="c-btn c-btn-danger c-btn-sm" onclick="deleteAndReverseTransaction('${tx.stream}', '${tx.docId}')" title="Delete & reverse stock, balances & GL">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// -------------------------------------------------------------------
// 1. VIEW TRANSACTION DETAILS MODAL
// -------------------------------------------------------------------

async function viewTransactionDetails(stream, docId) {
    const tx = rawTransactionsList.find(t => t.stream === stream && t.docId === docId);
    if (!tx) return;

    document.getElementById('viewTxTitle').textContent = `🔍 ${tx.streamName} — ${tx.ref}`;
    const content = document.getElementById('viewTxContent');

    const dt = window.CoconutModule.formatDateTime(tx.date);
    const raw = tx.rawData || {};

    let detailsHtml = `
        <div style="background:#f8fafc; border-radius:12px; padding:16px; margin-bottom:14px; border:1px solid #e2e8f0;">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="color:#64748b;">Transaction Reference:</span>
                <strong>${tx.ref}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="color:#64748b;">Date & Time:</span>
                <span>${dt}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="color:#64748b;">Party / Supplier / Customer:</span>
                <strong>${window.CoconutModule.esc(tx.partyName)}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="color:#64748b;">Payment Method:</span>
                <span class="c-badge c-badge-neutral">${tx.paymentMode}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="color:#64748b;">Financial Impact:</span>
                <strong style="color:${tx.inflow > 0 ? '#059669' : '#dc2626'}; font-size:15px;">
                    ${tx.inflow > 0 ? '+' + window.CoconutModule.fmtLKR(tx.inflow) : '-' + window.CoconutModule.fmtLKR(tx.outflow)}
                </strong>
            </div>
            ${tx.notes ? `<div style="margin-top:8px; padding-top:8px; border-top:1px dashed #cbd5e1; font-size:12.5px; color:#475569;"><strong>Notes / Reference:</strong> ${window.CoconutModule.esc(tx.notes)}</div>` : ''}
        </div>
    `;

    // Fetch and display linked General Ledger Entry
    try {
        const db = window.CoconutModule.getDb();
        const jSnap = await db.collection('journal').doc(appCtx.businessId).collection('entries')
            .where('ref', '==', tx.ref)
            .get();

        if (!jSnap.empty) {
            const entry = jSnap.docs[0].data();
            const lines = Array.isArray(entry.entries) ? entry.entries : (Array.isArray(entry.lines) ? entry.lines : []);

            detailsHtml += `
                <div style="border:1px solid #0f3b2c; border-radius:12px; padding:14px; background:#f0fdf4;">
                    <div style="font-weight:800; color:#0f3b2c; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
                        <span>⚖️ Linked Double-Entry Journal</span>
                        <span>${entry.referenceType || 'GL Entry'}</span>
                    </div>
                    <table style="width:100%; border-collapse:collapse; font-size:12px;">
                        <thead>
                            <tr style="border-bottom:1px solid #bbf7d0; text-align:left; color:#166534;">
                                <th>Account</th>
                                <th style="text-align:right;">Debit (LKR)</th>
                                <th style="text-align:right;">Credit (LKR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lines.map(l => `
                                <tr>
                                    <td style="padding:4px 0;">${l.accountCode} ${l.accountName}</td>
                                    <td style="text-align:right; font-weight:600; padding:4px 0;">${l.debit > 0 ? window.CoconutModule.fmtLKR(l.debit) : '-'}</td>
                                    <td style="text-align:right; font-weight:600; padding:4px 0;">${l.credit > 0 ? window.CoconutModule.fmtLKR(l.credit) : '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    } catch (e) {
        console.warn('Could not fetch linked journal entry:', e);
    }

    content.innerHTML = detailsHtml;
    document.getElementById('viewTxModal').classList.add('open');
}

// -------------------------------------------------------------------
// 2. EDIT TRANSACTION MODAL
// -------------------------------------------------------------------

function openEditTransactionModal(stream, docId) {
    const tx = rawTransactionsList.find(t => t.stream === stream && t.docId === docId);
    if (!tx) return;

    document.getElementById('editTxStream').value = stream;
    document.getElementById('editTxDocId').value = docId;
    document.getElementById('editTxTitle').textContent = `✏️ Edit ${tx.streamName} (${tx.ref})`;

    const dtStr = window.CoconutModule.toLocalDateStr(tx.date);
    document.getElementById('editTxDate').value = dtStr;
    document.getElementById('editTxPaymentMode').value = tx.paymentMode || 'CASH';
    document.getElementById('editTxNotes').value = tx.notes || '';

    const dynamicBox = document.getElementById('editDynamicFields');
    const raw = tx.rawData || {};

    if (stream === 'COCONUT_PURCHASE') {
        dynamicBox.innerHTML = `
            <div class="c-form-row">
                <div class="c-form-group">
                    <label>Coconut Count (ගෙඩි ගණන) *</label>
                    <input type="number" id="editQty" class="c-input" value="${raw.quantity || 0}" required>
                </div>
                <div class="c-form-group">
                    <label>Rate per Nut (ගෙඩියක මිල) *</label>
                    <input type="number" id="editRate" class="c-input" step="0.1" value="${raw.unitCost || 0}" required>
                </div>
            </div>
            <div class="c-form-group" style="margin-bottom:12px;">
                <label>Transport Cost (ප්‍රවාහන වියදම)</label>
                <input type="number" id="editTransport" class="c-input" value="${raw.transportCost || 0}">
            </div>
        `;
    } else if (stream === 'HUSK_PURCHASE') {
        dynamicBox.innerHTML = `
            <div class="c-form-row">
                <div class="c-form-group">
                    <label>Husk Count (ලෙලි ගෙඩි ගණන) *</label>
                    <input type="number" id="editQty" class="c-input" value="${raw.huskCount || 0}" required>
                </div>
                <div class="c-form-group">
                    <label>Rate per Husk (ලෙල්ලක මිල) *</label>
                    <input type="number" id="editRate" class="c-input" step="0.1" value="${raw.costPerHusk || 0}" required>
                </div>
            </div>
            <div class="c-form-group" style="margin-bottom:12px;">
                <label>Transport Cost</label>
                <input type="number" id="editTransport" class="c-input" value="${raw.transportCost || 0}">
            </div>
        `;
    } else if (stream === 'EXPENSE' || stream === 'PAYMENT' || stream === 'ADVANCE_PAYROLL') {
        const curAmt = raw.amount || raw.netPayable || tx.outflow || tx.inflow;
        dynamicBox.innerHTML = `
            <div class="c-form-group" style="margin-bottom:12px;">
                <label>Transaction Amount (LKR) *</label>
                <input type="number" id="editAmount" class="c-input" step="1" value="${curAmt}" required>
            </div>
        `;
    } else {
        dynamicBox.innerHTML = `
            <div style="font-size:12px; color:#64748b; margin-bottom:12px;">
                Note: Editing complex batch items or multi-line sales will update header values and linked GL journals.
            </div>
        `;
    }

    document.getElementById('editTxModal').classList.add('open');
}

async function handleSaveTransactionEdit(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveEditTx');
    btn.disabled = true;
    btn.textContent = 'Saving changes & syncing...';

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    const stream = document.getElementById('editTxStream').value;
    const docId = document.getElementById('editTxDocId').value;
    const tx = rawTransactionsList.find(t => t.stream === stream && t.docId === docId);
    if (!tx) return;

    try {
        const newDateStr = document.getElementById('editTxDate').value;
        const newDateObj = window.CoconutModule.parseDateAny(newDateStr) || new Date();
        const newMode = document.getElementById('editTxPaymentMode').value;
        const newNotes = document.getElementById('editTxNotes').value.trim();

        const batch = db.batch();

        if (stream === 'COCONUT_PURCHASE') {
            const newQty = Number(document.getElementById('editQty').value) || 0;
            const newRate = Number(document.getElementById('editRate').value) || 0;
            const newTrans = Number(document.getElementById('editTransport').value) || 0;
            const newTotal = (newQty * newRate) + newTrans;
            const effectiveRate = newQty > 0 ? (newTotal / newQty) : newRate;

            const oldQty = Number(tx.rawData?.quantity) || 0;
            const cat = tx.rawData?.category || 'GOOD';

            // 1. Stock Adjustment
            const stockRef = db.collection('coconut_raw_coconuts').doc(bid).collection('items').doc(cat);
            const sDoc = await stockRef.get();
            if (sDoc.exists) {
                const sd = sDoc.data() || {};
                const curQty = Number(sd.stockQty) || 0;
                const adjustedQty = Math.max(0, curQty - oldQty + newQty);
                batch.set(stockRef, { stockQty: adjustedQty, updatedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
            }

            // 2. Update Purchase Record
            const pRef = db.collection('coconut_raw_material_history').doc(docId);
            batch.set(pRef, {
                quantity: newQty,
                unitCost: newRate,
                transportCost: newTrans,
                totalCost: newTotal,
                effectiveCostPerNut: effectiveRate,
                paymentMode: newMode,
                notes: newNotes,
                date: window.CoconutModule.tsToFirestore(newDateObj),
                updatedAt: window.CoconutModule.tsToFirestore(new Date())
            }, { merge: true });

            // 3. Remove old Journal & Post New Balanced Journal
            await window.CoconutModule.deleteJournalForRef(bid, tx.ref);
            let creditAccount = newMode === 'BANK' ? '1-1020-01' : (newMode === 'CREDIT' ? '2-2010-01' : '1-1010-01');
            let creditAccountName = newMode === 'BANK' ? 'Bank Account' : (newMode === 'CREDIT' ? 'Accounts Payable' : 'Cash in Drawer');

            await window.CoconutModule.postJournalEntry({
                businessId: bid,
                description: `Coconut Purchase (Updated): ${newQty.toLocaleString()} nuts from ${tx.partyName}`,
                referenceType: 'COCONUT_PURCHASE',
                ref: tx.ref,
                date: newDateObj,
                lines: [
                    { accountCode: '1-1050-01', accountName: 'Raw Materials - Fresh Coconuts', debit: newTotal, credit: 0 },
                    { accountCode: creditAccount, accountName: creditAccountName, debit: 0, credit: newTotal }
                ]
            });

        } else if (stream === 'HUSK_PURCHASE') {
            const newCount = Number(document.getElementById('editQty').value) || 0;
            const newRate = Number(document.getElementById('editRate').value) || 0;
            const newTrans = Number(document.getElementById('editTransport').value) || 0;
            const newTotal = (newCount * newRate) + newTrans;
            const effectiveRate = newCount > 0 ? (newTotal / newCount) : newRate;

            const oldCount = Number(tx.rawData?.huskCount || tx.rawData?.quantityKg) || 0;

            // 1. Stock Adjustment
            const huskRef = db.collection('coconut_husk_raw').doc(bid).collection('items').doc('current');
            const hDoc = await huskRef.get();
            if (hDoc.exists) {
                const hd = hDoc.data() || {};
                const curHusks = Number(hd.stockHuskCount || hd.stockQtyKg || hd.stockKg) || 0;
                const adjustedHusks = Math.max(0, curHusks - oldCount + newCount);
                batch.set(huskRef, { stockHuskCount: adjustedHusks, updatedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
            }

            // 2. Update Purchase Record
            const hpRef = db.collection('coconut_husk_purchases').doc(docId);
            batch.set(hpRef, {
                huskCount: newCount,
                costPerHusk: newRate,
                transportCost: newTrans,
                totalCost: newTotal,
                effectiveCostPerHusk: effectiveRate,
                paymentMode: newMode,
                notes: newNotes,
                date: window.CoconutModule.tsToFirestore(newDateObj),
                updatedAt: window.CoconutModule.tsToFirestore(new Date())
            }, { merge: true });

            // 3. Update Journal
            await window.CoconutModule.deleteJournalForRef(bid, tx.ref);
            let creditAccount = newMode === 'BANK' ? '1-1020-01' : (newMode === 'CREDIT' ? '2-2010-01' : '1-1010-01');
            let creditAccountName = newMode === 'BANK' ? 'Bank Account' : (newMode === 'CREDIT' ? 'Accounts Payable' : 'Cash in Drawer');

            await window.CoconutModule.postJournalEntry({
                businessId: bid,
                description: `Husk Purchase (Updated): ${newCount.toLocaleString()} husks from ${tx.partyName}`,
                referenceType: 'HUSK_PURCHASE',
                ref: tx.ref,
                date: newDateObj,
                lines: [
                    { accountCode: '1-1050-02', accountName: 'Raw Materials - Coconut Husks', debit: newTotal, credit: 0 },
                    { accountCode: creditAccount, accountName: creditAccountName, debit: 0, credit: newTotal }
                ]
            });

        } else if (stream === 'EXPENSE') {
            const newAmt = Number(document.getElementById('editAmount').value) || 0;
            const expRef = db.collection('coconut_expenses').doc(docId);
            batch.set(expRef, {
                amount: newAmt,
                paymentMode: newMode,
                description: newNotes || tx.rawData?.description || 'Expense',
                date: window.CoconutModule.tsToFirestore(newDateObj),
                updatedAt: window.CoconutModule.tsToFirestore(new Date())
            }, { merge: true });

            await window.CoconutModule.deleteJournalForRef(bid, tx.ref);
            await window.CoconutModule.deleteJournalForRef(bid, `coconut_expenses/${docId}`);

            const crAccount = newMode === 'BANK' ? '1-1020-01' : '1-1010-01';
            const crName = newMode === 'BANK' ? 'Bank Account' : 'Cash in Drawer';

            await window.CoconutModule.postJournalEntry({
                businessId: bid,
                description: `Expense (Updated): ${newNotes || tx.rawData?.description || 'Expense'}`,
                referenceType: 'EXPENSE',
                ref: `coconut_expenses/${docId}`,
                date: newDateObj,
                lines: [
                    { accountCode: '5-5010-01', accountName: `Operational Expense (${tx.rawData?.category || 'General'})`, debit: newAmt, credit: 0 },
                    { accountCode: crAccount, accountName: crName, debit: 0, credit: newAmt }
                ]
            });
        }

        await batch.commit();

        window.CoconutModule.showToast('✅ Record updated and General Ledger synced!', 'success');
        document.getElementById('editTxModal').classList.remove('open');
        await loadAllTransactions();

    } catch (err) {
        console.error('Error editing transaction:', err);
        window.CoconutModule.showToast('Failed to update record: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '💾 Save Changes & Sync GL';
    }
}

// -------------------------------------------------------------------
// 3. UNIVERSAL DELETE & REVERSAL ENGINE
// -------------------------------------------------------------------

async function deleteAndReverseTransaction(stream, docId) {
    const tx = rawTransactionsList.find(t => t.stream === stream && t.docId === docId);
    if (!tx) return;

    if (!confirm(`⚠️ ARE YOU SURE YOU WANT TO DELETE & REVERSE THIS RECORD?\n\nTransaction: ${tx.streamName} (${tx.ref})\nParty: ${tx.partyName}\nAmount: Rs. ${(tx.outflow || tx.inflow).toLocaleString()}\n\nThis will automatically reverse inventory quantities, restore customer/supplier balances, and remove the journal entry from accounting.`)) {
        return;
    }

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const batch = db.batch();

        if (stream === 'COCONUT_PURCHASE') {
            const qty = Number(tx.rawData?.quantity) || 0;
            const cat = tx.rawData?.category || 'GOOD';

            // 1. Reverse Stock
            const catStockRef = db.collection('coconut_raw_coconuts').doc(bid).collection('items').doc(cat);
            const catDoc = await catStockRef.get();
            if (catDoc.exists) {
                const curQty = Number(catDoc.data()?.stockQty) || 0;
                batch.set(catStockRef, { stockQty: Math.max(0, curQty - qty), updatedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
            }

            // 2. Mark Purchase Inactive
            const pRef = db.collection('coconut_raw_material_history').doc(docId);
            batch.set(pRef, { isActive: false, deletedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });

            // 3. Delete Linked Journal
            await window.CoconutModule.deleteJournalForRef(bid, tx.ref);

        } else if (stream === 'HUSK_PURCHASE') {
            const husks = Number(tx.rawData?.huskCount || tx.rawData?.quantityKg) || 0;

            // 1. Reverse Stock
            const huskStockRef = db.collection('coconut_husk_raw').doc(bid).collection('items').doc('current');
            const hDoc = await huskStockRef.get();
            if (hDoc.exists) {
                const curHusks = Number(hDoc.data()?.stockHuskCount || hDoc.data()?.stockQtyKg || hDoc.data()?.stockKg) || 0;
                batch.set(huskStockRef, { stockHuskCount: Math.max(0, curHusks - husks), updatedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
            }

            // 2. Mark Inactive
            const hpRef = db.collection('coconut_husk_purchases').doc(docId);
            batch.set(hpRef, { isActive: false, deletedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });

            // 3. Delete Journal
            await window.CoconutModule.deleteJournalForRef(bid, tx.ref);

        } else if (stream === 'SALE') {
            // Restore inventory for each item
            const items = tx.rawData?.items || [];
            for (const itm of items) {
                if (itm.itemType === 'COCONUT') {
                    const cat = itm.refId || 'GOOD';
                    const cRef = db.collection('coconut_raw_coconuts').doc(bid).collection('items').doc(cat);
                    const cDoc = await cRef.get();
                    if (cDoc.exists) {
                        const cur = Number(cDoc.data()?.stockQty) || 0;
                        batch.set(cRef, { stockQty: cur + (Number(itm.qty) || 0), updatedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
                    }
                } else if (itm.itemType === 'PRODUCT') {
                    const prodId = itm.refId;
                    const prRef = db.collection('coconut_finished_products').doc(bid).collection('items').doc(prodId);
                    const prDoc = await prRef.get();
                    if (prDoc.exists) {
                        const cur = Number(prDoc.data()?.stockQty) || 0;
                        batch.set(prRef, { stockQty: cur + (Number(itm.qty) || 0), updatedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
                    }
                }
            }

            // Reverse Customer balance if credit
            if (tx.rawData?.paymentMode === 'CREDIT' && tx.rawData?.customerId) {
                const custRef = db.collection('coconut_customers').doc(tx.rawData.customerId);
                const custDoc = await custRef.get();
                if (custDoc.exists) {
                    const curBal = Number(custDoc.data()?.balance) || 0;
                    batch.set(custRef, { balance: Math.max(0, curBal - (tx.inflow || 0)), updatedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
                }
            }

            // Mark Inactive
            const saleRef = db.collection('coconut_sales').doc(docId);
            batch.set(saleRef, { isActive: false, deletedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });

            // Delete Journal
            await window.CoconutModule.deleteJournalForRef(bid, `coconut_sales/${docId}`);
            await window.CoconutModule.deleteJournalForRef(bid, tx.ref);

        } else if (stream === 'EXPENSE') {
            const expRef = db.collection('coconut_expenses').doc(docId);
            batch.set(expRef, { isActive: false, deletedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
            await window.CoconutModule.deleteJournalForRef(bid, `coconut_expenses/${docId}`);
            await window.CoconutModule.deleteJournalForRef(bid, tx.ref);

        } else if (stream === 'PAYMENT') {
            const isReceipt = tx.rawData?.type === 'CUSTOMER_RECEIPT';
            const amt = Number(tx.rawData?.amount) || 0;

            if (isReceipt && tx.rawData?.partyId) {
                const cRef = db.collection('coconut_customers').doc(tx.rawData.partyId);
                const cDoc = await cRef.get();
                if (cDoc.exists) {
                    const curBal = Number(cDoc.data()?.balance) || 0;
                    batch.set(cRef, { balance: curBal + amt, updatedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
                }
            } else if (!isReceipt && tx.rawData?.partyId) {
                const sRef = db.collection('coconut_suppliers').doc(tx.rawData.partyId);
                const sDoc = await sRef.get();
                if (sDoc.exists) {
                    const curBal = Number(sDoc.data()?.balance) || 0;
                    batch.set(sRef, { balance: curBal + amt, updatedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
                }
            }

            const payRef = db.collection('coconut_payments').doc(docId);
            batch.set(payRef, { isActive: false, deletedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
            await window.CoconutModule.deleteJournalForRef(bid, `coconut_payments/${docId}`);
            await window.CoconutModule.deleteJournalForRef(bid, tx.ref);

        } else if (stream === 'PRODUCTION') {
            const huskCount = Number(tx.rawData?.huskConsumedCount || tx.rawData?.huskConsumedKg) || 0;
            const prodQty = Number(tx.rawData?.producedQty) || 0;
            const prodId = tx.rawData?.productId;

            if (huskCount > 0) {
                const huskRef = db.collection('coconut_husk_raw').doc(bid).collection('items').doc('current');
                const hDoc = await huskRef.get();
                if (hDoc.exists) {
                    const cur = Number(hDoc.data()?.stockHuskCount || hDoc.data()?.stockQtyKg || hDoc.data()?.stockKg) || 0;
                    batch.set(huskRef, { stockHuskCount: cur + huskCount, updatedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
                }
            }

            if (prodId && prodQty > 0) {
                const prodRef = db.collection('coconut_finished_products').doc(bid).collection('items').doc(prodId);
                const pDoc = await prodRef.get();
                if (pDoc.exists) {
                    const cur = Number(pDoc.data()?.stockQty) || 0;
                    batch.set(prodRef, { stockQty: Math.max(0, cur - prodQty), updatedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
                }
            }

            const runRef = db.collection('coconut_production_runs').doc(docId);
            batch.set(runRef, { isActive: false, deletedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
            await window.CoconutModule.deleteJournalForRef(bid, tx.ref);

        } else if (stream === 'ADVANCE_PAYROLL') {
            if (tx.rawData?.advanceId) {
                const advRef = db.collection('coconut_employee_advances').doc(docId);
                batch.set(advRef, { isActive: false, deletedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
                await window.CoconutModule.deleteJournalForRef(bid, tx.ref);
            } else if (tx.rawData?.payrollRecordId) {
                const payRef = db.collection('coconut_payroll_records').doc(docId);
                batch.set(payRef, { isActive: false, deletedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
                await window.CoconutModule.deleteJournalForRef(bid, tx.ref);
            }
        }

        await batch.commit();

        window.CoconutModule.showToast(`✅ Transaction reversed and deleted successfully!`, 'success');
        await loadAllTransactions();

    } catch (err) {
        console.error('Error reversing transaction:', err);
        window.CoconutModule.showToast('Failed to delete transaction: ' + err.message, 'error');
    }
}
