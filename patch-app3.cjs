const fs = require('fs');
let content = fs.readFileSync('src/app.ts', 'utf8');

const targetImport = "import { fiscalCalendarRoutes } from './domains/books/routes/fiscalCalendarRoutes';";
const replacementImport = `import { fiscalCalendarRoutes } from './domains/books/routes/fiscalCalendarRoutes';
import { aiRoutes } from './domains/books/routes/aiRoutes';`;
content = content.replace(targetImport, replacementImport);

const targetUse = "app.use('/api/v1/books/fiscal-calendars', fiscalCalendarRoutes);";
const replacementUse = `app.use('/api/v1/books/fiscal-calendars', fiscalCalendarRoutes);
app.use('/api/v1/books/ai', aiRoutes);`;
content = content.replace(targetUse, replacementUse);

fs.writeFileSync('src/app.ts', content);
