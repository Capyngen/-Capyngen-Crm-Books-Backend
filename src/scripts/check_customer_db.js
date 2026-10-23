const mongoose = require('mongoose');
const uri = "mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority";

async function check() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const collections = ['customers', 'bookscustomers', 'clientaccounts'];
  for (const c of collections) {
    const col = db.collection(c);
    const countTotal = await col.countDocuments({});
    const spinnyTotal = await col.countDocuments({
      $or: [
        { orgId: '6aa797278d301b4735f1d322' },
        { orgId: new mongoose.Types.ObjectId('6aa797278d301b4735f1d322') },
        { companyId: '6aa797278d301b4735f1d322' },
        { companyId: new mongoose.Types.ObjectId('6aa797278d301b4735f1d322') },
      ]
    });
    const docs = await col.find({
      $or: [
        { orgId: '6aa797278d301b4735f1d322' },
        { orgId: new mongoose.Types.ObjectId('6aa797278d301b4735f1d322') },
        { companyId: '6aa797278d301b4735f1d322' },
        { companyId: new mongoose.Types.ObjectId('6aa797278d301b4735f1d322') },
      ]
    }).project({ _id: 1, displayName: 1, customerName: 1, name: 1, companyName: 1, email: 1, orgId: 1 }).toArray();

    console.log(`\nCollection: [${c}] -> Total Docs: ${countTotal}, Spinny Docs: ${spinnyTotal}`);
    console.log('Spinny Docs:', JSON.stringify(docs, null, 2));
  }

  // Also check if there are other customer records under all orgIds
  const allCustomers = await db.collection('customers').find({}).project({ _id: 1, displayName: 1, companyName: 1, orgId: 1 }).toArray();
  console.log('\nAll docs in `customers` collection:', JSON.stringify(allCustomers, null, 2));

  await mongoose.disconnect();
}
check().catch(console.error);
