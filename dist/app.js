"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./core/db");
const errorHandler_1 = require("./core/middlewares/errorHandler");
const context_1 = require("./context");
require("./mongoosePlugin");
// Route Imports
const authRoutes_1 = __importDefault(require("./domains/core/routes/authRoutes"));
const orgRoutes_1 = __importDefault(require("./domains/core/routes/orgRoutes"));
const customerRoutes_1 = __importDefault(require("./domains/billing/routes/customerRoutes"));
const itemRoutes_1 = __importDefault(require("./domains/billing/routes/itemRoutes"));
const planRoutes_1 = __importDefault(require("./domains/billing/routes/planRoutes"));
const dashboardRoutes_1 = __importDefault(require("./domains/books/routes/dashboardRoutes"));
const dashboardRoutes_2 = __importDefault(require("./domains/billing/routes/dashboardRoutes"));
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
const projectRoutes_1 = __importDefault(require("./domains/books/routes/projectRoutes"));
const timeEntryRoutes_1 = __importDefault(require("./domains/books/routes/timeEntryRoutes"));
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
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Global Org & Auth Context Middleware
app.use((req, res, next) => {
    const userId = req.headers['x-user-id'];
    const orgId = req.headers['x-org-id'];
    if (userId)
        req.user = { _id: userId };
    if (orgId)
        req.org = { _id: orgId };
    context_1.requestContext.run({
        userId: userId,
        orgId: orgId
    }, next);
});
// Routes
app.use('/api/v1/auth', authRoutes_1.default);
app.use('/api/v1/organizations', orgRoutes_1.default);
app.use('/api/v1/billing/customers', customerRoutes_1.default);
app.use('/api/v1/billing/items', itemRoutes_1.default);
app.use('/api/v1/billing/plans', planRoutes_1.default);
app.use('/api/v1/books/dashboard', dashboardRoutes_1.default);
app.use('/api/v1/billing/dashboard', dashboardRoutes_2.default);
app.use('/api/v1/books/items', itemRoutes_2.default);
app.use('/api/v1/books/inventory-adjustments', inventoryAdjustmentRoutes_1.default);
app.use('/api/v1/books/sales/customers', customerRoutes_2.default);
app.use('/api/v1/books/purchases/vendors', vendorRoutes_1.default);
app.use('/api/v1/books/purchases/expenses', expenseRoutes_1.default);
app.use('/api/v1/books/purchases/recurring-expenses', recurringExpenseRoutes_1.default);
app.use('/api/v1/books/purchases/purchase-orders', purchaseOrderRoutes_1.default);
app.use('/api/v1/books/purchases/bills', billRoutes_1.default);
app.use('/api/v1/books/purchases/recurring-bills', recurringBillRoutes_1.default);
app.use('/api/v1/books/purchases/payments-made', paymentMadeRoutes_1.default);
app.use('/api/v1/books/purchases/mileage', mileageExpenseRoutes_1.default);
app.use('/api/v1/books/time-tracking/projects', projectRoutes_1.default);
app.use('/api/v1/books/time-tracking/time-entries', timeEntryRoutes_1.default);
app.use('/api/v1/books/sales/quotes', quoteRoutes_1.default);
app.use('/api/v1/books/sales/sales-orders', salesOrderRoutes_1.default);
app.use('/api/v1/books/sales/invoices', invoiceRoutes_1.default);
app.use('/api/v1/books/sales/recurring-invoices', recurringInvoiceRoutes_1.default);
app.use('/api/v1/books/sales/delivery-challans', deliveryChallanRoutes_1.default);
app.use('/api/v1/books/sales/payments-received', paymentReceivedRoutes_1.default);
app.use('/api/v1/books/sales/credit-notes', creditNoteRoutes_1.default);
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
