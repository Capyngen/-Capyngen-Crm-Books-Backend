const mongoose = require('mongoose');

// Generate 12 months for a year
const generatePeriods = (startDate) => {
  const periods = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < 12; i++) {
    const periodStart = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const periodEnd = new Date(start.getFullYear(), start.getMonth() + i + 1, 0); // last day of month
    
    periods.push({
      periodName: periodStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
      startDate: periodStart,
      endDate: periodEnd,
      isClosed: false,
      _id: new mongoose.Types.ObjectId()
    });
  }
  return periods;
};

async function testDB() {
  await mongoose.connect('mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority');
  console.log('Connected to DB');

  try {
    const firstCompany = await mongoose.connection.collection('companyprofiles').findOne();
    if (!firstCompany) {
      console.log('No company profile found!');
      return;
    }
    const orgId = firstCompany._id.toString();

    const FiscalYear = mongoose.connection.collection('fiscalyears');
    
    let years = await FiscalYear.find({ orgId }).toArray();
    if (years.length === 0) {
      console.log('No years found. Attempting to insert manually...');
      
      const periods = generatePeriods(new Date('2026-04-01'));
      
      await FiscalYear.insertOne({
        orgId,
        yearName: 'FY 2026-2027',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2027-03-31'),
        isClosed: false,
        periods,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Inserted successfully!');
    } else {
      console.log('Years already exist:', years.length);
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    mongoose.disconnect();
  }
}
testDB();
