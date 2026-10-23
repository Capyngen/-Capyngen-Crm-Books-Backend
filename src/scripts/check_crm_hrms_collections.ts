import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  const db = mongoose.connection.db;
  if (!db) process.exit(1);

  const spinnyStr = '6aa797278d301b4735f1d322';
  const spinnyObj = new mongoose.Types.ObjectId(spinnyStr);

  const crmHrmsCols = [
    'leads', 'deals', 'contacts', 'accounts',
    'employees', 'payrollbatches', 'payslips', 'leaves', 'attendances',
    'employeeexpenseclaims', 'expenseclaims',
    'journals', 'generalledgers', 'chartofaccounts', 'bankaccounts'
  ];

  console.log('--- CRM, HRMS, and Accountant Collections for Spinny ---');
  const results: any = {};
  for (const c of crmHrmsCols) {
    try {
      const col = db.collection(c);
      const total = await col.countDocuments();
      const matchStr = await col.countDocuments({
        $or: [{ companyId: spinnyStr }, { orgId: spinnyStr }]
      });
      const matchObj = await col.countDocuments({
        $or: [{ companyId: spinnyObj }, { orgId: spinnyObj }]
      });
      results[c] = { totalInDb: total, matchString: matchStr, matchObjectId: matchObj };
    } catch(e: any) {
      results[c] = { error: e.message };
    }
  }
  console.table(results);
  process.exit(0);
}
run();
