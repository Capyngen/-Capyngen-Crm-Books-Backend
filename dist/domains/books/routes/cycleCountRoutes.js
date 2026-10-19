"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cycleCountController_1 = require("../../inventory/controllers/cycleCountController");
const router = express_1.default.Router({ mergeParams: true });
router.route('/')
    .get(cycleCountController_1.getCycleCounts)
    .post(cycleCountController_1.createCycleCount);
router.route('/:id')
    .get(cycleCountController_1.getCycleCountById);
router.post('/:id/submit', cycleCountController_1.submitCountResults);
router.post('/:id/reconcile', cycleCountController_1.reconcileCycleCount);
exports.default = router;
