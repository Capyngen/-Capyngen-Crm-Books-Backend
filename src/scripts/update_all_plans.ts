import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  console.log('Connected to MongoDB');

  const masterPlanId = new mongoose.Types.ObjectId('6a9aab2b37f115525a01b0dc');
  const masterPlan = await mongoose.connection.collection('plans').findOne({ _id: masterPlanId });

  if (!masterPlan) {
    console.error('Master Enterprise plan not found!');
    process.exit(1);
  }

  const enhancedKeys = Array.from(new Set([
    ...(masterPlan.featureKeys || []),
    'accounts-items-inventory-adjustments',
    'billing-sales-customers',
    '*',
    'all'
  ]));

  // Update ALL plans that mention Enterprise or Cloud or Telematics
  const updateResult = await mongoose.connection.collection('plans').updateMany(
    {
      $or: [
        { name: /enterprise/i },
        { name: /professional/i },
        { _id: new mongoose.Types.ObjectId('6ad525342d5bde67f33dee9d') },
        { _id: new mongoose.Types.ObjectId('6ad5b62c24f4c564a0071131') }
      ]
    },
    {
      $set: {
        featureKeys: enhancedKeys,
        updatedAt: new Date()
      }
    }
  );

  console.log(`✅ Updated ${updateResult.modifiedCount} plans with ${enhancedKeys.length} feature keys (including '*' and route aliases).`);

  // Ensure Spinny & Honda have active subscriptions and companyprofiles configured
  const companies = await mongoose.connection.collection('companyprofiles').find({
    $or: [{ companyName: /spinny/i }, { companyName: /honda/i }]
  }).toArray();

  for (const comp of companies) {
    const compId = comp._id;
    let sub = await mongoose.connection.collection('subscriptions').findOne({
      $or: [
        { companyId: compId },
        { companyId: compId.toString() },
        { orgId: compId },
        { orgId: compId.toString() }
      ]
    });

    const subId = sub ? sub._id : (comp.subscriptionId || new mongoose.Types.ObjectId());

    await mongoose.connection.collection('subscriptions').updateOne(
      { _id: subId },
      {
        $set: {
          _id: subId,
          companyId: compId,
          orgId: compId,
          planId: masterPlanId,
          status: 'Active',
          billingCycle: 'Annual',
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    await mongoose.connection.collection('companyprofiles').updateOne(
      { _id: compId },
      {
        $set: {
          subscriptionId: subId,
          accountStatus: 'Active',
          platformType: 'Enterprise',
          tier: 'Enterprise'
        }
      }
    );
    console.log(`✅ Organization '${comp.companyName}' (${compId}) fully active on Enterprise tier with sub: ${subId}`);
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
