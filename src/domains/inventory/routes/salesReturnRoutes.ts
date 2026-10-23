import express from 'express';
import {
  getSalesReturns,
  getSalesReturnById,
  createSalesReturn,
  updateSalesReturn,
  deleteSalesReturn,
  receiveAndRestock
} from '../controllers/salesReturnController';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getSalesReturns)
  .post(createSalesReturn);

router.route('/:id')
  .get(getSalesReturnById)
  .put(updateSalesReturn)
  .delete(deleteSalesReturn);

router.post('/:id/receive', receiveAndRestock);

export default router;
