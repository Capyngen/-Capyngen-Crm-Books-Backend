import { Router } from 'express';
import {
  getPaymentsMade,
  getPaymentMadeById,
  processDisbursement,
  sendRemittanceAdvice,
  createPaymentMade,
  updatePaymentMade,
  deletePaymentMade
} from '../controllers/paymentMadeController';

const router = Router();

router.route('/')
  .get(getPaymentsMade)
  .post(createPaymentMade);

router.route('/:id/disburse').post(processDisbursement);
router.route('/:id/remittance').post(sendRemittanceAdvice);

router.route('/:id')
  .get(getPaymentMadeById)
  .put(updatePaymentMade)
  .delete(deletePaymentMade);

export default router;
