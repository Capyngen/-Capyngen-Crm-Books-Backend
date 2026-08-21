"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recurringExpenseController_1 = require("../controllers/recurringExpenseController");
const router = (0, express_1.Router)();
router.route('/')
    .get(recurringExpenseController_1.getRecurringExpenses)
    .post(recurringExpenseController_1.createRecurringExpense);
router.route('/:id')
    .get(recurringExpenseController_1.getRecurringExpenseById)
    .put(recurringExpenseController_1.updateRecurringExpense)
    .delete(recurringExpenseController_1.deleteRecurringExpense);
exports.default = router;
