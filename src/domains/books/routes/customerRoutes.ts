import { Router } from 'express';
import { 
  createCustomer, 
  getCustomers, 
  getCustomerById, 
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
} from '../../billing/controllers/customerController';

const router = Router();

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

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
