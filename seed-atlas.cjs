const mongoose = require('mongoose');

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

    const AssetCategory = mongoose.connection.collection('assetcategories');
    
    let categories = await AssetCategory.find({ orgId }).toArray();
    if (categories.length === 0) {
      console.log('No categories found. Attempting to insert manually...');
      
      const account = await mongoose.connection.collection('chartofaccounts').findOne({ orgId });
      const accId = account ? account._id : new mongoose.Types.ObjectId();

      await AssetCategory.insertOne({
        orgId,
        name: 'Computers & Equipment',
        depreciationMethod: 'Straight_Line',
        defaultUsefulLifeMonths: 36,
        assetAccountId: accId,
        depreciationAccountId: accId,
        accumulatedDepreciationAccountId: accId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Inserted successfully!');
    } else {
      console.log('Categories already exist:', categories.length);
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    mongoose.disconnect();
  }
}
testDB();
