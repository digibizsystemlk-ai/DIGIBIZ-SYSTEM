const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'modules', 'admin');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const replacement = `if (window.dashboardCore && typeof window.dashboardCore.getVerticalDashboardUrl === 'function') { window.location.href = window.dashboardCore.getVerticalDashboardUrl(businessType); } else { window.location.href = (businessType === 'attendance_payroll' ? '/modules/attendance_payroll/dashboard.html' : '/modules/scrap_collection_center/dashboard.html'); }`;

let count = 0;
files.forEach(f => {
    const p = path.join(dir, f);
    let content = fs.readFileSync(p, 'utf8');
    if (content.includes('/modules/admin/dashboard.html') || content.includes('/admin/dashboard.html')) {
        content = content.replace(/window\.location\.href\s*=\s*['\"]\/?(modules\/)?admin\/dashboard\.html['\"];?/g, replacement);
        fs.writeFileSync(p, content, 'utf8');
        console.log('Fixed:', f);
        count++;
    }
});
console.log('Total files fixed:', count);
