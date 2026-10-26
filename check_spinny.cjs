const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/backend/.env' });

async function checkSpinny() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const orgs = await db.collection('companyprofiles').find({ companyName: /spinny/i }).toArray();
  console.log('Spinny in companyprofiles:', orgs.map(o => ({ _id: o._id, name: o.companyName, email: o.email })));

  const orgs2 = await db.collection('organizations').find({ name: /spinny/i }).toArray();
  console.log('Spinny in organizations:', orgs2.map(o => ({ _id: o._id, name: o.name })));

  // All orgs with Spinny
  const allSpinny = [...orgs, ...orgs2];
  for (const s of allSpinny) {
    const idStr = s._id.toString();
    const idObj = s._id;
    console.log(`\n================ Checking for org: ${idStr} (${s.companyName || s.name}) ================`);

    const wh = await db.collection('warehouses').find({
      $or: [{ orgId: idStr }, { orgId: idObj }, { companyId: idStr }, { companyId: idObj }]
    }).toArray();
    console.log(`Warehouses count: ${wh.length}`);
    wh.forEach(w => console.log(`  - Warehouse: ${w.name} (orgId: ${w.orgId}, companyId: ${w.companyId})`));

    const to = await db.collection('transferorders').find({
      $or: [{ orgId: idStr }, { orgId: idObj }, { companyId: idStr }, { companyId: idObj }]
    }).toArray();
    console.log(`TransferOrders count: ${to.length}`);
    to.forEach(t => console.log(`  - TO: ${t.transferOrderNumber || t.transferNumber} status: ${t.status} (orgId: ${t.orgId})`));

    const soList = await db.collection('salesorders').find({
      $or: [{ orgId: idStr }, { orgId: idObj }, { companyId: idStr }, { companyId: idObj }]
    }).toArray();
    console.log(`SalesOrders count: ${soList.length}`);
    soList.forEach(so => {
      console.log(`  - SO: ${so.salesOrderNumber} status: ${so.status} fulfillment: ${so.fulfillmentStatus} (orgId: ${so.orgId})`);
      (so.items || []).forEach(i => console.log(`      item: qty=${i.quantity}, fulfilled=${i.quantityFulfilled}`));
    });

    const sh = await db.collection('shipments').find({
      $or: [{ orgId: idStr }, { orgId: idObj }, { companyId: idStr }, { companyId: idObj }]
    }).toArray();
    console.log(`Shipments count: ${sh.length}`);

    const pkg = await db.collection('packages').find({
      $or: [{ orgId: idStr }, { orgId: idObj }, { companyId: idStr }, { companyId: idObj }]
    }).toArray();
    console.log(`Packages count: ${pkg.length}`);
    pkg.forEach(p => console.log(`  - Package: status: ${p.status} (orgId: ${p.orgId})`));
  }

  // Also check if there are warehouses or transfer orders with missing orgId or different orgId!
  console.log('\n================ ALL WAREHOUSES IN DB ================');
  const allWh = await db.collection('warehouses').find({}).toArray();
  allWh.forEach(w => console.log(`Warehouse: "${w.name}" | orgId: "${w.orgId}" | companyId: "${w.companyId}"`));

  console.log('\n================ ALL TRANSFER ORDERS IN DB ================');
  const allTo = await db.collection('transferorders').find({}).toArray();
  allTo.forEach(t => console.log(`TransferOrder: "${t.transferOrderNumber || t.transferNumber}" | status: "${t.status}" | orgId: "${t.orgId}"`));

  console.log('\n================ ALL PACKAGES IN DB ================');
  const allPkg = await db.collection('packages').find({}).toArray();
  allPkg.forEach(p => console.log(`Package: status: "${p.status}" | orgId: "${p.orgId}"`));

  await mongoose.disconnect();
}
checkSpinny().catch(console.error);
