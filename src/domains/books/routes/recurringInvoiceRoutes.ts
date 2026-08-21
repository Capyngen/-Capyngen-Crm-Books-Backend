import express from 'express';
import {
  createRecurringInvoice,
  getRecurringInvoices,
  getRecurringInvoiceById,
  updateRecurringInvoice,
  deleteRecurringInvoice
} from '../controllers/recurringInvoiceController';

const router = express.Router();

router.route('/')
  .post(createRecurringInvoice)
  .get(getRecurringInvoices);

router.route('/:id')
  .get(getRecurringInvoiceById)
  .put(updateRecurringInvoice)
  .delete(deleteRecurringInvoice);

export default router;
