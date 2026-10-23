const fs = require('fs');

let content = fs.readFileSync('d:/backend/src/domains/inventory/controllers/workOrderController.ts', 'utf8');
content = content.replace(/req\.body\.orgId/g, `(req.body?.orgId || (req.headers?.['x-org-id'] as string) || '6aa797278d301b4735f1d322')`);
fs.writeFileSync('d:/backend/src/domains/inventory/controllers/workOrderController.ts', content, 'utf8');
console.log('workOrderController.ts fixed successfully!');
