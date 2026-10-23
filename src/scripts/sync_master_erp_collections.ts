import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function syncCollections() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI || '');
  console.log('Connected successfully!');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed');
  }

  const spinnyId = new mongoose.Types.ObjectId('6aa797278d301b4735f1d322');
  const spinnyStr = '6aa797278d301b4735f1d322';

  // 1. SYNC ITEMS: items -> products & booksitems
  console.log('\n--- 1. Synchronizing Items ---');
  const items = await db.collection('items').find({
    $or: [{ companyId: spinnyId }, { companyId: spinnyStr }, { orgId: spinnyStr }]
  }).toArray();
  console.log(`Found ${items.length} items in 'items' collection for Spinny.`);

  for (const it of items) {
    const doc = {
      ...it,
      companyId: spinnyId,
      orgId: spinnyStr,
      stockOnHand: it.stockOnHand ?? it.quantityOnHand ?? 100,
      updatedAt: new Date()
    };
    await db.collection('products').updateOne(
      { _id: it._id },
      { $set: doc },
      { upsert: true }
    );
    await db.collection('booksitems').updateOne(
      { _id: it._id },
      { $set: doc },
      { upsert: true }
    );
  }
  const productsCount = await db.collection('products').countDocuments({
    $or: [{ companyId: spinnyId }, { companyId: spinnyStr }, { orgId: spinnyStr }]
  });
  console.log(`Synchronized 'products' collection now has ${productsCount} items.`);

  // 2. SYNC CUSTOMERS: bookscustomers & customers -> clientaccounts
  console.log('\n--- 2. Synchronizing Customers ---');
  const customers = await db.collection('bookscustomers').find({
    $or: [{ companyId: spinnyId }, { companyId: spinnyStr }, { orgId: spinnyStr }]
  }).toArray();
  console.log(`Found ${customers.length} customers in 'bookscustomers' collection for Spinny.`);

  for (const c of customers) {
    const doc = {
      ...c,
      companyId: spinnyStr,
      orgId: spinnyStr,
      updatedAt: new Date()
    };
    await db.collection('clientaccounts').updateOne(
      { _id: c._id },
      { $set: doc },
      { upsert: true }
    );
    await db.collection('customers').updateOne(
      { _id: c._id },
      { $set: doc },
      { upsert: true }
    );
  }
  const clientAccountsCount = await db.collection('clientaccounts').countDocuments({
    $or: [{ companyId: spinnyId }, { companyId: spinnyStr }, { orgId: spinnyStr }]
  });
  console.log(`Synchronized 'clientaccounts' collection now has ${clientAccountsCount} customers.`);

  // 3. SYNC VENDORS: booksvendors -> vendors
  console.log('\n--- 3. Synchronizing Vendors ---');
  const vendors = await db.collection('booksvendors').find({
    $or: [{ companyId: spinnyId }, { companyId: spinnyStr }, { orgId: spinnyStr }]
  }).toArray();
  console.log(`Found ${vendors.length} vendors in 'booksvendors' collection for Spinny.`);

  for (const v of vendors) {
    const doc = {
      ...v,
      companyId: spinnyStr,
      orgId: spinnyStr,
      updatedAt: new Date()
    };
    await db.collection('vendors').updateOne(
      { _id: v._id },
      { $set: doc },
      { upsert: true }
    );
  }
  const vendorsCount = await db.collection('vendors').countDocuments({
    $or: [{ companyId: spinnyId }, { companyId: spinnyStr }, { orgId: spinnyStr }]
  });
  console.log(`Synchronized 'vendors' collection now has ${vendorsCount} vendors.`);

  // 4. CHECK PACKAGES & SHIPMENTS
  console.log('\n--- 4. Checking Packages & Shipments ---');
  const packages = await db.collection('packages').find({
    $or: [{ companyId: spinnyId }, { companyId: spinnyStr }, { orgId: spinnyStr }]
  }).toArray();
  console.log(`Found ${packages.length} packages in 'packages' collection for Spinny.`);

  const shipments = await db.collection('shipments').find({
    $or: [{ companyId: spinnyId }, { companyId: spinnyStr }, { orgId: spinnyStr }]
  }).toArray();
  console.log(`Found ${shipments.length} shipments in 'shipments' collection for Spinny.`);

  // Ensure all packages and shipments have both companyId and orgId set
  for (const p of packages) {
    await db.collection('packages').updateOne(
      { _id: p._id },
      { $set: { companyId: spinnyId, orgId: spinnyStr } }
    );
  }
  for (const s of shipments) {
    await db.collection('shipments').updateOne(
      { _id: s._id },
      { $set: { companyId: spinnyId, orgId: spinnyStr } }
    );
  }

  // 5. SALES ORDERS STATUS & FULFILLMENT VERIFICATION
  console.log('\n--- 5. Checking Sales Orders Fulfillment ---');
  const salesOrders = await db.collection('salesorders').find({
    $or: [{ companyId: spinnyId }, { companyId: spinnyStr }, { orgId: spinnyStr }]
  }).toArray();
  console.log(`Found ${salesOrders.length} sales orders for Spinny.`);
  for (const so of salesOrders) {
    console.log(`  - SO #${so.salesOrderNumber}: Status=${so.status}, Fulfillment=${so.fulfillmentStatus || 'Pending'}, Items=${so.items?.length || 0}`);
  }

  console.log('\n Master ERP Collections Synchronization complete!');
  await mongoose.disconnect();
}

syncCollections().catch((err) => {
  console.error('Sync error:', err);
  process.exit(1);
});
