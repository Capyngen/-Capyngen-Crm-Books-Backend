import express from 'express';
import { 
  getTransferOrders, 
  getTransferOrderById, 
  createTransferOrder, 
  updateTransferOrder, 
  deleteTransferOrder,
  dispatchTransferOrder,
  receiveTransferOrder
} from '../../inventory/controllers/transferOrderController';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getTransferOrders)
  .post(createTransferOrder);

router.route('/:id')
  .get(getTransferOrderById)
  .put(updateTransferOrder)
  .delete(deleteTransferOrder);

router.post('/:id/dispatch', dispatchTransferOrder);
router.post('/:id/receive', receiveTransferOrder);

export default router;
