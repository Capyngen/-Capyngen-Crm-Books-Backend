const fs = require('fs');

const path = 'D:\\backend\\src\\app.ts';
let content = fs.readFileSync(path, 'utf8');

const target = "import { fiscalCalendarRoutes } from './domains/books/routes/fiscalCalendarRoutes';";
const replacement = "import { fiscalCalendarRoutes } from './domains/books/routes/fiscalCalendarRoutes';\nimport testRoutes from './domains/books/routes/testRoutes';";

const targetUse = "app.use('/api/v1/books/fiscal-calendars', fiscalCalendarRoutes);";
const replacementUse = "app.use('/api/v1/books/fiscal-calendars', fiscalCalendarRoutes);\napp.use('/api/v1/books/test', testRoutes);";

if (!content.includes('testRoutes')) {
  content = content.replace(target, replacement);
  content = content.replace(targetUse, replacementUse);
  fs.writeFileSync(path, content);
}
