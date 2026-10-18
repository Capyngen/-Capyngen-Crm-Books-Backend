import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const hondaId = '6abdf9a7c076b4bb072b4587';
  const hondaObjId = new mongoose.Types.ObjectId(hondaId);

  const collectionsToCheck = [
    'booksitems', 'bookscustomers', 'quotes', 'salesorders', 'invoices', 
    'deliverychallans', 'paymentreceiveds', 'booksvendors', 'bookspurchaseorders', 
    'booksbills', 'bookspaymentmades', 'packages', 'booksshipments', 'bookswarehouses', 
    'plans', 'subscriptions', 'ledgerentries', 'creditnotes', 'booksworkorders'
  ];
  console.log('=== HONDA DOCUMENT COUNTS ===');
  for (const c of collectionsToCheck) {
    const count = await mongoose.connection.collection(c).countDocuments({
      $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
    });
    console.log(`  ${c.padEnd(25)} : ${count}`);
  }
  await mongoose.disconnect();
}

main().catch(console.error);
