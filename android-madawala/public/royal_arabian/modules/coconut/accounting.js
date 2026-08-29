/**
 * Coconut Wholesale Module — General Ledger & Financial Statements Logic
 * Comprehensive Chart of Accounts, Automatic Discrepancy Prevention & Statements
 */

let appCtx = null;
let allJournalEntries = [];

document.addEventListener('DOMContentLoaded', async () => {
    appCtx = await window.CoconutModule.guardCoconutPage();
    if (!appCtx) return;

    window.CoconutModule.renderNav('accounting');

    setupTabs();
    setupFilters();
    await loadJournalAndStatements();
});

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn, .c-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.dataset.tab;
            document.querySelectorAll('.tab-content, .c-tab-content').forEach(c => c.style.display = 'none');
            const targetEl = document.getElementById(`tab-${target}`) || document.getElementById(`tabContent${target.charAt(0).toUpperCase() + target.slice(1)}`);
            if (targetEl) targetEl.style.display = 'block';
        });
    });
}

function setupFilters() {
    const searchInput = document.getElementById('searchJournal');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            const filtered = allJournalEntries.filter(entry =>
                (entry.description && entry.description.toLowerCase().includes(q)) ||
                (entry.referenceType && entry.referenceType.toLowerCase().includes(q)) ||
                (entry.ref && entry.ref.toLowerCase().includes(q))
            );
            renderJournalTable(filtered);
        });
    }
}

async function loadJournalAndStatements() {
    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const snap = await db.collection('journal')
            .doc(bid)
            .collection('entries')
            .get();

        allJournalEntries = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(e => e.isActive !== false && e.isReversed !== true)
            .sort((a, b) => {
                const ta = a.date ? (a.date.toDate ? a.date.toDate().getTime() : new Date(a.date).getTime()) : 0;
                const tb = b.date ? (b.date.toDate ? b.date.toDate().getTime() : new Date(b.date).getTime()) : 0;
                return tb - ta;
            });

        const badge = document.getElementById('journalCountBadge');
        if (badge) badge.textContent = `${allJournalEntries.length} Posted Entries`;

        renderJournalTable(allJournalEntries);
        computeTrialBalance(allJournalEntries);
        computeFinancialStatements(allJournalEntries);

    } catch (e) {
        console.error('Accounting load error:', e);
    }
}

function renderJournalTable(entries) {
    const body = document.getElementById('journalTableBody');
    if (!body) return;

    if (!entries.length) {
        body.innerHTML = '<tr><td colspan="6" class="text-center" style="padding:24px; color:#64748b;">No active journal entries posted yet.</td></tr>';
        return;
    }

    body.innerHTML = entries.map(entry => {
        const dt = window.CoconutModule.formatDateTime(entry.date || entry.createdAt);
        const lines = Array.isArray(entry.entries) ? entry.entries : (Array.isArray(entry.lines) ? entry.lines : []);

        let accountsHtml = '<div style="font-size:12.5px; line-height:1.6;">';
        let drHtml = '<div style="font-size:12.5px; line-height:1.6; text-align:right;">';
        let crHtml = '<div style="font-size:12.5px; line-height:1.6; text-align:right;">';

        lines.forEach(l => {
            const dr = Number(l.debit) || 0;
            const cr = Number(l.credit) || 0;
            const isDr = dr > 0;

            accountsHtml += `<div style="${isDr ? 'font-weight:600;' : 'padding-left:14px; color:#64748b;'}"><span style="font-family:monospace; color:#0f3b2c;">${l.accountCode}</span> ${l.accountName}</div>`;
            drHtml += `<div>${isDr ? window.CoconutModule.fmtLKR(dr) : '-'}</div>`;
            crHtml += `<div>${!isDr ? window.CoconutModule.fmtLKR(cr) : '-'}</div>`;
        });

        accountsHtml += '</div>';
        drHtml += '</div>';
        crHtml += '</div>';

        return `
            <tr>
                <td style="font-size:12px; color:#64748b; white-space:nowrap;">${dt}</td>
                <td><span class="c-badge c-badge-neutral" style="font-family:monospace; font-size:11px;">${window.CoconutModule.esc(entry.referenceType || 'GL')}</span></td>
                <td><strong>${window.CoconutModule.esc(entry.description)}</strong></td>
                <td>${accountsHtml}</td>
                <td>${drHtml}</td>
                <td>${crHtml}</td>
            </tr>
        `;
    }).join('');
}

