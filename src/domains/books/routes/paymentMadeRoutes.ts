import { Router } from 'express';
import {
  getPaymentsMade,
  getPaymentMadeById,
  createPaymentMade,
  updatePaymentMade,
  deletePaymentMade
} from '../controllers/paymentMadeController';

const router = Router();

router.route('/')
  .get(getPaymentsMade)
  .post(createPaymentMade);

router.route('/:id')
  .get(getPaymentMadeById)
  .put(updatePaymentMade)
  .delete(deletePaymentMade);

export default router;
