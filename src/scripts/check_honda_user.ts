import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  const hondaEmpObj = await mongoose.connection.collection('employees').find({
    companyId: new mongoose.Types.ObjectId('6abdf9a7c076b4bb072b4587')
  }).toArray();
  console.log('Honda employees (ObjectId):', hondaEmpObj.map(e => ({
    _id: e._id?.toString(),
    email: e.email,
    role: e.role,
    isWorkspaceOwner: e.isWorkspaceOwner,
    companyId: e.companyId?.toString()
  })));

  const hondaEmpStr = await mongoose.connection.collection('employees').find({
    companyId: '6abdf9a7c076b4bb072b4587'
  }).toArray();
  console.log('Honda employees (string):', hondaEmpStr.map(e => ({
    _id: e._id?.toString(),
    email: e.email,
    role: e.role
  })));

  await mongoose.disconnect();
}

run().catch(console.error);
