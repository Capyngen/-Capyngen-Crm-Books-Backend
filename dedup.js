
const fs = require('fs');
const file = 'D:\\backend\\src\\domains\\inventory\\controllers\\itemController.ts';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const uniqueLines = [];
const seen = new Set();
lines.forEach(line => {
    if (line.trim().startsWith('import Item from')) {
        if (!seen.has(line.trim())) {
            seen.add(line.trim());
            uniqueLines.push(line);
        }
    } else {
        uniqueLines.push(line);
    }
});
fs.writeFileSync(file, uniqueLines.join('\n'));
console.log('Fixed duplicate item import');

