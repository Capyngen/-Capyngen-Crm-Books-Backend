const mongoose = require('mongoose');
const uri = 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const pairs = [
    ['clientaccounts', 'customers'],
    ['paymentreceiveds', 'paymentsreceived'],
    ['bookswarehouses', 'warehouses'],
    ['bookspurchaseorders', 'purchaseorders'],
    ['booksshipments', 'shipments'],
    ['booksbills', 'bills'],
    ['bookstransferorders', 'transferorders'],
    ['booksworkorders', 'workorders'],
    ['bookspaymentmades', 'paymentsmade']
  ];

  for (const [wrongCol, rightCol] of pairs) {
    const wrongCount = await db.collection(wrongCol).countDocuments({
      $or: [{ orgId: '6aa797278d301b4735f1d322' }, { companyId: '6aa797278d301b4735f1d322' }]
    }).catch(() => -1);
    const rightCount = await db.collection(rightCol).countDocuments({
      $or: [{ orgId: '6aa797278d301b4735f1d322' }, { companyId: '6aa797278d301b4735f1d322' }]
    }).catch(() => -1);
    console.log(`Model queries: [${wrongCol.padEnd(20)}] (Spinny: ${wrongCount})  <---> Real ERP collection: [${rightCol.padEnd(18)}] (Spinny: ${rightCount})`);
  }
  await mongoose.disconnect();
}
run();
