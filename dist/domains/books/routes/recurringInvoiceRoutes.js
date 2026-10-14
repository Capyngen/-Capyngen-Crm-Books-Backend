"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const recurringInvoiceController_1 = require("../../billing/controllers/recurringInvoiceController");
const router = express_1.default.Router();
router.route('/')
    .post(recurringInvoiceController_1.createRecurringInvoice)
    .get(recurringInvoiceController_1.getRecurringInvoices);
router.route('/:id')
    .get(recurringInvoiceController_1.getRecurringInvoiceById)
    .put(recurringInvoiceController_1.updateRecurringInvoice)
    .delete(recurringInvoiceController_1.deleteRecurringInvoice);
exports.default = router;
