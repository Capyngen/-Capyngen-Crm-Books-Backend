import fs from 'fs';
import path from 'path';

const superadminCatalogPath = 'D:\\Capyngen-Crm-Superadmin-main\\src\\constants\\hrmsPlanCatalog.ts';
const backendCatalogPath = 'D:\\Capyngen-Crm-Backend-main\\src\\constants\\hrmsPlanCatalog.ts';

const NEW_BILLING_FEATURE_CATALOG = `export const BILLING_FEATURE_CATALOG: HrmsFeatureDefinition[] = [
  // Overview (2)
  { key: "billing-dashboard-home", label: "Home", module: "billing-dashboard", aliases: ["Home Dashboard", "Home", "Billing Home"] },
  { key: "billing-quick-guide", label: "Quick Guide", module: "billing-dashboard", aliases: ["Quick Guide", "Billing Quick Guide"] },

  // Customers (1)
  { key: "billing-customers", label: "Subscribers & Clients", module: "billing-customers", aliases: ["Subscribers & Clients", "Customers", "billing-sales-customers"] },

  // Product Catalog (5)
  { key: "billing-product-catalog-plans", label: "Subscription Plans", module: "billing-product-catalog", aliases: ["Subscription Plans", "Plans"] },
  { key: "billing-product-catalog-addons", label: "Add-ons & Metered", module: "billing-product-catalog", aliases: ["Add-ons & Metered", "Addons"] },
  { key: "billing-product-catalog-coupons", label: "Promo Coupons", module: "billing-product-catalog", aliases: ["Promo Coupons", "Coupons"] },
  { key: "billing-product-catalog-pricing-widgets", label: "Pricing Widgets", module: "billing-product-catalog", aliases: ["Pricing Widgets"] },
  { key: "billing-product-catalog-items", label: "Item Catalog", module: "billing-product-catalog", aliases: ["Item Catalog", "Items"] },

  // Subscriptions & Sales (4)
  { key: "billing-sales-subscriptions", label: "Subscriptions", module: "billing-sales", aliases: ["Subscriptions"] },
  { key: "billing-sales-invoices", label: "Recurring Invoices", module: "billing-sales", aliases: ["Recurring Invoices", "Invoices"] },
  { key: "billing-sales-quotes", label: "Quotes & Proposals", module: "billing-sales", aliases: ["Quotes & Proposals", "Quotes"] },
  { key: "billing-sales-credit-notes", label: "Credit Notes & Refunds", module: "billing-sales", aliases: ["Credit Notes & Refunds", "Credit Notes"] },

  // Payments & Collections (2)
  { key: "billing-payments-payments-received", label: "Payments Received", module: "billing-payments", aliases: ["Payments Received"] },
  { key: "billing-payments-gateway-setup", label: "Payment Gateway Setup", module: "billing-payments", aliases: ["Payment Gateway Setup", "Zoho Payments", "Gateways", "zoho-payments"] },

  // Time & Client Billing (2)
  { key: "billing-time-tracking-projects", label: "Client Projects", module: "billing-time-tracking", aliases: ["Client Projects", "Projects"] },
  { key: "billing-time-tracking-timesheet", label: "Billable Timesheets", module: "billing-time-tracking", aliases: ["Billable Timesheets", "Timesheet", "Timesheets"] },

  // Operational Expenses (2)
  { key: "billing-expenses-expenses-list", label: "Direct Expenses", module: "billing-expenses", aliases: ["Direct Expenses", "Expenses"] },
  { key: "billing-expenses-recurring-expenses", label: "Recurring Subscriptions", module: "billing-expenses", aliases: ["Recurring Subscriptions", "Recurring Expenses"] },

  // Lifecycle, Analytics, Documents (3)
  { key: "billing-events", label: "Lifecycle & Webhooks", module: "billing-events", aliases: ["Lifecycle & Webhooks", "Events", "Events Calendar", "billing-events-calendar"] },
  { key: "billing-reports", label: "Subscription Analytics", module: "billing-reports", aliases: ["Subscription Analytics", "Reports", "Billing Reports"] },
  { key: "billing-documents", label: "Documents Vault", module: "billing-documents", aliases: ["Documents Vault", "Documents", "Billing Documents"] },
];`;

