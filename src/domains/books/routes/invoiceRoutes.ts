import express from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
,
  consolidateInvoices,
  analyzeRisk
} from '../../billing/controllers/invoiceController';

const router = express.Router();

router.route('/')
  .post(createInvoice)
  .get(getInvoices);

router.route('/:id')
  .get(getInvoiceById)
  .put(updateInvoice)
  .delete(deleteInvoice);

export default router;

router.post('/consolidate', consolidateInvoices);
router.get('/:id/risk-analysis', analyzeRisk);
