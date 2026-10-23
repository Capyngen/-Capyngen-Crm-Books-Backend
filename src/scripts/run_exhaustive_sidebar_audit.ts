import mongoose from 'mongoose';

const BASE_URL = 'http://localhost:5000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2YWE3OTcyNzhkMzAxYjQ3MzVmMWQzMjQiLCJpZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyNCIsImVtYWlsIjoibml0ZXNodDIwNkBnbWFpbC5jb20iLCJyb2xlIjoiQWRtaW4iLCJvcmdJZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyMiIsImlhdCI6MTc5MjY1MTU0NSwiZXhwIjoxNzkzMjU2MzQ1fQ.HGUmUqrEMKbNxbf8vlz5YzICRYeW_NaAwwQj099g7O4';
const MONGO_URI = 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';
const SPINNY_ORG = '6aa797278d301b4735f1d322';

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
  'x-org-id': SPINNY_ORG
};

async function auditAll() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db!;
  const orgObj = new mongoose.Types.ObjectId(SPINNY_ORG);

  async function getDbCount(collections: string[]): Promise<number> {
    let total = 0;
    for (const c of collections) {
      try {
        const count = await db.collection(c).countDocuments({
          $or: [{ orgId: SPINNY_ORG }, { orgId: orgObj }, { companyId: SPINNY_ORG }, { companyId: orgObj }]
        });
        total += count;
      } catch {}
    }
    return total;
  }

  const itemsToTest = [
    // BOOKS - ITEMS
    { domain: 'Books', option: 'Items & Products', endpoint: '/api/v1/books/items', collections: ['items', 'products', 'booksitems'] },
    { domain: 'Books', option: 'Item Groups', endpoint: '/api/v1/books/items/item-groups', collections: ['itemgroups'] },
    { domain: 'Books', option: 'Composite Items', endpoint: '/api/v1/books/items/composite-items', collections: ['compositeitems'] },
    { domain: 'Books', option: 'Price Lists', endpoint: '/api/v1/books/items/price-lists', collections: ['pricelists'] },
    { domain: 'Books', option: 'Inventory Adjustments', endpoint: '/api/v1/books/inventory-adjustments', collections: ['inventoryadjustments'] },
    { domain: 'Books', option: 'Inventory Summary', endpoint: '/api/v1/books/reports/inventory-summary', collections: ['items', 'products'] },
    { domain: 'Books', option: 'Reorder Items', endpoint: '/api/v1/books/items/reorder-items', collections: ['items'] },
    { domain: 'Books', option: 'Item Preferences', endpoint: '/api/v1/books/items/preferences', collections: ['preferences'] },

    // BOOKS - SALES
    { domain: 'Books', option: 'Customers', endpoint: '/api/v1/books/sales/customers', collections: ['clientaccounts', 'customers', 'bookscustomers'] },
    { domain: 'Books', option: 'Quotes / Estimates', endpoint: '/api/v1/books/sales/quotes', collections: ['quotes'] },
    { domain: 'Books', option: 'Sales Orders', endpoint: '/api/v1/books/sales/sales-orders', collections: ['salesorders'] },
    { domain: 'Books', option: 'Invoices', endpoint: '/api/v1/books/sales/invoices', collections: ['invoices'] },
    { domain: 'Books', option: 'Customer Payments', endpoint: '/api/v1/books/sales/payments-received', collections: ['paymentsreceived'] },
    { domain: 'Books', option: 'Retainer Invoices', endpoint: '/api/v1/books/sales/invoices?type=Retainer', collections: ['invoices'] },
    { domain: 'Books', option: 'Credit Notes', endpoint: '/api/v1/books/sales/credit-notes', collections: ['creditnotes'] },
    { domain: 'Books', option: 'Recurring Invoices', endpoint: '/api/v1/books/sales/recurring-invoices', collections: ['recurringinvoices'] },
    { domain: 'Books', option: 'Sales Receipts', endpoint: '/api/v1/books/sales/invoices?type=Receipt', collections: ['invoices'] },
    { domain: 'Books', option: 'Customer Credits', endpoint: '/api/v1/books/sales/credit-notes', collections: ['creditnotes'] },

    // BOOKS - PURCHASES
    { domain: 'Books', option: 'Vendors', endpoint: '/api/v1/books/purchases/vendors', collections: ['vendors', 'booksvendors'] },
    { domain: 'Books', option: 'Expenses', endpoint: '/api/v1/books/purchases/expenses', collections: ['expenses'] },
    { domain: 'Books', option: 'Recurring Expenses', endpoint: '/api/v1/books/purchases/recurring-expenses', collections: ['recurringexpenses'] },
    { domain: 'Books', option: 'Purchase Orders', endpoint: '/api/v1/books/purchases/purchase-orders', collections: ['purchaseorders'] },
    { domain: 'Books', option: 'Bills', endpoint: '/api/v1/books/purchases/bills', collections: ['bills'] },
    { domain: 'Books', option: 'Payments Made', endpoint: '/api/v1/books/purchases/payments-made', collections: ['paymentsmade'] },
    { domain: 'Books', option: 'Recurring Bills', endpoint: '/api/v1/books/purchases/recurring-bills', collections: ['recurringbills'] },
    { domain: 'Books', option: 'Vendor Credits', endpoint: '/api/v1/books/purchases/vendor-credits', collections: ['vendorcredits'] },

    // BOOKS - TIME TRACKING
    { domain: 'Books', option: 'Projects', endpoint: '/api/v1/books/time-tracking/projects', collections: ['projects'] },
    { domain: 'Books', option: 'Timesheets', endpoint: '/api/v1/books/time-tracking/timesheet', collections: ['timesheets', 'timeentries'] },
    { domain: 'Books', option: 'Customer Approvals', endpoint: '/api/v1/books/approvals', collections: ['approvals'] },

    // BOOKS - BANKING
    { domain: 'Books', option: 'Bank Accounts', endpoint: '/api/v1/books/banking/accounts', collections: ['bankaccounts'] },
    { domain: 'Books', option: 'Credit Cards', endpoint: '/api/v1/books/banking/accounts?type=CreditCard', collections: ['bankaccounts'] },
    { domain: 'Books', option: 'Bank Feeds', endpoint: '/api/v1/books/banking/feeds', collections: ['bankfeeds'] },
    { domain: 'Books', option: 'Reconciliation', endpoint: '/api/v1/books/banking/reconciliation', collections: ['reconciliations'] },
    { domain: 'Books', option: 'Categorized Transactions', endpoint: '/api/v1/books/banking/transactions?categorized=true', collections: ['banktransactions'] },
    { domain: 'Books', option: 'Uncategorised Transactions', endpoint: '/api/v1/books/banking/transactions?categorized=false', collections: ['banktransactions'] },
    { domain: 'Books', option: 'Rules', endpoint: '/api/v1/books/banking/rules', collections: ['bankingrules'] },
    { domain: 'Books', option: 'Transfers', endpoint: '/api/v1/books/banking/transfers', collections: ['banktransfers'] },

    // BOOKS - ACCOUNTANT
    { domain: 'Books', option: 'Chart of Accounts', endpoint: '/api/v1/books/accountant/chart-of-accounts', collections: ['chartofaccounts'] },
    { domain: 'Books', option: 'Manual Journals', endpoint: '/api/v1/books/accountant/journals', collections: ['manualjournals', 'journals'] },
    { domain: 'Books', option: 'Recurring Journals', endpoint: '/api/v1/books/accountant/recurring-journals', collections: ['recurringjournals'] },
    { domain: 'Books', option: 'Budgets', endpoint: '/api/v1/books/accountant/budgets', collections: ['budgets'] },
    { domain: 'Books', option: 'Opening Balances', endpoint: '/api/v1/books/accountant/opening-balances', collections: ['openingbalances'] },
    { domain: 'Books', option: 'Transaction Locking', endpoint: '/api/v1/books/accountant/transaction-locking', collections: ['transactionlocks'] },
    { domain: 'Books', option: 'Audit Trail', endpoint: '/api/v1/books/accountant/audit-trail', collections: ['audittrails'] },

    // BOOKS - REPORTS
    { domain: 'Books', option: 'Reports Dashboard', endpoint: '/api/v1/books/me', collections: ['plans', 'subscriptions'] },
    { domain: 'Books', option: 'Profit & Loss', endpoint: '/api/v1/books/reports/profit-and-loss', collections: ['invoices', 'expenses'] },
    { domain: 'Books', option: 'Balance Sheet', endpoint: '/api/v1/books/reports/balance-sheet', collections: ['chartofaccounts', 'invoices'] },
    { domain: 'Books', option: 'Cash Flow', endpoint: '/api/v1/books/reports/cash-flow', collections: ['paymentsreceived', 'paymentsmade'] },
    { domain: 'Books', option: 'AR Aging Summary', endpoint: '/api/v1/books/reports/receivables-aging', collections: ['invoices'] },
    { domain: 'Books', option: 'AP Aging Summary', endpoint: '/api/v1/books/reports/payables-aging', collections: ['bills'] },
    { domain: 'Books', option: 'Stock Summary', endpoint: '/api/v1/books/reports/stock-summary', collections: ['items', 'products'] },

    // INVENTORY - WAREHOUSES & STOCK
    { domain: 'Inventory', option: 'Multi-Warehouse', endpoint: '/api/v1/inventory/warehouses', collections: ['warehouses'] },
    { domain: 'Inventory', option: 'Transfer Orders', endpoint: '/api/v1/inventory/transfer-orders', collections: ['transferorders'] },
    { domain: 'Inventory', option: 'Stock Adjustments', endpoint: '/api/v1/inventory/inventory/adjustments', collections: ['inventoryadjustments'] },
    { domain: 'Inventory', option: 'Move Orders', endpoint: '/api/v1/inventory/inventory/move-orders', collections: ['move_orders'] },
    { domain: 'Inventory', option: 'Putaways & Storage', endpoint: '/api/v1/inventory/inventory/putaways', collections: ['putaways'] },

    // INVENTORY - FULFILLMENT & DISPATCH
    { domain: 'Inventory', option: 'Order Fulfillment (Queue)', endpoint: '/api/v1/inventory/fulfillment', collections: ['fulfillment_orders'] },
    { domain: 'Inventory', option: 'Sales Orders', endpoint: '/api/v1/inventory/sales/sales-orders', collections: ['salesorders'] },
    { domain: 'Inventory', option: 'Packages & Slips', endpoint: '/api/v1/inventory/packages', collections: ['packages'] },
    { domain: 'Inventory', option: 'Shipments & Tracking', endpoint: '/api/v1/inventory/shipments', collections: ['shipments', 'booksshipments'] },
    { domain: 'Inventory', option: 'Delivery Challans', endpoint: '/api/v1/inventory/sales/delivery-challans', collections: ['deliverychallans'] },
    { domain: 'Inventory', option: 'Sales Returns (RMA)', endpoint: '/api/v1/inventory/sales/returns', collections: ['sales_returns'] },
    { domain: 'Inventory', option: 'Customers', endpoint: '/api/v1/inventory/sales/customers', collections: ['clientaccounts', 'customers', 'bookscustomers'] },

    // INVENTORY - PROCUREMENT
    { domain: 'Inventory', option: 'Purchase Orders', endpoint: '/api/v1/inventory/purchases/purchase-orders', collections: ['purchaseorders'] },
    { domain: 'Inventory', option: 'Purchase Receives', endpoint: '/api/v1/inventory/purchases/receives', collections: ['deliverychallans', 'purchasereceives'] },
    { domain: 'Inventory', option: 'Suppliers & Vendors', endpoint: '/api/v1/inventory/purchases/vendors', collections: ['vendors', 'booksvendors'] },

    // INVENTORY - MANUFACTURING
    { domain: 'Inventory', option: 'Work Orders', endpoint: '/api/v1/inventory/work-orders', collections: ['workorders'] },
    { domain: 'Inventory', option: 'MRP Material Planning', endpoint: '/api/v1/inventory/mrp', collections: ['workorders', 'items'] },
    { domain: 'Inventory', option: 'Production Routings', endpoint: '/api/v1/inventory/routings', collections: ['routings'] },
    { domain: 'Inventory', option: 'Machines & Capacity', endpoint: '/api/v1/inventory/machines', collections: ['machines'] },

    // INVENTORY - AUX
    { domain: 'Inventory', option: 'AI Supply Insights', endpoint: '/api/v1/inventory/ai-insights', collections: [] },
    { domain: 'Inventory', option: 'Supply Chain Reports', endpoint: '/api/v1/inventory/reports', collections: [] },
    { domain: 'Inventory', option: 'Documents Vault', endpoint: '/api/v1/inventory/documents', collections: ['documents'] },

    // BILLING - CATALOG
    { domain: 'Billing', option: 'Subscribers & Clients', endpoint: '/api/v1/billing/customers', collections: ['clientaccounts', 'customers'] },
    { domain: 'Billing', option: 'Subscription Plans', endpoint: '/api/v1/billing/plans', collections: ['plans'] },
    { domain: 'Billing', option: 'Add-ons & Metered', endpoint: '/api/v1/billing/addons', collections: ['addons'] },
    { domain: 'Billing', option: 'Promo Coupons', endpoint: '/api/v1/billing/coupons', collections: ['coupons'] },
    { domain: 'Billing', option: 'Pricing Widgets', endpoint: '/api/v1/billing/pricing-widgets', collections: ['pricingwidgets'] },
    { domain: 'Billing', option: 'Item Catalog', endpoint: '/api/v1/billing/items', collections: ['items', 'products'] },

    // BILLING - SALES
    { domain: 'Billing', option: 'Subscriptions', endpoint: '/api/v1/billing/sales/subscriptions', collections: ['subscriptions', 'recurringinvoices'] },
    { domain: 'Billing', option: 'Recurring Invoices', endpoint: '/api/v1/billing/sales/invoices', collections: ['invoices'] },
    { domain: 'Billing', option: 'Quotes & Proposals', endpoint: '/api/v1/billing/sales/quotes', collections: ['quotes'] },
    { domain: 'Billing', option: 'Credit Notes & Refunds', endpoint: '/api/v1/billing/sales/credit-notes', collections: ['creditnotes'] },

    // BILLING - PAYMENTS & EXPENSES
    { domain: 'Billing', option: 'Payments Received', endpoint: '/api/v1/billing/payments', collections: ['paymentsreceived'] },
    { domain: 'Billing', option: 'Payment Gateway Setup', endpoint: '/api/v1/billing/apps/zoho-payments', collections: [] },
    { domain: 'Billing', option: 'Client Projects', endpoint: '/api/v1/billing/time-tracking/projects', collections: ['projects'] },
    { domain: 'Billing', option: 'Billable Timesheets', endpoint: '/api/v1/billing/time-tracking/timesheet', collections: ['timeentries'] },
    { domain: 'Billing', option: 'Direct Expenses', endpoint: '/api/v1/billing/expenses', collections: ['expenses'] },
    { domain: 'Billing', option: 'Recurring Subscriptions (Exp)', endpoint: '/api/v1/billing/expenses/recurring', collections: ['recurringexpenses'] },
    { domain: 'Billing', option: 'Lifecycle & Webhooks', endpoint: '/api/v1/billing/events', collections: [] },
    { domain: 'Billing', option: 'Subscription Analytics', endpoint: '/api/v1/billing/reports', collections: [] }
  ];

  console.log(`Auditing ${itemsToTest.length} Sidebar Options...\n`);

  const results = [];

  for (const item of itemsToTest) {
    let dbCount = 0;
    if (item.collections.length > 0) {
      dbCount = await getDbCount(item.collections);
    }

    let status = 'ERROR';
    let apiCount = 0;
    let reason = 'OK';

    try {
      const res = await fetch(`${BASE_URL}${item.endpoint}`, { headers });
      status = `${res.status} ${res.statusText}`;

      if (res.status === 200) {
        const json: any = await res.json();
        if (Array.isArray(json.data)) {
          apiCount = json.data.length;
        } else if (Array.isArray(json)) {
          apiCount = json.length;
        } else if (json.count !== undefined) {
          apiCount = json.count;
        }

        if (item.option === 'Reports Dashboard' && (!json.data?.plan?.featureKeys || json.data.plan.featureKeys.length === 0)) {
          reason = 'Dummy handler omits featureKeys -> Crown icon on UI';
        } else if (item.option === 'Customers' && apiCount === 0 && dbCount > 0) {
          reason = "Mongoose model queries 'clientaccounts' (0 records), while customer is in 'customers'";
        } else if (item.domain === 'Books' && apiCount === 0 && dbCount === 0) {
          reason = 'Collection empty in DB for Spinny after test purge';
        } else if (item.domain === 'Inventory' && item.option === 'Stock Summary' && apiCount === 0) {
          reason = "inventoryReportsController uses requestContext.getStore()?.orgId (Map object) -> defaults to 'SYSTEM'";
        } else if (item.domain === 'Inventory' && item.option === 'Multi-Warehouse' && apiCount === 0 && dbCount > 0) {
          reason = 'Warehouse model tenant query mismatch (ObjectId vs string)';
        } else if (apiCount > 0) {
          reason = 'Healthy & live data returned';
        } else {
          reason = 'Empty collection / No records found';
        }
      } else if (res.status === 404) {
        if (item.endpoint.includes('/accountant/')) {
          reason = "Route mounted at /api/v1/books/* without '/accountant/' prefix";
        } else if (item.endpoint.includes('/billing/sales/')) {
          reason = "Route mounted at /api/v1/billing/* without '/sales/' prefix";
        } else {
          reason = 'Endpoint route not mounted on backend router';
        }
      } else if (res.status === 500) {
        reason = 'Backend unhandled exception / model schema error';
      }
    } catch (err: any) {
      status = 'CONN_FAIL';
      reason = err.message;
    }

    results.push({
      domain: item.domain,
      option: item.option,
      endpoint: item.endpoint,
      status,
      dbCount,
      reason
    });
  }

  await mongoose.disconnect();

  console.log(JSON.stringify(results, null, 2));
}

auditAll().catch(console.error);
export {};
