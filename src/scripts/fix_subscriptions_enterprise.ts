import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  console.log('Connected to MongoDB');

  const enterprisePlanId = new mongoose.Types.ObjectId('6a9aab2b37f115525a01b0dc');

  // 1. Fix Spinny
  const spinnyComp = await mongoose.connection.collection('companyprofiles').findOne({ companyName: /spinny/i });
  if (spinnyComp) {
    const spinnyId = spinnyComp._id;
    let sub = await mongoose.connection.collection('subscriptions').findOne({
      $or: [{ companyId: spinnyId }, { companyId: spinnyId.toString() }, { orgId: spinnyId }, { orgId: spinnyId.toString() }]
    });

    const subId = sub ? sub._id : (spinnyComp.subscriptionId || new mongoose.Types.ObjectId());

    await mongoose.connection.collection('subscriptions').updateOne(
      { _id: subId },
      {
        $set: {
          _id: subId,
          companyId: spinnyId,
          orgId: spinnyId,
          planId: enterprisePlanId,
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
      { _id: spinnyId },
      { $set: { subscriptionId: subId, accountStatus: 'Active', platformType: 'Enterprise' } }
    );
    console.log('✅ Spinny subscription linked to Master Enterprise Plan (424 features)! SubId:', subId);
  }

  // 2. Fix Honda
  const hondaComp = await mongoose.connection.collection('companyprofiles').findOne({ companyName: /honda/i });
  if (hondaComp) {
    const hondaId = hondaComp._id;
    let sub = await mongoose.connection.collection('subscriptions').findOne({
      $or: [{ companyId: hondaId }, { companyId: hondaId.toString() }, { orgId: hondaId }, { orgId: hondaId.toString() }]
    });

    const subId = sub ? sub._id : (hondaComp.subscriptionId || new mongoose.Types.ObjectId());

    await mongoose.connection.collection('subscriptions').updateOne(
      { _id: subId },
      {
        $set: {
          _id: subId,
          companyId: hondaId,
          orgId: hondaId,
          planId: enterprisePlanId,
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
      { _id: hondaId },
      { $set: { subscriptionId: subId, accountStatus: 'Active', platformType: 'Enterprise' } }
    );
    console.log('✅ Honda subscription linked to Master Enterprise Plan (424 features)! SubId:', subId);
  }

  process.exit(0);
}

run().catch(console.error);
