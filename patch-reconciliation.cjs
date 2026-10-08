const fs = require('fs');
const path = 'src/app.ts';
let content = fs.readFileSync(path, 'utf8');

const importTarget = "import recurringJournalRoutes from './domains/books/routes/recurringJournalRoutes';";
const importReplacement = "import recurringJournalRoutes from './domains/books/routes/recurringJournalRoutes';\nimport reconciliationRoutes from './domains/books/routes/reconciliationRoutes';";
content = content.replace(importTarget, importReplacement);

const useTarget = "app.use('/api/v1/books/recurring-journals', recurringJournalRoutes);";
const useReplacement = "app.use('/api/v1/books/recurring-journals', recurringJournalRoutes);\napp.use('/api/v1/books/reconciliation', reconciliationRoutes);";
content = content.replace(useTarget, useReplacement);

fs.writeFileSync(path, content);
