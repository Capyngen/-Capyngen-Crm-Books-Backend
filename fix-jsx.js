const fs = require('fs');

function fix(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Check if it's already fixed
    if (content.includes('<>')) return;
    
    content = content.replace(
        '<SubscriptionLifecycleGate />\r\n      <AppShell',
        '<>\n      <SubscriptionLifecycleGate />\n      <AppShell'
    );
    content = content.replace(
        '<SubscriptionLifecycleGate />\n      <AppShell',
        '<>\n      <SubscriptionLifecycleGate />\n      <AppShell'
    );
    content = content.replace(
        '</AppShell>\r\n  )',
        '</AppShell>\n    </>\n  )'
    );
    content = content.replace(
        '</AppShell>\n  )',
        '</AppShell>\n    </>\n  )'
    );
    
    fs.writeFileSync(path, content, 'utf8');
    console.log("Fixed", path);
}

fix('D:\\frontend\\src\\domains\\billing\\layouts\\BillingLayout.tsx');
fix('D:\\frontend\\src\\domains\\inventory\\layouts\\InventoryLayout.tsx');
