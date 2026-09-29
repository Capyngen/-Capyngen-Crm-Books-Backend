const fs = require('fs');
const file = 'D:\\Capyngen-Crm-Superadmin-main\\src\\constants\\hrmsPlanCatalog.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('export const ALL_FEATURE_CATALOG')) {
  const allFeatureCatalog = `
export const ALL_FEATURE_CATALOG: HrmsFeatureDefinition[] = [
  ...HRMS_FEATURE_CATALOG,
  ...ACCOUNTS_FEATURE_CATALOG,
  ...BILLING_FEATURE_CATALOG,
  ...INVENTORY_FEATURE_CATALOG,
];
`;

  // Insert right before FEATURE_ALIAS_MAP since we know it's there
  content = content.replace(
    /for\s*\(\s*const\s+feature\s+of\s+ACCOUNTS_FEATURE_CATALOG\s*\)\s*\{[\s\S]*?FEATURE_ALIAS_MAP\.set/,
    allFeatureCatalog + '\n  for (const feature of ACCOUNTS_FEATURE_CATALOG) {\n    FEATURE_ALIAS_MAP.set'
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully injected ALL_FEATURE_CATALOG!');
}
