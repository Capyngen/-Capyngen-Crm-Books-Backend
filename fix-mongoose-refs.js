const fs = require('fs');
const path = require('path');

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (let file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            if (content.includes("ref: 'BooksCustomer'") || content.includes('ref: "BooksCustomer"')) {
                content = content.replace(/ref:\s*['"]BooksCustomer['"]/g, "ref: 'ClientAccount'");
                modified = true;
            }
            if (content.includes("ref: 'BooksItem'") || content.includes('ref: "BooksItem"')) {
                content = content.replace(/ref:\s*['"]BooksItem['"]/g, "ref: 'Product'");
                modified = true;
            }
            if (content.includes("ref: 'BooksVendor'") || content.includes('ref: "BooksVendor"')) {
                content = content.replace(/ref:\s*['"]BooksVendor['"]/g, "ref: 'Vendor'"); // Assuming vendor is Vendor
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed refs in:', fullPath);
            }
        }
    }
}

processDir('D:\\backend\\src\\domains');
