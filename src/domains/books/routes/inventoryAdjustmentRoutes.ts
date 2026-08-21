import { Router } from 'express';
import { createAdjustment, getAdjustments, getAdjustmentById, updateAdjustment } from '../controllers/inventoryAdjustmentController';

const router = Router();

router.route('/')
  .get(getAdjustments)
  .post(createAdjustment);

router.route('/:id')
  .get(getAdjustmentById)
  .put(updateAdjustment);

export default router;
