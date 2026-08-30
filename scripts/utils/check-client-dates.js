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

  const startMatch = content.match(/startDate\s*:\s*['"]([^'"]+)['"]/);
  const expMatch = content.match(/expireDate\s*:\s*['"]([^'"]+)['"]/);
  const planMatch = content.match(/plan\s*:\s*['"]([^'"]+)['"]/);
  const statusMatch = content.match(/status\s*:\s*['"]([^'"]+)['"]/);
  
  console.log(c, '->', {
    startDate: startMatch ? startMatch[1] : 'N/A',
    expireDate: expMatch ? expMatch[1] : 'N/A',
    plan: planMatch ? planMatch[1] : 'N/A',
    status: statusMatch ? statusMatch[1] : 'N/A'
  });
});
