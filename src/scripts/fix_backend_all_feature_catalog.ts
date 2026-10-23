import fs from 'fs';

const backendCatalogPath = 'D:\\Capyngen-Crm-Backend-main\\src\\constants\\hrmsPlanCatalog.ts';
let content = fs.readFileSync(backendCatalogPath, 'utf8');

const targetStr = `  // Reports & Documents (2)
  { key: "accounts-reports-analytics", label: "Reports", module: "accounts-reports", aliases: ["Reports", "Financial Reports", "accounts-reports"] },
  { key: "accounts-documents-vault", label: "Documents", module: "accounts-documents", aliases: ["Documents", "accounts-documents", "Document Vault"] },
];`;

const replacementStr = `  // Reports & Documents (2)
  { key: "accounts-reports-analytics", label: "Reports", module: "accounts-reports", aliases: ["Reports", "Financial Reports", "accounts-reports"] },
  { key: "accounts-documents-vault", label: "Documents", module: "accounts-documents", aliases: ["Documents", "accounts-documents", "Document Vault"] },
];

export const ALL_FEATURE_CATALOG: HrmsFeatureDefinition[] = [
  ...HRMS_FEATURE_CATALOG,
  ...ACCOUNTS_FEATURE_CATALOG,
  ...BILLING_FEATURE_CATALOG,
  ...INVENTORY_FEATURE_CATALOG,
];`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(backendCatalogPath, content, 'utf8');
  console.log('✅ Successfully added ALL_FEATURE_CATALOG to D:\\Capyngen-Crm-Backend-main\\src\\constants\\hrmsPlanCatalog.ts');
} else {
  console.error('❌ Could not find targetStr in backend catalog');
}
