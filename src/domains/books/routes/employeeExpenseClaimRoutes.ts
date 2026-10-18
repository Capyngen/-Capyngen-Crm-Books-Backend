import express from 'express';
import {
  createClaim,
  getClaims,
  getClaimById,
  submitClaim,
  managerApproveClaim,
  financeApproveClaim,
  reimburseClaim
} from '../controllers/employeeExpenseClaimController';

const router = express.Router();

router.get('/', getClaims);
router.post('/', createClaim);
router.get('/:id', getClaimById);
router.put('/:id/submit', submitClaim);
router.put('/:id/manager-approve', managerApproveClaim);
router.put('/:id/finance-approve', financeApproveClaim);
router.put('/:id/reimburse', reimburseClaim);

export default router;
