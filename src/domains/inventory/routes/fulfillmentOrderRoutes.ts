import express from 'express';
import {
  getFulfillments,
  getFulfillmentById,
  createFulfillment,
  updateFulfillment,
  deleteFulfillment,
  advanceStage
} from '../controllers/fulfillmentOrderController';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getFulfillments)
  .post(createFulfillment);

router.route('/:id')
  .get(getFulfillmentById)
  .put(updateFulfillment)
  .delete(deleteFulfillment);

router.post('/:id/advance-stage', advanceStage);

export default router;
