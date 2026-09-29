const fs = require('fs');
function addHome(path, type, oldKey) {
    let content = fs.readFileSync(path, 'utf8');
    const searchStr = `export const ${type}_FEATURE_CATALOG: HrmsFeatureDefinition[] = [\n`;
    const replaceStr = `export const ${type}_FEATURE_CATALOG: HrmsFeatureDefinition[] = [\n  { key: "${oldKey}", label: "Home Dashboard", module: "${type.toLowerCase()}-dashboard", aliases: ["Home Dashboard"] },\n`;
    
    if (content.includes(searchStr) && !content.includes(oldKey)) {
        content = content.replace(searchStr, replaceStr);
        fs.writeFileSync(path, content, 'utf8');
        console.log(`Added home to ${type} in ${path}`);
    }
}
addHome('D:\\Capyngen-Crm-Superadmin-main\\src\\constants\\hrmsPlanCatalog.ts', 'BILLING', 'billing-dashboard-home');
addHome('D:\\Capyngen-Crm-Superadmin-main\\src\\constants\\hrmsPlanCatalog.ts', 'INVENTORY', 'inventory-dashboard-home');
addHome('D:\\Capyngen-Crm-Backend-main\\src\\constants\\hrmsPlanCatalog.ts', 'BILLING', 'billing-dashboard-home');
addHome('D:\\Capyngen-Crm-Backend-main\\src\\constants\\hrmsPlanCatalog.ts', 'INVENTORY', 'inventory-dashboard-home');
