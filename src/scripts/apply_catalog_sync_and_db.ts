import fs from 'fs';
import mongoose from 'mongoose';

const superadminCatalogPath = 'D:\\Capyngen-Crm-Superadmin-main\\src\\constants\\hrmsPlanCatalog.ts';
const backendCatalogPath = 'D:\\Capyngen-Crm-Backend-main\\src\\constants\\hrmsPlanCatalog.ts';
const matrixPagePath = 'D:\\Capyngen-Crm-Superadmin-main\\src\\pages\\PlanFeatureMatrixPage.tsx';

// 1. Update TABS in PlanFeatureMatrixPage.tsx
let matrixContent = fs.readFileSync(matrixPagePath, 'utf8');
const oldTabsRegex = /const TABS: Array<\{ planType: PlanType; label: string \}> = \[[\s\S]*?\];/;
const newTabs = `const TABS: Array<{ planType: PlanType; label: string }> = [
  { planType: "HRMS", label: "HRMS" },
  { planType: "Accounts", label: "Books / Accounts" },
  { planType: "Billing", label: "Billing" },
  { planType: "Inventory", label: "Inventory" },
  { planType: "Sales", label: "Sales" },
  { planType: "All", label: "Complete" },
];`;

if (oldTabsRegex.test(matrixContent)) {
  matrixContent = matrixContent.replace(oldTabsRegex, newTabs);
  fs.writeFileSync(matrixPagePath, matrixContent, 'utf8');
  console.log('✅ Updated TABS in PlanFeatureMatrixPage.tsx');
} else {
  console.log('ℹ️ TABS regex did not match in PlanFeatureMatrixPage.tsx (may already be updated)');
}

// 2. Extract all feature keys and module keys
const ALL_NEW_KEYS = [
  // Books (42)
  "accounts-dashboard-home",
  "accounts-quick-guide",
  "accounts-items-items-list",
  "accounts-items-directory", // legacy alias
  "accounts-inventory-inventory-adjustments",
  "accounts-items-inventory-adjustments", // legacy alias
  "accounts-sales-customers",
  "accounts-sales-quotes",
  "accounts-sales-sales-orders",
  "accounts-sales-invoices",
  "accounts-sales-recurring-invoices",
  "accounts-sales-delivery-challans",
  "accounts-sales-payments-received",
  "accounts-sales-credit-notes",
  "accounts-purchases-vendors",
  "accounts-purchases-expenses",
  "accounts-purchases-recurring-expenses",
  "accounts-purchases-purchase-orders",
  "accounts-purchases-bills",
  "accounts-purchases-recurring-bills",
  "accounts-purchases-payments-made",
  "accounts-purchases-vendor-credits",
  "accounts-time-tracking-projects",
  "accounts-time-tracking-timesheets",
  "accounts-banking-bank-accounts",
  "accounts-banking-bank-reconciliation",
  "accounts-banking-banking-rules",
  "accounts-accountant-manual-journals",
  "accounts-accountant-bulk-update",
  "accounts-accountant-currency-adjustments",
  "accounts-accountant-chart-of-accounts",
  "accounts-accountant-budgets",
  "accounts-accountant-transaction-locking",
  "accounts-accountant-fixed-assets",
  "accounts-accountant-inter-company",
  "accounts-accountant-financial-dimensions",
  "accounts-accountant-fiscal-calendars",
  "accounts-accountant-taxes",
  "accounts-settings-taxes", // legacy alias
  "accounts-accountant-tax-compliance",
  "accounts-accountant-treasury-forecasting",
  "accounts-accountant-year-end-closing",
  "accounts-accountant-ai-anomalies",
  "accounts-reports-analytics",
  "accounts-reports", // legacy alias
  "accounts-documents-vault",
  "accounts-documents", // legacy alias

  // Billing (19)
  "billing-dashboard-home",
  "billing-quick-guide",
  "billing-customers",
  "billing-sales-customers", // legacy alias
  "billing-product-catalog-plans",
  "billing-product-catalog-addons",
  "billing-product-catalog-coupons",
  "billing-product-catalog-pricing-widgets",
  "billing-product-catalog-items",
  "billing-sales-subscriptions",
  "billing-sales-invoices",
  "billing-sales-quotes",
  "billing-sales-credit-notes",
  "billing-payments-payments-received",
  "billing-payments-gateway-setup",
  "billing-time-tracking-projects",
  "billing-time-tracking-timesheet",
  "billing-expenses-expenses-list",
  "billing-expenses-recurring-expenses",
  "billing-events",
  "billing-reports",
  "billing-documents",

  // Inventory (25)
  "inventory-dashboard-home",
  "inventory-quick-guide",
  "inventory-items-items-list",
  "inventory-items-item-variants",
  "inventory-items-bom-kits",
  "inventory-ops-multi-warehouse",
  "inventory-inventory-multi-warehouse", // legacy alias
  "inventory-ops-transfer-orders",
  "inventory-ops-inventory-adjustments",
  "inventory-inventory-inventory-adjustments", // legacy alias
  "inventory-ops-move-orders",
  "inventory-inventory-move-orders", // legacy alias
  "inventory-ops-putaways",
  "inventory-inventory-putaways", // legacy alias
  "inventory-fulfillment-order-fulfillment",
  "inventory-inventory-order-fulfillment", // legacy alias
  "inventory-fulfillment-sales-orders",
  "inventory-sales-sales-orders", // legacy alias
  "inventory-fulfillment-packages",
  "inventory-inventory-packages", // legacy alias
  "inventory-fulfillment-shipments",
  "inventory-inventory-shipments", // legacy alias
  "inventory-fulfillment-delivery-challans",
  "inventory-sales-delivery-challans", // legacy alias
  "inventory-fulfillment-sales-returns",
  "inventory-sales-sales-returns", // legacy alias
  "inventory-fulfillment-customers",
  "inventory-sales-customers", // legacy alias
  "inventory-procurement-purchase-orders",
  "inventory-purchases-purchase-orders", // legacy alias
  "inventory-procurement-purchase-receives",
  "inventory-purchases-purchase-receives", // legacy alias
  "inventory-procurement-vendors",
  "inventory-purchases-vendors", // legacy alias
  "inventory-manufacturing-work-orders",
  "inventory-manufacturing-mrp-planning",
  "inventory-manufacturing-routings",
  "inventory-manufacturing-machines",
  "inventory-ai-insights",
  "inventory-inventory-ai-features", // legacy alias
  "inventory-reports",
  "inventory-documents",

  "*",
  "all"
];

