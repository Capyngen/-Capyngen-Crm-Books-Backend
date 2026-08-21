"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vendorController_1 = require("../controllers/vendorController");
const router = (0, express_1.Router)();
router.route('/')
    .get(vendorController_1.getVendors)
    .post(vendorController_1.createVendor);
router.route('/:id')
    .get(vendorController_1.getVendorById)
    .put(vendorController_1.updateVendor);
exports.default = router;
