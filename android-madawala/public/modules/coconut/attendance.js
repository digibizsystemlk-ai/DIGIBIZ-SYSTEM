/**
 * Coconut Wholesale Module — Attendance, Advances & Payroll Engine
 * Features: In/Out Time tracking, automated hours & OT computation, and daily logs.
 */

let appCtx = null;
let allStaff = [];
let currentAttendanceState = {};
let allAdvances = [];
let calculatedPayrollRows = [];

document.addEventListener('DOMContentLoaded', async () => {
    appCtx = await window.CoconutModule.guardCoconutPage();
    if (!appCtx) return;

    window.CoconutModule.renderNav('attendance');

    const todayStr = window.CoconutModule.toLocalDateStr(new Date());
    document.getElementById('attDate').value = todayStr;
    document.getElementById('advDate').value = todayStr;
    document.getElementById('setDate').value = todayStr;

    const currentYearMonth = todayStr.substring(0, 7);
    document.getElementById('payrollMonth').value = currentYearMonth;

    setupEventHandlers();
    await loadInitialData();
});

function switchAttTab(tab) {
    ['attendance', 'advances', 'payroll'].forEach(t => {
        const content = document.getElementById(`tabContent${t.charAt(0).toUpperCase() + t.slice(1)}`);
        const btn = document.getElementById(`tabBtn${t.charAt(0).toUpperCase() + t.slice(1)}`);
        if (content) content.style.display = t === tab ? 'block' : 'none';
        if (btn) btn.classList.toggle('active', t === tab);
    });

    if (tab === 'payroll') {
        calculateMonthlyPayroll();
    } else if (tab === 'advances') {
        loadAdvances();
    }
}

function setupEventHandlers() {
    // Attendance date change
    document.getElementById('attDate').addEventListener('change', loadDailyAttendance);
    document.getElementById('btnClockInAll').addEventListener('click', clockInAllMorning);
    document.getElementById('btnClockOutAll').addEventListener('click', clockOutAllEvening);
    document.getElementById('btnSaveAttendance').addEventListener('click', saveDailyAttendance);

    // Advances
    document.getElementById('advanceForm').addEventListener('submit', handleSaveAdvance);

    // Payroll
    document.getElementById('payrollMonth').addEventListener('change', calculateMonthlyPayroll);
    document.getElementById('btnRecalculatePayroll').addEventListener('click', calculateMonthlyPayroll);

    // Modals
    document.getElementById('btnClosePayslipModal').onclick = () => document.getElementById('payslipModal').classList.remove('open');
    document.getElementById('btnCancelPayslip').onclick = () => document.getElementById('payslipModal').classList.remove('open');
    document.getElementById('btnCloseSettleModal').onclick = () => document.getElementById('settleModal').classList.remove('open');
    document.getElementById('btnCancelSettle').onclick = () => document.getElementById('settleModal').classList.remove('open');
    document.getElementById('settleForm').addEventListener('submit', handleConfirmSettleSalary);
}

async function loadInitialData() {
    await loadStaffList();
    await loadDailyAttendance();
    await loadAdvances();
    await calculateMonthlyPayroll();
}

async function loadStaffList() {
    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const snap = await db.collection('coconut_staff')
            .where('businessId', '==', bid)
            .get();

        allStaff = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(s => s.isActive !== false)
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        // Populate employee dropdown in Advances tab
        const select = document.getElementById('advEmployee');
        select.innerHTML = '<option value="">Select Employee...</option>' + 
            allStaff.map(s => `<option value="${s.id}">${window.CoconutModule.esc(s.name)} (${s.role || 'Staff'})</option>`).join('');

    } catch (err) {
        console.error('Error loading staff:', err);
    }
}

// -------------------------------------------------------------------
// 1. DAILY TIME & ATTENDANCE ENGINE (IN/OUT TIMES & OT CALCULATION)
// -------------------------------------------------------------------

