import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  const spinnyId = new mongoose.Types.ObjectId('6aa797278d301b4735f1d322');
  const spinnyStr = '6aa797278d301b4735f1d322';

  const collections = await mongoose.connection.db!.listCollections().toArray();
  console.log('=== SPINNY DATA AUDIT IN MONGODB ===');
  
  const report: Record<string, number> = {};
  for (const c of collections) {
    const name = c.name;
    try {
      const count = await mongoose.connection.collection(name).countDocuments({
        $or: [
          { companyId: spinnyId },
          { companyId: spinnyStr },
          { orgId: spinnyId },
          { orgId: spinnyStr }
        ]
      });
      report[name] = count;
      if (count > 0) {
        console.log(`✅ ${name}: ${count} records`);
      } else {
        console.log(`❌ ${name}: 0 records (EMPTY)`);
      }
    } catch (e: any) {
      // Some collections might not have index or fields
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