const NEW_INVENTORY_FEATURE_CATALOG = `export const INVENTORY_FEATURE_CATALOG: HrmsFeatureDefinition[] = [
  // Overview (2)
  { key: "inventory-dashboard-home", label: "Home", module: "inventory-dashboard", aliases: ["Home Dashboard", "Home", "Inventory Home"] },
  { key: "inventory-quick-guide", label: "Quick Guide", module: "inventory-dashboard", aliases: ["Quick Guide", "Inventory Quick Guide"] },

  // Items & Catalog (3)
  { key: "inventory-items-items-list", label: "Items & Products", module: "inventory-items", aliases: ["Items & Products", "Items"] },
  { key: "inventory-items-item-variants", label: "Item Variants", module: "inventory-items", aliases: ["Item Variants", "Variants"] },
  { key: "inventory-items-bom-kits", label: "BOM / Assembly Kits", module: "inventory-items", aliases: ["BOM / Assembly Kits", "BOM", "Assembly Kits", "Kits"] },

  // Warehouses & Stock (5)
  { key: "inventory-ops-multi-warehouse", label: "Multi-Warehouse", module: "inventory-ops", aliases: ["Multi-Warehouse", "Warehouses", "inventory-inventory-multi-warehouse"] },
  { key: "inventory-ops-transfer-orders", label: "Transfer Orders", module: "inventory-ops", aliases: ["Transfer Orders"] },
  { key: "inventory-ops-inventory-adjustments", label: "Stock Adjustments", module: "inventory-ops", aliases: ["Stock Adjustments", "Inventory Adjustments", "inventory-inventory-inventory-adjustments"] },
  { key: "inventory-ops-move-orders", label: "Move Orders", module: "inventory-ops", aliases: ["Move Orders", "inventory-inventory-move-orders"] },
  { key: "inventory-ops-putaways", label: "Putaways & Storage", module: "inventory-ops", aliases: ["Putaways & Storage", "Putaways", "inventory-inventory-putaways"] },

  // Fulfillment & Dispatch (7)
  { key: "inventory-fulfillment-order-fulfillment", label: "Order Fulfillment", module: "inventory-fulfillment", aliases: ["Order Fulfillment", "inventory-inventory-order-fulfillment"] },
  { key: "inventory-fulfillment-sales-orders", label: "Sales Orders", module: "inventory-fulfillment", aliases: ["Sales Orders", "inventory-sales-sales-orders"] },
  { key: "inventory-fulfillment-packages", label: "Packages & Slips", module: "inventory-fulfillment", aliases: ["Packages & Slips", "Packages", "inventory-inventory-packages"] },
  { key: "inventory-fulfillment-shipments", label: "Shipments & Tracking", module: "inventory-fulfillment", aliases: ["Shipments & Tracking", "Shipments", "inventory-inventory-shipments"] },
  { key: "inventory-fulfillment-delivery-challans", label: "Delivery Challans", module: "inventory-fulfillment", aliases: ["Delivery Challans", "inventory-sales-delivery-challans"] },
  { key: "inventory-fulfillment-sales-returns", label: "Sales Returns (RMA)", module: "inventory-fulfillment", aliases: ["Sales Returns (RMA)", "Sales Returns", "RMA", "inventory-sales-sales-returns"] },
  { key: "inventory-fulfillment-customers", label: "Customers", module: "inventory-fulfillment", aliases: ["Customers", "inventory-sales-customers"] },

  // Procurement & Inbound (3)
  { key: "inventory-procurement-purchase-orders", label: "Purchase Orders", module: "inventory-procurement", aliases: ["Purchase Orders", "inventory-purchases-purchase-orders"] },
  { key: "inventory-procurement-purchase-receives", label: "Purchase Receives", module: "inventory-procurement", aliases: ["Purchase Receives", "Dock GRN", "inventory-purchases-purchase-receives"] },
  { key: "inventory-procurement-vendors", label: "Suppliers & Vendors", module: "inventory-procurement", aliases: ["Suppliers & Vendors", "Vendors", "inventory-purchases-vendors"] },

  // Manufacturing & MRP (4)
  { key: "inventory-manufacturing-work-orders", label: "Work Orders", module: "inventory-manufacturing", aliases: ["Work Orders"] },
  { key: "inventory-manufacturing-mrp-planning", label: "MRP Material Planning", module: "inventory-manufacturing", aliases: ["MRP Material Planning", "MRP", "Material Planning"] },
  { key: "inventory-manufacturing-routings", label: "Production Routings", module: "inventory-manufacturing", aliases: ["Production Routings", "Routings"] },
  { key: "inventory-manufacturing-machines", label: "Machines & Capacity", module: "inventory-manufacturing", aliases: ["Machines & Capacity", "Machines"] },

  // Intelligence, Analytics, Documents (3)
  { key: "inventory-ai-insights", label: "AI Supply Insights", module: "inventory-ai-insights", aliases: ["AI Supply Insights", "AI Features", "inventory-inventory-ai-features"] },
  { key: "inventory-reports", label: "Supply Chain Reports", module: "inventory-reports", aliases: ["Supply Chain Reports", "Reports", "Inventory Reports"] },
  { key: "inventory-documents", label: "Documents Vault", module: "inventory-documents", aliases: ["Documents Vault", "Documents", "Inventory Documents"] },
];`;

