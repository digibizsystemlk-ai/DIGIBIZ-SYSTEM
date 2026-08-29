/**
 * Coconut Wholesale Module — Finance & Ledger Hub Logic
 * Includes Cash & Banking, Customer Receivables, Supplier Payables, and Settlements
 */

let appCtx = null;
let allBankingTx = [];
let allCustomers = [];
let allSuppliers = [];
let allSettlements = [];

document.addEventListener('DOMContentLoaded', async () => {
    appCtx = await window.CoconutModule.guardCoconutPage();
    if (!appCtx) return;

    window.CoconutModule.renderNav('finance-ledger');

    const todayStr = window.CoconutModule.toLocalDateStr(new Date());
    if (document.getElementById('txDate')) document.getElementById('txDate').value = todayStr;
    if (document.getElementById('crDate')) document.getElementById('crDate').value = todayStr;
    if (document.getElementById('sdDate')) document.getElementById('sdDate').value = todayStr;

    setupEventHandlers();

    // Check URL parameters for view
    const urlParams = new URLSearchParams(window.location.search);
    const requestedView = urlParams.get('view');
    if (requestedView) {
        switchFinTab(requestedView);
    } else {
        switchFinTab('banking');
    }

    await loadAllFinanceData();
});

// --- Tab Switching Navigation ---
window.switchFinTab = function (tabKey) {
    const tabs = ['banking', 'receivables', 'payables', 'settlements'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tabBtn${t.charAt(0).toUpperCase() + t.slice(1)}`);
        const content = document.getElementById(`tabContent${t.charAt(0).toUpperCase() + t.slice(1)}`);
        if (btn) {
            if (t === tabKey) btn.classList.add('active');
            else btn.classList.remove('active');
        }
        if (content) {
            content.style.display = (t === tabKey) ? 'block' : 'none';
        }
    });

    // Update URL query state without full reload
    const url = new URL(window.location.href);
    url.searchParams.set('view', tabKey);
    window.history.replaceState({}, '', url.toString());
};

function setupEventHandlers() {
    // Banking modal
    const modal = document.getElementById('transferModal');
    const openBtn = document.getElementById('btnOpenNewTx');
    if (openBtn) {
        openBtn.onclick = () => {
            document.getElementById('transferForm').reset();
            document.getElementById('txDate').value = window.CoconutModule.toLocalDateStr(new Date());
            modal.classList.add('open');
        };
    }
    const closeBtn = document.getElementById('btnCloseTxModal');
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('open');
    const cancelBtn = document.getElementById('btnCancelTx');
    if (cancelBtn) cancelBtn.onclick = () => modal.classList.remove('open');

    // Forms
    const transferForm = document.getElementById('transferForm');
    if (transferForm) transferForm.addEventListener('submit', handleSaveTransaction);

    const crForm = document.getElementById('customerReceiptForm');
    if (crForm) crForm.addEventListener('submit', handleSaveCustReceipt);

    const sdForm = document.getElementById('supplierDisburseForm');
    if (sdForm) sdForm.addEventListener('submit', handleSaveSupDisburse);

    // Customer / Supplier Selection Balance Updates
    const crCust = document.getElementById('crCustomer');
    if (crCust) {
        crCust.addEventListener('change', () => {
            const custId = crCust.value;
            const c = allCustomers.find(item => item.id === custId);
            const bal = c ? (Number(c.balance) || 0) : 0;
            document.getElementById('crCurBalance').textContent = window.CoconutModule.fmtLKR(bal);
        });
    }

    const sdSup = document.getElementById('sdSupplier');
    if (sdSup) {
        sdSup.addEventListener('change', () => {
            const supId = sdSup.value;
            const s = allSuppliers.find(item => item.id === supId);
            const bal = s ? (Number(s.balance) || 0) : 0;
            document.getElementById('sdCurBalance').textContent = window.CoconutModule.fmtLKR(bal);
        });
    }

    // Search event listeners
    const searchBanking = document.getElementById('searchBankingTx');
    if (searchBanking) {
        searchBanking.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            const filtered = allBankingTx.filter(tx => 
                (tx.description || tx.notes || '').toLowerCase().includes(q) ||
                (tx.type || '').toLowerCase().includes(q)
            );
            renderBankingTable(filtered);
        });
    }

    const searchRec = document.getElementById('searchReceivables');
    if (searchRec) {
        searchRec.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            const filtered = allCustomers.filter(c => 
                (c.name || '').toLowerCase().includes(q) ||
                (c.phone || '').toLowerCase().includes(q) ||
                (c.area || c.address || '').toLowerCase().includes(q)
            );
            renderReceivablesTable(filtered);
        });
    }

    const searchPay = document.getElementById('searchPayables');
    if (searchPay) {
        searchPay.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            const filtered = allSuppliers.filter(s => 
                (s.name || '').toLowerCase().includes(q) ||
                (s.phone || '').toLowerCase().includes(q) ||
                (s.estateLocation || s.address || '').toLowerCase().includes(q)
            );
            renderPayablesTable(filtered);
        });
    }
}

async function loadAllFinanceData() {
    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const [jSnap, txSnap, paySnap, supList, custList] = await Promise.all([
            db.collection('journal').doc(bid).collection('entries').get(),
            db.collection('coconut_banks').doc(bid).collection('transactions').get(),
            db.collection('coconut_payments').where('businessId', '==', bid).get(),
            window.CoconutModule.loadReconciledSuppliers(bid),
            window.CoconutModule.loadReconciledCustomers(bid)
        ]);

        const entries = jSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // 1. Live Liquid Balances
        const cashBal = window.CoconutModule.calcAccountBalance(entries, '1-1010-01');
        const bankBal = window.CoconutModule.calcAccountBalance(entries, '1-1020-01');
        const totalLiquid = cashBal + bankBal;

        document.getElementById('liveCashBalance').textContent = window.CoconutModule.fmtLKR(cashBal);
        document.getElementById('liveBankBalance').textContent = window.CoconutModule.fmtLKR(bankBal);
        document.getElementById('liveTotalLiquid').textContent = window.CoconutModule.fmtLKR(totalLiquid);

        // 2. Banking Transactions
        allBankingTx = txSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => {
                const ta = a.date ? (a.date.toDate ? a.date.toDate().getTime() : new Date(a.date).getTime()) : 0;
                const tb = b.date ? (b.date.toDate ? b.date.toDate().getTime() : new Date(b.date).getTime()) : 0;
                return tb - ta;
            });
        renderBankingTable(allBankingTx);

        // 3. Customer Receivables (Reconciled)
        allCustomers = custList
            .filter(c => c.isActive !== false)
            .sort((a, b) => (Number(b.balance) || 0) - (Number(a.balance) || 0));

        let totalRec = 0;
        let debtorsCount = 0;
        allCustomers.forEach(c => {
            const bal = Number(c.balance) || 0;
            if (bal > 0) {
                totalRec += bal;
                debtorsCount++;
            }
        });

        const glAR = window.CoconutModule.calcAccountBalance(entries, '1-1030-01');
        const displayTotalRec = Math.max(totalRec, glAR);

        document.getElementById('recTotalBalance').textContent = window.CoconutModule.fmtLKR(displayTotalRec);
        document.getElementById('recDebtorsCount').textContent = `${debtorsCount} Customers`;

        renderReceivablesTable(allCustomers);
        populateCustomerDropdown(allCustomers);

        // 4. Supplier Payables (Reconciled)
        allSuppliers = supList
            .filter(s => s.isActive !== false)
            .sort((a, b) => (Number(b.balance) || 0) - (Number(a.balance) || 0));

        let totalPay = 0;
        let creditorsCount = 0;
        allSuppliers.forEach(s => {
            const bal = Number(s.balance) || 0;
            if (bal > 0) {
                totalPay += bal;
                creditorsCount++;
            }
        });

        const glAP = -window.CoconutModule.calcAccountBalance(entries, '2-2010-01') - window.CoconutModule.calcAccountBalance(entries, '2-2020-01');
        const displayTotalPay = Math.max(totalPay, glAP);

        document.getElementById('payTotalBalance').textContent = window.CoconutModule.fmtLKR(displayTotalPay);
        document.getElementById('payCreditorsCount').textContent = `${creditorsCount} Suppliers`;

        renderPayablesTable(allSuppliers);
        populateSupplierDropdown(allSuppliers);

        // 5. Settlements History
        allSettlements = paySnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(p => p.isActive !== false)
            .sort((a, b) => {
                const ta = a.date ? (a.date.toDate ? a.date.toDate().getTime() : new Date(a.date).getTime()) : 0;
                const tb = b.date ? (b.date.toDate ? b.date.toDate().getTime() : new Date(b.date).getTime()) : 0;
                return tb - ta;
            });

        let totalCollected = 0;
        let totalDisbursed = 0;
        allSettlements.forEach(p => {
            const amt = Number(p.amount) || 0;
            if (p.type === 'CUSTOMER_RECEIPT') totalCollected += amt;
            else if (p.type === 'SUPPLIER_PAYMENT') totalDisbursed += amt;
        });

        document.getElementById('recTotalCollected').textContent = window.CoconutModule.fmtLKR(totalCollected);
        document.getElementById('payTotalDisbursed').textContent = window.CoconutModule.fmtLKR(totalDisbursed);

        renderSettlementHistoryTable(allSettlements);

    } catch (e) {
        console.error('Finance ledger load error:', e);
    }
}

// --- Render Tables ---
function renderBankingTable(list) {
    const body = document.getElementById('bankTxTableBody');
    if (!body) return;
    if (!list || !list.length) {
        body.innerHTML = '<tr><td colspan="6" class="text-center" style="padding:24px; color:var(--c-text-muted);">No finance transactions recorded yet.</td></tr>';
        return;
    }

    body.innerHTML = list.map(tx => {
        const dt = window.CoconutModule.formatDateTime(tx.date || tx.createdAt);
        const amt = Number(tx.amount) || 0;

        let cashImpact = '-';
        let bankImpact = '-';

        if (tx.type === 'CASH_DEPOSIT') {
            cashImpact = `<span style="color:var(--c-danger); font-weight:700;">-${window.CoconutModule.fmtLKR(amt)}</span>`;
            bankImpact = `<span style="color:#166534; font-weight:700;">+${window.CoconutModule.fmtLKR(amt)}</span>`;
        } else if (tx.type === 'CASH_WITHDRAWAL') {
            cashImpact = `<span style="color:#166534; font-weight:700;">+${window.CoconutModule.fmtLKR(amt)}</span>`;
            bankImpact = `<span style="color:var(--c-danger); font-weight:700;">-${window.CoconutModule.fmtLKR(amt)}</span>`;
        } else if (tx.type === 'CAPITAL_INJECTION') {
            cashImpact = `<span style="color:#166534; font-weight:700;">+${window.CoconutModule.fmtLKR(amt)}</span>`;
        } else if (tx.type === 'OWNER_DRAWING') {
            cashImpact = `<span style="color:var(--c-danger); font-weight:700;">-${window.CoconutModule.fmtLKR(amt)}</span>`;
        }

        return `
            <tr>
                <td style="font-size:12px; color:var(--c-text-muted);">${dt}</td>
                <td><span class="c-badge c-badge-neutral">${window.CoconutModule.esc(tx.type)}</span></td>
                <td><strong>${window.CoconutModule.esc(tx.description || tx.notes)}</strong></td>
                <td class="text-right">${cashImpact}</td>
                <td class="text-right">${bankImpact}</td>
                <td class="text-right" style="font-weight:800; color:var(--c-primary);">${window.CoconutModule.fmtLKR(amt)}</td>
            </tr>
        `;
    }).join('');
}

function renderReceivablesTable(list) {
    const body = document.getElementById('receivablesTableBody');
    if (!body) return;

    // Filter only active debtors (balance > 0)
    const activeList = (list || []).filter(c => (Number(c.balance) || 0) > 0);

    if (!activeList.length) {
        body.innerHTML = '<tr><td colspan="6" class="text-center" style="padding:24px; color:var(--c-text-muted); font-weight:600;">🎉 අපට ලැබිය යුතු ණය කිසිවක් නැත! (No outstanding receivables - All customer accounts settled).</td></tr>';
        return;
    }

    body.innerHTML = activeList.map(c => {
        const bal = Number(c.balance) || 0;
        const statusBadge = `<span class="c-badge c-badge-danger">Active Debt (${window.CoconutModule.fmtLKR(bal)})</span>`;

        return `
            <tr>
                <td><strong>${window.CoconutModule.esc(c.name)}</strong></td>
                <td>${window.CoconutModule.esc(c.phone || '-')}</td>
                <td>${window.CoconutModule.esc(c.area || c.address || '-')}</td>
                <td class="text-right" style="font-weight:800; font-size:14px; color:var(--c-danger);">
                    ${window.CoconutModule.fmtLKR(bal)}
                </td>
                <td class="text-center">${statusBadge}</td>
                <td class="text-center">
                    <button type="button" class="c-btn c-btn-primary" style="padding:4px 10px; font-size:11px;" onclick="quickReceiveCustomer('${c.id}')">
                        📥 Receive
                    </button>
                    <a href="ledgers.html?type=customer&id=${c.id}" class="c-btn c-btn-secondary" style="padding:4px 10px; font-size:11px; margin-left:4px;">
                        📖 Ledger
                    </a>
                </td>
            </tr>
        `;
    }).join('');
}

function renderPayablesTable(list) {
    const body = document.getElementById('payablesTableBody');
    if (!body) return;

    // Filter only active creditors (balance > 0)
    const activeList = (list || []).filter(s => (Number(s.balance) || 0) > 0);

    if (!activeList.length) {
        body.innerHTML = '<tr><td colspan="6" class="text-center" style="padding:24px; color:var(--c-text-muted); font-weight:600;">🎉 අප ගෙවිය යුතු ණය කිසිවක් නැත! (No outstanding payables - All supplier dues cleared).</td></tr>';
        return;
    }

    body.innerHTML = activeList.map(s => {
        const bal = Number(s.balance) || 0;
        const statusBadge = `<span class="c-badge c-badge-danger">Payable Due (${window.CoconutModule.fmtLKR(bal)})</span>`;

        return `
            <tr>
                <td><strong>${window.CoconutModule.esc(s.name)}</strong></td>
                <td>${window.CoconutModule.esc(s.phone || '-')}</td>
                <td>${window.CoconutModule.esc(s.estateLocation || s.address || '-')}</td>
                <td class="text-right" style="font-weight:800; font-size:14px; color:var(--c-danger);">
                    ${window.CoconutModule.fmtLKR(bal)}
                </td>
                <td class="text-center">${statusBadge}</td>
                <td class="text-center">
                    <button type="button" class="c-btn c-btn-primary" style="padding:4px 10px; font-size:11px; background:#991b1b; border-color:#991b1b;" onclick="quickPaySupplier('${s.id}')">
                        📤 Pay
                    </button>
                    <a href="ledgers.html?type=supplier&id=${s.id}" class="c-btn c-btn-secondary" style="padding:4px 10px; font-size:11px; margin-left:4px;">
                        📖 Ledger
                    </a>
                </td>
            </tr>
        `;
    }).join('');
}

function renderSettlementHistoryTable(list) {
    const body = document.getElementById('settlementHistoryTableBody');
    if (!body) return;
    if (!list || !list.length) {
        body.innerHTML = '<tr><td colspan="7" class="text-center" style="padding:20px;">No settlements recorded yet.</td></tr>';
        return;
    }

    body.innerHTML = list.map(p => {
        const dt = window.CoconutModule.formatDateTime(p.date || p.createdAt);
        const amt = Number(p.amount) || 0;
        const isReceipt = p.type === 'CUSTOMER_RECEIPT';

        const typeBadge = isReceipt
            ? `<span class="c-badge c-badge-success">Customer Receipt</span>`
            : `<span class="c-badge c-badge-danger">Supplier Payment</span>`;

        return `
            <tr>
                <td style="font-size:12px; color:var(--c-text-muted);">${dt}</td>
                <td>${typeBadge}</td>
                <td><strong>${window.CoconutModule.esc(p.partyName || '-')}</strong></td>
                <td><span class="c-badge c-badge-neutral">${window.CoconutModule.esc(p.paymentMode || 'CASH')}</span></td>
                <td class="text-right" style="font-weight:800; color:${isReceipt ? '#059669' : '#dc2626'};">
                    ${isReceipt ? '+' : '-'}${window.CoconutModule.fmtLKR(amt)}
                </td>
                <td style="font-size:12px;">${window.CoconutModule.esc(p.notes || '-')}</td>
                <td class="text-center">
                    <button type="button" class="c-btn c-btn-secondary" style="padding:3px 8px; font-size:11px; color:#dc2626;" onclick="handleDeleteSettlement('${p.id}')">
                        🗑️ Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function populateCustomerDropdown(list) {
    const select = document.getElementById('crCustomer');
    if (!select) return;
    const debtors = list.filter(c => (Number(c.balance) || 0) > 0);
    const optionsList = debtors.length ? debtors : list;

    select.innerHTML = '<option value="">Select Customer...</option>' + 
        optionsList.map(c => `<option value="${c.id}">${window.CoconutModule.esc(c.name)} (Due: Rs. ${window.CoconutModule.fmt(c.balance || 0)})</option>`).join('');
}

function populateSupplierDropdown(list) {
    const select = document.getElementById('sdSupplier');
    if (!select) return;
    const creditors = list.filter(s => (Number(s.balance) || 0) > 0);
    const optionsList = creditors.length ? creditors : list;

    select.innerHTML = '<option value="">Select Supplier...</option>' + 
        optionsList.map(s => `<option value="${s.id}">${window.CoconutModule.esc(s.name)} (Due: Rs. ${window.CoconutModule.fmt(s.balance || 0)})</option>`).join('');
}

// --- Quick Actions ---
window.quickReceiveCustomer = function (custId) {
    switchFinTab('settlements');
    const select = document.getElementById('crCustomer');
    if (select) {
        select.value = custId;
        select.dispatchEvent(new Event('change'));
    }
    document.getElementById('crAmount').focus();
};

window.quickPaySupplier = function (supId) {
    switchFinTab('settlements');
    const select = document.getElementById('sdSupplier');
    if (select) {
        select.value = supId;
        select.dispatchEvent(new Event('change'));
    }
    document.getElementById('sdAmount').focus();
};

// --- Form Submissions ---
async function handleSaveTransaction(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveTx');
    btn.disabled = true;
    btn.textContent = 'Posting Transaction...';

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const dateVal = document.getElementById('txDate').value;
        const type = document.getElementById('txType').value;
        const amount = Number(document.getElementById('txAmount').value) || 0;
        const notes = document.getElementById('txNotes').value.trim();

        if (amount <= 0 || !notes) {
            alert('Please specify amount and description');
            btn.disabled = false;
            btn.textContent = 'Post Transaction';
            return;
        }

        const txId = `FTX_${window.CoconutModule.uid('fin')}`;
        const txDateObj = window.CoconutModule.parseDateAny(dateVal) || new Date();

        const batch = db.batch();

        const txRef = db.collection('coconut_banks').doc(bid).collection('transactions').doc(txId);
        batch.set(txRef, {
            businessId: bid,
            txId,
            type,
            amount,
            notes,
            description: notes,
            date: window.CoconutModule.tsToFirestore(txDateObj),
            createdAt: window.CoconutModule.tsToFirestore(new Date())
        });

        const journalLines = [];
        if (type === 'CASH_DEPOSIT') {
            journalLines.push({ accountCode: '1-1020-01', accountName: 'Bank Account', debit: amount, credit: 0 });
            journalLines.push({ accountCode: '1-1010-01', accountName: 'Cash in Drawer', debit: 0, credit: amount });
        } else if (type === 'CASH_WITHDRAWAL') {
            journalLines.push({ accountCode: '1-1010-01', accountName: 'Cash in Drawer', debit: amount, credit: 0 });
            journalLines.push({ accountCode: '1-1020-01', accountName: 'Bank Account', debit: 0, credit: amount });
        } else if (type === 'CAPITAL_INJECTION') {
            journalLines.push({ accountCode: '1-1010-01', accountName: 'Cash in Drawer', debit: amount, credit: 0 });
            journalLines.push({ accountCode: '3-3010-01', accountName: "Owner's Capital", debit: 0, credit: amount });
        } else if (type === 'OWNER_DRAWING') {
            journalLines.push({ accountCode: '3-3020-01', accountName: "Owner's Drawings", debit: amount, credit: 0 });
            journalLines.push({ accountCode: '1-1010-01', accountName: 'Cash in Drawer', debit: 0, credit: amount });
        }

        await window.CoconutModule.postJournalEntry({
            businessId: bid,
            description: `Finance Movement: ${notes} [${type}]`,
            referenceType: 'FINANCE_MOVEMENT',
            ref: `coconut_banks/${bid}/transactions/${txId}`,
            date: txDateObj,
            lines: journalLines,
            batch
        });

        await batch.commit();

        window.CoconutModule.showToast('Transaction posted & GL updated!', 'success');
        document.getElementById('transferModal').classList.remove('open');

        await loadAllFinanceData();

    } catch (err) {
        console.error(err);
        window.CoconutModule.showToast('Failed to post transaction: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Post Transaction';
    }
}

async function handleSaveCustReceipt(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveCustReceipt');
    btn.disabled = true;
    btn.textContent = 'Saving Customer Receipt...';

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const dateVal = document.getElementById('crDate').value;
        const custId = document.getElementById('crCustomer').value;
        const amount = Number(document.getElementById('crAmount').value) || 0;
        const mode = document.getElementById('crPaymentMode').value;
        const notes = document.getElementById('crNotes').value.trim();

        if (!custId || amount <= 0) {
            alert('Please select customer and enter valid amount.');
            btn.disabled = false;
            btn.textContent = '📥 Record Customer Receipt & Update Ledger';
            return;
        }

        const customer = allCustomers.find(c => c.id === custId);
        const custName = customer ? customer.name : 'Customer';
        const curBal = customer ? (Number(customer.balance) || 0) : 0;
        const newBal = Math.max(0, curBal - amount);

        const paymentId = `PAY_${window.CoconutModule.uid('cpay')}`;
        const pDateObj = window.CoconutModule.parseDateAny(dateVal) || new Date();

        const batch = db.batch();

        // 1. Save in coconut_payments
        const payRef = db.collection('coconut_payments').doc(paymentId);
        batch.set(payRef, {
            businessId: bid,
            paymentId,
            type: 'CUSTOMER_RECEIPT',
            partyId: custId,
            partyName: custName,
            amount,
            paymentMode: mode,
            notes,
            date: window.CoconutModule.tsToFirestore(pDateObj),
            createdAt: window.CoconutModule.tsToFirestore(new Date()),
            isActive: true
        });

        // 2. Update Customer Balance & Ledger
        const custRef = db.collection('coconut_customers').doc(custId);
        batch.set(custRef, {
            balance: newBal,
            updatedAt: window.CoconutModule.tsToFirestore(new Date())
        }, { merge: true });

        const custLedgerRef = custRef.collection('ledger').doc(`LED_${paymentId}`);
        batch.set(custLedgerRef, {
            businessId: bid,
            type: 'PAYMENT_RECEIVED',
            referenceId: paymentId,
            amount,
            balanceAfter: newBal,
            description: `Payment Received (${mode}): ${notes || 'Settlement'}`,
            date: window.CoconutModule.tsToFirestore(pDateObj),
            createdAt: window.CoconutModule.tsToFirestore(new Date())
        });

        // 3. Post Double-Entry Journal
        // Dr Cash (1-1010-01) or Bank (1-1020-01)
        // Cr Accounts Receivable (1-1030-01)
        const debitCode = mode === 'BANK' ? '1-1020-01' : (mode === 'CHEQUE' ? '1-1020-01' : '1-1010-01');
        const debitName = mode === 'BANK' ? 'Bank Account' : (mode === 'CHEQUE' ? 'Cheques in Hand / Bank' : 'Cash in Hand');

        await window.CoconutModule.postJournalEntry({
            businessId: bid,
            description: `Customer Receipt: ${custName} (${mode}) - ${notes || 'Settlement'}`,
            referenceType: 'CUSTOMER_PAYMENT',
            ref: `coconut_payments/${paymentId}`,
            date: pDateObj,
            lines: [
                { accountCode: debitCode, accountName: debitName, debit: amount, credit: 0 },
                { accountCode: '1-1030-01', accountName: 'Accounts Receivable / Customers', debit: 0, credit: amount }
            ],
            batch
        });

        await batch.commit();

        window.CoconutModule.showToast('Customer payment received and ledger updated!', 'success');
        document.getElementById('customerReceiptForm').reset();
        document.getElementById('crDate').value = window.CoconutModule.toLocalDateStr(new Date());
        document.getElementById('crCurBalance').textContent = 'Rs. 0.00';

        await loadAllFinanceData();

    } catch (err) {
        console.error(err);
        window.CoconutModule.showToast('Failed to save receipt: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '📥 Record Customer Receipt & Update Ledger';
    }
}

async function handleSaveSupDisburse(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveSupDisburse');
    btn.disabled = true;
    btn.textContent = 'Recording Supplier Payment...';

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const dateVal = document.getElementById('sdDate').value;
        const supId = document.getElementById('sdSupplier').value;
        const amount = Number(document.getElementById('sdAmount').value) || 0;
        const mode = document.getElementById('sdPaymentMode').value;
        const notes = document.getElementById('sdNotes').value.trim();

        if (!supId || amount <= 0) {
            alert('Please select supplier and enter valid amount.');
            btn.disabled = false;
            btn.textContent = '📤 Record Supplier Payment & Update Ledger';
            return;
        }

        const supplier = allSuppliers.find(s => s.id === supId);
        const supName = supplier ? supplier.name : 'Supplier';
        const curBal = supplier ? (Number(supplier.balance) || 0) : 0;
        const newBal = Math.max(0, curBal - amount);

        const paymentId = `PAY_${window.CoconutModule.uid('spay')}`;
        const pDateObj = window.CoconutModule.parseDateAny(dateVal) || new Date();

        const batch = db.batch();

        // 1. Save in coconut_payments
        const payRef = db.collection('coconut_payments').doc(paymentId);
        batch.set(payRef, {
            businessId: bid,
            paymentId,
            type: 'SUPPLIER_PAYMENT',
            partyId: supId,
            partyName: supName,
            amount,
            paymentMode: mode,
            notes,
            date: window.CoconutModule.tsToFirestore(pDateObj),
            createdAt: window.CoconutModule.tsToFirestore(new Date()),
            isActive: true
        });

        // 2. Update Supplier Balance & Ledger
        const supRef = db.collection('coconut_suppliers').doc(supId);
        batch.set(supRef, {
            balance: newBal,
            updatedAt: window.CoconutModule.tsToFirestore(new Date())
        }, { merge: true });

        const supLedgerRef = supRef.collection('ledger').doc(`LED_${paymentId}`);
        batch.set(supLedgerRef, {
            businessId: bid,
            type: 'PAYMENT_DISBURSED',
            referenceId: paymentId,
            amount,
            balanceAfter: newBal,
            description: `Payment Disbursed (${mode}): ${notes || 'Supplier Settlement'}`,
            date: window.CoconutModule.tsToFirestore(pDateObj),
            createdAt: window.CoconutModule.tsToFirestore(new Date())
        });

        // 3. Post Double-Entry Journal
        // Dr Accounts Payable (2-2010-01)
        // Cr Cash (1-1010-01) or Bank (1-1020-01) or Cheques Payable (2-2020-01)
        const creditCode = mode === 'BANK' ? '1-1020-01' : (mode === 'CHEQUE' ? '2-2020-01' : '1-1010-01');
        const creditName = mode === 'BANK' ? 'Bank Account' : (mode === 'CHEQUE' ? 'Cheques Payable / Issued Cheques' : 'Cash in Hand');

        await window.CoconutModule.postJournalEntry({
            businessId: bid,
            description: `Supplier Payment: ${supName} (${mode}) - ${notes || 'Settlement'}`,
            referenceType: 'SUPPLIER_PAYMENT',
            ref: `coconut_payments/${paymentId}`,
            date: pDateObj,
            lines: [
                { accountCode: '2-2010-01', accountName: 'Accounts Payable / Coconut Suppliers', debit: amount, credit: 0 },
                { accountCode: creditCode, accountName: creditName, debit: 0, credit: amount }
            ],
            batch
        });

        await batch.commit();

        window.CoconutModule.showToast('Supplier payment disbursed and ledger updated!', 'success');
        document.getElementById('supplierDisburseForm').reset();
        document.getElementById('sdDate').value = window.CoconutModule.toLocalDateStr(new Date());
        document.getElementById('sdCurBalance').textContent = 'Rs. 0.00';

        await loadAllFinanceData();

    } catch (err) {
        console.error(err);
        window.CoconutModule.showToast('Failed to save supplier payment: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '📤 Record Supplier Payment & Update Ledger';
    }
}

window.handleDeleteSettlement = async function (paymentId) {
    if (!confirm('Are you sure you want to delete this payment settlement? Balance and Journal will be reversed.')) return;
    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const payRef = db.collection('coconut_payments').doc(paymentId);
        const pDoc = await payRef.get();
        if (!pDoc.exists) return;
        const pData = pDoc.data() || {};

        const amt = Number(pData.amount) || 0;
        const batch = db.batch();

        if (pData.type === 'CUSTOMER_RECEIPT' && pData.partyId) {
            const cRef = db.collection('coconut_customers').doc(pData.partyId);
            const cDoc = await cRef.get();
            if (cDoc.exists) {
                const curBal = Number(cDoc.data()?.balance) || 0;
                batch.set(cRef, { balance: curBal + amt, updatedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
            }
        } else if (pData.type === 'SUPPLIER_PAYMENT' && pData.partyId) {
            const sRef = db.collection('coconut_suppliers').doc(pData.partyId);
            const sDoc = await sRef.get();
            if (sDoc.exists) {
                const curBal = Number(sDoc.data()?.balance) || 0;
                batch.set(sRef, { balance: curBal + amt, updatedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });
            }
        }

        batch.set(payRef, { isActive: false, deletedAt: window.CoconutModule.tsToFirestore(new Date()) }, { merge: true });

        await window.CoconutModule.deleteJournalEntry(`coconut_payments/${paymentId}`, batch);
        await batch.commit();

        window.CoconutModule.showToast('Settlement reversed successfully!', 'info');
        await loadAllFinanceData();

    } catch (e) {
        console.error(e);
        window.CoconutModule.showToast('Failed to delete settlement: ' + e.message, 'error');
    }
};

