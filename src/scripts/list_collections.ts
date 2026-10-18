import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  const collections = await mongoose.connection.db!.listCollections().toArray();
  console.log('Total collections found:', collections.length);
  for (const c of collections) {
    const count = await mongoose.connection.collection(c.name).countDocuments();
    if (count > 0) {
      console.log(c.name.padEnd(30), ':', count);
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
