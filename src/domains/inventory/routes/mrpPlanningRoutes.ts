import express from 'express';
import { getMRPPlan, executeMRPOrders } from '../controllers/mrpPlanningController';

const router = express.Router();

router.get('/', getMRPPlan);
router.get('/plan', getMRPPlan);
router.post('/generate-orders', executeMRPOrders);

export default router;
