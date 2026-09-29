const fs = require('fs');
const path = require('path');

function fixController(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;

    // Fix GET ALL (find)
    if (content.match(/const filter:\s*any\s*=\s*\{\};/)) {
        content = content.replace(/const filter:\s*any\s*=\s*\{\};/g, `const orgId = (req as any).org?._id || require('../../../context').requestContext.getStore()?.orgId || (req as any).user?.companyId;
    const filter: any = orgId ? { companyId: orgId } : {};`);
        modified = true;
    } else if (content.match(/await [A-Za-z]+\.find\(\{\}\)/)) {
        content = content.replace(/(await [A-Za-z]+\.find\()\{\}(\))/g, `$1(orgId ? { companyId: orgId } : {})$2`);
        // we'd need to insert the orgId var, maybe too complex for simple regex. Let's do it manually if needed.
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Patched ${path.basename(filePath)}`);
    } else {
        console.log(`No simple patch match for ${path.basename(filePath)}`);
    }
}

const dir = 'D:\\backend\\src\\domains\\billing\\controllers';
const files = fs.readdirSync(dir);
for (let file of files) {
    if (file.endsWith('.ts')) {
        fixController(path.join(dir, file));
    }
}