function computeHoursAndWage(s, inTime, outTime, manualOt = null) {
    const rate = Number(s.wageRate) || 0;
    const hourlyRate = rate > 0 ? (rate / 8) : 0;

    if (!inTime || !outTime) {
        return {
            workedHours: 0,
            status: inTime ? 'PRESENT' : 'ABSENT',
            dayMultiplier: inTime ? 1.0 : 0.0,
            otHours: Number(manualOt) || 0,
            dailyEarned: inTime ? rate : 0
        };
    }

    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);

    let inMinutes = inH * 60 + inM;
    let outMinutes = outH * 60 + outM;

    if (outMinutes < inMinutes) {
        // Shift crosses midnight
        outMinutes += 24 * 60;
    }

    let diffMinutes = outMinutes - inMinutes;
    // Deduct standard 1-hour lunch break if total duration exceeds 5 hours
    if (diffMinutes >= 300) {
        diffMinutes -= 60;
    }

    const workedHours = Number((diffMinutes / 60).toFixed(1));

    let status = 'ABSENT';
    let dayMultiplier = 0.0;
    let autoOt = 0.0;

    if (workedHours >= 7.0) {
        status = 'PRESENT';
        dayMultiplier = 1.0;
        if (workedHours > 8.0) {
            autoOt = Number((workedHours - 8.0).toFixed(1));
        }
    } else if (workedHours >= 3.5) {
        status = 'HALF_DAY';
        dayMultiplier = 0.5;
    } else if (workedHours > 0) {
        status = 'HALF_DAY';
        dayMultiplier = 0.5;
    }

    const finalOt = manualOt !== null && manualOt !== undefined ? Number(manualOt) : autoOt;
    const basePay = dayMultiplier * rate;
    const otPay = finalOt * (hourlyRate * 1.5);
    const dailyEarned = basePay + otPay;

    return {
        workedHours,
        status,
        dayMultiplier,
        otHours: finalOt,
        dailyEarned
    };
}

async function loadDailyAttendance() {
    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;
    const dateStr = document.getElementById('attDate').value;
    const body = document.getElementById('attTableBody');

    if (!allStaff.length) {
        body.innerHTML = '<tr><td colspan="9" class="text-center" style="padding:24px; color:var(--c-text-muted);">No staff registered yet. Please add staff in the Personnel Roster.</td></tr>';
        return;
    }

    currentAttendanceState = {};

    try {
        const snap = await db.collection('coconut_attendance')
            .where('businessId', '==', bid)
            .where('dateStr', '==', dateStr)
            .get();

        const savedMap = {};
        snap.docs.forEach(d => {
            const data = d.data();
            savedMap[data.staffId] = data;
        });

        allStaff.forEach(s => {
            if (savedMap[s.id]) {
                const sv = savedMap[s.id];
                currentAttendanceState[s.id] = {
                    inTime: sv.inTime || '08:00',
                    outTime: sv.outTime || '17:00',
                    status: sv.status || 'PRESENT',
                    workedHours: Number(sv.workedHours) || 8.0,
                    otHours: Number(sv.otHours) || 0,
                    dailyEarned: Number(sv.dailyEarned) || Number(s.wageRate || 0),
                    remarks: sv.remarks || ''
                };
            } else {
                // Default morning view: 08:00 AM In Time, Ready to mark
                const calc = computeHoursAndWage(s, '08:00', '17:00');
                currentAttendanceState[s.id] = {
                    inTime: '08:00',
                    outTime: '17:00',
                    status: calc.status,
                    workedHours: calc.workedHours,
                    otHours: calc.otHours,
                    dailyEarned: calc.dailyEarned,
                    remarks: ''
                };
            }
        });

        renderAttendanceRows();

    } catch (err) {
        console.error('Error loading attendance:', err);
        body.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Error loading attendance logs</td></tr>';
    }
}

