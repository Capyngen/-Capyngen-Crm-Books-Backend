import { Router } from 'express';
import {
  getRules,
  updateRule,
  getPendingApprovals,
  getPendingCount,
  getDocumentApprovalStatus,
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
router.post('/submit', submitForApproval);
router.post('/approve', approveTransaction);
router.post('/reject', rejectTransaction);

export default router;
