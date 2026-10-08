const fs = require('fs');
let content = fs.readFileSync('src/app.ts', 'utf8');

const targetImport = "import { dimensionRoutes, branchRoutes } from './domains/books/routes/dimensionRoutes';";
const replacementImport = `import { dimensionRoutes, branchRoutes } from './domains/books/routes/dimensionRoutes';
import { fiscalCalendarRoutes } from './domains/books/routes/fiscalCalendarRoutes';`;
content = content.replace(targetImport, replacementImport);

const targetUse = "app.use('/api/v1/books/branches', branchRoutes);";
const replacementUse = `app.use('/api/v1/books/branches', branchRoutes);
app.use('/api/v1/books/fiscal-calendars', fiscalCalendarRoutes);`;
content = content.replace(targetUse, replacementUse);

fs.writeFileSync('src/app.ts', content);
