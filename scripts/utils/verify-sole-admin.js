const fs = require('fs');
const assert = require('assert');

// 1. Verify admin index.html
const adminHtml = fs.readFileSync('i:/DIGIBIZ-SYSTEM/public/admin/index.html', 'utf8');
assert(adminHtml.includes("const ADMIN_EMAILS = [\n            'biz.sirimal@gmail.com'\n        ];") || adminHtml.includes("const ADMIN_EMAILS = [\r\n            'biz.sirimal@gmail.com'\r\n        ];"), 'Must only have biz.sirimal@gmail.com');
assert(adminHtml.includes("isAdmin = (email === 'biz.sirimal@gmail.com');"), 'Must check strictly biz.sirimal@gmail.com');
assert(!adminHtml.includes("digibiz.pro@gmail.com"), 'Must not have other admin pills in UI');

// 2. Verify root index.html
const rootHtml = fs.readFileSync('i:/DIGIBIZ-SYSTEM/public/index.html', 'utf8');
assert(rootHtml.includes("if (cleanEmail === 'biz.sirimal@gmail.com') {\n                    targetWorkspace = '/admin/';") || rootHtml.includes("if (cleanEmail === 'biz.sirimal@gmail.com') {\r\n                    targetWorkspace = '/admin/';"), 'Must route strictly biz.sirimal@gmail.com');

console.log('>>> 100% EXCLUSIVE SUPER ADMIN EMAIL CHECK PASSED! <<<');
