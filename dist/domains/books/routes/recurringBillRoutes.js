"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recurringBillController_1 = require("../controllers/recurringBillController");
const router = (0, express_1.Router)();
router.route('/')
    .get(recurringBillController_1.getRecurringBills)
    .post(recurringBillController_1.createRecurringBill);
router.route('/:id')
    .get(recurringBillController_1.getRecurringBillById)
    .put(recurringBillController_1.updateRecurringBill)
    .delete(recurringBillController_1.deleteRecurringBill);
exports.default = router;
