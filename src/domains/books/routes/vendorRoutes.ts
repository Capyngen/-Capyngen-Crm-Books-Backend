import { Router } from 'express';
import { createVendor, getVendors, getVendorById, updateVendor } from '../../inventory/controllers/vendorController';

const router = Router();

router.route('/')
  .get(getVendors)
  .post(createVendor);

router.route('/:id')
  .get(getVendorById)
  .put(updateVendor);

export default router;
