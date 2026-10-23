import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const ERP_COLLECTIONS = [
  // Items & Inventory
  'products', 'items', 'booksitems', 'inventoryadjustments', 'warehouses', 'transferorders',
  'shipments', 'packages', 'moveorders', 'putaways', 'workorders', 'machines', 'routings',
  // Sales
  'clientaccounts', 'customers', 'bookscustomers', 'quotes', 'salesorders', 'invoices',
  'recurringinvoices', 'deliverychallans', 'paymentsreceived', 'creditnotes',
  // Purchases
  'vendors', 'booksvendors', 'expenses', 'recurringexpenses', 'mileageexpenses',
  'purchaseorders', 'bills', 'recurringbills', 'paymentsmade', 'vendorcredits',
  // Accountant & Banking
  'chartofaccounts', 'journals', 'recurringjournals', 'bankaccounts', 'bankingrules',
  'budgets', 'fixedassets', 'intercompanytransactions', 'currencyadjustments', 'transactionlocks',
  // Projects & HRMS
  'projects', 'timeentries', 'employees', 'payrollbatches', 'attendances', 'leaves', 'employeeexpenseclaims',
  // Billing
  'plans', 'subscriptions', 'addons', 'coupons', 'pricingwidgets', 'documents'
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  const spinnyId = new mongoose.Types.ObjectId('6aa797278d301b4735f1d322');
  const spinnyStr = '6aa797278d301b4735f1d322';

  console.log('=== TARGETED ERP AUDIT FOR SPINNY (6aa797278d301b4735f1d322) ===\n');

  for (const collName of ERP_COLLECTIONS) {
    try {
      const coll = mongoose.connection.collection(collName);
      const count = await coll.countDocuments({
        $or: [
          { companyId: spinnyId },
          { companyId: spinnyStr },
          { orgId: spinnyId },
          { orgId: spinnyStr }
        ]
      });

      const totalInColl = await coll.countDocuments({});

      if (count > 0) {
        console.log(`✅ [${collName.toUpperCase()}]: ${count} records for Spinny (total in db: ${totalInColl})`);
      } else {
        console.log(`❌ [${collName.toUpperCase()}]: 0 records for Spinny (total in db: ${totalInColl})`);
      }
    } catch (e: any) {
      console.log(`⚠️ [${collName.toUpperCase()}]: Collection check skipped (${e.message})`);
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
