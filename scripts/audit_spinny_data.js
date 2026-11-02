require('dotenv').config();
const mongoose = require('mongoose');

async function audit() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const spinnyIdStr = '6aa797278d301b4735f1d322';
  const spinnyIdObj = new mongoose.Types.ObjectId(spinnyIdStr);

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(`Scanning ${collections.length} collections for Spinny data (${spinnyIdStr})...\n`);

  const results = [];
  let totalDocs = 0;

  for (const col of collections) {
    const cName = col.name;
    if (cName.startsWith('system.')) continue;

    const count = await mongoose.connection.db.collection(cName).countDocuments({
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
    });

    if (count > 0) {
      results.push({ collection: cName, count });
      totalDocs += count;
    }
  }

  // Also check User/Employee collections for users linked to Spinny
  const usersCount = await mongoose.connection.db.collection('users').countDocuments({
    $or: [
      { companyId: spinnyIdStr },
      { companyId: spinnyIdObj },
      { 'companies.companyId': spinnyIdStr },
      { 'companies.companyId': spinnyIdObj },
      { organizationId: spinnyIdStr },
      { organizationId: spinnyIdObj }
    ]
  });

  const employeesCount = await mongoose.connection.db.collection('employees').countDocuments({
    $or: [
      { companyId: spinnyIdStr },
      { companyId: spinnyIdObj },
      { organizationId: spinnyIdStr },
      { organizationId: spinnyIdObj }
    ]
  });

  console.log('Audit Summary of Spinny Data:');
  console.table(results);
  console.log(`Users linked to Spinny: ${usersCount}`);
  console.log(`Employees linked to Spinny: ${employeesCount}`);
  console.log(`\nTotal matched transactional/domain documents: ${totalDocs}`);

  await mongoose.disconnect();
}

audit().catch(console.error);
