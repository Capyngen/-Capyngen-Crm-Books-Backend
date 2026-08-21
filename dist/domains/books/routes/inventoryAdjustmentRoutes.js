"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventoryAdjustmentController_1 = require("../controllers/inventoryAdjustmentController");
const router = (0, express_1.Router)();
router.route('/')
    .get(inventoryAdjustmentController_1.getAdjustments)
    .post(inventoryAdjustmentController_1.createAdjustment);
router.route('/:id')
    .get(inventoryAdjustmentController_1.getAdjustmentById)
    .put(inventoryAdjustmentController_1.updateAdjustment);
exports.default = router;
