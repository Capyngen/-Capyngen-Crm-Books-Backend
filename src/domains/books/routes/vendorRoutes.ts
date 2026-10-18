import { Router } from 'express';
import {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  getVendorTransactions,
  getVendorStatement,
  updateVendorOnboarding
} from '../../inventory/controllers/vendorController';

const router = Router();

router.route('/')
  .get(getVendors)
  .post(createVendor);

router.route('/:id')
  .get(getVendorById)
  .put(updateVendor)
  .delete(deleteVendor);

router.get('/:id/transactions', getVendorTransactions);
router.get('/:id/statement', getVendorStatement);
router.post('/:id/onboarding', updateVendorOnboarding);

export default router;
