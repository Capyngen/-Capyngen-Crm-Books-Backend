import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Item from '../domains/inventory/models/Item';
import Customer from '../domains/billing/models/Customer';
import Invoice from '../domains/billing/models/Invoice';
import SalesOrder from '../domains/billing/models/SalesOrder';
import Plan from '../domains/billing/models/Plan';
import Warehouse from '../domains/inventory/models/Warehouse';
import Shipment from '../domains/inventory/models/Shipment';
import Package from '../domains/inventory/models/Package';
import PurchaseOrder from '../domains/inventory/models/PurchaseOrder';
import Bill from '../domains/inventory/models/Bill';
import PaymentReceived from '../domains/billing/models/PaymentReceived';
import PaymentMade from '../domains/books/models/PaymentMade';
import Expense from '../domains/books/models/Expense';
import { buildTenantFilter } from '../core/utils/tenantFilter';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  console.log('Connected to MongoDB Atlas for Step 1 Multi-Tenancy Verification\n');

  const mockReq = {
    org: { _id: '6aa797278d301b4735f1d322' },
    user: { companyId: '6aa797278d301b4735f1d322', role: 'Admin' },
    headers: { 'x-org-id': '6aa797278d301b4735f1d322' }
  };

  const filter = buildTenantFilter(mockReq);
  console.log('Generated Tenant Filter:', JSON.stringify(filter, null, 2));

  const items = await Item.find(filter);
  console.log(`\n📦 Items (Products): ${items.length} items found (Expected: 12)`);
  items.forEach(i => console.log(`   - ${i.name} (SKU: ${i.sku}, Stock: ${i.stock})`));

  const customers = await Customer.find(filter);
  console.log(`\n👥 Customers: ${customers.length} found`);

  const invoices = await Invoice.find(filter);
  console.log(`\n📄 Invoices: ${invoices.length} found`);

  const salesOrders = await SalesOrder.find(filter);
  console.log(`\n🛒 Sales Orders: ${salesOrders.length} found`);

  const plans = await Plan.find(filter);
  console.log(`\n📋 Plans: ${plans.length} found`);

  const warehouses = await Warehouse.find(filter);
  console.log(`\n🏭 Warehouses: ${warehouses.length} found`);

  const shipments = await Shipment.find(filter);
  console.log(`\n🚚 Shipments: ${shipments.length} found`);

  const packages = await Package.find(filter);
  console.log(`\n📦 Packages: ${packages.length} found`);

  const purchaseOrders = await PurchaseOrder.find(filter);
  console.log(`\n📑 Purchase Orders: ${purchaseOrders.length} found`);

  const bills = await Bill.find(filter);
  console.log(`\n🧾 Bills: ${bills.length} found`);

  const paymentsReceived = await PaymentReceived.find(filter);
  console.log(`\n💵 Payments Received: ${paymentsReceived.length} found`);

  const paymentsMade = await PaymentMade.find(filter);
  console.log(`\n💸 Payments Made: ${paymentsMade.length} found`);

  const expenses = await Expense.find(filter);
  console.log(`\n💳 Expenses: ${expenses.length} found`);

  console.log('\n=============================================');
  if (items.length === 12) {
    console.log('🎯 SUCCESS: All 12 Spinny items are matched cleanly!');
  } else {
    console.log(`⚠️ WARNING: Expected 12 items, but got ${items.length}`);
  }
  console.log('=============================================\n');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
