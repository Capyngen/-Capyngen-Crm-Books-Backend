import { Router } from 'express';
import {
  getRules,
  updateRule,
  getPendingApprovals,
  getPendingCount,
  getDocumentApprovalStatus,
  getDocumentTimeline,
  submitForApproval,
  approveTransaction,
  rejectTransaction
} from '../controllers/approvalController';

const router = Router();

router.get('/rules', getRules);
router.put('/rules/:module', updateRule);
router.get('/pending', getPendingApprovals);
router.get('/pending-count', getPendingCount);
router.get('/document/:module/:documentId', getDocumentApprovalStatus);
router.get('/timeline/:module/:documentId', getDocumentTimeline);
router.post('/submit', submitForApproval);
router.post('/approve', approveTransaction);
router.post('/reject', rejectTransaction);

export default router;
