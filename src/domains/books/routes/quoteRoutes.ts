import { Router } from 'express';
import { createQuote, getQuotes, getQuoteById, updateQuote, deleteQuote } from '../controllers/quoteController';

const router = Router();

router.route('/')
  .get(getQuotes)
  .post(createQuote);

router.route('/:id')
  .get(getQuoteById)
  .put(updateQuote)
  .delete(deleteQuote);

export default router;
