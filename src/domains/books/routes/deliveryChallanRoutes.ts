import express from 'express';
import {
  createDeliveryChallan,
  getDeliveryChallans,
  getDeliveryChallanById,
  updateDeliveryChallan,
  deleteDeliveryChallan
} from '../controllers/deliveryChallanController';

const router = express.Router();

router.route('/')
  .post(createDeliveryChallan)
  .get(getDeliveryChallans);

router.route('/:id')
  .get(getDeliveryChallanById)
  .put(updateDeliveryChallan)
  .delete(deleteDeliveryChallan);

export default router;
