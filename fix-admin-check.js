const fs = require('fs');

function fix(path, isLayout) {
    let content = fs.readFileSync(path, 'utf8');
    
    if (isLayout) {
        content = content.replace(
            "const isAdmin = org?.isAdmin",
            "const user = store.user\n  const isAdmin = org?.isAdmin || user?.role === 'Admin' || user?.role === 'Owner' || user?.isWorkspaceOwner"
        );
    } else {
        content = content.replace(
            "const isAdmin = org?.isAdmin;",
            "const user = store.user;\n      const isAdmin = org?.isAdmin || user?.role === 'Admin' || user?.role === 'Owner' || user?.isWorkspaceOwner;"
        );
    }
    
    fs.writeFileSync(path, content, 'utf8');
    console.log("Fixed Admin Check in", path);
}

fix('D:\\frontend\\src\\domains\\billing\\layouts\\BillingLayout.tsx', true);
fix('D:\\frontend\\src\\domains\\inventory\\layouts\\InventoryLayout.tsx', true);
fix('D:\\frontend\\src\\features\\auth\\pages\\ProductSelectionPage.tsx', false);
