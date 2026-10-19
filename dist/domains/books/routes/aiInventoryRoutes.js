"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aiInventoryController_1 = require("../../inventory/controllers/aiInventoryController");
const router = express_1.default.Router({ mergeParams: true });
router.get('/demand-forecast', aiInventoryController_1.generateDemandForecast);
router.get('/reorder-suggestions', aiInventoryController_1.getReorderSuggestions);
router.post('/smart-vendor-routing', aiInventoryController_1.smartVendorRouting);
router.post('/replenish', aiInventoryController_1.triggerReplenishmentPO);
exports.default = router;
