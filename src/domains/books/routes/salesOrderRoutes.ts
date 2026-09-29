import express from 'express';
import {
  createSalesOrder,
  getSalesOrders,
  getSalesOrderById,
  updateSalesOrder,
  deleteSalesOrder
} from '../../billing/controllers/salesOrderController';

const router = express.Router();

router.route('/')
  .post(createSalesOrder)
  .get(getSalesOrders);

router.route('/:id')
  .get(getSalesOrderById)
  .put(updateSalesOrder)
  .delete(deleteSalesOrder);

export default router;
