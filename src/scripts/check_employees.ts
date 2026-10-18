import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const emps = await mongoose.connection.collection('employees').find({}).toArray();
  console.log('=== EMPLOYEES in DB ===');
  for (const e of emps) {
    console.log(`ID: ${e._id} | Name: ${e.firstName} ${e.lastName} | Email: ${e.email} | companyId: ${e.companyId}`);
  }
  await mongoose.disconnect();
}

main().catch(console.error);
