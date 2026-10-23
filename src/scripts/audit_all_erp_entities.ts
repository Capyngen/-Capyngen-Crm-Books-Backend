import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  const db = mongoose.connection.db;
  if (!db) process.exit(1);

  const spinnyStr = '6aa797278d301b4735f1d322';
  const spinnyObj = new mongoose.Types.ObjectId(spinnyStr);

  const collections = [
    'products', 'items', 'booksitems',
    'clientaccounts', 'customers', 'bookscustomers',
    'vendors', 'booksvendors',
    'salesorders', 'bookssalesorders',
    'invoices', 'booksinvoices',
    'quotes', 'booksquotes',
    'packages',
    'shipments',
    'bills', 'booksbills',
    'purchaseorders', 'bookspurchaseorders',
    'expenses', 'booksexpenses',
    'paymentsreceived', 'bookspaymentsreceived',
    'paymentsmade', 'bookspaymentsmade',
    'warehouses', 'bookswarehouses',
    'plans', 'addons', 'coupons', 'subscriptions'
  ];

  console.log('--- MongoDB Entity Audit for Spinny (Tenant: ' + spinnyStr + ') ---');
  const results: any = {};

  for (const colName of collections) {
    try {
      const col = db.collection(colName);
      const total = await col.countDocuments();
      const matchStr = await col.countDocuments({
        $or: [{ companyId: spinnyStr }, { orgId: spinnyStr }]
      });
      const matchObj = await col.countDocuments({
        $or: [{ companyId: spinnyObj }, { orgId: spinnyObj }]
      });
      const matchCombined = await col.countDocuments({
        $or: [
          { companyId: spinnyStr },
          { companyId: spinnyObj },
          { orgId: spinnyStr },
          { orgId: spinnyObj }
        ]
      });

      results[colName] = {
        totalInDb: total,
        matchString: matchStr,
        matchObjectId: matchObj,
        matchCombined: matchCombined
      };
    } catch (e: any) {
      results[colName] = { error: e.message };
    }
  }

  console.table(results);
  process.exit(0);
}
run();
