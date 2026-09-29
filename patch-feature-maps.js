const fs = require('fs');
const file = 'D:\\Capyngen-Crm-Superadmin-main\\src\\constants\\hrmsPlanCatalog.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('for (const feature of BILLING_FEATURE_CATALOG)')) {
  const featureMaps = `
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
  }
`;

  content = content.replace(
    '  for (const feature of ACCOUNTS_FEATURE_CATALOG) {\n    FEATURE_ALIAS_MAP.set(normalizeValue(feature.key), feature.key);\n    FEATURE_ALIAS_MAP.set(normalizeValue(feature.label), feature.key);\n    for (const alias of feature.aliases) {\n      FEATURE_ALIAS_MAP.set(normalizeValue(alias), feature.key);\n    }\n  }',
    '  for (const feature of ACCOUNTS_FEATURE_CATALOG) {\n    FEATURE_ALIAS_MAP.set(normalizeValue(feature.key), feature.key);\n    FEATURE_ALIAS_MAP.set(normalizeValue(feature.label), feature.key);\n    for (const alias of feature.aliases) {\n      FEATURE_ALIAS_MAP.set(normalizeValue(alias), feature.key);\n    }\n  }\n' + featureMaps
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed FEATURE_ALIAS_MAP for Billing and Inventory!');
} else {
  console.log('Already fixed.');
}