function computeTrialBalance(entries) {
    const standardAccounts = [
        { code: '1-1010-01', name: 'Cash in Hand / Drawer', type: 'ASSET' },
        { code: '1-1020-01', name: 'Bank Account', type: 'ASSET' },
        { code: '1-1030-01', name: 'Accounts Receivable (Customers)', type: 'ASSET' },
        { code: '1-1050-01', name: 'Raw Materials - Fresh Coconuts', type: 'ASSET' },
        { code: '1-1050-02', name: 'Raw Materials - Coconut Husks', type: 'ASSET' },
        { code: '1-1050-03', name: 'Finished Goods Inventory', type: 'ASSET' },
        { code: '1-1060-01', name: 'Employee Advances Receivable', type: 'ASSET' },
        { code: '2-2010-01', name: 'Accounts Payable (Suppliers)', type: 'LIABILITY' },
        { code: '2-2020-01', name: 'Cheques Payable', type: 'LIABILITY' },
        { code: '2-2030-01', name: 'Loans Payable (Borrowings)', type: 'LIABILITY' },
        { code: '3-3010-01', name: "Owner's Capital", type: 'EQUITY' },
        { code: '3-3020-01', name: "Owner's Drawings", type: 'EQUITY' },
        { code: '4-4010-01', name: 'Sales Revenue', type: 'REVENUE' },
        { code: '5-5010-01', name: 'Operational Expense & Spoilage', type: 'EXPENSE' },
        { code: '5-5020-01', name: 'Cost of Goods Sold (COGS)', type: 'EXPENSE' },
        { code: '5-5030-01', name: 'Salaries & Wages Expense', type: 'EXPENSE' },
        { code: '5-5050-01', name: 'Loan Interest Expense', type: 'EXPENSE' }
    ];

    // Detect all unique accounts present in actual entries to avoid omission
    const seenAccounts = new Map();
    standardAccounts.forEach(a => seenAccounts.set(a.code, a));

    entries.forEach(entry => {
        const lines = Array.isArray(entry.entries) ? entry.entries : (Array.isArray(entry.lines) ? entry.lines : []);
        lines.forEach(l => {
            const code = String(l.accountCode || '').trim();
            if (code && !seenAccounts.has(code)) {
                let inferredType = 'ASSET';
                if (code.startsWith('2-')) inferredType = 'LIABILITY';
                else if (code.startsWith('3-')) inferredType = 'EQUITY';
                else if (code.startsWith('4-')) inferredType = 'REVENUE';
                else if (code.startsWith('5-')) inferredType = 'EXPENSE';

                seenAccounts.set(code, {
                    code,
                    name: l.accountName || 'General Account',
                    type: inferredType
                });
            }
        });
    });

    const accounts = Array.from(seenAccounts.values()).sort((a, b) => a.code.localeCompare(b.code));

    let totalDr = 0;
    let totalCr = 0;
    const body = document.getElementById('trialBalanceBody');
    if (!body) return;

    let rows = '';

    accounts.forEach(acc => {
        const bal = window.CoconutModule.calcAccountBalance(entries, acc.code);
        let drBal = 0;
        let crBal = 0;

        if (acc.type === 'ASSET' || acc.type === 'EXPENSE') {
            if (bal >= 0) drBal = bal;
            else crBal = Math.abs(bal);
        } else {
            if (bal >= 0) crBal = bal;
            else drBal = Math.abs(bal);
        }

        if (drBal === 0 && crBal === 0) return; // Skip inactive 0 balances for clean display

        totalDr += drBal;
        totalCr += crBal;

        rows += `
            <tr>
                <td><span style="font-family:monospace; font-weight:700; color:#0f3b2c;">${acc.code}</span></td>
                <td><strong>${acc.name}</strong></td>
                <td><span class="c-badge c-badge-neutral">${acc.type}</span></td>
                <td class="text-right" style="font-weight:600;">${drBal > 0 ? window.CoconutModule.fmtLKR(drBal) : '-'}</td>
                <td class="text-right" style="font-weight:600;">${crBal > 0 ? window.CoconutModule.fmtLKR(crBal) : '-'}</td>
            </tr>
        `;
    });

    const isBalanced = Math.abs(totalDr - totalCr) < 0.05;
    const statusBadge = document.getElementById('trialBalanceStatus');
    if (statusBadge) {
        if (isBalanced) {
            statusBadge.textContent = '⚖️ Invariant Verified: Balanced';
            statusBadge.className = 'balance-status balanced';
        } else {
            statusBadge.textContent = `⚠️ Imbalance Discrepancy: ${window.CoconutModule.fmtLKR(Math.abs(totalDr - totalCr))}`;
            statusBadge.className = 'balance-status not-balanced';
        }
    }

    rows += `
        <tr style="background:#f8fafc; font-weight:900; font-size:14px; border-top:2px solid #0f3b2c;">
            <td colspan="3">TOTAL TRIAL BALANCE</td>
            <td class="text-right" style="color:#0f3b2c;">${window.CoconutModule.fmtLKR(totalDr)}</td>
            <td class="text-right" style="color:#0f3b2c;">${window.CoconutModule.fmtLKR(totalCr)}</td>
        </tr>
    `;

    body.innerHTML = rows;
}

