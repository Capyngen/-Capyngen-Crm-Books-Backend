"use strict";
async function test() {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2YWE3OTcyNzhkMzAxYjQ3MzVmMWQzMjQiLCJpZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyNCIsImVtYWlsIjoibml0ZXNodDIwNkBnbWFpbC5jb20iLCJyb2xlIjoiQWRtaW4iLCJvcmdJZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyMiIsImlhdCI6MTc5MjQwNjQ3OSwiZXhwIjoxNzkzMDExMjc5fQ.GRHk2jFHwiWrJsOBvJ80mIN7AH88E4dfNA6S0Hr6EXg';
    const headers = {
        'Authorization': `Bearer ${token}`,
        'x-org-id': '6aa797278d301b4735f1d322',
        'x-user-id': '6aa797278d301b4735f1d324'
    };
    const endpoints = [
        '/api/v1/books/items',
        '/api/v1/billing/items',
        '/api/v1/billing/customers',
        '/api/v1/books/sales/customers',
        '/api/v1/books/sales/quotes',
        '/api/v1/books/sales/sales-orders',
        '/api/v1/books/sales/invoices',
        '/api/v1/books/sales/payments-received',
        '/api/v1/books/sales/delivery-challans',
        '/api/v1/books/inventory/packages',
        '/api/v1/inventory/packages',
        '/api/v1/books/inventory/shipments',
        '/api/v1/books/inventory/warehouses',
        '/api/v1/books/purchases/vendors',
        '/api/v1/books/purchases/purchase-orders',
        '/api/v1/books/purchases/bills',
        '/api/v1/books/purchases/payments-made',
        '/api/v1/books/purchases/expenses'
    ];
    console.log('Testing live backend HTTP endpoints on http://localhost:5000...\n');
    for (const ep of endpoints) {
        try {
            const res = await fetch(`http://localhost:5000${ep}`, { headers });
            const json = await res.json();
            const count = Array.isArray(json?.data) ? json.data.length : (json?.count ?? 'object');
            console.log(`✅ [${res.status}] ${ep} -> returned ${count} records`);
        }
        catch (e) {
            console.log(`❌ ${ep} -> ${e.message}`);
        }
    }
}
test();
