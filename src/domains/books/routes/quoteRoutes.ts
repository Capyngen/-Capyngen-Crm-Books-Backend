import { Router } from 'express';
import { 
  createQuote, 
  getQuotes, 
  getQuoteById, 
  updateQuote, 
  deleteQuote,
  convertToSalesOrder,
  convertToInvoice
} from '../../billing/controllers/quoteController';

const router = Router();

router.route('/')
  .get(getQuotes)
  .post(createQuote);

router.route('/:id')
  .get(getQuoteById)
  .put(updateQuote)
  .delete(deleteQuote);

router.post('/:id/convert-to-sales-order', convertToSalesOrder);
router.post('/:id/convert-to-invoice', convertToInvoice);

export default router;
