import express from 'express';
import { 
  generateDemandForecast, 
  getReorderSuggestions, 
  smartVendorRouting,
  triggerReplenishmentPO
} from '../../inventory/controllers/aiInventoryController';

const router = express.Router({ mergeParams: true });

router.get('/', generateDemandForecast);
router.get('/demand-forecast', generateDemandForecast);
router.get('/reorder-suggestions', getReorderSuggestions);
router.post('/smart-vendor-routing', smartVendorRouting);
router.post('/replenish', triggerReplenishmentPO);

export default router;
