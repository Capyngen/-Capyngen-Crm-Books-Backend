import express from 'express';
import { 
  getWorkOrders, 
  getWorkOrderById, 
  createWorkOrder, 
  updateWorkOrder, 
  deleteWorkOrder,
  completeWorkOrder,
  getBOMExplosion
} from '../../inventory/controllers/workOrderController';

const router = express.Router({ mergeParams: true });

router.get('/bom-explosion/:itemId', getBOMExplosion);

router.route('/')
  .get(getWorkOrders)
  .post(createWorkOrder);

router.post('/:id/complete', completeWorkOrder);

router.route('/:id')
  .get(getWorkOrderById)
  .put(updateWorkOrder)
  .delete(deleteWorkOrder);

export default router;
