import { Router } from 'express';
import {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  getVendorTransactions,
  getVendorStatement,
  getVendorActivity,
  getVendorBills,
  getVendorPurchaseOrders,
  getVendorPayments,
  getVendorCredits,
  updateVendorOnboarding
} from '../../inventory/controllers/vendorController';

const router = Router();

router.route('/')
  .get(getVendors)
  .post(createVendor);

router.get('/:id/transactions', getVendorTransactions);
router.get('/:id/statement', getVendorStatement);
router.get('/:id/activity', getVendorActivity);
router.get('/:id/timeline', getVendorActivity);
router.get('/:id/history', getVendorActivity);
router.get('/:id/bills', getVendorBills);
router.get('/:id/purchase-orders', getVendorPurchaseOrders);
router.get('/:id/orders', getVendorPurchaseOrders);
router.get('/:id/payments', getVendorPayments);
router.get('/:id/credits', getVendorCredits);
router.get('/:id/vendor-credits', getVendorCredits);
router.post('/:id/onboarding', updateVendorOnboarding);

router.route('/:id')
  .get(getVendorById)
  .put(updateVendor)
  .delete(deleteVendor);

export default router;
