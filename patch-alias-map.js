const fs = require('fs');

const path = 'D:\\Capyngen-Crm-Superadmin-main\\src\\constants\\hrmsPlanCatalog.ts';
let content = fs.readFileSync(path, 'utf8');

const targetLoop = `    for (const feature of ACCOUNTS_FEATURE_CATALOG) {
      FEATURE_ALIAS_MAP.set(normalizeValue(feature.key), feature.key);
      FEATURE_ALIAS_MAP.set(normalizeValue(feature.label), feature.key);
      for (const alias of feature.aliases) {
        FEATURE_ALIAS_MAP.set(normalizeValue(alias), feature.key);
      }
    }`;

const newLoops = `${targetLoop}

    for (const feature of BILLING_FEATURE_CATALOG) {
      FEATURE_ALIAS_MAP.set(normalizeValue(feature.key), feature.key);
      FEATURE_ALIAS_MAP.set(normalizeValue(feature.label), feature.key);
      for (const alias of feature.aliases) {
        FEATURE_ALIAS_MAP.set(normalizeValue(alias), feature.key);
      }
    }

    for (const feature of INVENTORY_FEATURE_CATALOG) {
      FEATURE_ALIAS_MAP.set(normalizeValue(feature.key), feature.key);
      FEATURE_ALIAS_MAP.set(normalizeValue(feature.label), feature.key);
      for (const alias of feature.aliases) {
        FEATURE_ALIAS_MAP.set(normalizeValue(alias), feature.key);
      }
    }`;

if (content.includes(targetLoop)) {
    content = content.replace(targetLoop, newLoops);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Patched FEATURE_ALIAS_MAP");
} else {
    console.log("Could not find target loop");
}
