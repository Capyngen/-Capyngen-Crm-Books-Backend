import { Router } from 'express';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  createBulkExpenses,
  updateExpense,
  deleteExpense,
  getBulkExpenses,
  updateBulkExpenses
} from '../controllers/expenseController';

const router = Router();

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/bulk')
  .post(createBulkExpenses);

router.route('/bulk/:batchId')
  .get(getBulkExpenses)
  .put(updateBulkExpenses);

router.route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

export default router;
