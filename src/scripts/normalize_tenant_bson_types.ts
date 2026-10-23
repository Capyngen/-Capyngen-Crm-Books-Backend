import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  console.log('Connected to MongoDB Atlas');

  const spinnyStr = '6aa797278d301b4735f1d322';
  const spinnyObj = new mongoose.Types.ObjectId(spinnyStr);

  const collections = await mongoose.connection.db!.listCollections().toArray();
  console.log(`\nStarting BSON Multi-Tenancy Normalization across ${collections.length} collections for Spinny (${spinnyStr})...\n`);

  let totalUpdated = 0;

  for (const colInfo of collections) {
    const colName = colInfo.name;
    // Skip internal system collections
    if (colName.startsWith('system.') || colName.startsWith('sessions')) continue;

    const col = mongoose.connection.collection(colName);

    try {
      // Find all docs matching Spinny by either String or ObjectId across companyId / orgId / tenantId
      const filter = {
        $or: [
          { companyId: spinnyStr },
          { companyId: spinnyObj },
          { orgId: spinnyStr },
          { orgId: spinnyObj },
          { tenantId: spinnyStr },
          { tenantId: spinnyObj }
        ]
      };

      const count = await col.countDocuments(filter);
      if (count === 0) continue;

      // Update documents to ensure both companyId and orgId are set to spinnyStr
      // (our schemas with Mixed type will also match ObjectId queries via buildTenantFilter)
      const updateResult = await col.updateMany(filter, {
        $set: {
          companyId: spinnyStr,
          orgId: spinnyStr
        }
      });

      console.log(`[${colName}] Matched: ${count}, Modified: ${updateResult.modifiedCount}`);
      totalUpdated += updateResult.modifiedCount;
    } catch (err: any) {
      console.warn(`Could not process collection ${colName}:`, err.message);
    }
  }

  console.log(`\n✅ BSON Normalization complete! Total documents updated: ${totalUpdated}\n`);

  // Specifically verify products collection
  const productsCol = mongoose.connection.collection('products');
  const spinnyProducts = await productsCol.find({
    $or: [
      { companyId: spinnyStr },
      { orgId: spinnyStr },
      { companyId: spinnyObj },
      { orgId: spinnyObj }
    ]
  }).toArray();

  console.log(`Verified Spinny Products in DB: ${spinnyProducts.length} items`);
  spinnyProducts.forEach((p, idx) => {
    console.log(`  ${idx + 1}. [${p.sku || 'NO-SKU'}] ${p.name} | companyId: ${p.companyId} (type: ${typeof p.companyId}) | orgId: ${p.orgId}`);
  });

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Error running normalization:', err);
  process.exit(1);
});
