import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

async function main() {
  const secret = process.env.ACCESS_TOKEN_SECRET || 'esdjAF8ZphD/gj14SlF35Ej97NL/C5PIQphWvzKYLzsX8l2QEMs1PQAXPTsugLIO';
  const token = jwt.sign({ _id: '6abdf9a7c076b4bb072b4589', email: 'honda@gmail.com' }, secret, { expiresIn: '7d' });

  const headers = {
    Authorization: `Bearer ${token}`,
    'x-org-id': '6abdf9a7c076b4bb072b4587',
  };

  const endpoints = [
    '/api/v1/books/sales/customers',
    '/api/v1/books/sales/invoices',
    '/api/v1/books/sales/quotes',
    '/api/v1/books/sales/sales-orders',
    '/api/v1/books/sales/delivery-challans',
    '/api/v1/books/sales/payments-received',
    '/api/v1/books/sales/credit-notes',
    '/api/v1/books/purchases/vendors',
    '/api/v1/books/purchases/purchase-orders',
    '/api/v1/books/purchases/bills',
    '/api/v1/books/purchases/payments-made',
    '/api/v1/books/items',
    '/api/v1/books/inventory/warehouses',
    '/api/v1/books/inventory/shipments',
    '/api/v1/books/manufacturing/work-orders',
    '/api/v1/billing/plans',
    '/api/v1/billing/subscriptions',
  ];

  console.log('Testing All Key API Endpoints with Honda Token:');
  for (const ep of endpoints) {
    try {
      const res = await fetch(`http://localhost:5000${ep}`, { headers });
      const data: any = await res.json();
      const count = Array.isArray(data.data) ? data.data.length : (data.data ? 1 : 0);
      console.log(`  ✅ ${ep.padEnd(42)} ➔ Status: ${res.status} | Records Returned: ${count}`);
    } catch (err: any) {
      console.log(`  ❌ ${ep.padEnd(42)} ➔ Error: ${err.message}`);
    }
  }
}

main().catch(console.error);
