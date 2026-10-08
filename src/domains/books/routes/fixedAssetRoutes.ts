import express from 'express';
import { getAssets, getCategories, createAsset, runDepreciation } from '../controllers/fixedAssetController';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/', getAssets);
router.post('/', createAsset);
router.post('/depreciation-run', runDepreciation);

export default router;