const NEW_ACCOUNTS_FEATURE_CATALOG = `export const ACCOUNTS_FEATURE_CATALOG: HrmsFeatureDefinition[] = [
  // Overview (2)
  { key: "accounts-dashboard-home", label: "Home", module: "accounts-dashboard", aliases: ["Home", "Books Home", "Dashboard"] },
  { key: "accounts-quick-guide", label: "Quick Guide", module: "accounts-dashboard", aliases: ["Quick Guide", "Getting Started"] },

  // Items (1)
  { key: "accounts-items-items-list", label: "Items", module: "accounts-items", aliases: ["Items", "accounts-items-directory", "Item Directory", "Products"] },

  // Inventory (1)
  { key: "accounts-inventory-inventory-adjustments", label: "Inventory Adjustments", module: "accounts-inventory", aliases: ["Inventory Adjustments", "accounts-items-inventory-adjustments", "Stock Adjustments"] },

  // Sales (8)
  { key: "accounts-sales-customers", label: "Customers", module: "accounts-sales", aliases: ["Customers", "Clients"] },
  { key: "accounts-sales-quotes", label: "Quotes", module: "accounts-sales", aliases: ["Quotes", "Estimates", "Proposals"] },
  { key: "accounts-sales-sales-orders", label: "Sales Orders", module: "accounts-sales", aliases: ["Sales Orders"] },
  { key: "accounts-sales-invoices", label: "Invoices", module: "accounts-sales", aliases: ["Invoices", "Sales Invoices"] },
  { key: "accounts-sales-recurring-invoices", label: "Recurring Invoices", module: "accounts-sales", aliases: ["Recurring Invoices"] },
  { key: "accounts-sales-delivery-challans", label: "Delivery Challans", module: "accounts-sales", aliases: ["Delivery Challans", "Challans"] },
  { key: "accounts-sales-payments-received", label: "Payments Received", module: "accounts-sales", aliases: ["Payments Received", "Customer Payments"] },
  { key: "accounts-sales-credit-notes", label: "Credit Notes", module: "accounts-sales", aliases: ["Credit Notes", "Refunds"] },

  // Purchases (8)
  { key: "accounts-purchases-vendors", label: "Vendors", module: "accounts-purchases", aliases: ["Vendors", "Suppliers"] },
  { key: "accounts-purchases-expenses", label: "Expenses", module: "accounts-purchases", aliases: ["Expenses"] },
  { key: "accounts-purchases-recurring-expenses", label: "Recurring Expenses", module: "accounts-purchases", aliases: ["Recurring Expenses"] },
  { key: "accounts-purchases-purchase-orders", label: "Purchase Orders", module: "accounts-purchases", aliases: ["Purchase Orders", "PO"] },
  { key: "accounts-purchases-bills", label: "Bills", module: "accounts-purchases", aliases: ["Bills", "Vendor Bills"] },
  { key: "accounts-purchases-recurring-bills", label: "Recurring Bills", module: "accounts-purchases", aliases: ["Recurring Bills"] },
  { key: "accounts-purchases-payments-made", label: "Payments Made", module: "accounts-purchases", aliases: ["Payments Made", "Vendor Payments"] },
  { key: "accounts-purchases-vendor-credits", label: "Vendor Credits", module: "accounts-purchases", aliases: ["Vendor Credits"] },

  // Time Tracking (2)
  { key: "accounts-time-tracking-projects", label: "Projects", module: "accounts-time-tracking", aliases: ["Projects", "Time Tracking Projects"] },
  { key: "accounts-time-tracking-timesheets", label: "Timesheets", module: "accounts-time-tracking", aliases: ["Timesheets", "Time Entries"] },

  // Banking (3)
  { key: "accounts-banking-bank-accounts", label: "Bank Accounts", module: "accounts-banking", aliases: ["Bank Accounts", "Banking Accounts"] },
  { key: "accounts-banking-bank-reconciliation", label: "Bank Reconciliation", module: "accounts-banking", aliases: ["Bank Reconciliation", "Reconciliation"] },
  { key: "accounts-banking-banking-rules", label: "Banking Rules", module: "accounts-banking", aliases: ["Banking Rules", "Bank Rules"] },

  // Accountant (15)
  { key: "accounts-accountant-manual-journals", label: "Manual Journals", module: "accounts-accountant", aliases: ["Manual Journals", "Journal Entries"] },
  { key: "accounts-accountant-bulk-update", label: "Bulk Update", module: "accounts-accountant", aliases: ["Bulk Update"] },
  { key: "accounts-accountant-currency-adjustments", label: "Currency Adjustments", module: "accounts-accountant", aliases: ["Currency Adjustments", "Exchange Rate Adjustments"] },
  { key: "accounts-accountant-chart-of-accounts", label: "Chart of Accounts", module: "accounts-accountant", aliases: ["Chart of Accounts", "COA"] },
  { key: "accounts-accountant-budgets", label: "Budgets", module: "accounts-accountant", aliases: ["Budgets", "Budgeting"] },
  { key: "accounts-accountant-transaction-locking", label: "Transaction Locking", module: "accounts-accountant", aliases: ["Transaction Locking", "Period Closing"] },
  { key: "accounts-accountant-fixed-assets", label: "Fixed Assets", module: "accounts-accountant", aliases: ["Fixed Assets", "Asset Management"] },
  { key: "accounts-accountant-inter-company", label: "Inter-Company", module: "accounts-accountant", aliases: ["Inter-Company", "Intercompany Transactions"] },
  { key: "accounts-accountant-financial-dimensions", label: "Financial Dimensions", module: "accounts-accountant", aliases: ["Financial Dimensions", "Cost Centers", "Profit Centers"] },
  { key: "accounts-accountant-fiscal-calendars", label: "Fiscal Calendars", module: "accounts-accountant", aliases: ["Fiscal Calendars", "Accounting Periods"] },
  { key: "accounts-accountant-taxes", label: "Tax Settings", module: "accounts-accountant", aliases: ["Tax Settings", "Taxes", "Advanced Taxation", "accounts-settings-taxes"] },
  { key: "accounts-accountant-tax-compliance", label: "GST / Tax Compliance", module: "accounts-accountant", aliases: ["GST / Tax Compliance", "Tax Compliance", "GST Portal"] },
  { key: "accounts-accountant-treasury-forecasting", label: "Treasury Forecasting", module: "accounts-accountant", aliases: ["Treasury Forecasting", "Cash Flow Forecasting"] },
  { key: "accounts-accountant-year-end-closing", label: "Year-End Closing", module: "accounts-accountant", aliases: ["Year-End Closing", "Financial Year Closing"] },
  { key: "accounts-accountant-ai-anomalies", label: "AI Anomaly Detection", module: "accounts-accountant", aliases: ["AI Anomaly Detection", "AI Features", "Anomaly Detection"] },

  // Reports & Documents (2)
  { key: "accounts-reports-analytics", label: "Reports", module: "accounts-reports", aliases: ["Reports", "Financial Reports", "accounts-reports"] },
  { key: "accounts-documents-vault", label: "Documents", module: "accounts-documents", aliases: ["Documents", "accounts-documents", "Document Vault"] },
];`;

