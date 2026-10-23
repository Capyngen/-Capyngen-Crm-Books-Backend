import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';

async function checkCustomers() {
  await mongoose.connect(MONGO_URI);

  console.log('--- clientaccounts ---');
  const ca = await mongoose.connection.collection('clientaccounts').find({}).toArray();
  console.log('Total clientaccounts:', ca.length);
  for (const c of ca) {
    console.log('  _id:', c._id, 'name/displayName:', c.name || c.displayName, 'companyId:', c.companyId, 'orgId:', c.orgId);
  }

  console.log('\n--- customers ---');
  const cust = await mongoose.connection.collection('customers').find({}).toArray();
  console.log('Total customers:', cust.length);
  for (const c of cust) {
    console.log('  _id:', c._id, 'name/displayName:', c.name || c.displayName, 'companyId:', c.companyId, 'orgId:', c.orgId);
  }

  console.log('\n--- bookscustomers ---');
  const bc = await mongoose.connection.collection('bookscustomers').find({}).toArray();
  console.log('Total bookscustomers:', bc.length);
  for (const c of bc) {
    console.log('  _id:', c._id, 'name/displayName:', c.name || c.displayName, 'companyId:', c.companyId, 'orgId:', c.orgId);
  }

  await mongoose.disconnect();
  process.exit(0);
}

checkCustomers().catch(console.error);
