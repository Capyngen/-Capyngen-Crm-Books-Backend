const fs = require('fs');
const path = require('path');

function patchController(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add context import if not present
    if (!content.includes("import { requestContext }")) {
        content = "import { requestContext } from '../../../context';\n" + content;
    }
    
    const ModelMatch = content.match(/import (\w+) from '\.\.\/models\/\w+'/);
    if (!ModelMatch) return;
    const ModelName = ModelMatch[1];
    
    // Patch create
    content = content.replace(/await (\w+)\.create\(\{\s*\.\.\.req\.body(.*?)\}\);/g, (match, model, rest) => {
        return `await ${model}.create({ ...req.body${rest}, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || req.body.companyId, createdBy: (req as any).user?._id });`;
    });
    content = content.replace(/await (\w+)\.create\(req\.body\);/g, (match, model) => {
        return `await ${model}.create({ ...req.body, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || req.body.companyId, createdBy: (req as any).user?._id });`;
    });

    // Patch get all
    content = content.replace(/await (\w+)\.find\(\)/g, (match, model) => {
        return `await ${model}.find({ companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })`;
    });
    
    // Patch findById
    content = content.replace(/await (\w+)\.findById\(req\.params\.id\)/g, (match, model) => {
        return `await ${model}.findOne({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })`;
    });

    // Patch findByIdAndUpdate
    content = content.replace(/await (\w+)\.findByIdAndUpdate\(req\.params\.id,\s*req\.body,\s*\{/g, (match, model) => {
        return `await ${model}.findOneAndUpdate({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } }, req.body, {`;
    });

    // Patch findByIdAndDelete
    content = content.replace(/await (\w+)\.findByIdAndDelete\(req\.params\.id\)/g, (match, model) => {
        return `await ${model}.findOneAndDelete({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })`;
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fully patched ${path.basename(filePath)}`);
}

const dir = 'D:\\backend\\src\\domains\\billing\\controllers';
const files = fs.readdirSync(dir);
for (let file of files) {
    if (file.endsWith('Controller.ts') && file !== 'customerController.ts' && file !== 'itemController.ts' && file !== 'dashboardController.ts' && file !== 'invoiceController.ts') {
        patchController(path.join(dir, file));
    }
}
// Do inventory too
const invDir = 'D:\\backend\\src\\domains\\inventory\\controllers';
if(fs.existsSync(invDir)){
    const invFiles = fs.readdirSync(invDir);
    for (let file of invFiles) {
        if (file.endsWith('Controller.ts') && file !== 'itemController.ts') {
            patchController(path.join(invDir, file));
        }
    }
}
