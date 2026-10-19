import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  const spinnyObjId = new mongoose.Types.ObjectId('6aa797278d301b4735f1d322');
  const spinnyId = '6aa797278d301b4735f1d322';
  const empId = new mongoose.Types.ObjectId('6aa797278d301b4735f1d324');

  await mongoose.connection.collection('employees').updateOne(
    { email: 'nitesht206@gmail.com' },
    {
      $set: {
        _id: empId,
        companyId: spinnyObjId,
        orgId: spinnyId,
        firstName: 'Nitesh',
        lastName: 'Thakur',
        email: 'nitesht206@gmail.com',
        role: 'Admin',
        status: 'Active',
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  console.log('✅ Nitesh Thakur upserted successfully for Spinny (6aa797278d301b4735f1d322)!');
  process.exit(0);
}

run().catch(console.error);
