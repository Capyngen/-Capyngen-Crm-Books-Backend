const fs = require('fs');
const file = 'D:\\Capyngen-Crm-Superadmin-main\\src\\constants\\hrmsPlanCatalog.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '(moduleDefinition.label.startsWith("Sales: ") || moduleDefinition.label.startsWith("Accounts: ")) &&',
  '(moduleDefinition.label.startsWith("Sales: ") || moduleDefinition.label.startsWith("Accounts: ") || moduleDefinition.label.startsWith("Billing: ") || moduleDefinition.label.startsWith("Inventory: ")) &&'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Subset Filter!');
