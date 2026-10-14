"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const billController_1 = require("../../inventory/controllers/billController");
const router = (0, express_1.Router)();
router.route('/ocr').post(billController_1.processBillOCR);
router.route('/')
    .get(billController_1.getBills)
    .post(billController_1.createBill);
router.route('/:id')
    .get(billController_1.getBillById)
    .put(billController_1.updateBill)
    .delete(billController_1.deleteBill);
exports.default = router;
