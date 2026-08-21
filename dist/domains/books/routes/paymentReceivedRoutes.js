"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentReceivedController_1 = require("../controllers/paymentReceivedController");
const router = express_1.default.Router();
router.route('/')
    .post(paymentReceivedController_1.createPaymentReceived)
    .get(paymentReceivedController_1.getPaymentsReceived);
router.route('/:id')
    .get(paymentReceivedController_1.getPaymentReceivedById)
    .put(paymentReceivedController_1.updatePaymentReceived)
    .delete(paymentReceivedController_1.deletePaymentReceived);
exports.default = router;
