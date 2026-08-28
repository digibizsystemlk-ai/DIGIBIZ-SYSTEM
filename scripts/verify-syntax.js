const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../public/clients/sathityrecentre/index.html');
const content = fs.readFileSync(filePath, 'utf8');
const scriptMatches = content.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi);

console.log(`Found ${scriptMatches ? scriptMatches.length : 0} script tags.`);
if (scriptMatches) {
    scriptMatches.forEach((raw, i) => {
        if (raw.includes('src=')) return;
        const js = raw.replace(/<script[\s\S]*?>/i, '').replace(/<\/script>/i, '');
        try {
            new Function(js);
            console.log(`✅ Script #${i+1} is 100% syntactically VALID!`);
        } catch(err) {
            console.error(`❌ Syntax Error in script #${i+1}:`, err.message);
        }
    });
}
