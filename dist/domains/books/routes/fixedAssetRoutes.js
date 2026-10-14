"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fixedAssetController_1 = require("../controllers/fixedAssetController");
const router = express_1.default.Router();
router.get('/categories', fixedAssetController_1.getCategories);
router.get('/', fixedAssetController_1.getAssets);
router.post('/', fixedAssetController_1.createAsset);
router.post('/depreciation-run', fixedAssetController_1.runDepreciation);
exports.default = router;
