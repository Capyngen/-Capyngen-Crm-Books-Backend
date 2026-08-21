import express from 'express';
import {
  createPaymentReceived,
  getPaymentsReceived,
  getPaymentReceivedById,
  updatePaymentReceived,
  deletePaymentReceived
} from '../controllers/paymentReceivedController';

const router = express.Router();

router.route('/')
  .post(createPaymentReceived)
  .get(getPaymentsReceived);

router.route('/:id')
  .get(getPaymentReceivedById)
  .put(updatePaymentReceived)
  .delete(deletePaymentReceived);

export default router;
