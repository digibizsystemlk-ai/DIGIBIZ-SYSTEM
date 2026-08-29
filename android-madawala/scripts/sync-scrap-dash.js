const fs = require('fs');
const retailContent = fs.readFileSync('public/modules/retail/dashboard.html', 'utf8');

// The scrap dashboard HTML is identical to retail dashboard HTML with the scrap hero card.
// Let's write the clean version for scrap_collection_center/dashboard.html
fs.writeFileSync('public/modules/scrap_collection_center/dashboard.html', retailContent, 'utf8');
console.log('✅ Synchronized scrap_collection_center/dashboard.html with clean retail dashboard engine!');
