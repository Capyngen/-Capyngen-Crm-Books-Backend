const fs = require('fs');

const billingModules = `export const BILLING_MODULE_CATALOG: HrmsModuleDefinition[] = [
  { key: "billing-dashboard", label: "Home", group: "Overview", aliases: ["Home", "Billing Home"] },
  { key: "billing-sales", label: "Sales", group: "Transactions", aliases: ["Sales", "Customers", "Invoices", "Quotes"] },
  { key: "billing-reports", label: "Reports", group: "Insights", aliases: ["Reports"] },
  { key: "billing-product-catalog", label: "Product Catalog", group: "Catalog", aliases: ["Product Catalog"] },
  { key: "billing-payments", label: "Payments", group: "Transactions", aliases: ["Payments"] },
  { key: "billing-expenses", label: "Expenses", group: "Transactions", aliases: ["Expenses"] },
  { key: "billing-time-tracking", label: "Time Tracking", group: "Operations", aliases: ["Time Tracking"] },
];`;

const inventoryModules = `export const INVENTORY_MODULE_CATALOG: HrmsModuleDefinition[] = [
  { key: "inventory-dashboard", label: "Home", group: "Overview", aliases: ["Home", "Inventory Home"] },
  { key: "inventory-stock", label: "Stock Control", group: "Inventory", aliases: ["Stock Control"] },
  { key: "inventory-sales", label: "Sales", group: "Transactions", aliases: ["Sales", "Customers"] },
  { key: "inventory-purchases", label: "Purchases", group: "Transactions", aliases: ["Purchases", "Vendors"] },
  { key: "inventory-reports", label: "Reports", group: "Insights", aliases: ["Reports"] },
];`;

function patchFile(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    content = content.replace(/export const BILLING_MODULE_CATALOG: HrmsModuleDefinition\[\] = \[\s*[\s\S]*?\];/, billingModules);
    content = content.replace(/export const INVENTORY_MODULE_CATALOG: HrmsModuleDefinition\[\] = \[\s*[\s\S]*?\];/, inventoryModules);
    
    fs.writeFileSync(path, content, 'utf8');
    console.log("Patched", path);
}

patchFile('D:\\Capyngen-Crm-Superadmin-main\\src\\constants\\hrmsPlanCatalog.ts');
patchFile('D:\\Capyngen-Crm-Backend-main\\src\\constants\\hrmsPlanCatalog.ts');
