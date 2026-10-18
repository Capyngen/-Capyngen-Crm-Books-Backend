import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  const check = [
    'invoices',
    'booksbills',
    'bookspurchaseorders',
    'paymentreceiveds',
    'quotes',
    'salesorders',
    'deliverychallans',
    'creditnotes',
    'booksworkorders',
    'timeentries',
    'ledgerentries'
  ];

  for (const c of check) {
    const doc = await mongoose.connection.collection(c).findOne();
    if (doc) {
      console.log('Collection:', c);
      console.log('   orgId:', doc.orgId, typeof doc.orgId);
      console.log('   companyId:', doc.companyId, typeof doc.companyId);
      console.log('   organizationId:', doc.organizationId, typeof doc.organizationId);
      console.log('   org:', doc.org);
    } else {
      console.log('Collection:', c, '(EMPTY or NOT FOUND)');
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
