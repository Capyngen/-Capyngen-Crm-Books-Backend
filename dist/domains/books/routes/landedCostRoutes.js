"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const landedCostController_1 = require("../../inventory/controllers/landedCostController");
const router = express_1.default.Router({ mergeParams: true });
router.route('/')
    .get(landedCostController_1.getLandedCosts)
    .post(landedCostController_1.createLandedCost);
router.route('/:id')
    .get(landedCostController_1.getLandedCostById)
    .delete(landedCostController_1.deleteLandedCost);
router.post('/:id/apply', landedCostController_1.applyLandedCost);
exports.default = router;
