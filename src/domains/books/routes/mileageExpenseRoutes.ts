import { Router } from 'express';
import {
  getMileageExpenses,
  getMileageExpenseById,
  createMileageExpense,
  updateMileageExpense,
  deleteMileageExpense
} from '../controllers/mileageExpenseController';

const router = Router();

router.route('/')
  .get(getMileageExpenses)
  .post(createMileageExpense);

router.route('/:id')
  .get(getMileageExpenseById)
  .put(updateMileageExpense)
  .delete(deleteMileageExpense);

export default router;
