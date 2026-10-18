import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { UserOrganization } from '../domains/core/models/UserOrganization';
import { Organization } from '../domains/core/models/Organization';
import { Role } from '../domains/core/models/Role';

async function test() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Role model registered:', !!mongoose.models.Role);
  const userEmail = 'rahul@company.com';
  const emp = await mongoose.connection.collection('employees').findOne({ email: userEmail });
  const userId = emp?._id.toString();

  const query: any = {};
  if (userId && mongoose.isValidObjectId(userId)) {
    query.$or = [{ userId: new mongoose.Types.ObjectId(userId) }, { userId: userId.toString() }];
    if (userEmail) query.$or.push({ email: userEmail.toLowerCase() });
  } else if (userEmail) {
    query.email = userEmail.toLowerCase();
  }

  const mappings = await UserOrganization.find(query).populate('roleId').lean();
  const mappedOrgIds = mappings.map(m => m.orgId).filter(Boolean);

  const validObjectIds = mappedOrgIds.filter(id => mongoose.isValidObjectId(id)).map(id => new mongoose.Types.ObjectId(id));
  const companyProfiles = await mongoose.connection.collection('companyprofiles').find({
    _id: { $in: validObjectIds }
  }).toArray();

  const allOrgList: any[] = [];
  for (const cp of companyProfiles) {
    const orgIdStr = cp._id.toString();
    const mapping = mappings.find(m => m.orgId === orgIdStr);
    let perms = {};
    let roleName = 'Employee';
    if (mapping && mapping.roleId) {
      perms = (mapping.roleId as any).permissions || {};
      roleName = (mapping.roleId as any).name || 'Employee';
    }

    allOrgList.push({
      _id: orgIdStr,
      id: orgIdStr,
      name: cp.companyName || 'Organization',
      companyName: cp.companyName || 'Organization',
      isAdmin: mapping?.isAdmin || false,
      role: roleName,
      rolePermissions: perms,
      status: mapping?.status || 'Active'
    });
  }

  console.log('Result for Rahul:', JSON.stringify(allOrgList, null, 2));
  process.exit(0);
}
test();
