import express from 'express';
import { getReconciliationFeeds, confirmMatch } from '../controllers/reconciliationController';

const router = express.Router();

router.get('/feeds', getReconciliationFeeds);
router.post('/feeds/:feedId/confirm', confirmMatch);

export default router;