function renderAttendanceRows() {
    const body = document.getElementById('attTableBody');
    body.innerHTML = allStaff.map(s => {
        const state = currentAttendanceState[s.id] || { inTime: '', outTime: '', status: 'PRESENT', workedHours: 0, otHours: 0, dailyEarned: 0, remarks: '' };
        const rate = Number(s.wageRate) || 0;

        let statusBadge = '<span class="c-badge c-badge-success">🟢 Full Day</span>';
        if (state.status === 'HALF_DAY') statusBadge = '<span class="c-badge c-badge-warning">🟡 Half Day</span>';
        else if (state.status === 'ABSENT') statusBadge = '<span class="c-badge c-badge-danger">🔴 Absent</span>';

        return `
            <tr data-staff-id="${s.id}">
                <td>
                    <strong>${window.CoconutModule.esc(s.name)}</strong>
                    <div style="font-size:11px; color:#64748b;">${window.CoconutModule.esc(s.role || 'Laborer')} ${s.phone ? '• ' + s.phone : ''}</div>
                </td>
                <td>Rs. ${window.CoconutModule.fmt(rate, 2)}</td>
                <td>
                    <input type="time" class="c-input" style="padding:4px 6px; font-size:12px; font-weight:700;" 
                        value="${state.inTime || ''}" onchange="handleTimeChange('${s.id}', 'in', this.value)">
                </td>
                <td>
                    <input type="time" class="c-input" style="padding:4px 6px; font-size:12px; font-weight:700;" 
                        value="${state.outTime || ''}" onchange="handleTimeChange('${s.id}', 'out', this.value)">
                </td>
                <td style="text-align:center; font-weight:800; color:#0f3b2c;">
                    ${state.workedHours > 0 ? state.workedHours + ' hrs' : '-'}
                </td>
                <td style="text-align:center;">
                    <div style="display:inline-flex; gap:4px;">
                        <button type="button" class="att-status-btn present ${state.status === 'PRESENT' ? 'active-status' : ''}" 
                            onclick="setStaffStatusOverride('${s.id}', 'PRESENT')" title="Full Day">🟢</button>
                        <button type="button" class="att-status-btn half ${state.status === 'HALF_DAY' ? 'active-status' : ''}" 
                            onclick="setStaffStatusOverride('${s.id}', 'HALF_DAY')" title="Half Day">🟡</button>
                        <button type="button" class="att-status-btn absent ${state.status === 'ABSENT' ? 'active-status' : ''}" 
                            onclick="setStaffStatusOverride('${s.id}', 'ABSENT')" title="Absent">🔴</button>
                    </div>
                </td>
                <td style="text-align:right;">
                    <input type="number" class="c-input" style="width:75px; text-align:right; padding:4px 6px; font-weight:700; color:#0284c7;" min="0" max="24" step="0.5" 
                        value="${state.otHours || ''}" placeholder="0" onchange="handleOtChange('${s.id}', this.value)">
                </td>
                <td class="text-right" style="font-weight:800; color:#0f3b2c; font-size:13px;">
                    ${window.CoconutModule.fmtLKR(state.dailyEarned)}
                </td>
                <td>
                    <input type="text" class="c-input" style="padding:4px 8px; font-size:12px;" 
                        value="${window.CoconutModule.esc(state.remarks || '')}" placeholder="Task / remarks..." onchange="setStaffRemarks('${s.id}', this.value)">
                </td>
            </tr>
        `;
    }).join('');
}

function handleTimeChange(staffId, field, timeVal) {
    const s = allStaff.find(x => x.id === staffId);
    if (!s) return;
    if (!currentAttendanceState[staffId]) currentAttendanceState[staffId] = {};

    if (field === 'in') currentAttendanceState[staffId].inTime = timeVal;
    if (field === 'out') currentAttendanceState[staffId].outTime = timeVal;

    const calc = computeHoursAndWage(s, currentAttendanceState[staffId].inTime, currentAttendanceState[staffId].outTime);
    currentAttendanceState[staffId].workedHours = calc.workedHours;
    currentAttendanceState[staffId].status = calc.status;
    currentAttendanceState[staffId].otHours = calc.otHours;
    currentAttendanceState[staffId].dailyEarned = calc.dailyEarned;

    renderAttendanceRows();
}

function handleOtChange(staffId, otVal) {
    const s = allStaff.find(x => x.id === staffId);
    if (!s) return;
    if (!currentAttendanceState[staffId]) currentAttendanceState[staffId] = {};

    const calc = computeHoursAndWage(s, currentAttendanceState[staffId].inTime, currentAttendanceState[staffId].outTime, otVal);
    currentAttendanceState[staffId].otHours = Number(otVal) || 0;
    currentAttendanceState[staffId].dailyEarned = calc.dailyEarned;

    renderAttendanceRows();
}

function setStaffStatusOverride(staffId, status) {
    const s = allStaff.find(x => x.id === staffId);
    if (!s) return;
    if (!currentAttendanceState[staffId]) currentAttendanceState[staffId] = {};

    currentAttendanceState[staffId].status = status;
    const rate = Number(s.wageRate) || 0;

    if (status === 'ABSENT') {
        currentAttendanceState[staffId].inTime = '';
        currentAttendanceState[staffId].outTime = '';
        currentAttendanceState[staffId].workedHours = 0;
        currentAttendanceState[staffId].otHours = 0;
        currentAttendanceState[staffId].dailyEarned = 0;
    } else if (status === 'HALF_DAY') {
        currentAttendanceState[staffId].dailyEarned = (rate * 0.5) + (currentAttendanceState[staffId].otHours * (rate / 8 * 1.5));
    } else {
        currentAttendanceState[staffId].dailyEarned = rate + (currentAttendanceState[staffId].otHours * (rate / 8 * 1.5));
    }

    renderAttendanceRows();
}

