const fs = require('fs');
const path = require('path');

const clientsDir = path.join(__dirname, '..', 'public', 'clients');
const dirs = fs.readdirSync(clientsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'))
    .map(d => d.name);

dirs.forEach(dir => {
    const p = path.join(clientsDir, dir, 'index.html');
    if (!fs.existsSync(p)) return;
    const content = fs.readFileSync(p, 'utf8');
    const matches = content.match(/localStorage\.setItem\(['"]([^'"]+auth[^'"]*)['"]/g) || [];
    const keys = matches.map(m => m.replace(/localStorage\.setItem\(['"]/, '').replace(/['"]$/, ''));
    console.log(dir, '=>', [...new Set(keys)]);
});
