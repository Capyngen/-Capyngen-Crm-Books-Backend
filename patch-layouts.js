const fs = require('fs');

const billingLayoutPath = 'D:\\frontend\\src\\domains\\billing\\layouts\\BillingLayout.tsx';
const inventoryLayoutPath = 'D:\\frontend\\src\\domains\\inventory\\layouts\\InventoryLayout.tsx';

function patchLayout(path, name) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    
    if (content.includes('SubscriptionLifecycleGate')) return;

    // Add imports
    content = content.replace(
        "import { AppShell } from '@/core/layouts/AppShell'",
        "import { Navigate } from 'react-router-dom'\nimport { AppShell } from '@/core/layouts/AppShell'\nimport useAuthStore from '@/features/auth/store/useAuthStore'\nimport SubscriptionLifecycleGate from '@/domains/books/layouts/SubscriptionLifecycleGate'"
    );

    // Add guard logic
    const guardLogic = `
  const store = useAuthStore()
  const org = store.selectedOrganization as any
  const isAdmin = org?.isAdmin
  const appPerms = org?.rolePermissions?.apps || {}
  
  if (!isAdmin && appPerms['${name.toLowerCase()}'] !== true) {
    return <Navigate to="/books/dashboard" replace />
  }
`;

    content = content.replace(
        `export function ${name}Layout() {`,
        `export function ${name}Layout() {\n${guardLogic}`
    );

    content = content.replace(
        `<AppShell navigation={${name.toLowerCase()}Navigation} productName="${name}">`,
        `<SubscriptionLifecycleGate />\n      <AppShell navigation={${name.toLowerCase()}Navigation} productName="${name}">`
    );

    fs.writeFileSync(path, content, 'utf8');
    console.log(`Patched ${name}Layout`);
}

patchLayout(billingLayoutPath, 'Billing');
patchLayout(inventoryLayoutPath, 'Inventory');