const NEW_BILLING_MODULE_CATALOG = `export const BILLING_MODULE_CATALOG: HrmsModuleDefinition[] = [
  { key: "billing-dashboard", label: "Home & Guide", group: "Overview", aliases: ["Home", "Quick Guide", "Billing Home", "Billing Dashboard"] },
  { key: "billing-customers", label: "Customers", group: "Customers", aliases: ["Customers", "Subscribers & Clients"] },
  { key: "billing-product-catalog", label: "Product Catalog", group: "Product Catalog", aliases: ["Product Catalog", "Plans", "Addons", "Coupons", "Pricing Widgets", "Items"] },
  { key: "billing-sales", label: "Subscriptions & Sales", group: "Subscriptions & Sales", aliases: ["Subscriptions & Sales", "Subscriptions", "Invoices", "Quotes", "Credit Notes"] },
  { key: "billing-payments", label: "Payments", group: "Payments & Collections", aliases: ["Payments", "Payments Received", "Payment Gateway Setup", "Zoho Payments"] },
  { key: "billing-time-tracking", label: "Time Tracking", group: "Operations", aliases: ["Time Tracking", "Projects", "Timesheet"] },
  { key: "billing-expenses", label: "Expenses", group: "Expenses", aliases: ["Expenses", "Direct Expenses", "Recurring Expenses"] },
  { key: "billing-events", label: "Events & Webhooks", group: "Operations", aliases: ["Events", "Lifecycle & Webhooks", "Events Calendar"] },
  { key: "billing-reports", label: "Reports", group: "Analytics & Vault", aliases: ["Reports", "Subscription Analytics", "Billing Reports"] },
  { key: "billing-documents", label: "Documents", group: "Analytics & Vault", aliases: ["Documents", "Documents Vault", "Billing Documents"] },
];`;

