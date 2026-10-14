"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expenseController_1 = require("../controllers/expenseController");
const router = (0, express_1.Router)();
router.route('/')
    .get(expenseController_1.getExpenses)
    .post(expenseController_1.createExpense);
router.route('/bulk')
    .post(expenseController_1.createBulkExpenses);
router.route('/bulk/:batchId')
    .get(expenseController_1.getBulkExpenses)
    .put(expenseController_1.updateBulkExpenses);
router.route('/:id')
    .get(expenseController_1.getExpenseById)
    .put(expenseController_1.updateExpense)
    .delete(expenseController_1.deleteExpense);
exports.default = router;
