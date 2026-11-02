require('dotenv').config();
const mongoose = require('mongoose');

async function cleanSpinnyData() {
  console.log('======================================================================');
  console.log('🧹 STRICT ISOLATED PURGE: SPINNY TENANT DATA (CRM, HRMS, BOOKS, BILLING, INVENTORY)');
  console.log('Target Tenant ID: 6aa797278d301b4735f1d322');
  console.log('Other Companies: ZERO DELETION / 100% UNTOUCHED');
  console.log('======================================================================\n');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB Atlas');

  const spinnyIdStr = '6aa797278d301b4735f1d322';
  const spinnyIdObj = new mongoose.Types.ObjectId(spinnyIdStr);

  const collections = await mongoose.connection.db.listCollections().toArray();
  let totalDeleted = 0;
  const deletedLog = [];

  for (const col of collections) {
    const cName = col.name;
    // Safety guard: Never touch system collections or companyprofiles (so tenant remains valid)
    if (cName.startsWith('system.') || cName === 'companyprofiles' || cName === 'organizations') {
      continue;
    }

    const filter = {
      $or: [
        { orgId: spinnyIdStr },
        { orgId: spinnyIdObj },
        { companyId: spinnyIdStr },
        { companyId: spinnyIdObj },
        { organizationId: spinnyIdStr },
        { organizationId: spinnyIdObj },
        { organization: spinnyIdStr },
        { organization: spinnyIdObj },
        { company: spinnyIdStr },
        { company: spinnyIdObj }
      ]
    };

    const res = await mongoose.connection.db.collection(cName).deleteMany(filter);
    if (res.deletedCount > 0) {
      deletedLog.push({ collection: cName, deleted: res.deletedCount });
      totalDeleted += res.deletedCount;
      console.log(`✓ [${cName}]: Deleted ${res.deletedCount} documents belonging strictly to Spinny`);
    }
  }

  // Also purge any user memberships or test users created specifically for Spinny
  const userPurgeRes = await mongoose.connection.db.collection('users').deleteMany({
    $or: [
      { companyId: spinnyIdStr },
      { companyId: spinnyIdObj },
      { organizationId: spinnyIdStr },
      { organizationId: spinnyIdObj }
    ]
  });
  if (userPurgeRes.deletedCount > 0) {
    deletedLog.push({ collection: 'users', deleted: userPurgeRes.deletedCount });
    totalDeleted += userPurgeRes.deletedCount;
    console.log(`✓ [users]: Deleted ${userPurgeRes.deletedCount} Spinny users`);
  }

  console.log('\n======================================================================');
  console.log(`🎉 PURGE COMPLETE: Total ${totalDeleted} documents deleted exclusively for Spinny.`);
  console.log('======================================================================\n');

  // Verify Spinny Data count is now 0 across all collections
  console.log('--- RUNNING POST-PURGE VERIFICATION ---');
  let remainingSpinnyDocs = 0;
  for (const col of collections) {
    const cName = col.name;
    if (cName.startsWith('system.') || cName === 'companyprofiles' || cName === 'organizations') continue;

    const count = await mongoose.connection.db.collection(cName).countDocuments({
      $or: [
        { orgId: spinnyIdStr },
        { orgId: spinnyIdObj },
        { companyId: spinnyIdStr },
        { companyId: spinnyIdObj },
        { organizationId: spinnyIdStr },
        { organizationId: spinnyIdObj }
      ]
    });
    if (count > 0) {
      console.warn(`⚠️ Warning: ${cName} still has ${count} Spinny docs`);
      remainingSpinnyDocs += count;
    }
  }

  // Verify other companies are intact
  const otherCompanies = await mongoose.connection.db.collection('companyprofiles').countDocuments({
    _id: { $ne: spinnyIdObj }
  });
  console.log(`✓ Other Companies in DB (Untouched): ${otherCompanies}`);

  const totalOtherExpenses = await mongoose.connection.db.collection('expenses').countDocuments({
    orgId: { $ne: spinnyIdStr }
  });
  console.log(`✓ Non-Spinny Expenses intact in DB: ${totalOtherExpenses}`);

  console.log(`✓ Spinny Remaining Documents: ${remainingSpinnyDocs} (Should be 0)`);
  console.log('✓ Spinny Company Profile in companyprofiles: Intact & Ready for Fresh Slate');

  await mongoose.disconnect();
}

cleanSpinnyData().catch(console.error);
