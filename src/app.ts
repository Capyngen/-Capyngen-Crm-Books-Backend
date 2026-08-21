import express from 'express';
import dotenv from 'dotenv';
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
app.use('/api/v1/books/items', booksItemRoutes);
app.use('/api/v1/books/inventory-adjustments', booksInventoryAdjustmentRoutes);
app.use('/api/v1/books/sales/customers', customerRoutes);
app.use('/api/v1/books/purchases/vendors', vendorRoutes);
app.use('/api/v1/books/purchases/expenses', expenseRoutes);
app.use('/api/v1/books/purchases/recurring-expenses', recurringExpenseRoutes);
app.use('/api/v1/books/purchases/purchase-orders', purchaseOrderRoutes);
app.use('/api/v1/books/purchases/bills', billRoutes);
app.use('/api/v1/books/purchases/recurring-bills', recurringBillRoutes);
app.use('/api/v1/books/purchases/payments-made', paymentMadeRoutes);
app.use('/api/v1/books/purchases/mileage', mileageExpenseRoutes);
app.use('/api/v1/books/sales/quotes', quoteRoutes);
app.use('/api/v1/books/sales/sales-orders', salesOrderRoutes);
app.use('/api/v1/books/sales/invoices', invoiceRoutes);
app.use('/api/v1/books/sales/recurring-invoices', recurringInvoiceRoutes);
app.use('/api/v1/books/sales/delivery-challans', deliveryChallanRoutes);
app.use('/api/v1/books/sales/payments-received', paymentReceivedRoutes);
app.use('/api/v1/books/sales/credit-notes', creditNoteRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Backend is healthy' });
});

// Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;
