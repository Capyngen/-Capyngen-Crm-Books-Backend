const fs = require('fs');

const billingFeatures = [
    { key: "billing-customers", label: "Customers", module: "billing-sales" },
    { key: "billing-product-catalog-items", label: "Items", module: "billing-product-catalog" },
    { key: "billing-product-catalog-plans", label: "Plans", module: "billing-product-catalog" },
    { key: "billing-product-catalog-addons", label: "Addons", module: "billing-product-catalog" },
    { key: "billing-product-catalog-coupons", label: "Coupons", module: "billing-product-catalog" },
    { key: "billing-product-catalog-pricing-widgets", label: "Pricing Widgets", module: "billing-product-catalog" },
    { key: "billing-sales-quotes", label: "Quotes", module: "billing-sales" },
    { key: "billing-sales-invoices", label: "Invoices", module: "billing-sales" },
    { key: "billing-sales-subscriptions", label: "Subscriptions", module: "billing-sales" },
    { key: "billing-sales-delivery-challans", label: "Delivery Challans", module: "billing-sales" },
    { key: "billing-sales-credit-notes", label: "Credit Notes", module: "billing-sales" },
    { key: "billing-payments-payments-received", label: "Payments Received", module: "billing-payments" },
    { key: "billing-expenses-expenses-list", label: "Expenses", module: "billing-expenses" },
    { key: "billing-expenses-recurring-expenses", label: "Recurring Expenses", module: "billing-expenses" },
    { key: "billing-time-tracking-projects", label: "Projects", module: "billing-time-tracking" },
    { key: "billing-time-tracking-timesheet", label: "Timesheet", module: "billing-time-tracking" }
];

const inventoryFeatures = [
    { key: "inventory-items-items-list", label: "Items", module: "inventory-stock" },
    { key: "inventory-inventory-inventory-adjustments", label: "Inventory Adjustments", module: "inventory-stock" },
    { key: "inventory-inventory-packages", label: "Packages", module: "inventory-stock" },
    { key: "inventory-inventory-shipments", label: "Shipments", module: "inventory-stock" },
    { key: "inventory-inventory-move-orders", label: "Move Orders", module: "inventory-stock" },
    { key: "inventory-inventory-putaways", label: "Putaways", module: "inventory-stock" },
    { key: "inventory-sales-customers", label: "Customers", module: "inventory-sales" },
    { key: "inventory-sales-sales-orders", label: "Sales Orders", module: "inventory-sales" },
    { key: "inventory-sales-invoices", label: "Invoices", module: "inventory-sales" },
    { key: "inventory-sales-delivery-challans", label: "Delivery Challans", module: "inventory-sales" },
    { key: "inventory-sales-payments-received", label: "Payments Received", module: "inventory-sales" },
    { key: "inventory-sales-sales-returns", label: "Sales Returns", module: "inventory-sales" },
    { key: "inventory-sales-credit-notes", label: "Credit Notes", module: "inventory-sales" },
    { key: "inventory-purchases-vendors", label: "Vendors", module: "inventory-purchases" },
    { key: "inventory-purchases-expenses", label: "Expenses", module: "inventory-purchases" },
    { key: "inventory-purchases-purchase-orders", label: "Purchase Orders", module: "inventory-purchases" },
    { key: "inventory-purchases-purchase-receives", label: "Purchase Receives", module: "inventory-purchases" },
    { key: "inventory-purchases-bills", label: "Bills", module: "inventory-purchases" },
    { key: "inventory-purchases-payments-made", label: "Payments Made", module: "inventory-purchases" },
    { key: "inventory-purchases-vendor-credits", label: "Vendor Credits", module: "inventory-purchases" }
];

function generateCode(features, name) {
    let code = `export const ${name}: HrmsFeatureDefinition[] = [\n`;
    for (let f of features) {
        code += `  { key: "${f.key}", label: "${f.label}", module: "${f.module}", aliases: ["${f.label}"] },\n`;
    }
    code += `];`;
    return code;
}

const newBilling = generateCode(billingFeatures, 'BILLING_FEATURE_CATALOG');
const newInventory = generateCode(inventoryFeatures, 'INVENTORY_FEATURE_CATALOG');

function patchFile(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Replace old billing
    content = content.replace(/export const BILLING_FEATURE_CATALOG: HrmsFeatureDefinition\[\] = \[\s*[\s\S]*?\];/, newBilling);
    // Replace old inventory
    content = content.replace(/export const INVENTORY_FEATURE_CATALOG: HrmsFeatureDefinition\[\] = \[\s*[\s\S]*?\];/, newInventory);
    
    fs.writeFileSync(path, content, 'utf8');
    console.log("Patched", path);
}

patchFile('D:\\Capyngen-Crm-Superadmin-main\\src\\constants\\hrmsPlanCatalog.ts');
patchFile('D:\\Capyngen-Crm-Backend-main\\src\\constants\\hrmsPlanCatalog.ts');
