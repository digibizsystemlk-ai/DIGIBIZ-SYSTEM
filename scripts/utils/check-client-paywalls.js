const fs = require('fs');
const path = require('path');

const clientDirs = [
  'chisathifamily',
  'delightbakers',
  'madawalateashop',
  'sathityrecentre',
  'spi_holdings',
  'sunroselanka',
  'thusithajayasundara'
];

clientDirs.forEach(c => {
  const filePath = path.join('i:/DIGIBIZ-SYSTEM/public/clients', c, 'index.html');
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');

  const hasPaywall = content.includes('paywall') || content.includes('checkSubscriptionPaywallLock') || content.includes('isExpired');
  const hasSubSync = content.includes('system_clients');
  
  console.log(c, '->', {
    hasPaywall,
    hasSubSync
  });
});