const NEW_INVENTORY_MODULE_CATALOG = `export const INVENTORY_MODULE_CATALOG: HrmsModuleDefinition[] = [
  { key: "inventory-dashboard", label: "Home & Guide", group: "Overview", aliases: ["Home", "Quick Guide", "Inventory Home", "Inventory Dashboard"] },
  { key: "inventory-items", label: "Items & Catalog", group: "Items & Catalog", aliases: ["Items & Catalog", "Items", "Variants", "BOM Kits"] },
  { key: "inventory-ops", label: "Warehouses & Stock", group: "Warehouses & Stock", aliases: ["Warehouses & Stock", "Warehouses", "Transfers", "Adjustments", "Move Orders", "Putaways"] },
  { key: "inventory-fulfillment", label: "Fulfillment & Dispatch", group: "Fulfillment & Dispatch", aliases: ["Fulfillment & Dispatch", "Fulfillment", "Sales Orders", "Packages", "Shipments", "Delivery Challans", "Returns", "Customers"] },
  { key: "inventory-procurement", label: "Procurement & Inbound", group: "Procurement & Inbound", aliases: ["Procurement & Inbound", "Procurement", "Purchase Orders", "Purchase Receives", "Vendors"] },
  { key: "inventory-manufacturing", label: "Manufacturing & MRP", group: "Manufacturing & MRP", aliases: ["Manufacturing & MRP", "Manufacturing", "Work Orders", "MRP", "Routings", "Machines"] },
  { key: "inventory-ai-insights", label: "AI Supply Insights", group: "Intelligence", aliases: ["AI Supply Insights", "AI Insights", "AI Features"] },
  { key: "inventory-reports", label: "Reports", group: "Analytics & Vault", aliases: ["Reports", "Supply Chain Reports", "Inventory Reports"] },
  { key: "inventory-documents", label: "Documents", group: "Analytics & Vault", aliases: ["Documents", "Documents Vault", "Inventory Documents"] },
];`;

const NEW_ACCOUNTS_MODULE_CATALOG = `export const ACCOUNTS_MODULE_CATALOG: HrmsModuleDefinition[] = [
  { key: "accounts-dashboard", label: "Home & Guide", group: "Overview", aliases: ["Home", "Quick Guide", "Accounts Dashboard", "Books Dashboard"] },
  { key: "accounts-items", label: "Items", group: "Inventory & Items", aliases: ["Items", "Item Directory"] },
  { key: "accounts-inventory", label: "Inventory", group: "Inventory & Items", aliases: ["Inventory", "Inventory Adjustments"] },
  { key: "accounts-sales", label: "Sales", group: "Sales & Income", aliases: ["Sales", "Customers", "Invoices", "Quotes", "Sales Orders", "Recurring Invoices", "Delivery Challans", "Payments Received", "Credit Notes"] },
  { key: "accounts-purchases", label: "Purchases", group: "Purchases & Expenses", aliases: ["Purchases", "Vendors", "Expenses", "Recurring Expenses", "Purchase Orders", "Bills", "Recurring Bills", "Payments Made", "Vendor Credits"] },
  { key: "accounts-time-tracking", label: "Time Tracking", group: "Operations", aliases: ["Time Tracking", "Projects", "Timesheets"] },
  { key: "accounts-banking", label: "Banking", group: "Banking & Cash", aliases: ["Banking", "Bank Accounts", "Bank Reconciliation", "Banking Rules"] },
  { key: "accounts-accountant", label: "Accountant", group: "Accounting & Compliance", aliases: ["Accountant", "Manual Journals", "Bulk Update", "Currency Adjustments", "Chart of Accounts", "Budgets", "Transaction Locking", "Fixed Assets", "Inter-Company", "Financial Dimensions", "Fiscal Calendars", "Tax Settings", "GST / Tax Compliance", "Treasury Forecasting", "Year-End Closing", "AI Anomaly Detection"] },
  { key: "accounts-reports", label: "Reports", group: "Analytics & Vault", aliases: ["Reports", "Financial Reports", "Accounts Reports"] },
  { key: "accounts-documents", label: "Documents", group: "Analytics & Vault", aliases: ["Documents", "Accounts Documents", "Document Vault"] },
];`;

function updateFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Replace BILLING_FEATURE_CATALOG
  content = content.replace(
    /export const BILLING_FEATURE_CATALOG: HrmsFeatureDefinition\[\] = \[[\s\S]*?\n\];/m,
    NEW_BILLING_FEATURE_CATALOG
  );

  // 2. Replace INVENTORY_FEATURE_CATALOG
  content = content.replace(
    /export const INVENTORY_FEATURE_CATALOG: HrmsFeatureDefinition\[\] = \[[\s\S]*?\n\];/m,
    NEW_INVENTORY_FEATURE_CATALOG
  );

  // 3. Replace ACCOUNTS_FEATURE_CATALOG
  content = content.replace(
    /export const ACCOUNTS_FEATURE_CATALOG: HrmsFeatureDefinition\[\] = \[[\s\S]*?\n\];/m,
    NEW_ACCOUNTS_FEATURE_CATALOG
  );

  // 4. Replace BILLING_MODULE_CATALOG
  content = content.replace(
    /export const BILLING_MODULE_CATALOG: HrmsModuleDefinition\[\] = \[[\s\S]*?\n\];/m,
    NEW_BILLING_MODULE_CATALOG
  );

  // 5. Replace INVENTORY_MODULE_CATALOG
  content = content.replace(
    /export const INVENTORY_MODULE_CATALOG: HrmsModuleDefinition\[\] = \[[\s\S]*?\n\];/m,
    NEW_INVENTORY_MODULE_CATALOG
  );

  // 6. Replace ACCOUNTS_MODULE_CATALOG
  content = content.replace(
    /export const ACCOUNTS_MODULE_CATALOG: HrmsModuleDefinition\[\] = \[[\s\S]*?\n\];/m,
    NEW_ACCOUNTS_MODULE_CATALOG
  );

  // 7. Ensure FEATURE_ALIAS_MAP covers ALL_FEATURE_CATALOG
  content = content.replace(
    /const FEATURE_ALIAS_MAP = new Map<string, string>\(\);\s*for \(const feature of HRMS_FEATURE_CATALOG\) \{/m,
    `const FEATURE_ALIAS_MAP = new Map<string, string>();\nfor (const feature of ALL_FEATURE_CATALOG) {`
  );

  // 8. Fix deriveModulesFromFeatures to map ALL_FEATURE_CATALOG while preserving non-HRMS modules
  content = content.replace(
    /export const deriveModulesFromFeatures = \([\s\S]*?\n\};/m,
    `export const deriveModulesFromFeatures = (
  features: string[],
  existingModules: string[] = [],
): string[] => {
  const hrmsModuleKeys = new Set(HRMS_MODULE_CATALOG.map((m) => m.key));
  const nonHrmsModules = existingModules.filter((key) => !hrmsModuleKeys.has(key));
  const derivedModules = new Set(
    normalizeFeatures(features)
      .map((key) => ALL_FEATURE_CATALOG.find((f) => f.key === key)?.module)
      .filter((key): key is string => Boolean(key))
  );
  return [...new Set([...nonHrmsModules, ...derivedModules])];
};`
  );

  // 9. Fix getModuleCatalogByPlanType to include Billing and Inventory
  content = content.replace(
    /export const getModuleCatalogByPlanType = \([\s\S]*?\n\s*: HRMS_MODULE_CATALOG;/m,
    `export const getModuleCatalogByPlanType = (planType: PlanType) =>
  planType === "All"
    ? ALL_MODULE_CATALOG
    : planType === "Accounts"
      ? ACCOUNTS_MODULE_CATALOG
      : planType === "Billing"
        ? BILLING_MODULE_CATALOG
        : planType === "Inventory"
          ? INVENTORY_MODULE_CATALOG
          : planType === "Sales"
            ? SALES_MODULE_CATALOG
            : HRMS_MODULE_CATALOG;`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Successfully updated ${filePath}`);
}

updateFile(superadminCatalogPath);
updateFile(backendCatalogPath);
