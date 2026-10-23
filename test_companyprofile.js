const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const spinnyId = new mongoose.Types.ObjectId('6aa797278d301b4735f1d322');
  const cp = await mongoose.connection.collection('companyprofiles').findOne({
    $or: [{ _id: spinnyId }, { _id: '6aa797278d301b4735f1d322' }]
  });
  console.log('Spinny companyprofiles:', cp ? { _id: cp._id, companyName: cp.companyName, status: cp.status } : 'NOT FOUND');

  const sub = await mongoose.connection.collection('subscriptions').findOne({
    $or: [{ companyId: spinnyId }, { orgId: spinnyId }, { companyId: '6aa797278d301b4735f1d322' }]
  });
  console.log('Spinny subscription:', sub ? { _id: sub._id, status: sub.status } : 'NOT FOUND');

  await mongoose.disconnect();
}
check();
