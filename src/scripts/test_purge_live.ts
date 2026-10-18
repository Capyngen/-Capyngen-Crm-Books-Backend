import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function testPurge() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  const targetOrgId = '6abdf9a7c076b4bb072b4587';
  const orgIdObj = new mongoose.Types.ObjectId(targetOrgId);

  const filter = {
    $or: [
      { orgId: targetOrgId },
      { orgId: orgIdObj },
      { organizationId: targetOrgId },
      { organizationId: orgIdObj },
      { companyId: targetOrgId },
      { companyId: orgIdObj },
    ],
  };

  const collectionsToClean = [
    { name: 'invoices', label: 'Sales Invoices' },
    { name: 'booksinvoices', label: 'Books Invoices' },
    { name: 'quotes', label: 'Quotations' },
    { name: 'salesorders', label: 'Sales Orders' },
    { name: 'deliverychallans', label: 'Delivery Challans' },
    { name: 'paymentreceiveds', label: 'Payments Received' },
    { name: 'creditnotes', label: 'Credit Notes' },
    { name: 'booksbills', label: 'Vendor Bills' },
    { name: 'bookspurchaseorders', label: 'Purchase Orders' },
    { name: 'bookspaymentmades', label: 'Payments Made' },
    { name: 'vendorcredits', label: 'Vendor Credits' },
    { name: 'expenses', label: 'Direct Expenses' },
    { name: 'employeeexpenseclaims', label: 'Expense Claims' },
    { name: 'booksjournals', label: 'Manual Journals' },
    { name: 'ledgerentries', label: 'General Ledger Entries' },
    { name: 'stockmovements', label: 'Stock Movements' },
    { name: 'booksshipments', label: 'Shipments' },
    { name: 'booksworkorders', label: 'Work Orders' },
    { name: 'timeentries', label: 'Time Entries' },
    { name: 'approvalrequests', label: 'Approval Requests' },
  ];

  let totalDeleted = 0;
  for (const item of collectionsToClean) {
    try {
      const coll = mongoose.connection.collection(item.name);
      const res = await coll.deleteMany(filter);
      if (res.deletedCount && res.deletedCount > 0) {
        console.log(`Deleted ${res.deletedCount} from ${item.name} (${item.label})`);
        totalDeleted += res.deletedCount;
      }
    } catch (e: any) {
      console.log(`Error on ${item.name}: ${e.message}`);
    }
  }

  console.log(`=== TOTAL TEST TRANSACTIONS DELETED: ${totalDeleted} ===`);

  // Verify that master data is still intact
  const comp = await mongoose.connection.collection('companyprofiles').findOne({ _id: orgIdObj });
  console.log('Company Profile preserved:', comp ? comp.companyName : 'MISSING');

  const coa = await mongoose.connection.collection('chartofaccounts').countDocuments(filter);
  console.log('Chart of Accounts preserved count:', coa);

  const emp = await mongoose.connection.collection('employees').countDocuments(filter);
  console.log('Employees preserved count:', emp);

  const items = await mongoose.connection.collection('booksitems').countDocuments(filter);
  console.log('Item Master preserved count:', items);

  await mongoose.disconnect();
}

testPurge().catch(console.error);
