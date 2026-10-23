import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from '../domains/inventory/models/Item';
dotenv.config();

async function testQuery() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  const spinnyStr = '6aa797278d301b4735f1d322';
  const spinnyObj = new mongoose.Types.ObjectId(spinnyStr);

  console.log('Testing raw MongoDB query...');
  const rawResults = await mongoose.connection.collection('products').find({
    $or: [
      { companyId: spinnyStr },
      { companyId: spinnyObj },
      { orgId: spinnyStr }
    ]
  }).toArray();
  console.log(`Raw MongoDB matched ${rawResults.length} items`);

  console.log('Testing Mongoose Item.find with $or...');
  const mongooseResults = await Item.find({
    $or: [
      { companyId: spinnyStr },
      { companyId: spinnyObj as any },
      { orgId: spinnyStr }
    ]
  }).lean();
  console.log(`Mongoose Item.find matched ${mongooseResults.length} items`);

  process.exit(0);
}
testQuery();
