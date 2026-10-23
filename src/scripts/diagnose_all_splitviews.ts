const BASE_URL = 'http://localhost:5000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2YWE3OTcyNzhkMzAxYjQ3MzVmMWQzMjQiLCJpZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyNCIsImVtYWlsIjoibml0ZXNodDIwNkBnbWFpbC5jb20iLCJyb2xlIjoiQWRtaW4iLCJvcmdJZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyMiIsImlhdCI6MTc5MjY1MTU0NSwiZXhwIjoxNzkzMjU2MzQ1fQ.HGUmUqrEMKbNxbf8vlz5YzICRYeW_NaAwwQj099g7O4';

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
  'x-org-id': '6aa797278d301b4735f1d322'
};

const endpoints = [
  // 1. Books Me (Subscription / Crown check)
  { domain: 'Auth/Plan', name: 'Books Me', url: '/api/v1/books/me' },

  // 2. Books Items & Sales
  { domain: 'Books', name: 'Items', url: '/api/v1/books/items' },
  { domain: 'Books', name: 'Customers', url: '/api/v1/books/sales/customers' },
  { domain: 'Books', name: 'Quotes/Estimates', url: '/api/v1/books/sales/quotes' },
  { domain: 'Books', name: 'Sales Orders', url: '/api/v1/books/sales/sales-orders' },
  { domain: 'Books', name: 'Invoices', url: '/api/v1/books/sales/invoices' },
  { domain: 'Books', name: 'Payments Received', url: '/api/v1/books/sales/payments-received' },
  { domain: 'Books', name: 'Recurring Invoices', url: '/api/v1/books/sales/recurring-invoices' },
  { domain: 'Books', name: 'Credit Notes', url: '/api/v1/books/sales/credit-notes' },
  { domain: 'Books', name: 'Delivery Challans', url: '/api/v1/books/sales/delivery-challans' },

  // 3. Books Purchases
  { domain: 'Books', name: 'Vendors', url: '/api/v1/books/purchases/vendors' },
  { domain: 'Books', name: 'Expenses', url: '/api/v1/books/purchases/expenses' },
  { domain: 'Books', name: 'Recurring Expenses', url: '/api/v1/books/purchases/recurring-expenses' },
  { domain: 'Books', name: 'Purchase Orders', url: '/api/v1/books/purchases/purchase-orders' },
  { domain: 'Books', name: 'Bills', url: '/api/v1/books/purchases/bills' },
  { domain: 'Books', name: 'Recurring Bills', url: '/api/v1/books/purchases/recurring-bills' },
  { domain: 'Books', name: 'Payments Made', url: '/api/v1/books/purchases/payments-made' },
  { domain: 'Books', name: 'Vendor Credits', url: '/api/v1/books/purchases/vendor-credits' },

  // 4. Books Accountant & Banking
  { domain: 'Books', name: 'Banking Accounts', url: '/api/v1/books/banking/accounts' },
  { domain: 'Books', name: 'Chart of Accounts', url: '/api/v1/books/accountant/chart-of-accounts' },
  { domain: 'Books', name: 'Manual Journals', url: '/api/v1/books/accountant/journals' },

  // 5. Books Reports
  { domain: 'Books Reports', name: 'Profit & Loss', url: '/api/v1/books/reports/profit-and-loss' },
  { domain: 'Books Reports', name: 'Balance Sheet', url: '/api/v1/books/reports/balance-sheet' },
  { domain: 'Books Reports', name: 'Cash Flow', url: '/api/v1/books/reports/cash-flow' },
  { domain: 'Books Reports', name: 'AR Aging Summary', url: '/api/v1/books/reports/receivables-aging' },
  { domain: 'Books Reports', name: 'AP Aging Summary', url: '/api/v1/books/reports/payables-aging' },
  { domain: 'Books Reports', name: 'Stock Summary', url: '/api/v1/books/reports/stock-summary' },

  // 6. Inventory Endpoints
  { domain: 'Inventory', name: 'Warehouses', url: '/api/v1/inventory/warehouses' },
  { domain: 'Inventory', name: 'Fulfillment Queue', url: '/api/v1/inventory/fulfillment' },
  { domain: 'Inventory', name: 'Transfer Orders', url: '/api/v1/inventory/transfer-orders' },
  { domain: 'Inventory', name: 'Stock Adjustments', url: '/api/v1/inventory/inventory/adjustments' },
  { domain: 'Inventory', name: 'Packages', url: '/api/v1/inventory/packages' },
  { domain: 'Inventory', name: 'Shipments', url: '/api/v1/inventory/shipments' },
  { domain: 'Inventory', name: 'Move Orders', url: '/api/v1/inventory/inventory/move-orders' },
  { domain: 'Inventory', name: 'Putaways', url: '/api/v1/inventory/inventory/putaways' },
  { domain: 'Inventory', name: 'Sales Orders', url: '/api/v1/inventory/sales/sales-orders' },
  { domain: 'Inventory', name: 'Delivery Challans', url: '/api/v1/inventory/sales/delivery-challans' },
  { domain: 'Inventory', name: 'Sales Returns', url: '/api/v1/inventory/sales/returns' },
  { domain: 'Inventory', name: 'Purchase Orders', url: '/api/v1/inventory/purchases/purchase-orders' },
  { domain: 'Inventory', name: 'Vendors', url: '/api/v1/inventory/purchases/vendors' },
  { domain: 'Inventory', name: 'Work Orders', url: '/api/v1/inventory/work-orders' },
  { domain: 'Inventory', name: 'Reports Summary', url: '/api/v1/inventory/reports/summary' },

  // 7. Billing Endpoints
  { domain: 'Billing', name: 'Customers', url: '/api/v1/billing/customers' },
  { domain: 'Billing', name: 'Subscriptions', url: '/api/v1/billing/sales/subscriptions' },
  { domain: 'Billing', name: 'Invoices', url: '/api/v1/billing/sales/invoices' },
  { domain: 'Billing', name: 'Quotes', url: '/api/v1/billing/sales/quotes' },
  { domain: 'Billing', name: 'Payments', url: '/api/v1/billing/sales/payments-received' },
  { domain: 'Billing', name: 'Credit Notes', url: '/api/v1/billing/sales/credit-notes' },
  { domain: 'Billing', name: 'Plans', url: '/api/v1/billing/product-catalog/plans' },
  { domain: 'Billing', name: 'Addons', url: '/api/v1/billing/product-catalog/addons' },
  { domain: 'Billing', name: 'Coupons', url: '/api/v1/billing/product-catalog/coupons' },
  { domain: 'Billing', name: 'Reports', url: '/api/v1/billing/reports' }
];

