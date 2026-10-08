const fs = require('fs');

const path = 'D:\\backend\\src\\app.ts';
let content = fs.readFileSync(path, 'utf8');

const targetImport = "import { fiscalCalendarRoutes } from './domains/books/routes/fiscalCalendarRoutes';";
const replacementImport = "import { fiscalCalendarRoutes } from './domains/books/routes/fiscalCalendarRoutes';\nimport { interCompanyRoutes } from './domains/books/routes/interCompanyRoutes';";

const targetUse = "app.use('/api/v1/books/fiscal-calendars', fiscalCalendarRoutes);";
const replacementUse = "app.use('/api/v1/books/fiscal-calendars', fiscalCalendarRoutes);\napp.use('/api/v1/books/inter-company', interCompanyRoutes);";

if (!content.includes('interCompanyRoutes')) {
  content = content.replace(targetImport, replacementImport);
  content = content.replace(targetUse, replacementUse);
  fs.writeFileSync(path, content);
}
