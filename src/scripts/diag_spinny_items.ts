import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  const db = mongoose.connection.db;
  if (!db) {
    console.error('No DB connection');
    process.exit(1);
  }
  const spinnyStr = '6aa797278d301b4735f1d322';
  const spinnyObj = new mongoose.Types.ObjectId(spinnyStr);

  const inProductsTotal = await db.collection('products').countDocuments();
  const inProductsStr = await db.collection('products').countDocuments({ companyId: spinnyStr });
  const inProductsObj = await db.collection('products').countDocuments({ companyId: spinnyObj });
  const inProductsOrgStr = await db.collection('products').countDocuments({ orgId: spinnyStr });

  console.log({ inProductsTotal, inProductsStr, inProductsObj, inProductsOrgStr });

  const allItems = await db.collection('products').find({
    $or: [{ companyId: spinnyStr }, { companyId: spinnyObj }, { orgId: spinnyStr }]
  }).project({ name: 1, sku: 1, companyId: 1, orgId: 1 }).toArray();

  console.log('Found items count:', allItems.length);
  console.log('Items sample:', allItems.map(i => ({ 
    name: i.name, 
    sku: i.sku, 
    companyId: i.companyId,
    companyIdType: typeof i.companyId, 
    isObjId: i.companyId instanceof mongoose.Types.ObjectId 
  })));

  // Also check items collection and booksitems collection
  const inItemsStr = await db.collection('items').countDocuments({ companyId: spinnyStr });
  const inItemsObj = await db.collection('items').countDocuments({ companyId: spinnyObj });
  const inBooksItemsStr = await db.collection('booksitems').countDocuments({ companyId: spinnyStr });
  const inBooksItemsObj = await db.collection('booksitems').countDocuments({ companyId: spinnyObj });

  console.log({ inItemsStr, inItemsObj, inBooksItemsStr, inBooksItemsObj });

  process.exit(0);
}
run();