async function diagnose() {
  console.log('='.repeat(80));
  console.log('EXHAUSTIVE DIAGNOSIS OF ALL SPLIT VIEWS & ENDPOINTS FOR SPINNY');
  console.log('='.repeat(80));

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${BASE_URL}${ep.url}`, { headers });
      const status = res.status;
      let count = 0;
      let preview = '';
      try {
        const data: any = await res.json();
        if (Array.isArray(data.data)) {
          count = data.data.length;
        } else if (Array.isArray(data)) {
          count = data.length;
        } else if (data.data && typeof data.data === 'object') {
          count = Object.keys(data.data).length;
          if (data.data.featureKeys) {
            preview = `Plan: ${data.data.plan?.name}, featureKeys: ${data.data.plan?.featureKeys?.length}`;
          }
        } else if (data.count !== undefined) {
          count = data.count;
        }
        if (data.featureKeys) {
          preview = `featureKeys: ${data.featureKeys.length}`;
        }
        if (data.plan?.featureKeys) {
          preview = `Plan: ${data.plan.name}, featureKeys: ${data.plan.featureKeys.length}`;
        }
        console.log(`[${status}] [${ep.domain.padEnd(14)}] ${ep.name.padEnd(22)} -> ${count} records ${preview ? `(${preview})` : ''}`);
      } catch (e: any) {
        console.log(`[${status}] [${ep.domain.padEnd(14)}] ${ep.name.padEnd(22)} -> Non-JSON response`);
      }
    } catch (err: any) {
      console.log(`[FAIL] [${ep.domain.padEnd(14)}] ${ep.name.padEnd(22)} -> Error: ${err.message}`);
    }
  }
}

diagnose();
export {};
