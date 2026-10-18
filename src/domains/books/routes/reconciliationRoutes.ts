import express from 'express';
import {
  getReconciliationFeeds,
  confirmMatch,
  unmatchFeed,
  autoReconcile
} from '../controllers/reconciliationController';

const router = express.Router();

router.get('/feeds', getReconciliationFeeds);
router.post('/feeds/:feedId/confirm', confirmMatch);
router.post('/feeds/:feedId/unmatch', unmatchFeed);
router.post('/auto-reconcile', autoReconcile);

export default router;
