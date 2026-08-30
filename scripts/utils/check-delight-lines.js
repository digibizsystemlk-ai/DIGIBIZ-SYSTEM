const fs = require('fs');
const content = fs.readFileSync('i:/DIGIBIZ-SYSTEM/public/clients/delightbakers/index.html', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('subscription:') || l.includes('function renderSubscription') || l.includes('checkSubscription')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
