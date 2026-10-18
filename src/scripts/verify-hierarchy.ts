import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { Role } from '../domains/core/models/Role';
import { UserOrganization } from '../domains/core/models/UserOrganization';
import { ApprovalRule } from '../core/models/ApprovalRule';
import { ApprovalWorkflowService } from '../core/services/ApprovalWorkflowService';

async function test() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB successfully!');

  const orgId = '6a47a7e1ec2ba07354500c19'; // Capyngen Private Limited

  // 1. Create or Find Parent Role: Finance Manager
  let parentRole = await Role.findOne({ orgId, name: 'Finance Manager' });
  if (!parentRole) {
    parentRole = new Role({
      orgId,
      name: 'Finance Manager',
      description: 'Reviews and authorizes invoices and financial transactions',
      permissions: { billing: { invoices: ['view', 'create', 'edit', 'approve'] } }
    });
    await parentRole.save();
    console.log('Created Parent Role:', parentRole.name, parentRole._id.toString());
  } else {
    console.log('Found Parent Role:', parentRole.name, parentRole._id.toString());
  }

  // 2. Create or Find Subordinate Role: Junior Accountant
  let subRole = await Role.findOne({ orgId, name: 'Junior Accountant' });
  if (!subRole) {
    subRole = new Role({
      orgId,
      name: 'Junior Accountant',
      description: 'Creates invoices and reports to Finance Manager',
      parentRoleId: parentRole._id,
      permissions: { billing: { invoices: ['view', 'create'] } }
    });
    await subRole.save();
    console.log('Created Subordinate Role:', subRole.name, subRole._id.toString(), 'reporting to Parent:', subRole.parentRoleId?.toString());
  } else {
    subRole.parentRoleId = parentRole._id;
    await subRole.save();
    console.log('Found Subordinate Role:', subRole.name, subRole._id.toString(), 'reporting to Parent:', subRole.parentRoleId?.toString());
  }

  // 3. Set Approval Rule for Invoices in this org
  let rule = await ApprovalRule.findOne({ orgId, module: 'invoices' });
  if (!rule) {
    rule = new ApprovalRule({
      orgId,
      module: 'invoices',
      isActive: true,
      approvalType: 'hierarchical',
      thresholdAmount: 10000,
      autoApproveBelowThreshold: true,
      approverRoles: [parentRole._id.toString()]
    });
  } else {
    rule.isActive = true;
    rule.approvalType = 'hierarchical';
    rule.thresholdAmount = 10000;
    rule.autoApproveBelowThreshold = true;
    rule.approverRoles = [parentRole._id.toString()];
  }
  await rule.save();
  console.log('Approval Rule set: Invoices above ₹10,000 require approval by', parentRole.name);

  // 4. Test evaluateApprovalNeed for a Junior Accountant invoice of ₹15,000 (> 10,000 threshold)
  const checkResult = await ApprovalWorkflowService.evaluateApprovalNeed(
    orgId,
    'invoices',
    15000,
    { email: 'accountant@capyngen.com', role: 'Employee' },
    subRole
  );
  console.log('\n--- Test 1: Junior Accountant creates ₹15,000 Invoice ---');
  console.log('Requires Approval:', checkResult.requiresApproval);
  console.log('Parent Role ID:', checkResult.parentRoleId);
  console.log('Reason:', checkResult.reason);

  // 5. Test evaluateApprovalNeed for a Junior Accountant invoice of ₹5,000 (below threshold)
  const belowThresholdResult = await ApprovalWorkflowService.evaluateApprovalNeed(
    orgId,
    'invoices',
    5000,
    { email: 'accountant@capyngen.com', role: 'Employee' },
    subRole
  );
  console.log('\n--- Test 2: Junior Accountant creates ₹5,000 Invoice ---');
  console.log('Requires Approval:', belowThresholdResult.requiresApproval);
  console.log('Reason:', belowThresholdResult.reason);

  // 6. Test Admin / Owner self-approval
  const adminResult = await ApprovalWorkflowService.evaluateApprovalNeed(
    orgId,
    'invoices',
    50000,
    { email: 'ceo@capyngen.com', role: 'Admin', isWorkspaceOwner: true },
    null
  );
  console.log('\n--- Test 3: Admin / Owner creates ₹50,000 Invoice ---');
  console.log('Requires Approval:', adminResult.requiresApproval);
  console.log('Reason:', adminResult.reason);

  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
