const mongoose = require('mongoose');

async function testDB() {
  await mongoose.connect('mongodb://localhost:27017/capyngen-local');
  const AssetCategory = mongoose.connection.collection('assetcategories');
  let categories = await AssetCategory.find({}).toArray();
  console.log(categories);
  mongoose.disconnect();
}
testDB();
