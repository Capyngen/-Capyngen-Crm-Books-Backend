const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const domainsDir = path.join(srcDir, 'domains');
const booksDir = path.join(domainsDir, 'books');
const billingDir = path.join(domainsDir, 'billing');
const inventoryDir = path.join(domainsDir, 'inventory');

const billingModels = ['Customer', 'Quote', 'SalesOrder', 'Invoice', 'RecurringInvoice', 'PaymentReceived', 'CreditNote'];
const billingControllers = billingModels.map(m => m.charAt(0).toLowerCase() + m.slice(1) + 'Controller');

const inventoryModels = ['Item', 'InventoryAdjustment', 'DeliveryChallan', 'PurchaseOrder', 'Bill', 'RecurringBill', 'Vendor', 'VendorCredit'];
const inventoryControllers = inventoryModels.map(m => m.charAt(0).toLowerCase() + m.slice(1) + 'Controller');

const domainMap = {}; // filename (without ext) -> target domain
billingModels.forEach(m => domainMap[m] = 'billing');
billingControllers.forEach(m => domainMap[m] = 'billing');
inventoryModels.forEach(m => domainMap[m] = 'inventory');
inventoryControllers.forEach(m => domainMap[m] = 'inventory');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(path.join(billingDir, 'models'));
ensureDir(path.join(billingDir, 'controllers'));
ensureDir(path.join(inventoryDir, 'models'));
ensureDir(path.join(inventoryDir, 'controllers'));

// Delete duplicates if they exist
const dupes = [
    path.join(billingDir, 'models', 'BillingCustomer.ts'),
    path.join(billingDir, 'models', 'BillingItem.ts')
];
dupes.forEach(d => {
    if (fs.existsSync(d)) {
        fs.unlinkSync(d);
        console.log('Deleted duplicate: ' + d);
    }
});

// Move files
const subdirs = ['models', 'controllers'];
const fileLocations = {}; // baseName -> full new path

function getTargetDomain(baseName) {
    return domainMap[baseName] || 'books';
}

subdirs.forEach(subdir => {
    const dirPath = path.join(booksDir, subdir);
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            if (file.endsWith('.ts')) {
                const baseName = file.replace('.ts', '');
                const targetDomain = getTargetDomain(baseName);
                
                const oldPath = path.join(dirPath, file);
                const newPath = path.join(domainsDir, targetDomain, subdir, file);
                
                fileLocations[baseName] = {
                    domain: targetDomain,
                    subdir: subdir,
                    fullPath: newPath
                };

                if (oldPath !== newPath) {
                    fs.renameSync(oldPath, newPath);
                    console.log(`Moved ${file} to ${targetDomain}`);
                }
            }
        });
    }
});

// Fix imports globally
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

    content = content.replace(/(from\s+['"])([^'"]+)(['"])/g, (match, p1, importPath, p3) => {
        if (!importPath.startsWith('.')) return match; 

        const resolvedImportPath = path.resolve(path.dirname(filePath), importPath);
        
        let matchedBaseName = null;
        for (const baseName in fileLocations) {
            const loc = fileLocations[baseName];
            if (resolvedImportPath === loc.fullPath.replace('.ts', '') || 
                resolvedImportPath + '.ts' === loc.fullPath ||
                resolvedImportPath === path.join(booksDir, loc.subdir, baseName) ||
                resolvedImportPath === path.join(billingDir, loc.subdir, 'Billing' + baseName)
                ) {
                matchedBaseName = baseName;
                break;
            }
        }

        if (matchedBaseName) {
            const loc = fileLocations[matchedBaseName];
            let newRelativePath = path.relative(path.dirname(filePath), loc.fullPath);
            newRelativePath = newRelativePath.replace(/\\/g, '/').replace('.ts', '');
            if (!newRelativePath.startsWith('.')) newRelativePath = './' + newRelativePath;
            
            if (importPath !== newRelativePath) {
                changed = true;
                return p1 + newRelativePath + p3;
            }
        }
        
        return match;
    });

    if (content.includes('BillingCustomer') || content.includes('BillingItem')) {
        content = content.replace(/BillingCustomer/g, 'Customer');
        content = content.replace(/BillingItem/g, 'Item');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated imports in ${path.relative(srcDir, filePath)}`);
    }
});

console.log('Refactoring complete.');
