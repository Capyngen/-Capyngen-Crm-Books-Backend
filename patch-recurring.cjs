const fs = require('fs');
const path = 'src/app.ts';
let content = fs.readFileSync(path, 'utf8');

const importTarget = "import journalRoutes from './domains/books/routes/journalRoutes';";
const importReplacement = "import journalRoutes from './domains/books/routes/journalRoutes';\nimport recurringJournalRoutes from './domains/books/routes/recurringJournalRoutes';";
content = content.replace(importTarget, importReplacement);

const useTarget = "app.use('/api/v1/books/journals', journalRoutes);";
const useReplacement = "app.use('/api/v1/books/journals', journalRoutes);\napp.use('/api/v1/books/recurring-journals', recurringJournalRoutes);";
content = content.replace(useTarget, useReplacement);

fs.writeFileSync(path, content);
