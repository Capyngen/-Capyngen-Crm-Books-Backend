const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === 'dist') continue;
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (filePath.endsWith('.ts')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const allTsFiles = getAllFiles(srcDir);

allTsFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix duplicated imports of Customer and Item
    if (content.match(/import\s+Customer\s+from\s+['"].*Customer['"]/g)?.length > 1 || content.match(/import\s+{\s*Customer\s*}\s+from\s+['"].*Customer['"]/g)?.length > 1) {
        // Just dedup imports manually if they are identical line by line
        const lines = content.split('\n');
        const uniqueLines = [];
        const seenImports = new Set();
        lines.forEach(line => {
            if (line.startsWith('import ')) {
                if (!seenImports.has(line.trim())) {
                    seenImports.add(line.trim());
                    uniqueLines.push(line);
                }
            } else {
                uniqueLines.push(line);
            }
        });
        content = uniqueLines.join('\n');
        changed = true;
    }

    // Replace '../services/' with '../../books/services/' in billing and inventory domains
    if (filePath.includes('billing') || filePath.includes('inventory')) {
        if (content.includes('../services/')) {
            content = content.replace(/\.\.\/services\//g, '../../books/services/');
            changed = true;
        }
    }
    
    // Fix DeliveryChallan importing Invoice
    if (filePath.includes('DeliveryChallan.ts')) {
        content = content.replace(/\.\/Invoice/g, '../../billing/models/Invoice');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed TS errors in ${path.relative(srcDir, filePath)}`);
    }
});
