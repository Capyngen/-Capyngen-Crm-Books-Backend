const fs = require('fs');
let content = fs.readFileSync('src/app.ts', 'utf8');

const targetImport = "import chartOfAccountRoutes from './domains/books/routes/chartOfAccountRoutes';";
const replacementImport = `import chartOfAccountRoutes from './domains/books/routes/chartOfAccountRoutes';
import { dimensionRoutes, branchRoutes } from './domains/books/routes/dimensionRoutes';`;

content = content.replace(targetImport, replacementImport);

const targetUse = "app.use('/api/v1/books/chart-of-accounts', chartOfAccountRoutes);";
const replacementUse = `app.use('/api/v1/books/chart-of-accounts', chartOfAccountRoutes);
app.use('/api/v1/books/dimensions', dimensionRoutes);
app.use('/api/v1/books/branches', branchRoutes);`;

content = content.replace(targetUse, replacementUse);

fs.writeFileSync('src/app.ts', content);
