const fs = require('fs');
const file = 'D:\\Capyngen-Crm-Superadmin-main\\src\\constants\\hrmsPlanCatalog.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('normalizeBillingModules')) {

  const aliasMaps = `
const BILLING_MODULE_ALIAS_MAP = new Map<string, string>();
for (const moduleDefinition of BILLING_MODULE_CATALOG) {
  BILLING_MODULE_ALIAS_MAP.set(normalizeValue(moduleDefinition.key), moduleDefinition.key);
  BILLING_MODULE_ALIAS_MAP.set(normalizeValue(moduleDefinition.label), moduleDefinition.key);
  for (const alias of moduleDefinition.aliases) {
    BILLING_MODULE_ALIAS_MAP.set(normalizeValue(alias), moduleDefinition.key);
  }
}

const INVENTORY_MODULE_ALIAS_MAP = new Map<string, string>();
for (const moduleDefinition of INVENTORY_MODULE_CATALOG) {
  INVENTORY_MODULE_ALIAS_MAP.set(normalizeValue(moduleDefinition.key), moduleDefinition.key);
  INVENTORY_MODULE_ALIAS_MAP.set(normalizeValue(moduleDefinition.label), moduleDefinition.key);
  for (const alias of moduleDefinition.aliases) {
    INVENTORY_MODULE_ALIAS_MAP.set(normalizeValue(alias), moduleDefinition.key);
  }
}
`;

  content = content.replace(
    'export const normalizeHrmsModuleKey = ',
    aliasMaps + '\nexport const normalizeHrmsModuleKey = '
  );

  const normalizers = `
export const normalizeBillingModuleKey = (value?: string | null) => {
  if (!value) return null;
  return BILLING_MODULE_ALIAS_MAP.get(normalizeValue(value)) || null;
};
export const normalizeInventoryModuleKey = (value?: string | null) => {
  if (!value) return null;
  return INVENTORY_MODULE_ALIAS_MAP.get(normalizeValue(value)) || null;
};
export const normalizeBillingModules = (modules: string[] = []) => Array.from(new Set(modules.map((m) => normalizeBillingModuleKey(m)).filter((m): m is string => Boolean(m))));
export const normalizeInventoryModules = (modules: string[] = []) => Array.from(new Set(modules.map((m) => normalizeInventoryModuleKey(m)).filter((m): m is string => Boolean(m))));
`;

  content = content.replace(
    'export const normalizeAllModules = ',
    normalizers + '\nexport const normalizeAllModules = '
  );

  content = content.replace(
    'export const normalizePlanModules = (planType: PlanType, modules: string[] = []) =>\n  planType === "All"\n    ? normalizeAllModules(modules)\n    : planType === "Accounts"\n      ? normalizeAccountsModules(modules)\n      : planType === "Sales"\n        ? normalizeSalesModules(modules)\n        : normalizeHrmsModules(modules);',
    'export const normalizePlanModules = (planType: PlanType, modules: string[] = []) =>\n  planType === "All"\n    ? normalizeAllModules(modules)\n    : planType === "Accounts"\n      ? normalizeAccountsModules(modules)\n      : planType === "Billing"\n        ? normalizeBillingModules(modules)\n      : planType === "Inventory"\n        ? normalizeInventoryModules(modules)\n      : planType === "Sales"\n        ? normalizeSalesModules(modules)\n        : normalizeHrmsModules(modules);'
  );

  content = content.replace(
    'export const getModuleCatalogByPlanType = (planType: PlanType) =>\n  planType === "All"\n    ? ALL_MODULE_CATALOG\n    : planType === "Accounts"\n      ? ACCOUNTS_MODULE_CATALOG\n      : planType === "Sales"\n        ? SALES_MODULE_CATALOG\n        : HRMS_MODULE_CATALOG;',
    'export const getModuleCatalogByPlanType = (planType: PlanType) =>\n  planType === "All"\n    ? ALL_MODULE_CATALOG\n    : planType === "Accounts"\n      ? ACCOUNTS_MODULE_CATALOG\n      : planType === "Billing"\n        ? BILLING_MODULE_CATALOG\n      : planType === "Inventory"\n        ? INVENTORY_MODULE_CATALOG\n      : planType === "Sales"\n        ? SALES_MODULE_CATALOG\n        : HRMS_MODULE_CATALOG;'
  );

  const getLabels = `
export const getBillingModuleLabel = (value?: string | null) => {
  const moduleKey = normalizeBillingModuleKey(value);
  return BILLING_MODULE_CATALOG.find((m) => m.key === moduleKey)?.label || value || "";
};
export const getInventoryModuleLabel = (value?: string | null) => {
  const moduleKey = normalizeInventoryModuleKey(value);
  return INVENTORY_MODULE_CATALOG.find((m) => m.key === moduleKey)?.label || value || "";
};
`;

  content = content.replace(
    'export const getPlanModuleLabel = ',
    getLabels + '\nexport const getPlanModuleLabel = '
  );

  content = content.replace(
    'export const getPlanModuleLabel = (planType: PlanType, value?: string | null) =>\n  planType === "All"\n    ? getAllModuleLabel(value)\n    : planType === "Accounts"\n      ? getAccountsModuleLabel(value)\n      : planType === "Sales"\n        ? getSalesModuleLabel(value)\n        : getHrmsModuleLabel(value);',
    'export const getPlanModuleLabel = (planType: PlanType, value?: string | null) =>\n  planType === "All"\n    ? getAllModuleLabel(value)\n    : planType === "Accounts"\n      ? getAccountsModuleLabel(value)\n      : planType === "Billing"\n        ? getBillingModuleLabel(value)\n      : planType === "Inventory"\n        ? getInventoryModuleLabel(value)\n      : planType === "Sales"\n        ? getSalesModuleLabel(value)\n        : getHrmsModuleLabel(value);'
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed Superadmin Normalizers!');
}
