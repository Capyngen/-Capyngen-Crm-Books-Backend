const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const uri = 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';

async function checkModelBindings() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  function findModelFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(findModelFiles(fullPath));
      } else if (file.endsWith('.ts') && fullPath.includes('models')) {
        results.push(fullPath);
      }
    });
    return results;
  }

  const modelFiles = findModelFiles('d:/backend/src/domains');
  console.log(`Found ${modelFiles.length} model files in domains.\n`);

  const report = [];

  for (const f of modelFiles) {
    const content = fs.readFileSync(f, 'utf8');
    // find mongoose.model('...', ..., 'collectionName')
    const matches = [...content.matchAll(/mongoose\.model(?:<[^>]+>)?\(\s*['"]([^'"]+)['"]\s*,\s*[^,)]+(?:,\s*['"]([^'"]+)['"])?/g)];
    for (const m of matches) {
      const modelName = m[1];
      const explicitCollection = m[2];
      const resolvedCollection = explicitCollection || mongoose.pluralize()(modelName);
      
      const totalCount = await db.collection(resolvedCollection).countDocuments().catch(() => -1);
      const spinnyCount = totalCount > 0 ? await db.collection(resolvedCollection).countDocuments({
        $or: [
          { orgId: '6aa797278d301b4735f1d322' },
          { orgId: new mongoose.Types.ObjectId('6aa797278d301b4735f1d322') },
          { companyId: '6aa797278d301b4735f1d322' },
          { companyId: new mongoose.Types.ObjectId('6aa797278d301b4735f1d322') },
        ]
      }).catch(() => -1) : 0;

      report.push({
        file: path.relative('d:/backend/src', f),
        modelName,
        collection: resolvedCollection,
        totalDocs: totalCount,
        spinnyDocs: spinnyCount
      });
    }
  }

  console.log(JSON.stringify(report, null, 2));
  fs.writeFileSync('d:/backend/model_audit_report.json', JSON.stringify(report, null, 2));

  await mongoose.disconnect();
}

checkModelBindings().catch(console.error);
