import { Router } from 'express';
import {
  getRecurringBills,
  getRecurringBillById,
  createRecurringBill,
  updateRecurringBill,
  deleteRecurringBill
} from '../controllers/recurringBillController';

const router = Router();

router.route('/')
  .get(getRecurringBills)
  .post(createRecurringBill);

router.route('/:id')
  .get(getRecurringBillById)
  .put(updateRecurringBill)
  .delete(deleteRecurringBill);

export default router;
