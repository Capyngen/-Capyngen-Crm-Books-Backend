import express from 'express';
import { generateDemandForecast, getReorderSuggestions, smartVendorRouting } from '../../inventory/controllers/aiInventoryController';

const router = express.Router({ mergeParams: true });

router.get('/demand-forecast', generateDemandForecast);
router.get('/reorder-suggestions', getReorderSuggestions);
router.post('/smart-vendor-routing', smartVendorRouting);

export default router;
