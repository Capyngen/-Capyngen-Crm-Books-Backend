import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');
  
  const profiles = await mongoose.connection.collection('companyprofiles').find({}).toArray();
  console.log('=== COMPANY PROFILES ===');
  for (const p of profiles) {
    console.log(`ID: ${p._id.toString()} | Name: ${p.companyName} | Email: ${p.companyEmail}`);
  }
  
  const users = await mongoose.connection.collection('users').find({}).toArray();
  console.log('\n=== USERS ===');
  for (const u of users) {
    console.log(`Email: ${u.email} | companyId: ${u.companyId} | orgId: ${u.orgId} | role: ${u.role}`);
  }

  // Count documents in main collections for the first company profile found
  if (profiles.length > 0) {
    const targetOrgId = profiles[0]._id.toString();
    console.log(`\n=== DOCUMENT COUNTS FOR ${profiles[0].companyName} (${targetOrgId}) ===`);
    const collectionsToCheck = [
      'booksitems', 'bookscustomers', 'quotes', 'salesorders', 'invoices', 
      'deliverychallans', 'paymentreceiveds', 'booksvendors', 'bookspurchaseorders', 
      'booksbills', 'bookspaymentmades', 'packages', 'booksshipments', 'bookswarehouses', 
      'plans', 'subscriptions', 'ledgerentries'
    ];
    for (const c of collectionsToCheck) {
      const count = await mongoose.connection.collection(c).countDocuments({
        $or: [{ orgId: targetOrgId }, { companyId: targetOrgId }, { companyId: profiles[0]._id }]
      });
      console.log(`  ${c.padEnd(25)} : ${count}`);
    }
  }

  await mongoose.disconnect();
}

main().catch(console.error);
