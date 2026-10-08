const mongoose = require('mongoose');

async function testDB() {
  await mongoose.connect('mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority');
  
  const FiscalYear = mongoose.connection.collection('fiscalyears');
  let years = await FiscalYear.find({}).toArray();
  console.log('Fiscal Years in DB:', years.map(y => ({ id: y._id, orgId: y.orgId, name: y.yearName })));

  const CompanyProfile = mongoose.connection.collection('companyprofiles');
  let companies = await CompanyProfile.find({}).toArray();
  console.log('Companies in DB:', companies.map(c => ({ id: c._id, name: c.companyName })));

  mongoose.disconnect();
}
testDB();
