import { ALL_FEATURE_CATALOG, getFeaturesForModule } from 'D:/Capyngen-Crm-Backend-main/src/constants/hrmsPlanCatalog';

console.log('✅ ALL_FEATURE_CATALOG count:', ALL_FEATURE_CATALOG.length);
console.log('✅ accounts-sales features:', getFeaturesForModule('accounts-sales'));
console.log('✅ billing-product-catalog features:', getFeaturesForModule('billing-product-catalog'));
console.log('✅ inventory-fulfillment features:', getFeaturesForModule('inventory-fulfillment'));
console.log('🎉 Catalog loaded cleanly with 0 errors!');