function setStaffRemarks(staffId, remarks) {
    if (!currentAttendanceState[staffId]) currentAttendanceState[staffId] = {};
    currentAttendanceState[staffId].remarks = remarks;
}

function clockInAllMorning() {
    allStaff.forEach(s => {
        const outTime = currentAttendanceState[s.id]?.outTime || '17:00';
        const calc = computeHoursAndWage(s, '08:00', outTime);
        currentAttendanceState[s.id] = {
            inTime: '08:00',
            outTime: outTime,
            status: calc.status,
            workedHours: calc.workedHours,
            otHours: calc.otHours,
            dailyEarned: calc.dailyEarned,
            remarks: currentAttendanceState[s.id]?.remarks || ''
        };
    });
    renderAttendanceRows();
    window.CoconutModule.showToast('🟢 All staff clocked in at 08:00 AM', 'info');
}

function clockOutAllEvening() {
    allStaff.forEach(s => {
        const inTime = currentAttendanceState[s.id]?.inTime || '08:00';
        const calc = computeHoursAndWage(s, inTime, '17:00');
        currentAttendanceState[s.id] = {
            inTime: inTime,
            outTime: '17:00',
            status: calc.status,
            workedHours: calc.workedHours,
            otHours: calc.otHours,
            dailyEarned: calc.dailyEarned,
            remarks: currentAttendanceState[s.id]?.remarks || ''
        };
    });
    renderAttendanceRows();
    window.CoconutModule.showToast('🔴 All staff clocked out at 05:00 PM (8.0 Hours)', 'info');
}

