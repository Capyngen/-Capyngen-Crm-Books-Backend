import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';

async function check() {
  await mongoose.connect(MONGO_URI);
  const plans = await mongoose.connection.collection('plans').find({}).toArray();
  console.log(`Total plans: ${plans.length}`);
  for (const p of plans) {
    console.log(`- Plan: ${p.name} | Type: ${p.planType} | ID: ${p._id} | Features: ${(p.featureKeys || []).length} | Modules: ${(p.modules || []).length}`);
  }
  await mongoose.disconnect();
  process.exit(0);
}

check().catch(console.error);