function computeFinancialStatements(entries) {
    const cash = window.CoconutModule.calcAccountBalance(entries, '1-1010');
    const bank = window.CoconutModule.calcAccountBalance(entries, '1-1020');
    const ar = window.CoconutModule.calcAccountBalance(entries, '1-1030');
    const rmCoconut = window.CoconutModule.calcAccountBalance(entries, '1-1050-01');
    const rmHusk = window.CoconutModule.calcAccountBalance(entries, '1-1050-02');
    const fgStock = window.CoconutModule.calcAccountBalance(entries, '1-1050-03') || window.CoconutModule.calcAccountBalance(entries, '1-1040');
    const advances = window.CoconutModule.calcAccountBalance(entries, '1-1060');

    const totalInventory = rmCoconut + rmHusk + fgStock;
    const totalAssets = cash + bank + ar + totalInventory + advances;

    const ap = window.CoconutModule.calcAccountBalance(entries, '2-2010');
    const chequesPayable = window.CoconutModule.calcAccountBalance(entries, '2-2020');
    const loans = window.CoconutModule.calcAccountBalance(entries, '2-2030');
    const totalLiab = ap + chequesPayable + loans;

    const cap = window.CoconutModule.calcAccountBalance(entries, '3-3010');
    const draw = window.CoconutModule.calcAccountBalance(entries, '3-3020');
    const equityNet = cap - draw;

    const rev = window.CoconutModule.calcAccountBalance(entries, '4-4010');
    const cogs = window.CoconutModule.calcAccountBalance(entries, '5-5020');
    const opex = window.CoconutModule.calcAccountBalance(entries, '5-5010');
    const salaries = window.CoconutModule.calcAccountBalance(entries, '5-5030');
    const interest = window.CoconutModule.calcAccountBalance(entries, '5-5050');

    const totalOperatingExpenses = opex + salaries + interest;
    const grossProfit = rev - cogs;
    const netProfit = grossProfit - totalOperatingExpenses;

    // Header Hero Cards
    const elRev = document.getElementById('totalRevenue');
    if (elRev) elRev.textContent = window.CoconutModule.fmtLKR(rev);

    const elExp = document.getElementById('totalExpenses');
    if (elExp) elExp.textContent = window.CoconutModule.fmtLKR(cogs + totalOperatingExpenses);

    const elProfit = document.getElementById('netProfit');
    if (elProfit) {
        elProfit.textContent = window.CoconutModule.fmtLKR(netProfit);
        elProfit.style.color = netProfit >= 0 ? '#059669' : '#dc2626';
    }

    const elLiquid = document.getElementById('totalCashBank');
    if (elLiquid) elLiquid.textContent = window.CoconutModule.fmtLKR(cash + bank);

    // Income Statement UI
    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = window.CoconutModule.fmtLKR(val); };
    setTxt('pnlRevenue', rev);
    setTxt('pnlCogs', cogs);
    setTxt('pnlGrossProfit', grossProfit);
    setTxt('pnlOpex', opex);
    setTxt('pnlSalaries', salaries);
    setTxt('pnlInterest', interest);
    setTxt('pnlTotalExpenses', totalOperatingExpenses);
    setTxt('pnlNetProfit', netProfit);

    // Balance Sheet UI
    setTxt('bsCash', cash);
    setTxt('bsBank', bank);
    setTxt('bsReceivables', ar);
    setTxt('bsInventory', totalInventory);
    setTxt('bsAdvances', advances);
    setTxt('bsTotalAssets', totalAssets);

    setTxt('bsPayables', ap + chequesPayable);
    setTxt('bsLoans', loans);
    setTxt('bsTotalLiabilities', totalLiab);

    setTxt('bsEquity', equityNet);
    setTxt('bsRetainedEarnings', netProfit);
    const totalEquityAndLiab = totalLiab + equityNet + netProfit;
    setTxt('bsTotalEquity', equityNet + netProfit);
    setTxt('bsTotalEquityAndLiab', totalEquityAndLiab);
}
