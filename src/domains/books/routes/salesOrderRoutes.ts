import express from 'express';
import {
  createSalesOrder,
  getSalesOrders,
  getSalesOrderById,
  updateSalesOrder,
  deleteSalesOrder,
  fulfillSalesOrder,
  convertToDeliveryChallan,
  convertToInvoice
} from '../../billing/controllers/salesOrderController';

const router = express.Router();

router.route('/')
  .post(createSalesOrder)
  .get(getSalesOrders);

router.route('/:id')
  .get(getSalesOrderById)
  .put(updateSalesOrder)
  .delete(deleteSalesOrder);

router.post('/:id/fulfill', fulfillSalesOrder);
router.post('/:id/convert-to-delivery-challan', convertToDeliveryChallan);
router.post('/:id/convert-to-invoice', convertToInvoice);

export default router;
