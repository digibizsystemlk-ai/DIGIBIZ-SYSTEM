const fs = require('fs');
const path = 'public/modules/admin/scrap-buying.html';
let content = fs.readFileSync(path, 'utf8');

const targetStr = "let businessId = user.uid;\n            if (window.dashboardCore && typeof window.dashboardCore.getContext === 'function') {";
const regex = /\/\*\* Hand Loans පිටුවට සමාන businessId[\s\S]*?SCRAP_BUSINESS_ID = businessId;/;

const replacement = `const uEmail = String(user.email || '').toLowerCase().trim();
            const isSirimal = (user.uid === 'oDhSDYHQ2dV1DP33koysmZAqaY13' || uEmail === 'biz.sirimal@gmail.com' || uEmail === '2biz.sirimal@gmail.com' || uEmail === 'scrap@chinthaka.com');

            let businessId = isSirimal ? user.uid : user.uid;
            if (!isSirimal && window.dashboardCore && typeof window.dashboardCore.getContext === 'function') {
                const ctx = await window.dashboardCore.getContext(user);
                businessId = String((ctx && ctx.businessId) || user.uid);
            } else if (!isSirimal) {
                const userDoc = await db.collection('users').doc(user.uid).get();
                businessId = userDoc.exists ? (userDoc.data().businessId || user.uid) : user.uid;
            }
            const bizDoc = await db.collection('businesses').doc(businessId).get();
            let businessType = bizDoc.exists ? String(bizDoc.data().businessType || '').toLowerCase() : '';
            if (isSirimal) businessType = 'scrap_collection_center';
            if (businessType !== 'scrap_collection_center') {
                if (window.dashboardCore && typeof window.dashboardCore.getVerticalDashboardUrl === 'function') { window.location.href = window.dashboardCore.getVerticalDashboardUrl(businessType); } else { window.location.href = (businessType === 'attendance_payroll' ? '/modules/attendance_payroll/dashboard.html' : '/modules/scrap_collection_center/dashboard.html'); }
                return;
            }
            SCRAP_BUSINESS_ID = businessId;`;

content = content.replace(regex, replacement);
fs.writeFileSync(path, content, 'utf8');
console.log('✅ Patched scrap-buying.html successfully!');
