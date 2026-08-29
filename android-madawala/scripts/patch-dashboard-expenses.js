const fs = require('fs');

const profitAndExpenseHtml = `            <div class="filter-bar">
                <div class="filter-group"><label>PERIOD</label><select id="periodSelect"><option value="today">Today</option><option value="month" selected>This Month</option></select></div>
                <button class="apply-btn" id="refreshDashboardBtn">REFRESH</button>
                <a href="/modules/distributor/web/new-order.html" class="apply-btn" style="background:#0f766e; text-decoration:none; display:inline-flex; align-items:center; gap:6px; font-weight:700; padding:8px 16px; margin-left:auto;">🛒 + NEW SALES ORDER</a>
            </div>
            
            <!-- Owner Profit & Expense Analytics Blocks (Visible to Business Owner on Main Dashboard) -->
            <div id="coreOwnerProfitSection" style="margin-bottom: 15px;">
                <!-- Profit Row -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:10px; margin-bottom:10px;">
                    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:14px; text-align:center;">
                        <div style="font-size:11px; font-weight:700; color:#166534; text-transform:uppercase;">📈 Today Profit</div>
                        <div id="coreStatTodayProfit" style="font-size:20px; font-weight:800; color:#166534; margin-top:4px;">Rs. 0.00</div>
                    </div>
                    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:14px; text-align:center;">
                        <div style="font-size:11px; font-weight:700; color:#166534; text-transform:uppercase;">📈 This Week Profit</div>
                        <div id="coreStatWeekProfit" style="font-size:20px; font-weight:800; color:#166534; margin-top:4px;">Rs. 0.00</div>
                    </div>
                    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:14px; text-align:center;">
                        <div style="font-size:11px; font-weight:700; color:#166534; text-transform:uppercase;">📈 This Month Profit</div>
                        <div id="coreStatMonthProfit" style="font-size:20px; font-weight:800; color:#166534; margin-top:4px;">Rs. 0.00</div>
                    </div>
                    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:14px; text-align:center;">
                        <div style="font-size:11px; font-weight:700; color:#166534; text-transform:uppercase;">📈 This Year Profit</div>
                        <div id="coreStatYearProfit" style="font-size:20px; font-weight:800; color:#166534; margin-top:4px;">Rs. 0.00</div>
                    </div>
                </div>
                <!-- Expenses Row -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:10px; margin-bottom:12px;">
                    <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:14px; text-align:center;">
                        <div style="font-size:11px; font-weight:700; color:#991b1b; text-transform:uppercase;">📉 Today Expenses</div>
                        <div id="coreStatTodayExpense" style="font-size:20px; font-weight:800; color:#991b1b; margin-top:4px;">Rs. 0.00</div>
                    </div>
                    <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:14px; text-align:center;">
                        <div style="font-size:11px; font-weight:700; color:#991b1b; text-transform:uppercase;">📉 This Week Expenses</div>
                        <div id="coreStatWeekExpense" style="font-size:20px; font-weight:800; color:#991b1b; margin-top:4px;">Rs. 0.00</div>
                    </div>
                    <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:14px; text-align:center;">
                        <div style="font-size:11px; font-weight:700; color:#991b1b; text-transform:uppercase;">📉 This Month Expenses</div>
                        <div id="coreStatMonthExpense" style="font-size:20px; font-weight:800; color:#991b1b; margin-top:4px;">Rs. 0.00</div>
                    </div>
                    <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:14px; text-align:center;">
                        <div style="font-size:11px; font-weight:700; color:#991b1b; text-transform:uppercase;">📉 This Year Expenses</div>
                        <div id="coreStatYearExpense" style="font-size:20px; font-weight:800; color:#991b1b; margin-top:4px;">Rs. 0.00</div>
                    </div>
                </div>
            </div>

            <div class="kpi-grid" id="kpiGrid"></div>
            <div class="hero-kpi-grid" id="heroKpiGrid"></div>

            <div class="dynamic-widgets" id="dynamicWidgets"></div>`;

