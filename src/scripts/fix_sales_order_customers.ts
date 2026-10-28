import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function fixCustomer() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db;
  if (!db) {
    console.error('No DB connection');
    return;
  }

  // Find a valid customer or client account
  let sampleCust = await db.collection('clientaccounts').findOne({});
  if (!sampleCust) {
    sampleCust = await db.collection('customers').findOne({});
  }
  console.log('Sample customer found:', sampleCust?._id, sampleCust?.displayName || sampleCust?.name);

  // Check sales orders with non-ObjectId customer
  const orders = await db.collection('salesorders').find({}).toArray();
  for (const o of orders) {
    const isObjId = o.customer && (o.customer instanceof mongoose.Types.ObjectId || mongoose.Types.ObjectId.isValid(o.customer));
    if (!isObjId || typeof o.customer === 'object') {
      console.log('Fixing sales order:', o._id, o.salesOrderNumber);
      const custName = typeof o.customer === 'object' ? (o.customer.displayName || o.customer.name) : o.customer;
      await db.collection('salesorders').updateOne(
        { _id: o._id },
        { 
          $set: { 
            customer: sampleCust ? sampleCust._id : new mongoose.Types.ObjectId(),
            customerName: custName || 'Rohit Sharma (Spinny Customer)'
          } 
        }
      );
    }
  }
  console.log('Fixed sales orders successfully.');
  await mongoose.disconnect();
}

fixCustomer();
