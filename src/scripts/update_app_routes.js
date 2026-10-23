const fs = require('fs');

let content = fs.readFileSync('d:/backend/src/app.ts', 'utf8');

// 1. Remove duplicate app.get('/api/v1/books/me', verifyCapyngenToken...
const targetDup = `app.get('/api/v1/books/me', verifyCapyngenToken, async (req: any, res: any) => {`;
if (content.includes(targetDup)) {
  const startIdx = content.indexOf(targetDup);
  const endMarker = `app.use('/api/v1/books/public-test'`;
  const endIdx = content.indexOf(endMarker, startIdx);
  if (endIdx !== -1) {
    content = content.substring(0, startIdx) + content.substring(endIdx);
    console.log('Removed duplicate /api/v1/books/me route successfully!');
  }
}

// 2. Add route aliases
const targetChart = `app.use('/api/v1/books/chart-of-accounts', chartOfAccountRoutes);`;
if (content.includes(targetChart)) {
  content = content.replace(targetChart, `app.use(['/api/v1/books/chart-of-accounts', '/api/v1/books/accountant/chart-of-accounts', '/api/v1/books/accounts'], chartOfAccountRoutes);`);
  console.log('Added chart-of-accounts aliases!');
}

const targetJournals = `app.use('/api/v1/books/journals', journalRoutes);`;
if (content.includes(targetJournals)) {
  content = content.replace(targetJournals, `app.use(['/api/v1/books/journals', '/api/v1/books/accountant/journals'], journalRoutes);`);
  console.log('Added journals aliases!');
}

const targetRecJournals = `app.use('/api/v1/books/recurring-journals', recurringJournalRoutes);`;
if (content.includes(targetRecJournals)) {
  content = content.replace(targetRecJournals, `app.use(['/api/v1/books/recurring-journals', '/api/v1/books/accountant/recurring-journals'], recurringJournalRoutes);`);
  console.log('Added recurring-journals aliases!');
}

const targetBudgets = `app.use('/api/v1/books/budgets', budgetRoutes);`;
if (content.includes(targetBudgets)) {
  content = content.replace(targetBudgets, `app.use(['/api/v1/books/budgets', '/api/v1/books/accountant/budgets'], budgetRoutes);`);
  console.log('Added budgets aliases!');
}

const targetLocks = `app.use('/api/v1/books/transaction-locks', transactionLockRoutes);`;
if (content.includes(targetLocks)) {
  content = content.replace(targetLocks, `app.use(['/api/v1/books/transaction-locks', '/api/v1/books/accountant/transaction-locking', '/api/v1/books/accountant/transaction-locks'], transactionLockRoutes);`);
  console.log('Added transaction-locking aliases!');
}

const targetAudit = `app.use('/api/v1/books/audit-trail', auditLogRoutes);`;
if (content.includes(targetAudit)) {
  content = content.replace(targetAudit, `app.use(['/api/v1/books/audit-trail', '/api/v1/books/accountant/audit-trail'], auditLogRoutes);`);
  console.log('Added audit-trail aliases!');
}

const targetProjects = `app.use('/api/v1/books/projects', projectRoutes);`;
if (content.includes(targetProjects)) {
  content = content.replace(targetProjects, `app.use(['/api/v1/books/projects', '/api/v1/books/time-tracking/projects'], projectRoutes);`);
  console.log('Added time-tracking projects aliases!');
}

const targetTimeEntries = `app.use('/api/v1/books/time-entries', timeEntryRoutes);`;
if (content.includes(targetTimeEntries)) {
  content = content.replace(targetTimeEntries, `app.use(['/api/v1/books/time-entries', '/api/v1/books/time-tracking/timesheet'], timeEntryRoutes);`);
  console.log('Added time-tracking timesheet aliases!');
}

const targetBillingSubs = `app.use('/api/v1/billing/subscriptions', verifyCapyngenToken, recurringInvoiceRoutes);`;
if (content.includes(targetBillingSubs)) {
  content = content.replace(targetBillingSubs, `app.use(['/api/v1/billing/sales/subscriptions', '/api/v1/billing/subscriptions'], verifyCapyngenToken, recurringInvoiceRoutes);`);
  console.log('Added billing sales/subscriptions aliases!');
}

const targetBillingQuotes = `app.use('/api/v1/billing/quotes', verifyCapyngenToken, quoteRoutes);`;
if (content.includes(targetBillingQuotes)) {
  content = content.replace(targetBillingQuotes, `app.use(['/api/v1/billing/sales/quotes', '/api/v1/billing/quotes'], verifyCapyngenToken, quoteRoutes);`);
  console.log('Added billing sales/quotes aliases!');
}

const targetBillingInvoices = `app.use('/api/v1/billing/invoices', verifyCapyngenToken, invoiceRoutes);`;
if (content.includes(targetBillingInvoices)) {
  content = content.replace(targetBillingInvoices, `app.use(['/api/v1/billing/sales/invoices', '/api/v1/billing/invoices'], verifyCapyngenToken, invoiceRoutes);`);
  console.log('Added billing sales/invoices aliases!');
}

fs.writeFileSync('d:/backend/src/app.ts', content, 'utf8');
console.log('app.ts updated successfully!');
