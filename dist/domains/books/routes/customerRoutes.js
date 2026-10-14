"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerController_1 = require("../../billing/controllers/customerController");
const router = (0, express_1.Router)();
router.route('/')
    .get(customerController_1.getCustomers)
    .post(customerController_1.createCustomer);
router.route('/:id')
    .get(customerController_1.getCustomerById)
    .put(customerController_1.updateCustomer);
exports.default = router;
