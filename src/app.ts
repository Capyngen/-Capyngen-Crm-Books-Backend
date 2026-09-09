import express from 'express';
import dotenv from 'dotenv';
import { verifyCapyngenToken, requireBooksSubscription, requireFeature } from './core/middlewares/hrmsAuth';
import cors from 'cors';
import { connectDB } from './core/db';
import { errorHandler } from './core/middlewares/errorHandler';

// Route Imports
import booksItemRoutes from './domains/books/routes/itemRoutes';
import booksInventoryAdjustmentRoutes from './domains/books/routes/inventoryAdjustmentRoutes';
import customerRoutes from './domains/books/routes/customerRoutes';
import vendorRoutes from './domains/books/routes/vendorRoutes';
import expenseRoutes from './domains/books/routes/expenseRoutes';
import recurringExpenseRoutes from './domains/books/routes/recurringExpenseRoutes';
import purchaseOrderRoutes from './domains/books/routes/purchaseOrderRoutes';
import billRoutes from './domains/books/routes/billRoutes';
import recurringBillRoutes from './domains/books/routes/recurringBillRoutes';
import paymentMadeRoutes from './domains/books/routes/paymentMadeRoutes';
import mileageExpenseRoutes from './domains/books/routes/mileageExpenseRoutes';
import itemRoutes from './domains/books/routes/itemRoutes';
import quoteRoutes from './domains/books/routes/quoteRoutes';
import salesOrderRoutes from './domains/books/routes/salesOrderRoutes';
import invoiceRoutes from './domains/books/routes/invoiceRoutes';
import recurringInvoiceRoutes from './domains/books/routes/recurringInvoiceRoutes';
import deliveryChallanRoutes from './domains/books/routes/deliveryChallanRoutes';
import paymentReceivedRoutes from './domains/books/routes/paymentReceivedRoutes';
import creditNoteRoutes from './domains/books/routes/creditNoteRoutes';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/books', verifyCapyngenToken, requireBooksSubscription);
app.use('/api/v1/books/items', requireFeature('accounts-items-directory'), booksItemRoutes);
app.use('/api/v1/books/inventory-adjustments', requireFeature('accounts-items-inventory-adjustments'), booksInventoryAdjustmentRoutes);
app.use('/api/v1/books/sales/customers', requireFeature('accounts-sales-customers'), customerRoutes);
app.use('/api/v1/books/purchases/vendors', requireFeature('accounts-purchases-vendors'), vendorRoutes);
app.use('/api/v1/books/purchases/expenses', requireFeature('accounts-purchases-expenses'), expenseRoutes);
app.use('/api/v1/books/purchases/recurring-expenses', requireFeature('accounts-purchases-recurring-expenses'), recurringExpenseRoutes);
app.use('/api/v1/books/purchases/purchase-orders', requireFeature('accounts-purchases-purchase-orders'), purchaseOrderRoutes);
app.use('/api/v1/books/purchases/bills', requireFeature('accounts-purchases-bills'), billRoutes);
app.use('/api/v1/books/purchases/recurring-bills', requireFeature('accounts-purchases-recurring-bills'), recurringBillRoutes);
app.use('/api/v1/books/purchases/payments-made', requireFeature('accounts-purchases-payments-made'), paymentMadeRoutes);
app.use('/api/v1/books/purchases/mileage', requireFeature('accounts-purchases-mileage'), mileageExpenseRoutes);
app.use('/api/v1/books/sales/quotes', requireFeature('accounts-sales-quotes'), quoteRoutes);
app.use('/api/v1/books/sales/sales-orders', requireFeature('accounts-sales-sales-orders'), salesOrderRoutes);
app.use('/api/v1/books/sales/invoices', requireFeature('accounts-sales-invoices'), invoiceRoutes);
app.use('/api/v1/books/sales/recurring-invoices', requireFeature('accounts-sales-recurring-invoices'), recurringInvoiceRoutes);
app.use('/api/v1/books/sales/delivery-challans', requireFeature('accounts-sales-delivery-challans'), deliveryChallanRoutes);
app.use('/api/v1/books/sales/payments-received', requireFeature('accounts-sales-payments-received'), paymentReceivedRoutes);
app.use('/api/v1/books/sales/credit-notes', requireFeature('accounts-sales-credit-notes'), creditNoteRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Backend is healthy' });
});


app.get('/api/v1/books/me', verifyCapyngenToken, async (req: any, res: any) => { const orgId = req.org?._id; if (!orgId) return res.status(401).json({ success: false }); const company = await mongoose.connection.collection('companyprofiles').findOne({ _id: new mongoose.Types.ObjectId(orgId) }); if (!company || !company.subscriptionId) return res.json({ subscription: null }); const subscription = await mongoose.connection.collection('subscriptions').findOne({ _id: new mongoose.Types.ObjectId(company.subscriptionId) }); res.json({ subscription, role: req.employee?.role || 'Admin' }); });

// Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;


