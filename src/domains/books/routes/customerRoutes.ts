import { Router } from 'express';
import { createCustomer, getCustomers, getCustomerById, updateCustomer } from '../../billing/controllers/customerController';

const router = Router();

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.route('/:id')
  .get(getCustomerById)
  .put(updateCustomer);

export default router;
