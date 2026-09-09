import express from 'express';
import { getPlans, getPlanById, createPlan, updatePlan, deletePlan } from '../controllers/planController';

const router = express.Router();

router.route('/')
  .get(getPlans)
  .post(createPlan);

router.route('/:id')
  .get(getPlanById)
  .put(updatePlan)
  .delete(deletePlan);

export default router;
