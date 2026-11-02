require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

async function testAuth() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB Atlas');

  const rawEmail = 'nitesht206@gmail.com';
  const company = await mongoose.connection.collection('companyprofiles').findOne({ 
    email: { $regex: new RegExp('^' + rawEmail + '$', 'i') } 
  });
  console.log('Tier 1 Check - Company Owner Found:', company ? { id: company._id.toString(), companyName: company.companyName, email: company.email } : null);

  if (company) {
    const companyIdStr = company._id.toString();
    const upsertRes = await mongoose.connection.collection('employees').updateOne(
      { email: company.email, companyId: new mongoose.Types.ObjectId(companyIdStr) },
      {
        $set: {
          email: company.email,
          companyId: new mongoose.Types.ObjectId(companyIdStr),
          firstName: company.companyName,
          lastName: 'Admin',
          displayName: company.companyName + ' Administrator',
          role: 'Admin',
          status: 'Active',
          employmentType: 'Full-time'
        }
      },
      { upsert: true }
    );
    console.log('Employee Sync Upsert Result:', { matched: upsertRes.matchedCount, upserted: upsertRes.upsertedCount });
  }

  const verifiedEmp = await mongoose.connection.collection('employees').findOne({ email: rawEmail });
  console.log('Verified Synced Employee in DB:', verifiedEmp ? { id: verifiedEmp._id.toString(), email: verifiedEmp.email, companyId: verifiedEmp.companyId.toString(), role: verifiedEmp.role } : null);

  await mongoose.disconnect();
}

testAuth().catch(console.error);
