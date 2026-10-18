import { Router } from 'express';
import { 
  createCustomer, 
  getCustomers, 
  getCustomerById, 
  updateCustomer,
  getCustomerTransactions,
  getCustomerStatement
} from '../../billing/controllers/customerController';

const router = Router();

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.route('/:id')
  .get(getCustomerById)
  .put(updateCustomer);

router.get('/:id/transactions', getCustomerTransactions);
router.get('/:id/statement', getCustomerStatement);

export default router;
