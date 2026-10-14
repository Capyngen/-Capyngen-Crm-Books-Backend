"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customerPortalController_1 = require("../../billing/controllers/customerPortalController");
const router = express_1.default.Router();
// NOTE: In production, these endpoints (except getSecurePortalLink) would be authenticated via the secure token middleware
router.get('/:customerId/secure-link', customerPortalController_1.getSecurePortalLink);
router.get('/:customerId/statement', customerPortalController_1.getStatementOfAccount);
router.get('/:customerId/invoices', customerPortalController_1.getOpenInvoices);
exports.default = router;
