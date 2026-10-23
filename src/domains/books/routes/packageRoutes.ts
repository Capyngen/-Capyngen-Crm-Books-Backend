import express from 'express';
import { 
  getPackages, 
  getPackageById, 
  createPackage, 
  updatePackage, 
  deletePackage 
} from '../../inventory/controllers/packageController';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getPackages)
  .post(createPackage);

router.route('/:id')
  .get(getPackageById)
  .put(updatePackage)
  .delete(deletePackage);

export default router;
