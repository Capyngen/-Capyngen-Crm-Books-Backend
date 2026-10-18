import { Router } from 'express';
import { 
  createAdjustment, 
  getAdjustments, 
  getAdjustmentById, 
  updateAdjustment,
  deleteAdjustment
} from '../../inventory/controllers/inventoryAdjustmentController';

const router = Router();

router.route('/')
  .get(getAdjustments)
  .post(createAdjustment);

router.route('/:id')
  .get(getAdjustmentById)
  .put(updateAdjustment)
  .delete(deleteAdjustment);

export default router;
