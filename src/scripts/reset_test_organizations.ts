import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function resetTestOrganizations() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://developer:1234@hrms.rwnp1.mongodb.net/hrms_crm?retryWrites=true&w=majority&appName=Hrms';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB Atlas:', mongoose.connection.name);

  // Retrieve Honda and Spinny organizations
  const honda = await mongoose.connection.collection('companyprofiles').findOne({ companyEmail: 'honda@gmail.com' });
  const spinny = await mongoose.connection.collection('companyprofiles').findOne({ companyEmail: 'nitesht206@gmail.com' });

  const targetOrgIds = [
    honda?._id?.toString(),
    spinny?._id?.toString()
  ].filter(Boolean);

  console.log('Target Organization IDs for Reset:', targetOrgIds);

  const collectionsToClean = [
    'booksinvoices',
    'quotes',
    'salesorders',
    'deliverychallans',
    'paymentsreceived',
    'bills',
    'purchaseorders',
    'paymentsmade',
    'booksjournals',
    'generallegders',
    'stockmovements',
    'approvalrequests',
    'workorders',
    'timesheets'
  ];

  for (const collName of collectionsToClean) {
    try {
      const coll = mongoose.connection.collection(collName);
      const res = await coll.deleteMany({
        $or: [
          { orgId: { $in: targetOrgIds } },
          { organizationId: { $in: targetOrgIds } },
          { companyId: { $in: targetOrgIds } }
        ]
      });
      console.log(`Cleaned collection ${collName}: deleted ${res.deletedCount} test transactions`);
    } catch (e: any) {
      console.log(`Note: collection ${collName} not present or skipped (${e.message})`);
    }
  }

  console.log('Test organizations reset successfully! Ready for fresh team testing.');
  await mongoose.disconnect();
}

resetTestOrganizations().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
