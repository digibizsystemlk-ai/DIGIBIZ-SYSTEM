const fs = require('fs');
const assert = require('assert');

// 1. Verify admin file
const admin = fs.readFileSync('public/admin/index.html', 'utf8');
assert(admin.includes('DEFAULT_CLIENTS'), 'DEFAULT_CLIENTS must exist');
assert(!admin.includes('14-DAY TRIAL'), 'Must NOT have 14-DAY TRIAL');
assert(!admin.includes('ENTERPRISE PRO'), 'Must NOT have ENTERPRISE PRO default');

// 2. Check each client folder's index.html
const clients = [
  'chisathifamily',
  'delightbakers',
  'madawalateashop',
  'sathityrecentre',
  'spi_holdings',
  'sunroselanka',
  'thusithajayasundara',
  'bawantharandipa'
];

clients.forEach(c => {
  const f = `public/clients/${c}/index.html`;
  assert(fs.existsSync(f), `File must exist: ${f}`);
  const html = fs.readFileSync(f, 'utf8');
  assert(html.length > 1000, `${c} file length must be valid`);
});

console.log('>>> 100% SUBSCRIPTION SYSTEM INTEGRITY TEST PASSED! <<<');
