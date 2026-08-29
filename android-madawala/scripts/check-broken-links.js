const fs = require('fs');
const path = require('path');

const dirs = ['public/admin', 'public/modules/admin', 'public/core'];
let broken = [];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(f => {
        if (!f.endsWith('.html') && !f.endsWith('.js')) return;
        const fp = path.join(dir, f);
        const text = fs.readFileSync(fp, 'utf8');
        
        // Regex for internal links like /modules/... or /admin/...
        const regex = /['"`](\/(?:modules|admin|auth|snapshots)\/[a-zA-Z0-9_\-\/]+\.html)['"`]/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const link = match[1];
            const targetPath = path.join('public', link.replace(/^\//, ''));
            if (!fs.existsSync(targetPath)) {
                broken.push({ source: fp, link, targetPath });
            }
        }
    });
});

console.log('Broken Links Audit:');
const unique = new Map();
broken.forEach(b => unique.set(b.source + ' -> ' + b.link, b));
unique.forEach((b, k) => console.log(k));
console.log('Total unique broken links:', unique.size);
