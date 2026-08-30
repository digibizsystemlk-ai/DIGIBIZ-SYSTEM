const fs = require('fs');
const file = 'i:/DIGIBIZ-SYSTEM/public/clients/madawalateashop/index.html';
let content = fs.readFileSync(file, 'utf8');

const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

const needle = `            } else if (gcAdvanceRow) {
                gcAdvanceRow.style.display = 'none';
            }
        }

            const smsHeaderInput = document.getElementById('smsHeaderInput');`;

const fullBlock = `            } else if (gcAdvanceRow) {
                gcAdvanceRow.style.display = 'none';
            }
        }

        function onWizardMethodChange(val) {
            const bankRow = document.getElementById('wzCdBankRow');
            if (bankRow) bankRow.style.display = (val === 'BANK') ? 'block' : 'none';
        }

        function onSettleMethodChange() {
            const method = document.getElementById('settlePayMethod').value;
            const bankRow = document.getElementById('settleBankRow');
            if (bankRow) bankRow.style.display = (method === 'BANK') ? 'block' : 'none';
        }

        // ==========================================
        // 5. BILLING & SUBSCRIPTION SYSTEM LOGIC
        // ==========================================
        function getDaysRemaining(expireDateStr) {
            if (!expireDateStr) return 1;
            // Support explicit 12:00 PM noon cutoff for 2026-08-31
            let expTime = 'T23:59:59';
            if (expireDateStr === '2026-08-31' || expireDateStr.includes('2026-08-31')) {
                expTime = 'T12:00:00';
            }
            const exp = expireDateStr.includes('T') ? new Date(expireDateStr) : new Date(expireDateStr + expTime);
            const now = new Date();
            const diff = exp.getTime() - now.getTime();
            if (diff <= 0) return 0;
            return Math.ceil(diff / (1000 * 60 * 60 * 24));
        }

        function updateSubscriptionUI() {
            const sub = currentSubscription;
            const daysLeft = getDaysRemaining(sub.expireDate);
            const isTrial = (sub.plan || '').toUpperCase().includes('TRIAL') || sub.status === 'trial';

            // Sidebar subscription status
            const sidePlan = document.getElementById('sidePlanName');
            if (sidePlan) sidePlan.textContent = sub.plan || 'TRIAL';

            const sideDays = document.getElementById('sidePlanDaysLeft');
            if (sideDays) sideDays.textContent = daysLeft === 1 ? '1 Day Left (Expires Tomorrow 12PM)' : (daysLeft <= 0 ? 'Trial Expired' : (daysLeft + ' Days Left'));

            const sideBadge = document.getElementById('sidePlanStatusBadge');
            if (sideBadge) {
                if (daysLeft <= 0) {
                    sideBadge.textContent = 'EXPIRED';
                    sideBadge.className = 'status-badge expired';
                } else {
                    sideBadge.textContent = 'ACTIVE';
                    sideBadge.className = 'status-badge active';
                }
            }

            // Subscription tab UI
            const planVal = document.getElementById('planValue');
            if (planVal) planVal.textContent = (sub.plan || 'TRIAL').toUpperCase();

            const expVal = document.getElementById('expiryValue');
            if (expVal) expVal.textContent = (sub.expireDate || '2026-08-31') + ' 12:00 PM';

            const feeTxt = document.getElementById('subFeeText');
            if (feeTxt) feeTxt.textContent = 'Rs. ' + (sub.monthlyFee || 1000).toLocaleString();

            const daysCircleNum = document.getElementById('daysRemaining');
            if (daysCircleNum) daysCircleNum.textContent = daysLeft;

            const daysCircleLbl = document.getElementById('daysRemainingLabel');
            if (daysCircleLbl) daysCircleLbl.textContent = daysLeft === 1 ? 'day left (noon)' : (daysLeft <= 0 ? 'expired' : 'days left');

            const subStatusBadgeText = document.getElementById('subStatusBadgeText');
            if (subStatusBadgeText) subStatusBadgeText.textContent = isTrial ? (daysLeft <= 0 ? 'Trial Expired' : 'Trial Active') : 'PRO Active';

            const smsBal = document.getElementById('smsBalanceValue');
            if (smsBal) smsBal.textContent = sub.smsBalance || 300;

            const trialCreds = document.getElementById('trialCreditsEffective');
            if (trialCreds) trialCreds.textContent = sub.smsBalance || 300;

            const trialEnds = document.getElementById('trialSmsEnds');
            if (trialEnds) trialEnds.textContent = (sub.expireDate || '2026-08-31') + ', 12:00:00 PM (Noon)';

            const smsHeaderInput = document.getElementById('smsHeaderInput');`;

if (content.includes(needle)) {
    content = content.replace(needle, fullBlock);
    if (isCRLF) content = content.replace(/\n/g, '\r\n');
    fs.writeFileSync(file, content, 'utf8');
    console.log('SUCCESS: madawalateashop index.html updated cleanly!');
} else {
    console.log('FAILED: needle not found in file');
}
