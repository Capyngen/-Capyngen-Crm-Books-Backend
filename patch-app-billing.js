const fs = require('fs');
const path = 'D:\\backend\\src\\app.ts';
let content = fs.readFileSync(path, 'utf8');

const oldRoutes = `// Billing routers currently declare no authentication middleware.
app.use('/api/v1/billing/customers', billingCustomerRoutes);
app.use('/api/v1/billing/items', billingItemRoutes);
app.use('/api/v1/billing/plans', billingPlanRoutes);
app.use('/api/v1/billing/dashboard', billingDashboardRoutes);`;

const newRoutes = `// Capped Billing Routes
app.use('/api/v1/billing/dashboard', verifyCapyngenToken, requireFeature('billing-dashboard-home'), billingDashboardRoutes);
app.use('/api/v1/billing/customers', verifyCapyngenToken, requireFeature('billing-sales-customers'), billingCustomerRoutes);
app.use('/api/v1/billing/items', verifyCapyngenToken, billingItemRoutes);
app.use('/api/v1/billing/plans', verifyCapyngenToken, billingPlanRoutes);`;

if (content.includes(oldRoutes)) {
    content = content.replace(oldRoutes, newRoutes);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Patched app.ts");
} else {
    console.log("oldRoutes not found in app.ts");
}
