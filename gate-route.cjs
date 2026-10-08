const fs = require('fs');

const path = 'D:\\backend\\src\\app.ts';
let content = fs.readFileSync(path, 'utf8');

const target = "app.use('/api/v1/books/inter-company', interCompanyRoutes);";
const replacement = "app.use('/api/v1/books/inter-company', requireFeature('accounts-accountant-inter-company'), interCompanyRoutes);";

if (!content.includes('requireFeature(\'accounts-accountant-inter-company\')')) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content);
}
