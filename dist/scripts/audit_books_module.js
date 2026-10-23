"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2YWE3OTcyNzhkMzAxYjQ3MzVmMWQzMjQiLCJpZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyNCIsImVtYWlsIjoibml0ZXNodDIwNkBnbWFpbC5jb20iLCJyb2xlIjoiQWRtaW4iLCJvcmdJZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyMiIsImlhdCI6MTc5MjQwNjQ3OSwiZXhwIjoxNzkzMDExMjc5fQ.GRHk2jFHwiWrJsOBvJ80mIN7AH88E4dfNA6S0Hr6EXg';
const headers = {
    Authorization: 'Bearer ' + token,
    'x-org-id': '6aa797278d301b4735f1d322',
    'x-user-id': '6aa797278d301b4735f1d324',
    'Content-Type': 'application/json'
};
const BASE_URL = 'http://localhost:5000/api/v1/books';
async function testEndpoint(label, url) {
    try {
        const res = await fetch(url, { headers });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
            const count = Array.isArray(data?.data) ? data.data.length : (Array.isArray(data) ? data.length : 'Object');
            console.log(`[PASS] ${label}: status ${res.status}, count/data: ${count}`);
            return { ok: true, data };
        }
        else {
            console.log(`[FAIL] ${label}: status ${res.status}, msg: ${data?.message || res.statusText}`);
            return { ok: false, error: data?.message };
        }
    }
    catch (err) {
        console.log(`[ERR] ${label}: ${err.message}`);
        return { ok: false, error: err.message };
    }
}
async function auditBooks() {
    console.log('=== REAL BOOKS BACKEND ENDPOINT AUDIT ===\n');
    // 1. Dashboard
    await testEndpoint('Books Dashboard', `${BASE_URL}/dashboard`);
    // 2. Items
    await testEndpoint('Books Items', `${BASE_URL}/items`);
    // 3. Inventory Adjustments
    await testEndpoint('Inventory Adjustments', `${BASE_URL}/inventory-adjustments`);
    // 4. Sales: Customers
    await testEndpoint('Sales: Customers', `${BASE_URL}/sales/customers`);
    // 5. Sales: Quotes
    await testEndpoint('Sales: Quotes', `${BASE_URL}/sales/quotes`);
    // 6. Sales: Sales Orders
    await testEndpoint('Sales: Sales Orders', `${BASE_URL}/sales/sales-orders`);
    // 7. Sales: Invoices
    await testEndpoint('Sales: Invoices', `${BASE_URL}/sales/invoices`);
    // 8. Sales: Recurring Invoices
    await testEndpoint('Sales: Recurring Invoices', `${BASE_URL}/sales/recurring-invoices`);
    // 9. Sales: Delivery Challans
    await testEndpoint('Sales: Delivery Challans', `${BASE_URL}/sales/delivery-challans`);
    // 10. Sales: Payments Received
    await testEndpoint('Sales: Payments Received', `${BASE_URL}/sales/payments-received`);
    // 11. Sales: Credit Notes
    await testEndpoint('Sales: Credit Notes', `${BASE_URL}/sales/credit-notes`);
    // 12. Purchases: Vendors
    await testEndpoint('Purchases: Vendors', `${BASE_URL}/purchases/vendors`);
    // 13. Purchases: Expenses
    await testEndpoint('Purchases: Expenses', `${BASE_URL}/purchases/expenses`);
    // 14. Purchases: Recurring Expenses
    await testEndpoint('Purchases: Recurring Expenses', `${BASE_URL}/purchases/recurring-expenses`);
    // 15. Purchases: Purchase Orders
    await testEndpoint('Purchases: Purchase Orders', `${BASE_URL}/purchases/purchase-orders`);
    // 16. Purchases: Bills
    await testEndpoint('Purchases: Bills', `${BASE_URL}/purchases/bills`);
    // 17. Purchases: Recurring Bills
    await testEndpoint('Purchases: Recurring Bills', `${BASE_URL}/purchases/recurring-bills`);
    // 18. Purchases: Payments Made
    await testEndpoint('Purchases: Payments Made', `${BASE_URL}/purchases/payments-made`);
    // 19. Purchases: Vendor Credits
    await testEndpoint('Purchases: Vendor Credits', `${BASE_URL}/purchases/vendor-credits`);
    // 20. Banking: Accounts
    await testEndpoint('Banking: Accounts', `${BASE_URL}/banking/accounts`);
    // 21. Banking: Reconciliation
    await testEndpoint('Banking: Reconciliation', `${BASE_URL}/reconciliation`);
    // 22. Accountant: Chart of Accounts
    await testEndpoint('Accountant: Chart of Accounts', `${BASE_URL}/chart-of-accounts`);
    // 23. Accountant: Manual Journals
    await testEndpoint('Accountant: Manual Journals', `${BASE_URL}/journals`);
    // 24. Accountant: Budgets
    await testEndpoint('Accountant: Budgets', `${BASE_URL}/budgets`);
    // 25. Accountant: Currency Adjustments
    await testEndpoint('Accountant: Currency Adjustments', `${BASE_URL}/currency-adjustments`);
    // 26. Accountant: Fixed Assets
    await testEndpoint('Accountant: Fixed Assets', `${BASE_URL}/fixed-assets`);
    // 27. Accountant: Inter-Company
    await testEndpoint('Accountant: Inter-Company', `${BASE_URL}/inter-company`);
    // 28. Inventory: Warehouses
    await testEndpoint('Inventory: Warehouses', `${BASE_URL}/inventory/warehouses`);
    // 29. Inventory: Packages
    await testEndpoint('Inventory: Packages', `${BASE_URL}/inventory/packages`);
    // 30. Inventory: Shipments
    await testEndpoint('Inventory: Shipments', `${BASE_URL}/inventory/shipments`);
    console.log('\n=== REAL BOOKS BACKEND AUDIT FINISHED ===');
}
auditBooks();
