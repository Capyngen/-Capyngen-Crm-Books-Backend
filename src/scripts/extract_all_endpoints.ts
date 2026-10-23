import fs from 'fs';
import path from 'path';

// Map of route file to mount path in app.ts
const mounts: Record<string, string[]> = {
  // Books domain
  'dashboardRoutes.ts': ['/api/v1/books/dashboard'],
  'itemRoutes.ts': ['/api/v1/books/items'],
  'inventoryAdjustmentRoutes.ts': ['/api/v1/books/inventory-adjustments'],
  'customerRoutes.ts': ['/api/v1/books/sales/customers'],
  'quoteRoutes.ts': ['/api/v1/books/sales/quotes'],
  'salesOrderRoutes.ts': ['/api/v1/books/sales/sales-orders'],
  'invoiceRoutes.ts': ['/api/v1/books/sales/invoices'],
  'recurringInvoiceRoutes.ts': ['/api/v1/books/sales/recurring-invoices'],
  'deliveryChallanRoutes.ts': ['/api/v1/books/sales/delivery-challans', '/api/v1/inventory/delivery-challans'],
  'paymentReceivedRoutes.ts': ['/api/v1/books/sales/payments-received'],
  'creditNoteRoutes.ts': ['/api/v1/books/sales/credit-notes'],
  'vendorRoutes.ts': ['/api/v1/books/purchases/vendors'],
  'expenseRoutes.ts': ['/api/v1/books/purchases/expenses'],
  'recurringExpenseRoutes.ts': ['/api/v1/books/purchases/recurring-expenses'],
  'purchaseOrderRoutes.ts': ['/api/v1/books/purchases/purchase-orders'],
  'billRoutes.ts': ['/api/v1/books/purchases/bills'],
  'recurringBillRoutes.ts': ['/api/v1/books/purchases/recurring-bills'],
  'paymentMadeRoutes.ts': ['/api/v1/books/purchases/payments-made'],
  'mileageExpenseRoutes.ts': ['/api/v1/books/purchases/mileage'],
  'vendorCreditRoutes.ts': ['/api/v1/books/purchases/vendor-credits'],
  'chartOfAccountRoutes.ts': ['/api/v1/books/chart-of-accounts'],
  'dimensionRoutes.ts': ['/api/v1/books/dimensions', '/api/v1/books/branches'],
  'fiscalCalendarRoutes.ts': ['/api/v1/books/fiscal-calendars'],
  'interCompanyRoutes.ts': ['/api/v1/books/inter-company'],
  'journalRoutes.ts': ['/api/v1/books/journals'],
  'recurringJournalRoutes.ts': ['/api/v1/books/recurring-journals'],
  'reconciliationRoutes.ts': ['/api/v1/books/reconciliation'],
  'bankAccountRoutes.ts': ['/api/v1/books/banking/accounts'],
  'treasuryForecastRoutes.ts': ['/api/v1/books/treasury'],
  'gstComplianceRoutes.ts': ['/api/v1/books/tax-compliance'],
  'yearEndClosingRoutes.ts': ['/api/v1/books/closing'],
  'taxRoutes.ts': ['/api/v1/books/taxes'],
  'fixedAssetRoutes.ts': ['/api/v1/books/fixed-assets'],
  'budgetRoutes.ts': ['/api/v1/books/budgets'],
  'currencyAdjustmentRoutes.ts': ['/api/v1/books/currency-adjustments'],
  'projectRoutes.ts': ['/api/v1/books/projects'],
  'timeEntryRoutes.ts': ['/api/v1/books/time-entries'],
  'transactionLockRoutes.ts': ['/api/v1/books/transaction-locks'],
  'auditLogRoutes.ts': ['/api/v1/books/audit-trail'],
  'reportsRoutes.ts': ['/api/v1/books/reports'],
  'aiRoutes.ts': ['/api/v1/books/ai'],
  'customerPortalRoutes.ts': ['/api/v1/portal'],
  'documentRoutes.ts': ['/api/v1/books/documents', '/api/v1/billing/documents', '/api/v1/inventory/documents'],

  // HRMS in Books
  'employeeRoutes.ts': ['/api/v1/books/hrms/employees'],
  'attendanceRoutes.ts': ['/api/v1/books/hrms/attendance'],
  'leaveRoutes.ts': ['/api/v1/books/hrms/leaves'],
  'salaryStructureRoutes.ts': ['/api/v1/books/hrms/salary-structures'],
  'payrollRoutes.ts': ['/api/v1/books/hrms/payroll'],
  'employeeExpenseClaimRoutes.ts': ['/api/v1/books/hrms/expense-claims'],
  'hrmsReportsRoutes.ts': ['/api/v1/books/hrms/reports'],

  // Inventory domain
  'warehouseRoutes.ts': ['/api/v1/books/inventory/warehouses'],
  'transferOrderRoutes.ts': ['/api/v1/books/inventory/transfer-orders'],
  'shipmentRoutes.ts': ['/api/v1/books/inventory/shipments'],
  'landedCostRoutes.ts': ['/api/v1/books/inventory/landed-costs'],
  'cycleCountRoutes.ts': ['/api/v1/books/inventory/cycle-counts'],
  'machineRoutes.ts': ['/api/v1/books/inventory/machines'],
  'routingRoutes.ts': ['/api/v1/books/inventory/routings'],
  'workOrderRoutes.ts': ['/api/v1/books/inventory/work-orders'],
  'mrpPlanningRoutes.ts': ['/api/v1/books/inventory/mrp'],
  'aiInventoryRoutes.ts': ['/api/v1/books/inventory/ai'],

  // Billing domain
  'billing/routes/dashboardRoutes.ts': ['/api/v1/billing/dashboard'],
  'billing/routes/customerRoutes.ts': ['/api/v1/billing/customers'],
  'billing/routes/itemRoutes.ts': ['/api/v1/billing/items'],
  'billing/routes/planRoutes.ts': ['/api/v1/billing/plans'],

  // Core & Shared
  'orgRoutes.ts': ['/api/v1/organizations'],
  'rbacRoutes.ts': ['/api/v1/rbac'],
  'approvalRoutes.ts': ['/api/v1/approvals', '/api/v1/books/approvals'],
  'integrationRoutes.ts': ['/api/v1/integration', '/api/v1/integrations'],
  'uploadRoutes.ts': ['/api/v1/upload'],
};

