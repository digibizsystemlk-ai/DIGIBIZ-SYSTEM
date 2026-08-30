const fs = require('fs');
const content = fs.readFileSync('i:/DIGIBIZ-SYSTEM/public/clients/delightbakers/index.html', 'utf8');
console.log('Delight bakers total lines:', content.split('\n').length);
const subMatch = content.match(/subscription/gi);
console.log('subscription mentions:', subMatch ? subMatch.length : 0);
