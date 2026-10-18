import { Router } from 'express';
import {
  createVendorCredit,
  getVendorCredits,
  getVendorCreditById,
  updateVendorCredit,
  deleteVendorCredit
} from '../../inventory/controllers/vendorCreditController';

const router = Router();

router.route('/')
  .get(getVendorCredits)
  .post(createVendorCredit);

router.route('/:id')
  .get(getVendorCreditById)
  .put(updateVendorCredit)
  .delete(deleteVendorCredit);

export default router;
