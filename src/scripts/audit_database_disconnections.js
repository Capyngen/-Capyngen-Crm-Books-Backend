const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const uri = 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';

async function auditEverything() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  const allCollNames = collections.map(c => c.name);

  // Group collections by entity type
  const entityGroups = {
    customers: allCollNames.filter(n => n.includes('cust') || n.includes('client')),
    items: allCollNames.filter(n => n.includes('item') || n.includes('product')),
    vendors: allCollNames.filter(n => n.includes('vendor') || n.includes('supplier')),
    invoices: allCollNames.filter(n => n.includes('invoice')),
    orders: allCollNames.filter(n => n.includes('order')),
    payments: allCollNames.filter(n => n.includes('payment')),
    accounts: allCollNames.filter(n => n.includes('account') || n.includes('ledger') || n.includes('journal')),
    inventory: allCollNames.filter(n => n.includes('stock') || n.includes('warehouse') || n.includes('shipment') || n.includes('challan') || n.includes('putaway') || n.includes('package')),
  };

  console.log('--- ALL MONGO COLLECTIONS BY DOMAIN ENTITY ---');
  for (const [entity, cols] of Object.entries(entityGroups)) {
    console.log(`\nEntity [${entity.toUpperCase()}]:`);
    for (const c of cols) {
      const total = await db.collection(c).countDocuments();
      const spinny = await db.collection(c).countDocuments({
        $or: [
          { orgId: '6aa797278d301b4735f1d322' },
          { orgId: new mongoose.Types.ObjectId('6aa797278d301b4735f1d322') },
          { companyId: '6aa797278d301b4735f1d322' },
          { companyId: new mongoose.Types.ObjectId('6aa797278d301b4735f1d322') },
        ]
      });
      console.log(`  - ${c}: total=${total}, spinny=${spinny}`);
    }
  }

  await mongoose.disconnect();
}

auditEverything().catch(console.error);
