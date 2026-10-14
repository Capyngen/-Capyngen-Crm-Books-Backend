"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const currencyAdjustmentController_1 = require("../controllers/currencyAdjustmentController");
const router = express_1.default.Router();
router.get('/', currencyAdjustmentController_1.getCurrencyAdjustments);
router.get('/:id', currencyAdjustmentController_1.getCurrencyAdjustmentById);
router.post('/', currencyAdjustmentController_1.createCurrencyAdjustment);
router.put('/:id', currencyAdjustmentController_1.updateCurrencyAdjustment);
router.delete('/:id', currencyAdjustmentController_1.deleteCurrencyAdjustment);
exports.default = router;
