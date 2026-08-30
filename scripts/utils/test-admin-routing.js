const fs = require('fs');
const assert = require('assert');

const adminHtml = fs.readFileSync('i:/DIGIBIZ-SYSTEM/public/admin/index.html', 'utf8');
assert(adminHtml.includes('handleInlineAdminLogin'), 'Must have handleInlineAdminLogin');
assert(!adminHtml.includes("setTimeout(() => { window.location.replace('/'); }, 400);"), 'Must not have force redirect');

const fb = JSON.parse(fs.readFileSync('i:/DIGIBIZ-SYSTEM/firebase.json', 'utf8'));
assert(fb.hosting.rewrites.some(r => r.source === '/admin'), 'Must have /admin rewrite');

console.log('>>> ADMIN AUTH & ROUTING INTEGRITY TEST PASSED! <<<');
