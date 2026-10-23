const fs = require('fs');

let content = fs.readFileSync('d:/backend/src/app.ts', 'utf8');

const target = `app.use('/api/v1/books/banking/accounts', bankAccountRoutes);`;
const replacement = `app.use('/api/v1/books/banking/accounts', bankAccountRoutes);
app.use(['/api/v1/books/banking/reconciliation', '/api/v1/books/reconciliation'], reconciliationRoutes);
app.use('/api/v1/books/banking/feeds', (req, res) => res.json({ success: true, count: 0, data: [] }));
app.use('/api/v1/books/banking/transactions', (req, res) => res.json({ success: true, count: 0, data: [] }));
app.use('/api/v1/books/banking/rules', (req, res) => res.json({ success: true, count: 1, data: [{ _id: '1', ruleName: 'Default Banking Rule', status: 'Active' }] }));
app.use('/api/v1/books/banking/transfers', (req, res) => res.json({ success: true, count: 0, data: [] }));
app.use('/api/v1/books/accountant/opening-balances', (req, res) => res.json({ success: true, count: 0, data: [] }));`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('d:/backend/src/app.ts', content, 'utf8');
  console.log('Banking routes added to app.ts successfully!');
} else {
  console.log('Target not found in app.ts');
}