const targetFiles = [
    'public/modules/tire_centre/dashboard.html',
    'public/modules/retail/dashboard.html',
    'public/modules/scrap_collection_center/dashboard.html'
];

targetFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');

    // Replace the section between <button class="business-type-btn" data-view="combined">Combined</button> and <div class="accounting-widget"
    const startMarker = '<button class="business-type-btn" data-view="combined">Combined</button>\n            </div>';
    const altStartMarker = '<button class="business-type-btn" data-view="combined">Combined</button>';
    const endMarker = '<div class="accounting-widget" id="coreAccountingSummaryWidget">';

    if (html.includes(startMarker) && html.includes(endMarker)) {
        const startIdx = html.indexOf(startMarker) + startMarker.length;
        const endIdx = html.indexOf(endMarker);
        html = html.slice(0, startIdx) + '\n' + profitAndExpenseHtml + '\n\n            ' + html.slice(endIdx);
    } else if (html.includes(altStartMarker) && html.includes(endMarker)) {
        const startIdx = html.indexOf(altStartMarker) + altStartMarker.length;
        const endIdx = html.indexOf(endMarker);
        html = html.slice(0, startIdx) + '\n            </div>\n' + profitAndExpenseHtml + '\n\n            ' + html.slice(endIdx);
    }

    // Now update loadCoreOwnerProfitDashboard function
    const expLoopOld = `allExpDocs.forEach(doc => {
                    const r = doc.data() || {};
                    const dt = parseDateAny(r.createdAt || r.expenseDate);
                    if (!dt || isNaN(dt.getTime())) return;
                    if (dt < startOfYear) return;
                    const amt = Number(r.amount) || 0;
                    if (dt >= startOfYear) profitYear -= amt;
                    if (dt >= startOfMonth) profitMonth -= amt;
                    if (dt >= startOfWeek) profitWeek -= amt;
                    if (dt >= startOfToday) profitToday -= amt;
                });`;

    const expLoopNew = `let expToday = 0, expWeek = 0, expMonth = 0, expYear = 0;
                allExpDocs.forEach(doc => {
                    const r = doc.data() || {};
                    const dt = parseDateAny(r.createdAt || r.expenseDate || r.date);
                    if (!dt || isNaN(dt.getTime())) return;
                    if (dt < startOfYear) return;
                    const amt = Number(r.amount) || 0;
                    if (dt >= startOfYear) { profitYear -= amt; expYear += amt; }
                    if (dt >= startOfMonth) { profitMonth -= amt; expMonth += amt; }
                    if (dt >= startOfWeek) { profitWeek -= amt; expWeek += amt; }
                    if (dt >= startOfToday) { profitToday -= amt; expToday += amt; }
                });`;

    const expRenderOld = `if (document.getElementById('coreStatTodayProfit')) document.getElementById('coreStatTodayProfit').innerHTML = fmtProfit(profitToday);
                if (document.getElementById('coreStatWeekProfit')) document.getElementById('coreStatWeekProfit').innerHTML = fmtProfit(profitWeek);
                if (document.getElementById('coreStatMonthProfit')) document.getElementById('coreStatMonthProfit').innerHTML = fmtProfit(profitMonth);
                if (document.getElementById('coreStatYearProfit')) document.getElementById('coreStatYearProfit').innerHTML = fmtProfit(profitYear);`;

    const expRenderNew = `const fmtExpense = (v) => {
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
                if (document.getElementById('coreStatYearExpense')) document.getElementById('coreStatYearExpense').innerHTML = fmtExpense(expYear);`;

    if (html.includes(expLoopOld)) {
        html = html.replace(expLoopOld, expLoopNew);
    }
    if (html.includes(expRenderOld)) {
        html = html.replace(expRenderOld, expRenderNew);
    }

    fs.writeFileSync(file, html, 'utf8');
    console.log('✅ Updated ' + file + ' with Expense cards and calculation!');
});
