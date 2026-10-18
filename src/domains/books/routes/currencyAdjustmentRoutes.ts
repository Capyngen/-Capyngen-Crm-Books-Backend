import express from 'express';
import {
  getCurrencyAdjustments,
  getCurrencyAdjustmentById,
  createCurrencyAdjustment,
  updateCurrencyAdjustment,
  deleteCurrencyAdjustment,
  getOpenForeignBalances
} from '../controllers/currencyAdjustmentController';

const router = express.Router();

router.get('/open-balances', getOpenForeignBalances);
router.get('/', getCurrencyAdjustments);
router.get('/:id', getCurrencyAdjustmentById);
router.post('/', createCurrencyAdjustment);
router.put('/:id', updateCurrencyAdjustment);
router.delete('/:id', deleteCurrencyAdjustment);

export default router;
