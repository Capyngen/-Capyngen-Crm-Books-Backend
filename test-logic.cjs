const mongoose = require('mongoose');
const { getFiscalYears } = require('./src/domains/books/controllers/fiscalCalendarController.ts'); // Wait, can't easily require TS

async function run() {
  await mongoose.connect('mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority');
  const FiscalYear = mongoose.connection.collection('fiscalyears');
  const filter = { orgId: "6aa797278d301b4735f1d322" };
  const years = await FiscalYear.find(filter).sort({ startDate: -1 }).toArray(); // Equivalent to lean()
  console.log(JSON.stringify(years, null, 2));
  mongoose.disconnect();
}
run();
