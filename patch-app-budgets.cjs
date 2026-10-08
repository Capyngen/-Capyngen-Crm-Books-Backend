const fs = require('fs');

const path = 'D:\\backend\\src\\app.ts';
let content = fs.readFileSync(path, 'utf8');

const importTarget = "import fixedAssetRoutes from './domains/books/routes/fixedAssetRoutes';";
const importReplacement = "import fixedAssetRoutes from './domains/books/routes/fixedAssetRoutes';\nimport budgetRoutes from './domains/books/routes/budgetRoutes';";

const useTarget = "app.use('/api/v1/books/fixed-assets', fixedAssetRoutes);";
const useReplacement = "app.use('/api/v1/books/fixed-assets', fixedAssetRoutes);\napp.use('/api/v1/books/budgets', budgetRoutes);";

if (!content.includes('budgetRoutes')) {
  content = content.replace(importTarget, importReplacement);
  content = content.replace(useTarget, useReplacement);
  fs.writeFileSync(path, content);
}
