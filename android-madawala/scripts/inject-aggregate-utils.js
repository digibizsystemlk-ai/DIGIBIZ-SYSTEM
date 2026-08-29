const fs = require('fs');
const path = require('path');

function walk(dir) {
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        if (e.name === 'node_modules' || e.name === '.git' || e.name === 'snapshots') continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) files.push(...walk(full));
        else if (e.name.endsWith('.html')) files.push(full);
    }
    return files;
}

const htmlFiles = walk('i:/DIGIBIZ_MASTER/public');
let updatedCount = 0;

for (const file of htmlFiles) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('dashboard-core.js') || content.includes('coconut-common.js') || content.includes('pos.html')) {
        if (!content.includes('aggregate-utils.js')) {
            if (content.includes('/core/dashboard-core.js')) {
                content = content.replace('/core/dashboard-core.js', '/core/aggregate-utils.js"></script>\n    <script src="/core/dashboard-core.js');
                fs.writeFileSync(file, content, 'utf8');
                updatedCount++;
                console.log('Injected aggregate-utils.js into:', file);
            } else if (content.includes('coconut-common.js')) {
                content = content.replace('coconut-common.js', '/core/aggregate-utils.js"></script>\n    <script src="coconut-common.js');
                fs.writeFileSync(file, content, 'utf8');
                updatedCount++;
                console.log('Injected aggregate-utils.js into (coconut):', file);
            }
        }
    }
}

console.log('Total files updated with aggregate-utils.js:', updatedCount);
