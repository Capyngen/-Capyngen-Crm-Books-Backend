const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const company = await mongoose.connection.collection('companyprofiles').findOne({ companyName: /spinny/i });
  if (!company) {
    console.log("Spinny not found");
  } else {
    console.log("Company:", company._id, company.subscriptionId);
    
    const sub = await mongoose.connection.collection('subscriptions').findOne({ 
      $or: [
        { _id: company.subscriptionId ? new mongoose.Types.ObjectId(company.subscriptionId) : null },
        { companyId: company._id },
        { orgId: company._id }
      ]
    });
    
    console.log("Subscription:", sub);
    if (sub) {
       const plan = await mongoose.connection.collection('plans').findOne({ _id: new mongoose.Types.ObjectId(sub.planId) });
       console.log("Plan Name:", plan ? plan.name : "Not found");
    }
  }
  process.exit();
});
