const mongoose = require('mongoose');

async function testSchema() {
  await mongoose.connect('mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority');
  
  // Use the actual schema
  const { FiscalYear } = require('./src/domains/books/models/FiscalYear.ts'); // Will fail because TS
}
