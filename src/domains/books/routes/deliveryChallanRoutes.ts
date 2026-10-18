import express from 'express';
import {
  createDeliveryChallan,
  getDeliveryChallans,
  getDeliveryChallanById,
  updateDeliveryChallan,
  deleteDeliveryChallan,
  convertToInvoice
} from '../../inventory/controllers/deliveryChallanController';

const router = express.Router();

router.route('/')
  .post(createDeliveryChallan)
  .get(getDeliveryChallans);

router.route('/:id')
  .get(getDeliveryChallanById)
  .put(updateDeliveryChallan)
  .delete(deleteDeliveryChallan);

router.post('/:id/convert-to-invoice', convertToInvoice);

export default router;
