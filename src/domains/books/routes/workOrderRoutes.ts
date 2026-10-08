import express from 'express';
import { getWorkOrders, getWorkOrderById, createWorkOrder, updateWorkOrder, deleteWorkOrder } from '../../inventory/controllers/workOrderController';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getWorkOrders)
  .post(createWorkOrder);

router.route('/:id')
  .get(getWorkOrderById)
  .put(updateWorkOrder)
  .delete(deleteWorkOrder);

export default router;
