const mongoose = require('mongoose');

const uri = 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';

async function unify() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  console.log('=== UNIFYING ERP COLLECTIONS (SINGLE SOURCE OF TRUTH) ===\n');

  // 1. Customers: Ensure all records from 'bookscustomers' and 'clientaccounts' are in 'customers'
  console.log('1. Unifying Customers -> `customers`...');
  const fromBooksCust = await db.collection('bookscustomers').find({}).toArray();
  for (const doc of fromBooksCust) {
    const exists = await db.collection('customers').findOne({ _id: doc._id });
    if (!exists) {
      await db.collection('customers').insertOne(doc);
      console.log(`  Merged customer [${doc.displayName || doc.name}] from bookscustomers to customers`);
    }
  }

  // 2. Warehouses: Ensure all warehouses are in 'warehouses'
  console.log('2. Unifying Warehouses -> `warehouses`...');
  const fromBooksWh = await db.collection('bookswarehouses').find({}).toArray();
  for (const doc of fromBooksWh) {
    const exists = await db.collection('warehouses').findOne({ _id: doc._id });
    if (!exists) {
      await db.collection('warehouses').insertOne(doc);
      console.log(`  Merged warehouse [${doc.name}] into warehouses`);
    }
  }

  // 3. Purchase Orders: Ensure all POs are in 'purchaseorders'
  console.log('3. Unifying Purchase Orders -> `purchaseorders`...');
  const fromBooksPO = await db.collection('bookspurchaseorders').find({}).toArray();
  for (const doc of fromBooksPO) {
    const exists = await db.collection('purchaseorders').findOne({ _id: doc._id });
    if (!exists) {
      await db.collection('purchaseorders').insertOne(doc);
      console.log(`  Merged purchase order [${doc.poNumber || doc._id}] into purchaseorders`);
    }
  }

  // 4. Shipments: Ensure all shipments are in 'shipments'
  console.log('4. Unifying Shipments -> `shipments`...');
  const fromBooksShip = await db.collection('booksshipments').find({}).toArray();
  for (const doc of fromBooksShip) {
    const exists = await db.collection('shipments').findOne({ _id: doc._id });
    if (!exists) {
      await db.collection('shipments').insertOne(doc);
      console.log(`  Merged shipment [${doc.shipmentNumber || doc._id}] into shipments`);
    }
  }

  // 5. Bills: Ensure all bills are in 'bills'
  console.log('5. Unifying Bills -> `bills`...');
  const fromBooksBills = await db.collection('booksbills').find({}).toArray();
  for (const doc of fromBooksBills) {
    const exists = await db.collection('bills').findOne({ _id: doc._id });
    if (!exists) {
      await db.collection('bills').insertOne(doc);
      console.log(`  Merged bill [${doc.billNumber || doc._id}] into bills`);
    }
  }

  // 6. Payments Received: Ensure all payments are in 'paymentsreceived'
  console.log('6. Unifying Payments Received -> `paymentsreceived`...');
  const fromTypoPay = await db.collection('paymentreceiveds').find({}).toArray();
  for (const doc of fromTypoPay) {
    const exists = await db.collection('paymentsreceived').findOne({ _id: doc._id });
    if (!exists) {
      await db.collection('paymentsreceived').insertOne(doc);
      console.log(`  Merged payment [${doc.paymentNumber || doc._id}] into paymentsreceived`);
    }
  }

  // 7. Payments Made: Ensure all payments made are in 'paymentsmade'
  console.log('7. Unifying Payments Made -> `paymentsmade`...');
  const fromBooksPM = await db.collection('bookspaymentmades').find({}).toArray();
  for (const doc of fromBooksPM) {
    const exists = await db.collection('paymentsmade').findOne({ _id: doc._id });
    if (!exists) {
      await db.collection('paymentsmade').insertOne(doc);
      console.log(`  Merged payment made [${doc.paymentNumber || doc._id}] into paymentsmade`);
    }
  }

  // 8. Journals: Ensure all journals are in 'booksjournals'
  console.log('8. Unifying Journals -> `booksjournals`...');
  const fromJournals = await db.collection('journals').find({}).toArray();
  for (const doc of fromJournals) {
    const exists = await db.collection('booksjournals').findOne({ _id: doc._id });
    if (!exists) {
      await db.collection('booksjournals').insertOne(doc);
      console.log(`  Merged journal [${doc.journalNumber || doc._id}] into booksjournals`);
    }
  }

  console.log('\n=== UNIFICATION COMPLETE SUCCESSFULLY! ===');
  await mongoose.disconnect();
}

unify().catch(console.error);
