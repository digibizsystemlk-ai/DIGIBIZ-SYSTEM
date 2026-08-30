const fs = require('fs');

let adminHtml = fs.readFileSync('i:/DIGIBIZ-SYSTEM/public/admin/index.html', 'utf8');
adminHtml = adminHtml.replace(/, 'digibiz\.pro@gmail\.com'/g, '');

fs.writeFileSync('i:/DIGIBIZ-SYSTEM/public/admin/index.html', adminHtml, 'utf8');
fs.writeFileSync('i:/DIGIBIZ-SYSTEM/public/admin/business-management.html', adminHtml, 'utf8');
fs.writeFileSync('i:/DIGIBIZ-SYSTEM/public/admin/live-activity.html', adminHtml, 'utf8');
fs.writeFileSync('i:/DIGIBIZ-SYSTEM/public/std/modules/admin/live-activity.html', adminHtml, 'utf8');
console.log('Cleaned allowedEmails across all admin pages!');
