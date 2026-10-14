"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const invoiceController_1 = require("../../billing/controllers/invoiceController");
const router = express_1.default.Router();
router.route('/')
    .post(invoiceController_1.createInvoice)
    .get(invoiceController_1.getInvoices);
router.route('/:id')
    .get(invoiceController_1.getInvoiceById)
    .put(invoiceController_1.updateInvoice)
    .delete(invoiceController_1.deleteInvoice);
exports.default = router;
router.post('/consolidate', invoiceController_1.consolidateInvoices);
router.get('/:id/risk-analysis', invoiceController_1.analyzeRisk);
