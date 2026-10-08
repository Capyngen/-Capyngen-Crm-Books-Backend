import { Router } from 'express';
import { createVendor, getVendors, getVendorById, updateVendor ,
  updateVendorOnboarding
} from '../../inventory/controllers/vendorController';

const router = Router();

router.route('/')
  .get(getVendors)
  .post(createVendor);

router.route('/:id')
  .get(getVendorById)
  .put(updateVendor);

export default router;

router.post('/:id/onboarding', updateVendorOnboarding);
