import { Router } from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  requestPOApproval,
  approvePOManager,
  convertToBill,
  convertToReceive
} from '../../inventory/controllers/purchaseOrderController';

const router = Router();

router.route('/')
  .get(getPurchaseOrders)
  .post(createPurchaseOrder);

router.route('/:id')
  .get(getPurchaseOrderById)
  .put(updatePurchaseOrder)
  .delete(deletePurchaseOrder);

router.post('/:id/request-approval', requestPOApproval);
router.post('/:id/approve', approvePOManager);
router.post('/:id/convert-to-bill', convertToBill);
router.post('/:id/convert-to-receive', convertToReceive);

export default router;
