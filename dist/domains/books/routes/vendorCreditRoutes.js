"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vendorCreditController_1 = require("../../inventory/controllers/vendorCreditController");
const router = (0, express_1.Router)();
router.route('/')
    .get(vendorCreditController_1.getVendorCredits)
    .post(vendorCreditController_1.createVendorCredit);
router.route('/:id')
    .get(vendorCreditController_1.getVendorCreditById)
    .put(vendorCreditController_1.updateVendorCredit)
    .delete(vendorCreditController_1.deleteVendorCredit);
exports.default = router;
