const fs = require('fs');

const path = 'D:\\frontend\\src\\app\\routes.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    "{ path: 'dashboard', element: <BillingDashboard /> },",
    "{ path: '*', element: <Navigate to=\"dashboard\" replace /> },\n            { path: 'dashboard', element: <BillingDashboard /> },"
);

content = content.replace(
    "{ path: 'dashboard', element: <InventoryDashboard /> },",
    "{ path: '*', element: <Navigate to=\"dashboard\" replace /> },\n            { path: 'dashboard', element: <InventoryDashboard /> },"
);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed routes.tsx");
