import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Role } from '../domains/core/models/Role';
import { User } from '../domains/core/models/User';
import { UserOrganization } from '../domains/core/models/UserOrganization';

async function seedUsers() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  const orgId = '6a47a7e1ec2ba07354500c19';
  const orgIdObj = new mongoose.Types.ObjectId(orgId);

  const parentRole = await Role.findOne({ orgId, name: 'Finance Manager' });
  const subRole = await Role.findOne({ orgId, name: 'Junior Accountant' });

  const hashedPassword = await bcrypt.hash('Password@123', 10);

  // 1. Manager User
  const managerEmail = 'manager@capyngen.com';
  await User.findOneAndUpdate(
    { email: managerEmail },
    { email: managerEmail, password: hashedPassword, role: 'Business User', isVerified: true },
    { upsert: true }
  );

  let managerEmp = await mongoose.connection.collection('employees').findOne({ email: managerEmail });
  if (!managerEmp) {
    const res = await mongoose.connection.collection('employees').insertOne({
      employeeId: `EMP-${Date.now().toString().slice(-6)}-101`,
      email: managerEmail,
      password: hashedPassword,
      firstName: 'Finance',
      lastName: 'Manager',
      role: 'Manager',
      companyId: orgIdObj,
      isActive: true,
      booksRole: 'Finance Manager',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    managerEmp = { _id: res.insertedId };
  } else {
    await mongoose.connection.collection('employees').updateOne(
      { _id: managerEmp._id },
      { $set: { password: hashedPassword, booksRole: 'Finance Manager', isActive: true } }
    );
  }

  await UserOrganization.findOneAndUpdate(
    { email: managerEmail, orgId },
    {
      email: managerEmail,
      name: 'Finance Manager',
      orgId,
      roleId: parentRole!._id,
      userId: managerEmp._id,
      status: 'Active',
      isAdmin: false
    },
    { upsert: true }
  );
  console.log('Seeded Manager: manager@capyngen.com / Password@123 (Role: Finance Manager)');

  // 2. Accountant User
  const accEmail = 'accountant@capyngen.com';
  await User.findOneAndUpdate(
    { email: accEmail },
    { email: accEmail, password: hashedPassword, role: 'Business User', isVerified: true },
    { upsert: true }
  );

  let accEmp = await mongoose.connection.collection('employees').findOne({ email: accEmail });
  if (!accEmp) {
    const res = await mongoose.connection.collection('employees').insertOne({
      employeeId: `EMP-${Date.now().toString().slice(-6)}-102`,
      email: accEmail,
      password: hashedPassword,
      firstName: 'Junior',
      lastName: 'Accountant',
      role: 'Employee',
      companyId: orgIdObj,
      isActive: true,
      booksRole: 'Junior Accountant',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    accEmp = { _id: res.insertedId };
  } else {
    await mongoose.connection.collection('employees').updateOne(
      { _id: accEmp._id },
      { $set: { password: hashedPassword, booksRole: 'Junior Accountant', isActive: true } }
    );
  }

  await UserOrganization.findOneAndUpdate(
    { email: accEmail, orgId },
    {
      email: accEmail,
      name: 'Junior Accountant',
      orgId,
      roleId: subRole!._id,
      userId: accEmp._id,
      status: 'Active',
      isAdmin: false
    },
    { upsert: true }
  );
  console.log('Seeded Accountant: accountant@capyngen.com / Password@123 (Role: Junior Accountant, Reports to Finance Manager)');

  process.exit(0);
}

seedUsers().catch(e => { console.error(e); process.exit(1); });
