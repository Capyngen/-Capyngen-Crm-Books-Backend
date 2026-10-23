import { Router } from 'express';
import {
  getPurchaseReceives,
  getPurchaseReceiveById,
  createPurchaseReceive
} from '../controllers/purchaseReceiveController';

const router = Router();

router.get('/', getPurchaseReceives);
router.get('/:id', getPurchaseReceiveById);
router.post('/', createPurchaseReceive);

export default router;
