import { Router } from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder
,
  requestPOApproval,
  approvePOManager
} from '../../inventory/controllers/purchaseOrderController';

const router = Router();

router.route('/')
  .get(getPurchaseOrders)
  .post(createPurchaseOrder);

router.route('/:id')
  .get(getPurchaseOrderById)
  .put(updatePurchaseOrder)
  .delete(deletePurchaseOrder);

export default router;

router.post('/:id/request-approval', requestPOApproval);
router.post('/:id/approve', approvePOManager);