const ALL_NEW_MODULES = [
  // Books (10)
  "accounts-dashboard",
  "accounts-items",
  "accounts-inventory",
  "accounts-sales",
  "accounts-purchases",
  "accounts-time-tracking",
  "accounts-banking",
  "accounts-accountant",
  "accounts-reports",
  "accounts-documents",

  // Billing (10)
  "billing-dashboard",
  "billing-customers",
  "billing-product-catalog",
  "billing-sales",
  "billing-payments",
  "billing-time-tracking",
  "billing-expenses",
  "billing-events",
  "billing-reports",
  "billing-documents",

  // Inventory (9)
  "inventory-dashboard",
  "inventory-items",
  "inventory-ops",
  "inventory-fulfillment",
  "inventory-procurement",
  "inventory-manufacturing",
  "inventory-ai-insights",
  "inventory-reports",
  "inventory-documents",
];

async function updateDb() {
  const MONGO_URI = 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB Atlas');

  const plans = await mongoose.connection.collection('plans').find({}).toArray();
  for (const p of plans) {
    const existingFeatures = p.featureKeys || [];
    const mergedFeatures = Array.from(new Set([...existingFeatures, ...ALL_NEW_KEYS]));

    const existingModules = p.modules || [];
    const mergedModules = Array.from(new Set([...existingModules, ...ALL_NEW_MODULES]));

    await mongoose.connection.collection('plans').updateOne(
      { _id: p._id },
      {
        $set: {
          featureKeys: mergedFeatures,
          modules: mergedModules,
          updatedAt: new Date()
        }
      }
    );
    console.log(`✅ Plan "${p.name}" updated with ${mergedFeatures.length} features and ${mergedModules.length} modules.`);
  }

  await mongoose.disconnect();
  console.log('Finished updating MongoDB');
}

updateDb().catch(console.error);
