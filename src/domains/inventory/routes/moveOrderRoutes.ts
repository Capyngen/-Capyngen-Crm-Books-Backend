import { Router } from 'express';
import {
  getMoveOrders,
  getMoveOrderById,
  createMoveOrder,
  executeMoveOrder,
  updateMoveOrder,
  deleteMoveOrder
} from '../controllers/moveOrderController';

const router = Router();

router.get('/', getMoveOrders);
router.get('/:id', getMoveOrderById);
router.post('/', createMoveOrder);
router.post('/:id/execute', executeMoveOrder);
router.put('/:id', updateMoveOrder);
router.delete('/:id', deleteMoveOrder);

export default router;
