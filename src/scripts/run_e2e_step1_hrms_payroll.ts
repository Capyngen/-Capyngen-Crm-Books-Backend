import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const SPINNY_ID_STR = '6aa797278d301b4735f1d322';
const SPINNY_ID_OBJ = new mongoose.Types.ObjectId(SPINNY_ID_STR);

async function runStep1() {
  console.log('====================================================');
  console.log('🚀 STEP 1: HRMS ONBOARDING & PAYROLL FINALIZATION');
  console.log(`Target Tenant: Spinny (${SPINNY_ID_STR})`);
  console.log('====================================================');

  await mongoose.connect(process.env.MONGODB_URI || '');
  const db = mongoose.connection.db!;

  // 1. Onboard 5 Employees
  const employeesData = [
    {
      _id: new mongoose.Types.ObjectId(),
      employeeCode: 'EMP-001',
      firstName: 'Rahul',
      lastName: 'Sharma',
      employeeName: 'Rahul Sharma',
      email: 'rahul.sharma@spinny.com',
      department: 'Sales',
      designation: 'Senior Sales Executive',
      role: 'Sales Executive',
      basicSalary: 40000,
      hra: 15000,
      allowances: 5000,
      netSalary: 60000,
      status: 'Active',
      companyId: SPINNY_ID_OBJ,
      orgId: SPINNY_ID_STR,
      dateOfJoining: new Date('2026-01-15'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      employeeCode: 'EMP-002',
      firstName: 'Priya',
      lastName: 'Verma',
      employeeName: 'Priya Verma',
      email: 'priya.verma@spinny.com',
      department: 'Finance',
      designation: 'Senior Accountant',
      role: 'Accountant',
      basicSalary: 35000,
      hra: 15000,
      allowances: 5000,
      netSalary: 55000,
      status: 'Active',
      companyId: SPINNY_ID_OBJ,
      orgId: SPINNY_ID_STR,
      dateOfJoining: new Date('2026-02-01'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      employeeCode: 'EMP-003',
      firstName: 'Amit',
      lastName: 'Patel',
      employeeName: 'Amit Patel',
      email: 'amit.patel@spinny.com',
      department: 'Finance',
      designation: 'Finance & Accounts Manager',
      role: 'Account Manager',
      basicSalary: 60000,
      hra: 20000,
      allowances: 10000,
      netSalary: 90000,
      status: 'Active',
      companyId: SPINNY_ID_OBJ,
      orgId: SPINNY_ID_STR,
      dateOfJoining: new Date('2025-11-10'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      employeeCode: 'EMP-004',
      firstName: 'Vikram',
      lastName: 'Singh',
      employeeName: 'Vikram Singh',
      email: 'vikram.singh@spinny.com',
      department: 'Logistics',
      designation: 'Warehouse & Inventory Lead',
      role: 'Inventory Operator',
      basicSalary: 32000,
      hra: 12000,
      allowances: 6000,
      netSalary: 50000,
      status: 'Active',
      companyId: SPINNY_ID_OBJ,
      orgId: SPINNY_ID_STR,
      dateOfJoining: new Date('2026-03-01'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      employeeCode: 'EMP-005',
      firstName: 'Neha',
      lastName: 'Gupta',
      employeeName: 'Neha Gupta',
      email: 'neha.gupta@spinny.com',
      department: 'Operations',
      designation: 'Operations Associate',
      role: 'Operations Associate',
      basicSalary: 30000,
      hra: 10000,
      allowances: 5000,
      netSalary: 45000,
      status: 'Active',
      companyId: SPINNY_ID_OBJ,
      orgId: SPINNY_ID_STR,
      dateOfJoining: new Date('2026-04-10'),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Clean prior if any and insert
  await db.collection('employees').deleteMany({
    $or: [{ orgId: SPINNY_ID_STR }, { companyId: SPINNY_ID_OBJ }]
  });
  // Also keep Nitesh admin
  const adminEmpId = new mongoose.Types.ObjectId('6aa797278d301b4735f1d324');
  await db.collection('employees').insertOne({
    _id: adminEmpId,
    employeeCode: 'EMP-000',
    firstName: 'Nitesh',
    lastName: 'Thakur',
    employeeName: 'Nitesh Thakur',
    email: 'nitesht206@gmail.com',
    role: 'Admin',
    designation: 'Managing Director & Admin',
    status: 'Active',
    companyId: SPINNY_ID_OBJ,
    orgId: SPINNY_ID_STR,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  await db.collection('employees').insertMany(employeesData);
  console.log(`✅ Onboarded ${employeesData.length} Employees for Spinny:`);
  employeesData.forEach(e => console.log(`   - ${e.employeeCode}: ${e.employeeName} (${e.role} | Net: ₹${e.netSalary.toLocaleString('en-IN')})`));

  // 2. Process Monthly Payroll Batch
  const totalSalaries = employeesData.reduce((sum, e) => sum + e.netSalary, 0); // ₹3,00,000
  const totalBasic = employeesData.reduce((sum, e) => sum + e.basicSalary, 0); // ₹1,97,000
  const totalHra = employeesData.reduce((sum, e) => sum + e.hra, 0); // ₹72,000
  const totalAllowances = employeesData.reduce((sum, e) => sum + e.allowances, 0); // ₹31,000

  const batchId = new mongoose.Types.ObjectId();
  const payrollBatch = {
    _id: batchId,
    batchNumber: `PAY-2026-10`,
    month: 'October',
    year: 2026,
    companyId: SPINNY_ID_OBJ,
    orgId: SPINNY_ID_STR,
    totalGrossAmount: totalSalaries,
    totalDeductions: 0,
    totalNetAmount: totalSalaries,
    employeeCount: employeesData.length,
    status: 'Finalized',
    processedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collection('payrollbatches').insertOne(payrollBatch);
  console.log(`\n✅ Generated Payroll Batch: ${payrollBatch.batchNumber} (Total Payout: ₹${totalSalaries.toLocaleString('en-IN')} for ${employeesData.length} employees)`);

  // 3. Post Automatic Double-Entry Journal in Books
  const journalNumber = `JRN-PAY-2026-10`;
  const journalDoc = {
    _id: new mongoose.Types.ObjectId(),
    journalNumber,
    date: new Date('2026-10-31'),
    reference: `Payroll Batch PAY-2026-10`,
    notes: `Automated Payroll Finalization Journal for 5 Spinny employees (October 2026)`,
    status: 'Published',
    companyId: SPINNY_ID_OBJ,
    orgId: SPINNY_ID_STR,
    currency: 'INR',
    totalDebit: totalSalaries,
    totalCredit: totalSalaries,
    lineItems: [
      {
        accountId: 'Salaries & Wages Expense',
        accountName: 'Salaries and Wages Expense',
        accountType: 'Expense',
        debit: totalSalaries,
        credit: 0,
        description: 'Monthly employee compensation for October 2026'
      },
      {
        accountId: 'Payroll Payable',
        accountName: 'Accrued Payroll & Salaries Payable',
        accountType: 'Current Liability',
        debit: 0,
        credit: totalSalaries,
        description: 'Net salaries payable to employees'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collection('booksjournals').insertOne(journalDoc);
  console.log(`✅ Posted Automated Double-Entry Journal in Books: #${journalDoc.journalNumber}`);
  console.log(`   Debit:  Salaries & Wages Expense -> ₹${totalSalaries.toLocaleString('en-IN')}`);
  console.log(`   Credit: Payroll Payable          -> ₹${totalSalaries.toLocaleString('en-IN')}`);

  // Post to General Ledger ledgerentries
  const ledgerEntries = [
    {
      _id: new mongoose.Types.ObjectId(),
      transactionId: journalDoc._id.toString(),
      transactionNumber: journalDoc.journalNumber,
      transactionType: 'Journal',
      date: new Date('2026-10-31'),
      accountName: 'Salaries and Wages Expense',
      accountType: 'Expense',
      debit: totalSalaries,
      credit: 0,
      balance: totalSalaries,
      companyId: SPINNY_ID_OBJ,
      orgId: SPINNY_ID_STR,
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      transactionId: journalDoc._id.toString(),
      transactionNumber: journalDoc.journalNumber,
      transactionType: 'Journal',
      date: new Date('2026-10-31'),
      accountName: 'Accrued Payroll & Salaries Payable',
      accountType: 'Current Liability',
      debit: 0,
      credit: totalSalaries,
      balance: -totalSalaries,
      companyId: SPINNY_ID_OBJ,
      orgId: SPINNY_ID_STR,
      createdAt: new Date()
    }
  ];
  await db.collection('ledgerentries').insertMany(ledgerEntries);
  console.log(`✅ Posted ${ledgerEntries.length} General Ledger entries for Trial Balance integrity.`);

  await mongoose.disconnect();
  console.log('\n====================================================');
  console.log('🎉 STEP 1 COMPLETED SUCCESSFULLY WITH ZERO ERRORS!');
  console.log('====================================================');
}

runStep1().catch(err => {
  console.error('Step 1 Failed:', err);
  process.exit(1);
});
