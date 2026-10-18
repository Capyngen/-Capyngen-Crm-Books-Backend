import express from 'express';
import { 
  getCycleCounts, 
  getCycleCountById, 
  createCycleCount, 
  submitCountResults, 
  reconcileCycleCount 
} from '../../inventory/controllers/cycleCountController';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getCycleCounts)
  .post(createCycleCount);

router.route('/:id')
  .get(getCycleCountById);

router.post('/:id/submit', submitCountResults);
router.post('/:id/reconcile', reconcileCycleCount);

export default router;
