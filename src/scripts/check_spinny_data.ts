import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';

async function checkData() {
  await mongoose.connect(MONGO_URI);
  const orgId = '6aa797278d301b4735f1d322';
  const orgIdObj = new mongoose.Types.ObjectId(orgId);

  const collections = [
    'customers',
    'clientaccounts',
    'bookscustomers',
    'quotes',
    'salesorders',
    'invoices',
    'paymentsreceived',
    'creditnotes',
    'deliverychallans',
    'products',
    'items',
    'booksitems',
    'vendors',
    'booksvendors',
    'bills',
    'expenses',
    'purchaseorders',
    'paymentsmade',
    'warehouses',
    'shipments',
    'booksshipments',
    'packages',
    'move_orders',
    'putaways',
    'sales_returns',
    'fulfillment_orders'
  ];

  console.log(`Checking data for Spinny Org: ${orgId}`);

  for (const colName of collections) {
    try {
      const col = mongoose.connection.collection(colName);
      const count = await col.countDocuments({
        $or: [
          { orgId: orgId },
          { orgId: orgIdObj },
          { companyId: orgId },
          { companyId: orgIdObj },
          { tenantId: orgId }
        ]
      });
      if (count > 0) {
        console.log(`[FOUND] ${colName}: ${count} records`);
      } else {
        const totalInDb = await col.countDocuments({});
        console.log(`[EMPTY] ${colName}: 0 records for Spinny (total in collection: ${totalInDb})`);
      }
    } catch (e: any) {
      // collection might not exist
    }
  }

  await mongoose.disconnect();
  process.exit(0);
}

checkData().catch(console.error);
