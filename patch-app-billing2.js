const fs = require('fs');
const path = 'D:\\backend\\src\\app.ts';
let content = fs.readFileSync(path, 'utf8');

const regex = /\/\/ Billing routers currently declare no authentication middleware\.[\s\S]*?app\.use\('\/api\/v1\/billing\/dashboard', billingDashboardRoutes\);/;

const newRoutes = `// Capped Billing Routes
app.use('/api/v1/billing/dashboard', verifyCapyngenToken, requireFeature('billing-dashboard-home'), billingDashboardRoutes);
app.use('/api/v1/billing/customers', verifyCapyngenToken, requireFeature('billing-sales-customers'), billingCustomerRoutes);
app.use('/api/v1/billing/items', verifyCapyngenToken, billingItemRoutes);
app.use('/api/v1/billing/plans', verifyCapyngenToken, billingPlanRoutes);`;

if (regex.test(content)) {
    content = content.replace(regex, newRoutes);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Patched app.ts");
} else {
    console.log("regex not found in app.ts");
}
