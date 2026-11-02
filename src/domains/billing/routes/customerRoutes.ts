import express from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerTransactions,
  getCustomerStatement,
  getCustomerActivity,
  getCustomerSubscriptions,
  getCustomerInvoices,
  getCustomerQuotes,
  getCustomerSalesOrders,
  getCustomerPayments,
  getCustomerCreditNotes,
  getCustomerPortalLink
} from '../controllers/customerController';

const router = express.Router();

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

// Specific customer sub-routes (Placed before /:id generic router to avoid routing conflicts)
router.get('/:id/transactions', getCustomerTransactions);
router.get('/:id/statement', getCustomerStatement);
router.get('/:id/activity', getCustomerActivity);
router.get('/:id/timeline', getCustomerActivity);
router.get('/:id/history', getCustomerActivity);
router.get('/:id/subscriptions', getCustomerSubscriptions);
router.get('/:id/invoices', getCustomerInvoices);
router.get('/:id/quotes', getCustomerQuotes);
router.get('/:id/sales-orders', getCustomerSalesOrders);
router.get('/:id/orders', getCustomerSalesOrders);
router.get('/:id/payments', getCustomerPayments);
router.get('/:id/credit-notes', getCustomerCreditNotes);
router.get('/:id/portal-link', getCustomerPortalLink);

router.route('/:id')
  .get(getCustomerById)
  .put(updateCustomer)
  .delete(deleteCustomer);

export default router;
