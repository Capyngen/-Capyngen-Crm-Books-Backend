import express from 'express';
import { getDashboardData, getInventoryDashboardData } from '../controllers/dashboardController';

const router = express.Router();

router.get('/', getDashboardData);
router.get('/inventory', getInventoryDashboardData);

export default router;
