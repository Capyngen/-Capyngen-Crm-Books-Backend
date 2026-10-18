import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const user = await mongoose.connection.collection('users').findOne({ email: 'honda@gmail.com' });
  console.log('User honda@gmail.com:', JSON.stringify(user, null, 2));
  
  // Also check auth middleware to see how req.user and orgId/companyId are resolved
  await mongoose.disconnect();
}

main().catch(console.error);
