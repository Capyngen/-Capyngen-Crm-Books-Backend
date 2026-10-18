import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  const orgId = '6abdf9a7c076b4bb072b4587';
  const orgObj = new mongoose.Types.ObjectId(orgId);

  const collections = await mongoose.connection.db!.listCollections().toArray();
  console.log('Checking all collections for Honda orgId/companyId:', orgId);

  for (const c of collections) {
    const filter = {
      $or: [
        { orgId: orgId },
        { orgId: orgObj },
        { companyId: orgId },
        { companyId: orgObj },
        { organizationId: orgId },
        { organizationId: orgObj }
      ]
    };
    try {
      const count = await mongoose.connection.collection(c.name).countDocuments(filter);
      if (count > 0) {
        console.log(c.name.padEnd(30), ':', count);
      }
    } catch {
      // ignore
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
