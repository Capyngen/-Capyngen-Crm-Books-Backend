const fs = require('fs');
const path = 'src/app.ts';
let content = fs.readFileSync(path, 'utf8');

const importTarget = "import reconciliationRoutes from './domains/books/routes/reconciliationRoutes';";
const importReplacement = "import reconciliationRoutes from './domains/books/routes/reconciliationRoutes';\nimport taxRoutes from './domains/books/routes/taxRoutes';";
content = content.replace(importTarget, importReplacement);

const useTarget = "app.use('/api/v1/books/reconciliation', reconciliationRoutes);";
const useReplacement = "app.use('/api/v1/books/reconciliation', reconciliationRoutes);\napp.use('/api/v1/books/taxes', taxRoutes);";
content = content.replace(useTarget, useReplacement);

fs.writeFileSync(path, content);
