const mongoose = require('mongoose');

async function testDB() {
  await mongoose.connect('mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority');
  
  const orgId = "6aa797278d301b4735f1d322";
  const FiscalYear = mongoose.connection.collection('fiscalyears');
  
  const exactMatch = await FiscalYear.find({ orgId: orgId }).toArray();
  const objIdMatch = await FiscalYear.find({ orgId: new mongoose.Types.ObjectId(orgId) }).toArray();
  
  console.log('String Match:', exactMatch.length);
  console.log('ObjectId Match:', objIdMatch.length);
  
  mongoose.disconnect();
}
testDB();
