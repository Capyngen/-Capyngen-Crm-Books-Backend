import express from 'express';
import dotenv from 'dotenv';
import { verifyCapyngenToken, requireBooksSubscription, requireFeature } from './core/middlewares/hrmsAuth';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDB } from './core/db';
import mongoose from 'mongoose';
import { errorHandler } from './core/middlewares/errorHandler';
import { apiContract } from './core/middlewares/apiContract';
import orgRoutes from './domains/core/routes/orgRoutes';
import rbacRoutes from './domains/core/routes/rbacRoutes';
import { loadRbacContext } from './domains/core/middlewares/rbacMiddleware';
import booksDashboardRoutes from './domains/books/routes/dashboardRoutes';
import chartOfAccountRoutes from './domains/books/routes/chartOfAccountRoutes';
import journalRoutes from './domains/books/routes/journalRoutes';
import currencyAdjustmentRoutes from './domains/books/routes/currencyAdjustmentRoutes';
import projectRoutes from './domains/books/routes/projectRoutes';
import timeEntryRoutes from './domains/books/routes/timeEntryRoutes';
import transactionLockRoutes from './domains/books/routes/transactionLockRoutes';
import reportsRoutes from './domains/books/routes/reportsRoutes';
import billingCustomerRoutes from './domains/billing/routes/customerRoutes';
import billingItemRoutes from './domains/billing/routes/itemRoutes';
import billingPlanRoutes from './domains/billing/routes/planRoutes';
import billingDashboardRoutes from './domains/billing/routes/dashboardRoutes';

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

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000', 'https://books.orinite.com'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

app.use(express.json());
app.use(apiContract);

// Core public/authentication and context-backed organization/RBAC routes.
app.use('/api/v1/organizations', verifyCapyngenToken, loadRbacContext, orgRoutes);
app.use('/api/v1/rbac', verifyCapyngenToken, loadRbacContext, rbacRoutes);

// Routes
// Fetch user subscription data without blocking it
app.get('/api/v1/books/debug-me', verifyCapyngenToken, async (req: any, res: any) => { 
    try {
        const orgId = req.org?._id; 
        const company = await mongoose.connection.collection('companyprofiles').findOne({ _id: new mongoose.Types.ObjectId(orgId) }); 
        
        const allSubsByCompanyId = await mongoose.connection.collection('subscriptions').find({ companyId: new mongoose.Types.ObjectId(orgId) }).toArray();
        const allSubsByOrgId = await mongoose.connection.collection('subscriptions').find({ orgId: new mongoose.Types.ObjectId(orgId) }).toArray();
        const allSubsByStringCompanyId = await mongoose.connection.collection('subscriptions').find({ companyId: orgId }).toArray();
        
        // Find any subscription where the planId matches the Enterprise plan just to see how it's structured
        const anySub = await mongoose.connection.collection('subscriptions').findOne({});

        res.json({ 
            orgIdFromToken: orgId,
            companyProfileFound: !!company,
            companySubscriptionId: company?.subscriptionId,
            subsFoundByCompanyIdObj: allSubsByCompanyId.length,
            subsFoundByOrgIdObj: allSubsByOrgId.length,
            subsFoundByCompanyIdStr: allSubsByStringCompanyId.length,
            sampleSubStructure: anySub
        }); 
    } catch(err: any) {
        res.json({ error: err.message });
    }
  });
app.get('/api/v1/books/me', verifyCapyngenToken, async (req: any, res: any) => { 
    try {
        const orgId = req.org?._id; 
        if (!orgId) return res.status(401).json({ success: false }); 
        
        let orgIdObj = null;
        try { orgIdObj = new mongoose.Types.ObjectId(orgId); } catch(e) {}
        
        const company = orgIdObj ? await mongoose.connection.collection('companyprofiles').findOne({ _id: orgIdObj }) : null; 
        
        let subscription = null;
        if (company && company.subscriptionId) {
            let subIdObj = null;
            try { subIdObj = new mongoose.Types.ObjectId(company.subscriptionId); } catch(e) {}
            if (subIdObj) subscription = await mongoose.connection.collection('subscriptions').findOne({ _id: subIdObj }); 
        }
        
        if (!subscription) {
            subscription = (orgIdObj ? await mongoose.connection.collection('subscriptions').findOne({ companyId: orgIdObj }) : null) || 
                           (orgIdObj ? await mongoose.connection.collection('subscriptions').findOne({ orgId: orgIdObj }) : null) ||
                           await mongoose.connection.collection('subscriptions').findOne({ companyId: orgId }) || 
                           await mongoose.connection.collection('subscriptions').findOne({ orgId: orgId });
        }

        if (!subscription) return res.json({ subscription: null, plan: null, debug: "No sub found" }); 

        let plan = null;
        if (subscription.planId) {
          let planIdObj = null;
          try { planIdObj = new mongoose.Types.ObjectId(subscription.planId); } catch(e) {}
          plan = (planIdObj ? await mongoose.connection.collection('plans').findOne({ _id: planIdObj }) : null) ||
                 await mongoose.connection.collection('plans').findOne({ _id: subscription.planId });
        }
        
        res.json({ subscription, plan, role: req.employee?.role || 'Admin' }); 
    } catch(err: any) {
        res.json({ subscription: null, plan: null, error: err.message });
    }
  });

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

// Books routers declared in the source but previously not mounted.
app.use('/api/v1/books/dashboard', booksDashboardRoutes);
app.use('/api/v1/books/chart-of-accounts', chartOfAccountRoutes);
app.use('/api/v1/books/journals', journalRoutes);
app.use('/api/v1/books/currency-adjustments', currencyAdjustmentRoutes);
app.use('/api/v1/books/projects', projectRoutes);
app.use('/api/v1/books/time-entries', timeEntryRoutes);
app.use('/api/v1/books/transaction-locks', transactionLockRoutes);
app.use('/api/v1/books/reports', reportsRoutes);

// Billing routers currently declare no authentication middleware.
app.use('/api/v1/billing/customers', billingCustomerRoutes);
app.use('/api/v1/billing/items', billingItemRoutes);
app.use('/api/v1/billing/plans', billingPlanRoutes);
app.use('/api/v1/billing/dashboard', billingDashboardRoutes);

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










