const mongoose = require('mongoose');
const uri = 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';

async function testMe() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const orgId = '6aa797278d301b4735f1d322';
  const orgIdObj = new mongoose.Types.ObjectId(orgId);

  const sub = await db.collection('subscriptions').findOne({
    $or: [{ companyId: orgIdObj }, { orgId: orgIdObj }, { companyId: orgId }, { orgId: orgId }]
  });
  console.log('Found sub:', sub ? { _id: sub._id, planId: sub.planId, status: sub.status } : 'NULL');

  if (sub && sub.planId) {
    const plan = await db.collection('plans').findOne({
      $or: [{ _id: new mongoose.Types.ObjectId(sub.planId) }, { _id: sub.planId }]
    });
    console.log('Found plan:', plan ? { _id: plan._id, name: plan.name, featureKeysCount: plan.featureKeys ? plan.featureKeys.length : 0 } : 'NULL');
    if (plan && plan.featureKeys) {
      console.log('Sample feature keys:', plan.featureKeys.slice(0, 15));
    }
  }

  await mongoose.disconnect();
}
testMe();