async function saveDailyAttendance() {
    const btn = document.getElementById('btnSaveAttendance');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;
    const dateStr = document.getElementById('attDate').value;
    const dateObj = window.CoconutModule.parseDateAny(dateStr) || new Date();

    try {
        const batch = db.batch();

        for (const s of allStaff) {
            const state = currentAttendanceState[s.id] || { inTime: '', outTime: '', status: 'PRESENT', workedHours: 0, otHours: 0, dailyEarned: 0, remarks: '' };
            const docId = `ATT_${bid}_${s.id}_${dateStr}`;
            const ref = db.collection('coconut_attendance').doc(docId);

            const dayMultiplier = state.status === 'PRESENT' ? 1.0 : (state.status === 'HALF_DAY' ? 0.5 : 0.0);

            batch.set(ref, {
                businessId: bid,
                staffId: s.id,
                staffName: s.name || '',
                role: s.role || '',
                wageRate: Number(s.wageRate) || 0,
                dateStr: dateStr,
                date: window.CoconutModule.tsToFirestore(dateObj),
                inTime: state.inTime || '',
                outTime: state.outTime || '',
                workedHours: Number(state.workedHours) || 0,
                status: state.status,
                dayMultiplier: dayMultiplier,
                otHours: Number(state.otHours) || 0,
                dailyEarned: Number(state.dailyEarned) || 0,
                remarks: state.remarks || '',
                updatedAt: window.CoconutModule.tsToFirestore(new Date())
            }, { merge: true });
        }

        await batch.commit();
        window.CoconutModule.showToast('✅ Daily Attendance & Hours saved successfully for ' + dateStr, 'success');

    } catch (err) {
        console.error('Error saving attendance:', err);
        window.CoconutModule.showToast('Failed to save attendance: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '💾 පැමිණීම සුරකින්න (Save Attendance)';
    }
}

// -------------------------------------------------------------------
// 2. EMPLOYEE ADVANCES ENGINE & GL POSTING
// -------------------------------------------------------------------

async function loadAdvances() {
    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;
    const body = document.getElementById('advancesHistoryBody');

    try {
        const snap = await db.collection('coconut_employee_advances')
            .where('businessId', '==', bid)
            .get();

        allAdvances = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(a => a.isActive !== false)
            .sort((a, b) => {
                const ta = a.date ? (a.date.toDate ? a.date.toDate().getTime() : new Date(a.date).getTime()) : 0;
                const tb = b.date ? (b.date.toDate ? b.date.toDate().getTime() : new Date(b.date).getTime()) : 0;
                return tb - ta;
            });

        // Compute balances
        const currentMonth = document.getElementById('payrollMonth').value || new Date().toISOString().substring(0, 7);
        let monthTotal = 0;
        let pendingTotal = 0;

        allAdvances.forEach(adv => {
            const amt = Number(adv.amount) || 0;
            const dateStr = adv.dateStr || '';
            if (dateStr.startsWith(currentMonth)) {
                monthTotal += amt;
            }
            if (adv.status !== 'RECOVERED') {
                pendingTotal += amt;
            }
        });

        document.getElementById('advMonthTotal').textContent = window.CoconutModule.fmtLKR(monthTotal);
        document.getElementById('advPendingBalance').textContent = window.CoconutModule.fmtLKR(pendingTotal);

        if (!allAdvances.length) {
            body.innerHTML = '<tr><td colspan="5" class="text-center" style="padding:16px; color:var(--c-text-muted);">No advance records found.</td></tr>';
            return;
        }

        body.innerHTML = allAdvances.slice(0, 20).map(adv => {
            const dt = window.CoconutModule.formatDate(adv.date);
            const amt = Number(adv.amount) || 0;
            const isRec = adv.status === 'RECOVERED';

            return `
                <tr>
                    <td>${dt}</td>
                    <td><strong>${window.CoconutModule.esc(adv.staffName || 'Staff')}</strong></td>
                    <td class="text-right" style="font-weight:700; color:#d97706;">${window.CoconutModule.fmtLKR(amt)}</td>
                    <td>
                        <span class="c-badge ${isRec ? 'c-badge-success' : 'c-badge-warning'}">
                            ${isRec ? 'Deducted in Payroll' : 'Active Balance'}
                        </span>
                    </td>
                    <td class="text-center">
                        <button class="c-btn c-btn-danger c-btn-sm" onclick="handleDeleteAdvance('${adv.id}')" title="Delete & Reverse GL">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error('Error loading advances:', err);
    }
}

async function handleSaveAdvance(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveAdvance');
    btn.disabled = true;
    btn.textContent = 'Recording & Posting GL...';

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const staffId = document.getElementById('advEmployee').value;
        const staffObj = allStaff.find(s => s.id === staffId);
        if (!staffObj) throw new Error('Please select an employee');

        const dateStr = document.getElementById('advDate').value;
        const dateObj = window.CoconutModule.parseDateAny(dateStr) || new Date();
        const amount = Number(document.getElementById('advAmount').value) || 0;
        const mode = document.getElementById('advMode').value;
        const remarks = document.getElementById('advRemarks').value.trim();

        if (amount <= 0) throw new Error('Advance amount must be greater than 0');

        const advanceId = `ADV_${window.CoconutModule.uid('emp')}`;

        const creditAccount = mode === 'BANK' ? '1-1020-01' : '1-1010-01';
        const creditAccountName = mode === 'BANK' ? 'Bank Account' : 'Cash in Hand';

        await window.CoconutModule.postJournalEntry({
            businessId: bid,
            description: `Employee Advance: ${staffObj.name} (${remarks || 'Staff Advance'})`,
            referenceType: 'EMPLOYEE_ADVANCE',
            ref: advanceId,
            date: dateObj,
            lines: [
                { accountCode: '1-1060-01', accountName: 'Employee Advances Receivable', debit: amount, credit: 0 },
                { accountCode: creditAccount, accountName: creditAccountName, debit: 0, credit: amount }
            ]
        });

        await db.collection('coconut_employee_advances').doc(advanceId).set({
            businessId: bid,
            advanceId,
            staffId,
            staffName: staffObj.name,
            role: staffObj.role || 'Staff',
            amount,
            mode,
            remarks,
            status: 'PENDING_DEDUCTION',
            dateStr,
            date: window.CoconutModule.tsToFirestore(dateObj),
            createdAt: window.CoconutModule.tsToFirestore(new Date()),
            isActive: true
        });

        window.CoconutModule.showToast(`✅ Advance of Rs. ${amount.toLocaleString()} issued to ${staffObj.name}`, 'success');
        document.getElementById('advanceForm').reset();
        document.getElementById('advDate').value = window.CoconutModule.toLocalDateStr(new Date());

        await loadAdvances();

    } catch (err) {
        window.CoconutModule.showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '💾 Record & Post GL';
    }
}

async function handleDeleteAdvance(advId) {
    if (!confirm('Are you sure you want to delete this advance record? This will also remove the GL entry.')) return;
    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        await db.collection('coconut_employee_advances').doc(advId).set({
            isActive: false,
            updatedAt: window.CoconutModule.tsToFirestore(new Date())
        }, { merge: true });

        const jSnap = await db.collection('journal').doc(bid).collection('entries')
            .where('ref', '==', advId)
            .get();
        
        jSnap.docs.forEach(async doc => {
            await doc.ref.delete();
        });

        window.CoconutModule.showToast('Advance entry removed & GL reversed', 'info');
        await loadAdvances();

    } catch (err) {
        window.CoconutModule.showToast('Failed to delete advance: ' + err.message, 'error');
    }
}

// -------------------------------------------------------------------
// 3. MONTHLY PAYROLL CALCULATION & SETTLEMENT
// -------------------------------------------------------------------

async function calculateMonthlyPayroll() {
    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;
    const monthStr = document.getElementById('payrollMonth').value;
    const body = document.getElementById('payrollTableBody');

    if (!allStaff.length) {
        body.innerHTML = '<tr><td colspan="10" class="text-center" style="padding:24px; color:var(--c-text-muted);">No staff registered yet.</td></tr>';
        return;
    }

    body.innerHTML = '<tr><td colspan="10" class="text-center" style="padding:24px;">Calculating monthly progress & payroll...</td></tr>';

    try {
        const attSnap = await db.collection('coconut_attendance')
            .where('businessId', '==', bid)
            .get();

        const attendanceMap = {};
        allStaff.forEach(s => {
            attendanceMap[s.id] = {
                fullDays: 0,
                halfDays: 0,
                absentDays: 0,
                otHours: 0,
                totalHours: 0
            };
        });

        attSnap.docs.forEach(doc => {
            const d = doc.data() || {};
            const sid = d.staffId;
            const dStr = d.dateStr || '';
            if (attendanceMap[sid] && dStr.startsWith(monthStr)) {
                if (d.status === 'PRESENT') attendanceMap[sid].fullDays += 1;
                else if (d.status === 'HALF_DAY') attendanceMap[sid].halfDays += 1;
                else if (d.status === 'ABSENT') attendanceMap[sid].absentDays += 1;
                attendanceMap[sid].otHours += (Number(d.otHours) || 0);
                attendanceMap[sid].totalHours += (Number(d.workedHours) || 0);
            }
        });

        const advSnap = await db.collection('coconut_employee_advances')
            .where('businessId', '==', bid)
            .get();

        const advanceMap = {};
        allStaff.forEach(s => { advanceMap[s.id] = 0; });

        advSnap.docs.forEach(doc => {
            const d = doc.data() || {};
            const sid = d.staffId;
            if (d.isActive !== false && advanceMap[sid] !== undefined && d.status !== 'RECOVERED') {
                advanceMap[sid] += (Number(d.amount) || 0);
            }
        });

        let totalGross = 0;
        let totalAdvances = 0;
        let totalNet = 0;

        calculatedPayrollRows = allStaff.map(s => {
            const att = attendanceMap[s.id] || { fullDays: 0, halfDays: 0, absentDays: 0, otHours: 0, totalHours: 0 };
            const rate = Number(s.wageRate) || 0;
            const hourlyRate = rate > 0 ? (rate / 8) : 0;
            const otAmount = att.otHours * (hourlyRate * 1.5);

            const baseEarned = (att.fullDays * rate) + (att.halfDays * (rate * 0.5));
            const grossWage = baseEarned + otAmount;
            const advancesDeducted = advanceMap[s.id] || 0;
            const netPayable = Math.max(0, grossWage - advancesDeducted);

            totalGross += grossWage;
            totalAdvances += advancesDeducted;
            totalNet += netPayable;

            return {
                staffId: s.id,
                staffName: s.name,
                role: s.role || 'Staff',
                rate,
                fullDays: att.fullDays,
                halfDays: att.halfDays,
                absentDays: att.absentDays,
                otHours: att.otHours,
                totalHours: att.totalHours,
                otAmount,
                grossWage,
                advancesDeducted,
                netPayable,
                monthStr
            };
        });

        if (document.getElementById('kpiStaffCount')) document.getElementById('kpiStaffCount').textContent = `${allStaff.length} Employees`;
        if (document.getElementById('kpiGrossSalary')) document.getElementById('kpiGrossSalary').textContent = window.CoconutModule.fmtLKR(totalGross);
        if (document.getElementById('kpiAdvancesTotal')) document.getElementById('kpiAdvancesTotal').textContent = window.CoconutModule.fmtLKR(totalAdvances);
        if (document.getElementById('kpiNetSalary')) document.getElementById('kpiNetSalary').textContent = window.CoconutModule.fmtLKR(totalNet);

        if (!calculatedPayrollRows.length) {
            body.innerHTML = '<tr><td colspan="10" class="text-center">No payroll records.</td></tr>';
            return;
        }

        body.innerHTML = calculatedPayrollRows.map(row => `
            <tr>
                <td><strong>${window.CoconutModule.esc(row.staffName)}</strong></td>
                <td><span class="c-badge c-badge-neutral">${window.CoconutModule.esc(row.role)}</span></td>
                <td class="text-right">Rs. ${window.CoconutModule.fmt(row.rate, 2)}</td>
                <td class="text-center" style="font-weight:700; color:#166534;">${row.fullDays}</td>
                <td class="text-center" style="font-weight:700; color:#d97706;">${row.halfDays}</td>
                <td class="text-center" style="font-weight:700; color:#0284c7;">${row.otHours} hrs</td>
                <td class="text-right" style="font-weight:700;">${window.CoconutModule.fmtLKR(row.grossWage)}</td>
                <td class="text-right" style="font-weight:700; color:#dc2626;">-${window.CoconutModule.fmtLKR(row.advancesDeducted)}</td>
                <td class="text-right" style="font-weight:800; color:#0f3b2c; font-size:14px;">${window.CoconutModule.fmtLKR(row.netPayable)}</td>
                <td class="text-center">
                    <button class="c-btn c-btn-primary c-btn-sm" onclick="openSettleSalaryModal('${row.staffId}')" title="Settle Net Salary">💳 Settle</button>
                    <button class="c-btn c-btn-secondary c-btn-sm" onclick="viewEmployeePayslip('${row.staffId}')" title="View Payslip">📄 Payslip</button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error('Error calculating payroll:', err);
        body.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Error calculating monthly payroll: ' + err.message + '</td></tr>';
    }
}

function viewEmployeePayslip(staffId) {
    const row = calculatedPayrollRows.find(r => r.staffId === staffId);
    if (!row) return;

    const content = document.getElementById('payslipContent');
    content.innerHTML = `
        <div class="payslip-box">
            <div style="text-align:center; border-bottom:2px solid #0f3b2c; padding-bottom:10px; margin-bottom:12px;">
                <h2 style="margin:0; color:#0f3b2c; font-size:18px;">🥥 DIGIBIZ COCONUT PRODUCTS</h2>
                <div style="font-size:12px; color:#64748b;">Staff Monthly Wages & Earnings Slip</div>
                <div style="font-weight:700; font-size:13px; margin-top:4px;">Period: ${row.monthStr}</div>
            </div>

            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span>Employee Name:</span>
                <strong>${window.CoconutModule.esc(row.staffName)}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                <span>Designation / Role:</span>
                <span>${window.CoconutModule.esc(row.role)}</span>
            </div>

            <hr style="border:0; border-top:1px dashed #cbd5e1; margin:10px 0;">

            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span>Full Days Worked (${row.fullDays} days @ Rs. ${window.CoconutModule.fmt(row.rate)}):</span>
                <span>Rs. ${window.CoconutModule.fmt(row.fullDays * row.rate, 2)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span>Half Days (${row.halfDays} days @ 50%):</span>
                <span>Rs. ${window.CoconutModule.fmt(row.halfDays * (row.rate * 0.5), 2)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span>Overtime (${row.otHours} hrs):</span>
                <span>Rs. ${window.CoconutModule.fmt(row.otAmount, 2)}</span>
            </div>

            <div style="display:flex; justify-content:space-between; font-weight:700; padding:6px 0; border-top:1px solid #e2e8f0; margin-bottom:6px;">
                <span>GROSS EARNED WAGES:</span>
                <span>${window.CoconutModule.fmtLKR(row.grossWage)}</span>
            </div>

            <div style="display:flex; justify-content:space-between; color:#dc2626; margin-bottom:6px;">
                <span>Less: Total Advances Deducted:</span>
                <span>-${window.CoconutModule.fmtLKR(row.advancesDeducted)}</span>
            </div>

            <div style="display:flex; justify-content:space-between; font-size:16px; font-weight:800; color:#0f3b2c; padding-top:8px; border-top:2px solid #0f3b2c; margin-top:8px;">
                <span>NET PAYABLE SALARY:</span>
                <span>${window.CoconutModule.fmtLKR(row.netPayable)}</span>
            </div>

            <div style="margin-top:30px; display:flex; justify-content:space-between; font-size:11px; color:#64748b;">
                <div>____________________<br>Employer Signature</div>
                <div>____________________<br>Employee Signature</div>
            </div>
        </div>
    `;

    document.getElementById('payslipModal').classList.add('open');
}

function openSettleSalaryModal(staffId) {
    const row = calculatedPayrollRows.find(r => r.staffId === staffId);
    if (!row) return;

    if (row.netPayable <= 0) {
        window.CoconutModule.showToast('Net payable salary is Rs. 0.00. No disbursement required.', 'info');
        return;
    }

    document.getElementById('setStaffId').value = staffId;
    document.getElementById('setStaffName').textContent = `Staff: ${row.staffName} (${row.role})`;
    document.getElementById('setPeriodText').textContent = `Payroll Period: ${row.monthStr} | Gross: ${window.CoconutModule.fmtLKR(row.grossWage)} | Advances: ${window.CoconutModule.fmtLKR(row.advancesDeducted)}`;
    document.getElementById('setNetAmt').textContent = window.CoconutModule.fmtLKR(row.netPayable);

    document.getElementById('settleModal').classList.add('open');
}

async function handleConfirmSettleSalary(e) {
    e.preventDefault();
    const btn = document.getElementById('btnConfirmSettle');
    btn.disabled = true;
    btn.textContent = 'Posting Journal & Settling...';

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    try {
        const staffId = document.getElementById('setStaffId').value;
        const row = calculatedPayrollRows.find(r => r.staffId === staffId);
        if (!row) throw new Error('Payroll row not found');

        const account = document.getElementById('setAccount').value;
        const dateStr = document.getElementById('setDate').value;
        const dateObj = window.CoconutModule.parseDateAny(dateStr) || new Date();

        const payrollRecordId = `PAY_${window.CoconutModule.uid('sal')}`;
        const creditAccount = account === 'BANK' ? '1-1020-01' : '1-1010-01';
        const creditAccountName = account === 'BANK' ? 'Bank Account' : 'Cash in Hand';

        const journalLines = [
            { accountCode: '5-5030-01', accountName: 'Salaries & Wages Expense', debit: row.grossWage, credit: 0 }
        ];

        if (row.advancesDeducted > 0) {
            journalLines.push({
                accountCode: '1-1060-01',
                accountName: 'Employee Advances Receivable',
                debit: 0,
                credit: row.advancesDeducted
            });
        }

        if (row.netPayable > 0) {
            journalLines.push({
                accountCode: creditAccount,
                accountName: creditAccountName,
                debit: 0,
                credit: row.netPayable
            });
        }

        await window.CoconutModule.postJournalEntry({
            businessId: bid,
            description: `Salary Settlement: ${row.staffName} for ${row.monthStr}`,
            referenceType: 'SALARY_PAYMENT',
            ref: payrollRecordId,
            date: dateObj,
            lines: journalLines
        });

        const advSnap = await db.collection('coconut_employee_advances')
            .where('businessId', '==', bid)
            .where('staffId', '==', staffId)
            .where('isActive', '==', true)
            .get();

        const batch = db.batch();
        advSnap.docs.forEach(doc => {
            const d = doc.data();
            if (d.status !== 'RECOVERED') {
                batch.update(doc.ref, {
                    status: 'RECOVERED',
                    recoveredInPayroll: payrollRecordId,
                    recoveredAt: window.CoconutModule.tsToFirestore(dateObj)
                });
            }
        });

        const payRef = db.collection('coconut_payroll_records').doc(payrollRecordId);
        batch.set(payRef, {
            businessId: bid,
            payrollRecordId,
            staffId,
            staffName: row.staffName,
            role: row.role,
            monthStr: row.monthStr,
            grossWage: row.grossWage,
            advancesDeducted: row.advancesDeducted,
            netPayable: row.netPayable,
            paymentMode: account,
            date: window.CoconutModule.tsToFirestore(dateObj),
            settledAt: window.CoconutModule.tsToFirestore(new Date()),
            status: 'SETTLED'
        });

        await batch.commit();

        window.CoconutModule.showToast(`✅ Salary settled for ${row.staffName} (${window.CoconutModule.fmtLKR(row.netPayable)})`, 'success');
        document.getElementById('settleModal').classList.remove('open');

        await calculateMonthlyPayroll();

    } catch (err) {
        window.CoconutModule.showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '✅ Settle & Post GL';
    }
}
