const fs = require('fs');
const file = 'D:\\Capyngen-Crm-Superadmin-main\\src\\constants\\hrmsPlanCatalog.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('BILLING_MODULE_CATALOG')) {
  const billingInventoryModules = `
export const BILLING_MODULE_CATALOG: HrmsModuleDefinition[] = [
  { key: "billing-dashboard", label: "Home", group: "Overview", aliases: ["Home", "Billing Home"] },
  { key: "billing-sales", label: "Sales", group: "Transactions", aliases: ["Sales", "Customers", "Invoices", "Quotes"] },
  { key: "billing-reports", label: "Reports", group: "Insights", aliases: ["Reports"] },
  { key: "billing-settings", label: "Settings", group: "Configuration", aliases: ["Settings"] },
];

export const INVENTORY_MODULE_CATALOG: HrmsModuleDefinition[] = [
  { key: "inventory-dashboard", label: "Home", group: "Overview", aliases: ["Home", "Inventory Home"] },
  { key: "inventory-stock", label: "Stock Control", group: "Transactions", aliases: ["Stock Control", "Items", "Inventory Adjustments"] },
  { key: "inventory-purchases", label: "Purchases", group: "Transactions", aliases: ["Purchases", "Vendors", "Bills", "Purchase Orders"] },
  { key: "inventory-sales", label: "Sales", group: "Transactions", aliases: ["Sales", "Sales Orders", "Delivery Challans"] },
  { key: "inventory-reports", label: "Reports", group: "Insights", aliases: ["Reports"] },
  { key: "inventory-settings", label: "Settings", group: "Configuration", aliases: ["Settings"] },
];
`;
  content = content.replace(
    'export const ACCOUNTS_MODULE_CATALOG: HrmsModuleDefinition[] = [',
    billingInventoryModules + '\nexport const ACCOUNTS_MODULE_CATALOG: HrmsModuleDefinition[] = ['
  );

  const billingInventoryFeatures = `
export const BILLING_FEATURE_CATALOG: HrmsFeatureDefinition[] = [
  { key: "billing-dashboard-home", label: "Home Dashboard", module: "billing-dashboard", aliases: ["Home Dashboard"] },
  { key: "billing-sales-customers", label: "Customers", module: "billing-sales", aliases: ["Customers"] },
  { key: "billing-sales-quotes", label: "Quotes", module: "billing-sales", aliases: ["Quotes"] },
  { key: "billing-sales-invoices", label: "Invoices", module: "billing-sales", aliases: ["Invoices"] },
  { key: "billing-sales-recurring-invoices", label: "Recurring Invoices", module: "billing-sales", aliases: ["Recurring Invoices"] },
  { key: "billing-sales-payments-received", label: "Payments Received", module: "billing-sales", aliases: ["Payments Received"] },
  { key: "billing-sales-credit-notes", label: "Credit Notes", module: "billing-sales", aliases: ["Credit Notes"] },
];

export const INVENTORY_FEATURE_CATALOG: HrmsFeatureDefinition[] = [
  { key: "inventory-dashboard-home", label: "Home Dashboard", module: "inventory-dashboard", aliases: ["Home Dashboard"] },
  { key: "inventory-stock-items", label: "Items", module: "inventory-stock", aliases: ["Items"] },
  { key: "inventory-stock-adjustments", label: "Inventory Adjustments", module: "inventory-stock", aliases: ["Inventory Adjustments"] },
  { key: "inventory-purchases-vendors", label: "Vendors", module: "inventory-purchases", aliases: ["Vendors"] },
  { key: "inventory-purchases-purchase-orders", label: "Purchase Orders", module: "inventory-purchases", aliases: ["Purchase Orders"] },
  { key: "inventory-purchases-bills", label: "Bills", module: "inventory-purchases", aliases: ["Bills"] },
  { key: "inventory-sales-sales-orders", label: "Sales Orders", module: "inventory-sales", aliases: ["Sales Orders"] },
  { key: "inventory-sales-delivery-challans", label: "Delivery Challans", module: "inventory-sales", aliases: ["Delivery Challans"] },
];
`;
  content = content.replace(
    'export const ACCOUNTS_FEATURE_CATALOG: HrmsFeatureDefinition[] = [',
    billingInventoryFeatures + '\nexport const ACCOUNTS_FEATURE_CATALOG: HrmsFeatureDefinition[] = ['
  );

  content = content.replace(
    '...ACCOUNTS_FEATURE_CATALOG,',
    '...ACCOUNTS_FEATURE_CATALOG,\n  ...BILLING_FEATURE_CATALOG,\n  ...INVENTORY_FEATURE_CATALOG,'
  );

  content = content.replace(
    '...ACCOUNTS_MODULE_CATALOG.map((moduleDefinition) => ({',
    `...BILLING_MODULE_CATALOG.map((moduleDefinition) => ({
    ...moduleDefinition,
    label: \`Billing: \${moduleDefinition.label}\`,
    group: \`Billing: \${moduleDefinition.group}\`,
    aliases: moduleDefinition.aliases.map((alias) => \`Billing \${alias}\`),
  })),
  ...INVENTORY_MODULE_CATALOG.map((moduleDefinition) => ({
    ...moduleDefinition,
    label: \`Inventory: \${moduleDefinition.label}\`,
    group: \`Inventory: \${moduleDefinition.group}\`,
    aliases: moduleDefinition.aliases.map((alias) => \`Inventory \${alias}\`),
  })),
  ...ACCOUNTS_MODULE_CATALOG.map((moduleDefinition) => ({`
  );
  
  // Extend PlanType if there's a type definition, though usually PlanType is imported. 
  // Let's just blindly add Billing and Inventory strings wherever Accounts exists in getGroupedFeatureCatalog
  content = content.replace(
    'if (planType !== "HRMS" && planType !== "All" && planType !== "Accounts") {',
    'if (planType !== "HRMS" && planType !== "All" && planType !== "Accounts" && planType !== "Billing" && planType !== "Inventory") {'
  );

  // Extend combinedModules
  content = content.replace(
    'const combinedModules = planType === "Accounts" ? ACCOUNTS_MODULE_CATALOG : ALL_MODULE_CATALOG;',
    'const combinedModules = planType === "Accounts" ? ACCOUNTS_MODULE_CATALOG : planType === "Billing" ? BILLING_MODULE_CATALOG : planType === "Inventory" ? INVENTORY_MODULE_CATALOG : ALL_MODULE_CATALOG;'
  );

  content = content.replace(
    'const sourceCatalog = planType === "Accounts" ? ACCOUNTS_FEATURE_CATALOG : (planType === "HRMS" ? HRMS_FEATURE_CATALOG : ALL_FEATURE_CATALOG);',
    'const sourceCatalog = planType === "Accounts" ? ACCOUNTS_FEATURE_CATALOG : planType === "Billing" ? BILLING_FEATURE_CATALOG : planType === "Inventory" ? INVENTORY_FEATURE_CATALOG : (planType === "HRMS" ? HRMS_FEATURE_CATALOG : ALL_FEATURE_CATALOG);'
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log('Superadmin patched with Billing and Inventory catalogs');
} else {
  console.log('Already patched');
}
