import express from 'express';
import {
  getAssets,
  getCategories,
  createCategory,
  createAsset,
  runDepreciation,
  disposeAsset,
  getAssetSchedule
} from '../controllers/fixedAssetController';

const router = express.Router();

router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.get('/schedule', getAssetSchedule);
router.get('/', getAssets);
router.post('/', createAsset);
router.post('/depreciation-run', runDepreciation);
router.post('/:id/dispose', disposeAsset);

export default router;
