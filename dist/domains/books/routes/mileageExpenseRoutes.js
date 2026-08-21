"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mileageExpenseController_1 = require("../controllers/mileageExpenseController");
const router = (0, express_1.Router)();
router.route('/')
    .get(mileageExpenseController_1.getMileageExpenses)
    .post(mileageExpenseController_1.createMileageExpense);
router.route('/:id')
    .get(mileageExpenseController_1.getMileageExpenseById)
    .put(mileageExpenseController_1.updateMileageExpense)
    .delete(mileageExpenseController_1.deleteMileageExpense);
exports.default = router;
