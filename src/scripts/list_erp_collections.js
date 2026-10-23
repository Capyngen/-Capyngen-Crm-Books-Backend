const mongoose = require('mongoose');
const uri = 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const cols = await db.listCollections().toArray();
  const names = cols.map(c => c.name);
  console.log('Customer/Client collections:', names.filter(n => n.includes('cust') || n.includes('client')));
  console.log('Item/Product collections:', names.filter(n => n.includes('item') || n.includes('prod')));
  
  for (const n of ['customers', 'bookscustomers', 'clientaccounts', 'items', 'products', 'booksitems']) {
    if (names.includes(n)) {
      const count = await db.collection(n).countDocuments();
      console.log(`Collection [${n}]: ${count} total docs`);
    } else {
      console.log(`Collection [${n}]: DOES NOT EXIST`);
    }
  }

  await mongoose.disconnect();
}
run().catch(console.error);
