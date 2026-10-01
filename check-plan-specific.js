const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const plan = await mongoose.connection.collection('plans').findOne({ _id: new mongoose.Types.ObjectId('6a9aab2b37f115525a01b0dc') });
  console.log("Plan modules:", plan.modules);
  console.log("Plan featureKeys length:", plan.featureKeys ? plan.featureKeys.length : 0);
  console.log("Has accounts-sales-customers:", plan.featureKeys ? plan.featureKeys.includes('accounts-sales-customers') : false);
  process.exit();
});
