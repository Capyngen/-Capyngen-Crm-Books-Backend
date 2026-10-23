import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function runAudit() {
  console.log('=== MASTER ENTERPRISE ERP ARCHITECTURAL AUDIT ===');
  await mongoose.connect(process.env.MONGODB_URI || '');
  console.log('Connected to MongoDB Atlas...');
  const db = mongoose.connection.db;
  if (!db) process.exit(1);

  const spinnyStr = '6aa797278d301b4735f1d322';
  const spinnyObj = new mongoose.Types.ObjectId(spinnyStr);

  // 1. MULTI-TENANCY AUDIT: Check all collections for isolation & type consistency
  console.log('\n--- 1. MULTI-TENANCY AUDIT (Tenant: ' + spinnyStr + ') ---');
  const collections = await db.listCollections().toArray();
  const multitenancyResults: any[] = [];

  for (const c of collections) {
    const colName = c.name;
    if (colName.startsWith('system.') || colName.startsWith('fs.')) continue;
    const col = db.collection(colName);
    const totalDocs = await col.countDocuments();
    if (totalDocs === 0) continue;

    const sampleDoc = await col.findOne({});
    const hasOrgId = sampleDoc ? ('orgId' in sampleDoc) : false;
    const hasCompanyId = sampleDoc ? ('companyId' in sampleDoc) : false;
    const hasTenantId = sampleDoc ? ('tenantId' in sampleDoc) : false;

    const spinnyDocsStr = await col.countDocuments({
      $or: [{ companyId: spinnyStr }, { orgId: spinnyStr }, { tenantId: spinnyStr }]
    });
    const spinnyDocsObj = await col.countDocuments({
      $or: [{ companyId: spinnyObj }, { orgId: spinnyObj }]
    });

    const isIsolated = hasOrgId || hasCompanyId || hasTenantId;
    let riskLevel = 'LOW';
    if (!isIsolated && totalDocs > 0) riskLevel = 'CRITICAL (No Tenant Key!)';
    else if (spinnyDocsStr > 0 && spinnyDocsObj > 0) riskLevel = 'HIGH (Mixed BSON Types)';

    multitenancyResults.push({
      collection: colName,
      totalInDb: totalDocs,
      spinnyStringCount: spinnyDocsStr,
      spinnyObjectIdCount: spinnyDocsObj,
      tenantKeys: [hasCompanyId && 'companyId', hasOrgId && 'orgId', hasTenantId && 'tenantId'].filter(Boolean).join(', ') || 'NONE',
      risk: riskLevel
    });
  }
  console.table(multitenancyResults);

  // 2. CHECK ALL EVENT LISTENERS FOR CRM & HRMS
  console.log('\n--- 2. EVENT INTEGRATIONS AUDIT ---');
  const eventsDir = path.resolve('src/core/events');
  console.log('Events directory exists:', fs.existsSync(eventsDir));

  // 3. CHECK POSTING ENGINE AND JOURNAL AUDIT
  console.log('\n--- 3. POSTING ENGINE & GENERAL LEDGER AUDIT ---');
  const journalsTotal = await db.collection('journals').countDocuments();
  const journalsSpinny = await db.collection('journals').countDocuments({
    $or: [{ companyId: spinnyStr }, { companyId: spinnyObj }, { orgId: spinnyStr }]
  });
  console.log(`Journals total: ${journalsTotal}, Spinny journals: ${journalsSpinny}`);

  // 4. CROSS-MODULE FLOW: Check CRM Deals, Leads, Accounts
  console.log('\n--- 4. CRM & HRMS INTEGRATION AUDIT ---');
  const leadsCount = await db.collection('leads').countDocuments({
    $or: [{ companyId: spinnyStr }, { companyId: spinnyObj }]
  });
  const dealsCount = await db.collection('deals').countDocuments({
    $or: [{ companyId: spinnyStr }, { companyId: spinnyObj }]
  });
  const employeesCount = await db.collection('employees').countDocuments({
    $or: [{ companyId: spinnyStr }, { companyId: spinnyObj }]
  });
  const payrollBatchesCount = await db.collection('payrollbatches').countDocuments({
    $or: [{ companyId: spinnyStr }, { companyId: spinnyObj }]
  });
  const expenseClaimsCount = await db.collection('expenseclaims').countDocuments({
    $or: [{ companyId: spinnyStr }, { companyId: spinnyObj }]
  });

  console.log({
    leadsInCrm: leadsCount,
    dealsInCrm: dealsCount,
    employeesInHrms: employeesCount,
    payrollBatchesInHrms: payrollBatchesCount,
    expenseClaimsInHrms: expenseClaimsCount
  });

  process.exit(0);
}

runAudit().catch(e => {
  console.error(e);
  process.exit(1);
});
