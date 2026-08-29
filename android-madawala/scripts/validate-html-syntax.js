const fs = require('fs');
const path = require('path');
const vm = require('vm');

function checkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fp = path.join(dir, file);
        if (fs.statSync(fp).isDirectory()) {
            if (!fp.includes('node_modules') && !fp.includes('.git')) {
                checkDir(fp);
            }
        } else if (file.endsWith('.html')) {
            const html = fs.readFileSync(fp, 'utf8');
            const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
            let match;
            let count = 0;
            while ((match = scriptRegex.exec(html)) !== null) {
                count++;
                const js = match[1];
                try {
                    new vm.Script(js);
                } catch (e) {
                    console.error(`❌ Syntax Error in ${fp} (script #${count}):`, e.message);
                }
            }
        }
    });
}

console.log('🔍 Validating all inline scripts across public/modules...');
checkDir('public/modules');
console.log('✅ Validation scan complete!');
