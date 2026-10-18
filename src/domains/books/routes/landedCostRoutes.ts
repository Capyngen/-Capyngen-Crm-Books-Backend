import express from 'express';
import { 
  getLandedCosts, 
  getLandedCostById, 
  createLandedCost, 
  applyLandedCost, 
  deleteLandedCost 
} from '../../inventory/controllers/landedCostController';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getLandedCosts)
  .post(createLandedCost);

router.route('/:id')
  .get(getLandedCostById)
  .delete(deleteLandedCost);

router.post('/:id/apply', applyLandedCost);

export default router;
