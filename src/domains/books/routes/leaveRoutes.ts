import express from 'express';
import {
  applyLeave,
  getLeaveApplications,
  approveLeave,
  rejectLeave,
  getLeaveBalances
} from '../controllers/leaveController';

const router = express.Router();

router.get('/', getLeaveApplications);
router.post('/apply', applyLeave);
router.put('/:id/approve', approveLeave);
router.put('/:id/reject', rejectLeave);
router.get('/balances/:employeeId', getLeaveBalances);

export default router;
