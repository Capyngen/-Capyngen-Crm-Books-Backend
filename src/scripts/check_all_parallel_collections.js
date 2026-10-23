const mongoose = require('mongoose');
const uri = 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';

async function checkAllParallelCollections() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const testList = [
    // Books & Accounting
    { label: 'Journals', models: ['journals', 'booksjournals'] },
    { label: 'Expenses', models: ['expenses', 'booksexpenses'] },
    { label: 'Recurring Expenses', models: ['recurringexpenses', 'booksrecurringexpenses'] },
    { label: 'Recurring Bills', models: ['recurringbills', 'booksrecurringbills'] },
    { label: 'Projects', models: ['projects', 'booksprojects'] },
    { label: 'Documents', models: ['documents', 'booksdocuments'] },
    { label: 'Taxes', models: ['taxes', 'taxrates', 'taxconfigurations'] },
    { label: 'Organizations', models: ['organizations', 'companies', 'orgs'] },
    { label: 'Users / Employees', models: ['users', 'employees', 'userorganizations'] },
    { label: 'Asset Categories / Assets', models: ['assets', 'assetcategories', 'fixedassets'] },
    { label: 'Banking', models: ['bankaccounts', 'bankingrules', 'bankstatementlines'] },
    { label: 'Branches', models: ['branches', 'booksbranches'] },
    { label: 'Landed Costs', models: ['landedcosts', 'bookslandedcosts'] },
    { label: 'Cycle Counts', models: ['cyclecounts', 'bookscyclecounts'] },
    { label: 'Machines', models: ['machines', 'booksmachines'] },
    { label: 'Routings', models: ['routings', 'booksroutings'] },
  ];

  console.log('=== PARALLEL COLLECTIONS SCAN (SPINNY & TOTAL) ===\n');

  for (const item of testList) {
    console.log(`--- ${item.label} ---`);
    for (const c of item.models) {
      const exists = await db.listCollections({ name: c }).hasNext();
      if (!exists) {
        console.log(`  [${c}]: NOT FOUND in DB`);
        continue;
      }
      const total = await db.collection(c).countDocuments();
      const spinny = await db.collection(c).countDocuments({
        $or: [
          { orgId: '6aa797278d301b4735f1d322' },
          { orgId: new mongoose.Types.ObjectId('6aa797278d301b4735f1d322') },
          { companyId: '6aa797278d301b4735f1d322' },
          { companyId: new mongoose.Types.ObjectId('6aa797278d301b4735f1d322') },
        ]
      });
      console.log(`  [${c}]: totalDocs=${total}, spinnyDocs=${spinny}`);
    }
  }

  await mongoose.disconnect();
}

checkAllParallelCollections().catch(console.error);
