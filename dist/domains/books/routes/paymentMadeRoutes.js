"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentMadeController_1 = require("../controllers/paymentMadeController");
const router = (0, express_1.Router)();
router.route('/')
    .get(paymentMadeController_1.getPaymentsMade)
    .post(paymentMadeController_1.createPaymentMade);
router.route('/:id/disburse').post(paymentMadeController_1.processDisbursement);
router.route('/:id/remittance').post(paymentMadeController_1.sendRemittanceAdvice);
router.route('/:id')
    .get(paymentMadeController_1.getPaymentMadeById)
    .put(paymentMadeController_1.updatePaymentMade)
    .delete(paymentMadeController_1.deletePaymentMade);
exports.default = router;
