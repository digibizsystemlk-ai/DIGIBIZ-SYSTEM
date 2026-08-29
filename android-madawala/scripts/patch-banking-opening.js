const fs = require('fs');

const bankingFiles = [
    'public/modules/tire_centre/banking.html',
    'public/modules/retail/banking.html'
];

const openingSourceHtml = `            <div id="accOpeningSourceWrap" style="display:none;" class="radio-box-group">
                <label style="color:#0f3b2c; font-weight:800; margin-bottom:6px;">ආරම්භක ශේෂයේ ප්‍රභවය (Opening Balance Source):</label>
                <label class="radio-option">
                    <input type="radio" name="accOpeningDeductDrawer" value="no" checked>
                    <span>🟢 <strong>පවතින බැංකු මුදලක් (ලාච්චුවෙන් / Cash Flow එකෙන් අඩු නොකරන්න)</strong> — මෙය දැනටමත් බැංකුවේ ඇති මුදලකි. ව්‍යාපාරයේ ලාච්චුවේ මුදලින් අඩු නොවේ.</span>
                </label>
                <label class="radio-option">
                    <input type="radio" name="accOpeningDeductDrawer" value="yes">
                    <span>🔴 <strong>ලාච්චුවේ මුදල් බැංකුවට දැමීමක් (ලාච්චුවෙන් අඩු කරන්න)</strong> — ලාච්චුවේ ඇති මුදල් වලින් මෙම මුදල අඩු කර බැංකුවට එකතු වේ.</span>
                </label>
            </div>`;

bankingFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');

    // 1. Add opening source radio group after accOpeningBalance input
    const targetInput = '<input type="number" id="accOpeningBalance" placeholder="Opening Balance (Rs.)" min="0" value="0">';
    const targetInput2 = '<input type="number" id="accOpeningBalance" placeholder="Opening Balance (Rs.)" min="0"\n                value="0">';
    
    if (html.includes(targetInput) && !html.includes('accOpeningSourceWrap')) {
        html = html.replace(targetInput, targetInput + '\n\n' + openingSourceHtml);
    } else if (html.includes(targetInput2) && !html.includes('accOpeningSourceWrap')) {
        html = html.replace(targetInput2, targetInput2 + '\n\n' + openingSourceHtml);
    }

    // 2. Add input event listener for accOpeningBalance
    const openAccModalHook = `document.getElementById('openAddAccBtn').onclick = () => {`;
    const openAccModalReplacement = `document.getElementById('accOpeningBalance').oninput = function() {
            const wrap = document.getElementById('accOpeningSourceWrap');
            if (wrap) wrap.style.display = (parseFloat(this.value) || 0) > 0 ? 'block' : 'none';
        };

        document.getElementById('openAddAccBtn').onclick = () => {
            const wrap = document.getElementById('accOpeningSourceWrap');
            if (wrap) wrap.style.display = 'none';`;

    if (html.includes(openAccModalHook) && !html.includes("document.getElementById('accOpeningBalance').oninput")) {
        html = html.replace(openAccModalHook, openAccModalReplacement);
    }

    // 3. Update saveAccBtn
    const oldSaveLogic = `if (openingBalance > 0) {
                const trId = 'TR-' + Date.now() + '-OP';
                const trRef = db.collection('banks').doc(currentBusinessId).collection('transactions').doc(trId);
                batch.set(trRef, {
                    bankAccountId: accId,
                    type: 'CASH_DEPOSIT',
                    amount: openingBalance,
                    ref: 'Opening Balance Setup',
                    createdAt: new Date()
                });
            }`;

    const newSaveLogic = `const deductDrawer = document.querySelector('input[name="accOpeningDeductDrawer"]:checked')?.value === 'yes';

            if (openingBalance > 0) {
                const trId = 'TR-' + Date.now() + '-OP';
                const trRef = db.collection('banks').doc(currentBusinessId).collection('transactions').doc(trId);
                batch.set(trRef, {
                    bankAccountId: accId,
                    type: deductDrawer ? 'CASH_DEPOSIT' : 'OPENING_BALANCE',
                    isOpeningBalance: true,
                    deductedFromDrawer: deductDrawer,
                    amount: openingBalance,
                    ref: deductDrawer ? 'Cash Deposited to Bank (Opening Setup)' : 'Opening Balance Setup',
                    createdAt: new Date()
                });
            }`;

    if (html.includes(oldSaveLogic)) {
        html = html.replace(oldSaveLogic, newSaveLogic);
    }

    fs.writeFileSync(file, html, 'utf8');
    console.log('✅ Updated ' + file + ' with opening balance drawer deduction prompt!');
});
