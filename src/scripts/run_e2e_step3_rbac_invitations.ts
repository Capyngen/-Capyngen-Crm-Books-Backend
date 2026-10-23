import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const SPINNY_ID_STR = '6aa797278d301b4735f1d322';
const SPINNY_ID_OBJ = new mongoose.Types.ObjectId(SPINNY_ID_STR);

async function runStep3() {
  console.log('====================================================');
  console.log('🚀 STEP 3: SUITE INVITATIONS, RBAC MAPPING & APPROVAL RULES');
  console.log(`Target Tenant: Spinny (${SPINNY_ID_STR})`);
  console.log('====================================================');

  await mongoose.connect(process.env.MONGODB_URI || '');
  const db = mongoose.connection.db!;

  // 1. Create or Resolve Roles with Permissions
  const rolesColl = db.collection('roles');
  
  // Role: Accountant (Maker)
  let accountantRole = await rolesColl.findOne({ orgId: SPINNY_ID_STR, name: 'Accountant' });
  if (!accountantRole) {
    accountantRole = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Accountant',
      description: 'Books & Financial Transaction Maker',
      orgId: SPINNY_ID_STR,
      companyId: SPINNY_ID_OBJ,
      isSystemRole: false,
      permissions: {
        books: ['read', 'create', 'update'],
        billing: ['read', 'create'],
        approvals: ['request'],
        inventory: ['read']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await rolesColl.insertOne(accountantRole);
  }

  // Role: Account Manager (Checker / Approver)
  let accountManagerRole = await rolesColl.findOne({ orgId: SPINNY_ID_STR, name: 'Account Manager' });
  if (!accountManagerRole) {
    accountManagerRole = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Account Manager',
      description: 'Finance Head & Approval Authority',
      orgId: SPINNY_ID_STR,
      companyId: SPINNY_ID_OBJ,
      isSystemRole: false,
      permissions: {
        books: ['read', 'create', 'update', 'approve', 'delete'],
        billing: ['read', 'approve'],
        approvals: ['approve', 'reject'],
        inventory: ['read', 'approve']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await rolesColl.insertOne(accountManagerRole);
  }

  // Role: Inventory Operator
  let inventoryRole = await rolesColl.findOne({ orgId: SPINNY_ID_STR, name: 'Inventory Operator' });
  if (!inventoryRole) {
    inventoryRole = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Inventory Operator',
      description: 'Warehouse & Fulfillment Lead',
      orgId: SPINNY_ID_STR,
      companyId: SPINNY_ID_OBJ,
      isSystemRole: false,
      permissions: {
        inventory: ['read', 'create', 'update'],
        books: ['read'],
        billing: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await rolesColl.insertOne(inventoryRole);
  }

  console.log('✅ Configured RBAC Roles:');
  console.log(`   - Accountant: ${accountantRole._id} (Maker - Cannot self-approve)`);
  console.log(`   - Account Manager: ${accountManagerRole._id} (Checker - Approval Authority)`);
  console.log(`   - Inventory Operator: ${inventoryRole._id} (Fulfillment & Dispatch Lead)`);

  // 2. Provision Users and Link to UserOrganizations for Spinny
  const usersColl = db.collection('users');
  const userOrgColl = db.collection('userorganizations');
  const defaultPasswordHash = await bcrypt.hash('Spinny@2026!', 10);

  const invitees = [
    {
      name: 'Priya Verma',
      email: 'priya.verma@spinny.com',
      roleId: accountantRole._id,
      roleName: 'Accountant',
      isAdmin: false
    },
    {
      name: 'Amit Patel',
      email: 'amit.patel@spinny.com',
      roleId: accountManagerRole._id,
      roleName: 'Account Manager',
      isAdmin: false
    },
    {
      name: 'Vikram Singh',
      email: 'vikram.singh@spinny.com',
      roleId: inventoryRole._id,
      roleName: 'Inventory Operator',
      isAdmin: false
    }
  ];

  for (const inv of invitees) {
    let userDoc = await usersColl.findOne({ email: inv.email });
    let userId = userDoc?._id;
    if (!userDoc) {
      userId = new mongoose.Types.ObjectId();
      await usersColl.insertOne({
        _id: userId,
        email: inv.email,
        name: inv.name,
        password: defaultPasswordHash,
        role: inv.roleName,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Upsert UserOrganization membership for Spinny
    await userOrgColl.updateOne(
      { email: inv.email, orgId: SPINNY_ID_STR },
      {
        $set: {
          userId,
          email: inv.email,
          orgId: SPINNY_ID_STR,
          companyId: SPINNY_ID_OBJ,
          organizationId: SPINNY_ID_OBJ,
          roleId: inv.roleId,
          role: inv.roleName,
          isAdmin: inv.isAdmin,
          status: 'Active',
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
    console.log(`✅ Invited & Mapped Suite User: ${inv.name} <${inv.email}> as [${inv.roleName}]`);
  }

  // 3. Define Approval Rules for Spinny (Invoices & Bills > ₹10,000 require Account Manager Approval)
  const approvalRulesColl = db.collection('approvalrules');
  const rules = [
    {
      module: 'invoices',
      orgId: SPINNY_ID_STR,
      companyId: SPINNY_ID_OBJ,
      enabled: true,
      threshold: 10000,
      approverRoleId: accountManagerRole._id,
      approverRoleName: 'Account Manager',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      module: 'bills',
      orgId: SPINNY_ID_STR,
      companyId: SPINNY_ID_OBJ,
      enabled: true,
      threshold: 10000,
      approverRoleId: accountManagerRole._id,
      approverRoleName: 'Account Manager',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      module: 'expenses',
      orgId: SPINNY_ID_STR,
      companyId: SPINNY_ID_OBJ,
      enabled: true,
      threshold: 5000,
      approverRoleId: accountManagerRole._id,
      approverRoleName: 'Account Manager',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await approvalRulesColl.deleteMany({
    $or: [{ orgId: SPINNY_ID_STR }, { companyId: SPINNY_ID_OBJ }]
  });
  await approvalRulesColl.insertMany(rules);
  console.log(`\n✅ Active Approval Rules Configured for Spinny:`);
  rules.forEach(r => console.log(`   - Module [${r.module.toUpperCase()}]: Transactions > ₹${r.threshold.toLocaleString('en-IN')} require approval by [${r.approverRoleName}]`));

  await mongoose.disconnect();
  console.log('\n====================================================');
  console.log('🎉 STEP 3 COMPLETED SUCCESSFULLY WITH ZERO ERRORS!');
  console.log('====================================================');
}

runStep3().catch(err => {
  console.error('Step 3 Failed:', err);
  process.exit(1);
});
