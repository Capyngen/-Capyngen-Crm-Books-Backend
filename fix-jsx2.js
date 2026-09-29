const fs = require('fs');

function fix(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Clean up all fragments and the gate, then just cleanly reconstruct it
    content = content.replace(/return \([\s\S]*?\)/, `return (
    <>
      <SubscriptionLifecycleGate />
      <AppShell navigation={${path.includes('billing') ? 'billing' : 'inventory'}Navigation} productName="${path.includes('billing') ? 'Billing' : 'Inventory'}">
        <Outlet />
      </AppShell>
    </>
  )`);
    
    fs.writeFileSync(path, content, 'utf8');
    console.log("Rewrote", path);
}

fix('D:\\frontend\\src\\domains\\billing\\layouts\\BillingLayout.tsx');
fix('D:\\frontend\\src\\domains\\inventory\\layouts\\InventoryLayout.tsx');
