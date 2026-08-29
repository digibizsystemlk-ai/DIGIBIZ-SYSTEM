/**
 * Injects User Manual menu items into all business types in business-types.js
 */
const fs = require('fs');
const path = require('path');

const btFile = path.resolve(__dirname, '../public/core/business-types.js');
let content = fs.readFileSync(btFile, 'utf8');

const verticals = [
    { id: 'retail', link: '/modules/retail/user-manual.html', role: '["SUPER_ADMIN", "BUSINESS_OWNER", "ADMIN", "MANAGER", "ACCOUNTANT", "CASHIER", "VIEWER", "STAFF", "BUSINESS_STAFF"]' },
    { id: 'tire_centre', link: '/modules/tire_centre/user-manual.html', role: '["SUPER_ADMIN", "BUSINESS_OWNER", "ACCOUNTANT", "CASHIER", "VIEWER", "STAFF"]' },
    { id: 'auto_care', link: '/modules/auto_care/user-manual.html', role: '["SUPER_ADMIN", "BUSINESS_OWNER", "ADMIN", "MANAGER", "ACCOUNTANT", "CASHIER", "STAFF", "STORE_KEEPER", "VIEWER", "USER"]' },
    { id: 'pharmacy', link: '/modules/pharmacy/user-manual.html', role: '["SUPER_ADMIN", "BUSINESS_OWNER", "ADMIN", "MANAGER", "ACCOUNTANT", "CASHIER", "STORE_KEEPER", "STAFF", "BUSINESS_STAFF", "USER", "VIEWER"]' },
    { id: 'restaurant', link: '/modules/restaurant/user-manual.html', role: '["SUPER_ADMIN", "BUSINESS_OWNER", "MANAGER", "ACCOUNTANT", "CASHIER"]' },
    { id: 'garment', link: '/modules/garment/user-manual.html', role: '["SUPER_ADMIN", "BUSINESS_OWNER", "MANAGER", "ACCOUNTANT", "CASHIER"]' },
    { id: 'hardware', link: '/modules/hardware/user-manual.html', role: '["SUPER_ADMIN", "BUSINESS_OWNER", "ADMIN", "MANAGER", "ACCOUNTANT", "CASHIER", "STORE_KEEPER"]' },
    { id: 'service', link: '/modules/service/user-manual.html', role: '["SUPER_ADMIN", "BUSINESS_OWNER", "ADMIN", "MANAGER", "ACCOUNTANT", "STAFF"]' },
    { id: 'manufacturer', link: '/modules/manufacturer/user-manual.html', role: '["SUPER_ADMIN", "BUSINESS_OWNER", "ACCOUNTANT", "MANAGER", "VIEWER"]' },
    { id: 'scrap_collection_center', link: '/modules/scrap_collection_center/user-manual.html', role: '["SUPER_ADMIN", "BUSINESS_OWNER", "ADMIN", "MANAGER", "ACCOUNTANT", "CASHIER", "STAFF", "STORE_KEEPER", "VIEWER", "USER"]' },
    { id: 'coconut', link: '/modules/coconut/user-manual.html', role: '["SUPER_ADMIN", "BUSINESS_OWNER", "ADMIN", "MANAGER", "ACCOUNTANT", "CASHIER", "STORE_KEEPER", "VIEWER", "USER"]' },
    { id: 'attendance_payroll', link: '/modules/attendance_payroll/user-manual.html', role: '["SUPER_ADMIN", "BUSINESS_OWNER", "HR_MANAGER", "ACCOUNTANT", "VIEWER", "CASHIER", "STAFF", "STORE_KEEPER"]' }
];

console.log('[UpdateBusinessTypes] Adding User Manual links to all business types...');
for (const v of verticals) {
    const manualEntry = `{ icon: "📖", name: "User Manual", link: "${v.link}", role: ${v.role} }`;
    // Find where the vertical is defined in content
    const vertRegex = new RegExp(`(${v.id}:\\s*\\{[\\s\\S]*?menus:\\s*\\[)([\\s\\S]*?)(\\n\\s*\\])`);
    if (vertRegex.test(content)) {
        const match = content.match(vertRegex);
        if (!match[2].includes('User Manual')) {
            content = content.replace(vertRegex, `$1$2,\n            ${manualEntry}$3`);
            console.log(`✅ Added User Manual to ${v.id}`);
        }
    }
}

fs.writeFileSync(btFile, content, 'utf8');
console.log('[UpdateBusinessTypes] ✅ Updated public/core/business-types.js successfully!');