// Let's inspect route files
const filesToCheck = [
  { dir: 'D:/backend/src/domains/books/routes', prefix: '' },
  { dir: 'D:/backend/src/domains/billing/routes', prefix: 'billing/routes/' },
  { dir: 'D:/backend/src/domains/inventory/routes', prefix: '' },
  { dir: 'D:/backend/src/domains/core/routes', prefix: '' },
  { dir: 'D:/backend/src/routes', prefix: '' }
];

interface ExtractedEndpoint {
  domain: string;
  submodule: string;
  method: string;
  endpoint: string;
  file: string;
  handler: string;
  raw: string;
}

const endpoints: ExtractedEndpoint[] = [];

for (const { dir, prefix } of filesToCheck) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (!file.endsWith('.ts')) continue;
    const key = prefix + file;
    const baseMounts = mounts[key] || mounts[file] || ['/api/v1/unknown/' + file.replace('.ts', '')];
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      const match = line.match(/router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(.*)\);?/i);
      if (match) {
        const method = match[1].toUpperCase();
        const subPath = match[2];
        const handlerPart = match[3].trim();

        // Determine domain
        let domain = 'Books';
        if (dir.includes('billing')) domain = 'Billing';
        else if (dir.includes('inventory')) domain = 'Inventory';
        else if (dir.includes('core')) domain = 'Core / Admin';

        // Check each base mount
        for (const base of baseMounts) {
          const fullEndpoint = (base + (subPath === '/' ? '' : subPath)).replace(/\/+/g, '/');
          endpoints.push({
            domain,
            submodule: file.replace('Routes.ts', ''),
            method,
            endpoint: fullEndpoint,
            file,
            handler: handlerPart,
            raw: line.trim()
          });
        }
      }
    }
  }
}

// Add top level app.ts routes
endpoints.push(
  { domain: 'Core / Auth', submodule: 'Auth', method: 'POST', endpoint: '/api/v1/employees/login', file: 'app.ts', handler: 'Direct Proxy / DB fallback', raw: '' },
  { domain: 'Core / Auth', submodule: 'Auth', method: 'POST', endpoint: '/api/v1/auth/spinny-login', file: 'app.ts', handler: 'Direct Auth', raw: '' },
  { domain: 'Core / Auth', submodule: 'Auth', method: 'POST', endpoint: '/api/v1/auth/dev-login', file: 'app.ts', handler: 'Direct Auth', raw: '' },
  { domain: 'Core / Auth', submodule: 'Subscription', method: 'GET', endpoint: '/api/v1/books/me', file: 'app.ts', handler: 'Subscription & Plan Resolver', raw: '' },
  { domain: 'Core / Auth', submodule: 'Subscription', method: 'GET', endpoint: '/api/v1/books/debug-me', file: 'app.ts', handler: 'Subscription Debugger', raw: '' },
  { domain: 'Core / Auth', submodule: 'Settings', method: 'POST', endpoint: '/api/v1/settings/users/books-only-user', file: 'app.ts', handler: 'inviteUser', raw: '' },
  { domain: 'Core / Auth', submodule: 'Settings', method: 'PATCH', endpoint: '/api/v1/settings/users/:id/books-role', file: 'app.ts', handler: 'assignEmployeeRole', raw: '' },
  { domain: 'Core / Auth', submodule: 'Settings', method: 'GET', endpoint: '/api/v1/settings/users', file: 'app.ts', handler: 'getOrganizationUsers', raw: '' },
  { domain: 'Core / Auth', submodule: 'Admin', method: 'POST', endpoint: '/api/v1/books/admin/purge-test-data', file: 'app.ts', handler: 'purgeCompanyTestData', raw: '' },
  { domain: 'Core / Auth', submodule: 'Health', method: 'GET', endpoint: '/health', file: 'app.ts', handler: 'Health Check', raw: '' }
);

fs.writeFileSync('D:/backend/extracted_endpoints.json', JSON.stringify(endpoints, null, 2));
console.log(`Extracted ${endpoints.length} unique endpoints. Written to D:/backend/extracted_endpoints.json`);
