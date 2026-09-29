const fs = require('fs');
const file = 'D:\\Capyngen-Crm-Backend-main\\src\\constants\\hrmsPlanCatalog.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('export const ALL_FEATURE_CATALOG: HrmsFeatureDefinition[] = [')) {
  const allFeatureCatalog = `
export const ALL_FEATURE_CATALOG: HrmsFeatureDefinition[] = [
  ...HRMS_FEATURE_CATALOG,
  ...ACCOUNTS_FEATURE_CATALOG,
  ...BILLING_FEATURE_CATALOG,
  ...INVENTORY_FEATURE_CATALOG,
];
`;

  content = content.replace(
    '    { key: "accounts-settings-core", label: "Core Settings", module: "accounts-settings", aliases: ["Core Settings"] }\n  ];',
    '    { key: "accounts-settings-core", label: "Core Settings", module: "accounts-settings", aliases: ["Core Settings"] }\n  ];\n' + allFeatureCatalog
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log('Injected ALL_FEATURE_CATALOG!');
} else {
  console.log('ALL_FEATURE_CATALOG already exists!');
}
