"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const requestContext_1 = require("./core/middlewares/requestContext");
const express_1 = __importDefault(require("express"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const dotenv_1 = __importDefault(require("dotenv"));
const hrmsAuth_1 = require("./core/middlewares/hrmsAuth");
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = require("./core/db");
const mongoose_1 = __importDefault(require("mongoose"));
const errorHandler_1 = require("./core/middlewares/errorHandler");
const apiContract_1 = require("./core/middlewares/apiContract");
const orgRoutes_1 = __importDefault(require("./domains/core/routes/orgRoutes"));
const rbacRoutes_1 = __importDefault(require("./domains/core/routes/rbacRoutes"));
const rbacMiddleware_1 = require("./domains/core/middlewares/rbacMiddleware");
const dashboardRoutes_1 = __importDefault(require("./domains/books/routes/dashboardRoutes"));
const chartOfAccountRoutes_1 = __importDefault(require("./domains/books/routes/chartOfAccountRoutes"));
const dimensionRoutes_1 = require("./domains/books/routes/dimensionRoutes");
const fiscalCalendarRoutes_1 = require("./domains/books/routes/fiscalCalendarRoutes");
const interCompanyRoutes_1 = require("./domains/books/routes/interCompanyRoutes");
const machineRoutes_1 = __importDefault(require("./domains/books/routes/machineRoutes"));
const routingRoutes_1 = __importDefault(require("./domains/books/routes/routingRoutes"));
const workOrderRoutes_1 = __importDefault(require("./domains/books/routes/workOrderRoutes"));
const aiInventoryRoutes_1 = __importDefault(require("./domains/books/routes/aiInventoryRoutes"));
const warehouseRoutes_1 = __importDefault(require("./domains/books/routes/warehouseRoutes"));
const transferOrderRoutes_1 = __importDefault(require("./domains/books/routes/transferOrderRoutes"));
const shipmentRoutes_1 = __importDefault(require("./domains/books/routes/shipmentRoutes"));
const aiRoutes_1 = require("./domains/books/routes/aiRoutes");
const journalRoutes_1 = __importDefault(require("./domains/books/routes/journalRoutes"));
const recurringJournalRoutes_1 = __importDefault(require("./domains/books/routes/recurringJournalRoutes"));
const reconciliationRoutes_1 = __importDefault(require("./domains/books/routes/reconciliationRoutes"));
const taxRoutes_1 = __importDefault(require("./domains/books/routes/taxRoutes"));
const fixedAssetRoutes_1 = __importDefault(require("./domains/books/routes/fixedAssetRoutes"));
const budgetRoutes_1 = __importDefault(require("./domains/books/routes/budgetRoutes"));
const currencyAdjustmentRoutes_1 = __importDefault(require("./domains/books/routes/currencyAdjustmentRoutes"));
const projectRoutes_1 = __importDefault(require("./domains/books/routes/projectRoutes"));
const timeEntryRoutes_1 = __importDefault(require("./domains/books/routes/timeEntryRoutes"));
const transactionLockRoutes_1 = __importDefault(require("./domains/books/routes/transactionLockRoutes"));
const reportsRoutes_1 = __importDefault(require("./domains/books/routes/reportsRoutes"));
const customerRoutes_1 = __importDefault(require("./domains/billing/routes/customerRoutes"));
const itemRoutes_1 = __importDefault(require("./domains/billing/routes/itemRoutes"));
const planRoutes_1 = __importDefault(require("./domains/billing/routes/planRoutes"));
const customerPortalRoutes_1 = __importDefault(require("./domains/books/routes/customerPortalRoutes"));
const dashboardRoutes_2 = __importDefault(require("./domains/billing/routes/dashboardRoutes"));
// Route Imports
const itemRoutes_2 = __importDefault(require("./domains/books/routes/itemRoutes"));
const inventoryAdjustmentRoutes_1 = __importDefault(require("./domains/books/routes/inventoryAdjustmentRoutes"));
const customerRoutes_2 = __importDefault(require("./domains/books/routes/customerRoutes"));
const vendorRoutes_1 = __importDefault(require("./domains/books/routes/vendorRoutes"));
const expenseRoutes_1 = __importDefault(require("./domains/books/routes/expenseRoutes"));
const recurringExpenseRoutes_1 = __importDefault(require("./domains/books/routes/recurringExpenseRoutes"));
const purchaseOrderRoutes_1 = __importDefault(require("./domains/books/routes/purchaseOrderRoutes"));
const billRoutes_1 = __importDefault(require("./domains/books/routes/billRoutes"));
const recurringBillRoutes_1 = __importDefault(require("./domains/books/routes/recurringBillRoutes"));
const paymentMadeRoutes_1 = __importDefault(require("./domains/books/routes/paymentMadeRoutes"));
const mileageExpenseRoutes_1 = __importDefault(require("./domains/books/routes/mileageExpenseRoutes"));
const quoteRoutes_1 = __importDefault(require("./domains/books/routes/quoteRoutes"));
const salesOrderRoutes_1 = __importDefault(require("./domains/books/routes/salesOrderRoutes"));
const invoiceRoutes_1 = __importDefault(require("./domains/books/routes/invoiceRoutes"));
const recurringInvoiceRoutes_1 = __importDefault(require("./domains/books/routes/recurringInvoiceRoutes"));
const deliveryChallanRoutes_1 = __importDefault(require("./domains/books/routes/deliveryChallanRoutes"));
const paymentReceivedRoutes_1 = __importDefault(require("./domains/books/routes/paymentReceivedRoutes"));
const creditNoteRoutes_1 = __importDefault(require("./domains/books/routes/creditNoteRoutes"));
dotenv_1.default.config();
(0, db_1.connectDB)();
const app = (0, express_1.default)();
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000', 'https://books.orinite.com'];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.orinite.com') || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);
const hrmsBackendUrl = process.env.HRMS_BACKEND_URL || 'http://127.0.0.1:3000';
// API Gateway / Reverse Proxy to HRMS Backend
const hrmsProxy = (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: hrmsBackendUrl,
    changeOrigin: true,
});
// Intercept login to extract token from cookie and send it in JSON body
app.post('/api/v1/employees/login', express_1.default.json(), async (req, res) => {
    try {
        const response = await fetch(hrmsBackendUrl + '/api/v1/employees/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        let token = null;
        const setCookie = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
        if (setCookie) {
            for (const cookie of setCookie) {
                const matchHrms = cookie.match(/accessToken_hrms=([^;]+)/);
                const matchOld = cookie.match(/(?:^|;\s*)accessToken=([^;]+)/);
                if (matchHrms)
                    token = matchHrms[1];
                else if (matchOld)
                    token = matchOld[1];
            }
        }
        if (token) {
            data.token = token;
        }
        res.status(response.status).json(data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Proxy Login Failed' });
    }
});
app.use('/api/v1/employees', (0, http_proxy_middleware_1.createProxyMiddleware)({ target: hrmsBackendUrl, changeOrigin: true, pathRewrite: (path, req) => req.originalUrl, cookieDomainRewrite: { '*': '' }, onProxyRes: (proxyRes) => { const cookies = proxyRes.headers['set-cookie']; if (cookies) {
        proxyRes.headers['set-cookie'] = cookies.map((c) => c.replace(/SameSite=[a-zA-Z]+/i, '') + '; SameSite=None; Secure');
    } } }));
app.use('/api/v1/superadmin/public', (0, http_proxy_middleware_1.createProxyMiddleware)({ target: hrmsBackendUrl, changeOrigin: true, pathRewrite: (path, req) => req.originalUrl, cookieDomainRewrite: { '*': '' }, onProxyRes: (proxyRes) => { const cookies = proxyRes.headers['set-cookie']; if (cookies) {
        proxyRes.headers['set-cookie'] = cookies.map((c) => c.replace(/SameSite=[a-zA-Z]+/i, '') + '; SameSite=None; Secure');
    } } }));
app.use('/api/v1/subscribe', (0, http_proxy_middleware_1.createProxyMiddleware)({ target: hrmsBackendUrl, changeOrigin: true, pathRewrite: (path, req) => req.originalUrl, cookieDomainRewrite: { '*': '' }, onProxyRes: (proxyRes) => { const cookies = proxyRes.headers['set-cookie']; if (cookies) {
        proxyRes.headers['set-cookie'] = cookies.map((c) => c.replace(/SameSite=[a-zA-Z]+/i, '') + '; SameSite=None; Secure');
    } } }));
app.use(requestContext_1.requestContextMiddleware);
app.use(express_1.default.json());
app.use(apiContract_1.apiContract);
// Core public/authentication and context-backed organization/RBAC routes.
app.use('/api/v1/organizations', hrmsAuth_1.verifyCapyngenToken, rbacMiddleware_1.loadRbacContext, orgRoutes_1.default);
app.use('/api/v1/rbac', hrmsAuth_1.verifyCapyngenToken, rbacMiddleware_1.loadRbacContext, rbacRoutes_1.default);
// Routes
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const integrationRoutes_1 = __importDefault(require("./routes/integrationRoutes"));
require("./domains/books/listeners/journalListeners");
require("./domains/inventory/listeners/stockListeners");
require("./domains/billing/listeners/quoteListeners");
app.use('/api/v1/upload', uploadRoutes_1.default);
app.use('/api/v1/integration', integrationRoutes_1.default);
app.use('/api/v1/portal', customerPortalRoutes_1.default);
// Fetch user subscription data without blocking it
app.get('/api/v1/books/debug-me', hrmsAuth_1.verifyCapyngenToken, async (req, res) => {
    try {
        const orgId = req.org?._id;
        const company = await mongoose_1.default.connection.collection('companyprofiles').findOne({ _id: new mongoose_1.default.Types.ObjectId(orgId) });
        const allSubsByCompanyId = await mongoose_1.default.connection.collection('subscriptions').find({ companyId: new mongoose_1.default.Types.ObjectId(orgId) }).toArray();
        const allSubsByOrgId = await mongoose_1.default.connection.collection('subscriptions').find({ orgId: new mongoose_1.default.Types.ObjectId(orgId) }).toArray();
        const allSubsByStringCompanyId = await mongoose_1.default.connection.collection('subscriptions').find({ companyId: orgId }).toArray();
        // Find any subscription where the planId matches the Enterprise plan just to see how it's structured
        const anySub = await mongoose_1.default.connection.collection('subscriptions').findOne({});
        res.json({
            orgIdFromToken: orgId,
            companyProfileFound: !!company,
            companySubscriptionId: company?.subscriptionId,
            subsFoundByCompanyIdObj: allSubsByCompanyId.length,
            subsFoundByOrgIdObj: allSubsByOrgId.length,
            subsFoundByCompanyIdStr: allSubsByStringCompanyId.length,
            sampleSubStructure: anySub
        });
    }
    catch (err) {
        res.json({ error: err.message });
    }
});
app.get('/api/v1/books/me', hrmsAuth_1.verifyCapyngenToken, async (req, res) => {
    try {
        const orgId = req.org?._id;
        if (!orgId)
            return res.status(401).json({ success: false });
        let orgIdObj = null;
        try {
            orgIdObj = new mongoose_1.default.Types.ObjectId(orgId);
        }
        catch (e) { }
        const company = orgIdObj ? await mongoose_1.default.connection.collection('companyprofiles').findOne({ _id: orgIdObj }) : null;
        let subscription = null;
        if (company && company.subscriptionId) {
            let subIdObj = null;
            try {
                subIdObj = new mongoose_1.default.Types.ObjectId(company.subscriptionId);
            }
            catch (e) { }
            if (subIdObj)
                subscription = await mongoose_1.default.connection.collection('subscriptions').findOne({ _id: subIdObj });
        }
        if (!subscription) {
            subscription = (orgIdObj ? await mongoose_1.default.connection.collection('subscriptions').findOne({ companyId: orgIdObj }) : null) ||
                (orgIdObj ? await mongoose_1.default.connection.collection('subscriptions').findOne({ orgId: orgIdObj }) : null) ||
                await mongoose_1.default.connection.collection('subscriptions').findOne({ companyId: orgId }) ||
                await mongoose_1.default.connection.collection('subscriptions').findOne({ orgId: orgId });
        }
        if (!subscription)
            return res.json({ subscription: null, plan: null, debug: "No sub found" });
        let plan = null;
        if (subscription.planId) {
            let planIdObj = null;
            try {
                planIdObj = new mongoose_1.default.Types.ObjectId(subscription.planId);
            }
            catch (e) { }
            plan = (planIdObj ? await mongoose_1.default.connection.collection('plans').findOne({ _id: planIdObj }) : null) ||
                await mongoose_1.default.connection.collection('plans').findOne({ _id: subscription.planId });
        }
        res.json({ subscription, plan, role: req.user?.role || 'Admin' });
    }
    catch (err) {
        res.json({ subscription: null, plan: null, error: err.message });
    }
});
app.use('/api/v1/books/public-test', require('./domains/books/routes/testRoutes').default);
app.use('/api/v1/books', hrmsAuth_1.verifyCapyngenToken, hrmsAuth_1.requireBooksSubscription);
app.use('/api/v1/books/items', (0, hrmsAuth_1.requireFeature)('accounts-items-directory'), itemRoutes_2.default);
app.use('/api/v1/books/inventory-adjustments', (0, hrmsAuth_1.requireFeature)('accounts-items-inventory-adjustments'), inventoryAdjustmentRoutes_1.default);
app.use('/api/v1/books/sales/customers', (0, hrmsAuth_1.requireFeature)('accounts-sales-customers'), customerRoutes_2.default);
app.use('/api/v1/books/purchases/vendors', (0, hrmsAuth_1.requireFeature)('accounts-purchases-vendors'), vendorRoutes_1.default);
app.use('/api/v1/books/purchases/expenses', (0, hrmsAuth_1.requireFeature)('accounts-purchases-expenses'), expenseRoutes_1.default);
app.use('/api/v1/books/purchases/recurring-expenses', (0, hrmsAuth_1.requireFeature)('accounts-purchases-recurring-expenses'), recurringExpenseRoutes_1.default);
app.use('/api/v1/books/purchases/purchase-orders', (0, hrmsAuth_1.requireFeature)('accounts-purchases-purchase-orders'), purchaseOrderRoutes_1.default);
app.use('/api/v1/books/purchases/bills', (0, hrmsAuth_1.requireFeature)('accounts-purchases-bills'), billRoutes_1.default);
app.use('/api/v1/books/purchases/recurring-bills', (0, hrmsAuth_1.requireFeature)('accounts-purchases-recurring-bills'), recurringBillRoutes_1.default);
app.use('/api/v1/books/purchases/payments-made', (0, hrmsAuth_1.requireFeature)('accounts-purchases-payments-made'), paymentMadeRoutes_1.default);
app.use('/api/v1/books/purchases/mileage', (0, hrmsAuth_1.requireFeature)('accounts-purchases-mileage'), mileageExpenseRoutes_1.default);
app.use('/api/v1/books/sales/quotes', (0, hrmsAuth_1.requireFeature)('accounts-sales-quotes'), quoteRoutes_1.default);
app.use('/api/v1/books/sales/sales-orders', (0, hrmsAuth_1.requireFeature)('accounts-sales-sales-orders'), salesOrderRoutes_1.default);
app.use('/api/v1/books/sales/invoices', (0, hrmsAuth_1.requireFeature)('accounts-sales-invoices'), invoiceRoutes_1.default);
app.use('/api/v1/books/sales/recurring-invoices', (0, hrmsAuth_1.requireFeature)('accounts-sales-recurring-invoices'), recurringInvoiceRoutes_1.default);
app.use('/api/v1/books/sales/delivery-challans', (0, hrmsAuth_1.requireFeature)('accounts-sales-delivery-challans'), deliveryChallanRoutes_1.default);
app.use('/api/v1/books/sales/payments-received', (0, hrmsAuth_1.requireFeature)('accounts-sales-payments-received'), paymentReceivedRoutes_1.default);
app.use('/api/v1/books/sales/credit-notes', (0, hrmsAuth_1.requireFeature)('accounts-sales-credit-notes'), creditNoteRoutes_1.default);
// Books routers declared in the source but previously not mounted.
app.use('/api/v1/books/dashboard', dashboardRoutes_1.default);
app.use('/api/v1/books/inventory/machines', machineRoutes_1.default);
app.use('/api/v1/books/inventory/routings', routingRoutes_1.default);
app.use('/api/v1/books/inventory/work-orders', workOrderRoutes_1.default);
app.use('/api/v1/books/inventory/ai', aiInventoryRoutes_1.default);
app.use('/api/v1/books/inventory/warehouses', warehouseRoutes_1.default);
app.use('/api/v1/books/inventory/transfer-orders', transferOrderRoutes_1.default);
app.use('/api/v1/books/inventory/shipments', shipmentRoutes_1.default);
app.use('/api/v1/books/chart-of-accounts', chartOfAccountRoutes_1.default);
app.use('/api/v1/books/dimensions', dimensionRoutes_1.dimensionRoutes);
app.use('/api/v1/books/branches', dimensionRoutes_1.branchRoutes);
app.use('/api/v1/books/fiscal-calendars', fiscalCalendarRoutes_1.fiscalCalendarRoutes);
app.use('/api/v1/books/inter-company', interCompanyRoutes_1.interCompanyRoutes);
app.use('/api/v1/books/ai', aiRoutes_1.aiRoutes);
app.use('/api/v1/books/journals', journalRoutes_1.default);
app.use('/api/v1/books/recurring-journals', recurringJournalRoutes_1.default);
app.use('/api/v1/books/reconciliation', reconciliationRoutes_1.default);
app.use('/api/v1/books/taxes', taxRoutes_1.default);
app.use('/api/v1/books/fixed-assets', fixedAssetRoutes_1.default);
app.use('/api/v1/books/budgets', budgetRoutes_1.default);
app.use('/api/v1/books/currency-adjustments', currencyAdjustmentRoutes_1.default);
app.use('/api/v1/books/projects', projectRoutes_1.default);
app.use('/api/v1/books/time-entries', timeEntryRoutes_1.default);
app.use('/api/v1/books/transaction-locks', transactionLockRoutes_1.default);
app.use('/api/v1/books/reports', reportsRoutes_1.default);
// Capped Billing Routes
app.use('/api/v1/billing/dashboard', hrmsAuth_1.verifyCapyngenToken, (0, hrmsAuth_1.requireFeature)('billing-dashboard-home'), dashboardRoutes_2.default);
app.use('/api/v1/billing/customers', hrmsAuth_1.verifyCapyngenToken, (0, hrmsAuth_1.requireFeature)('billing-sales-customers'), customerRoutes_1.default);
app.use('/api/v1/billing/items', hrmsAuth_1.verifyCapyngenToken, itemRoutes_1.default);
app.use('/api/v1/billing/plans', hrmsAuth_1.verifyCapyngenToken, planRoutes_1.default);
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Backend is healthy' });
});
// Error Handling
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
exports.default = app;
