"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processGatewayPayment = exports.autoAllocateCreditNote = exports.deletePaymentReceived = exports.updatePaymentReceived = exports.getPaymentReceivedById = exports.getPaymentsReceived = exports.createPaymentReceived = void 0;
const context_1 = require("../../../context");
const PaymentReceived_1 = __importDefault(require("../models/PaymentReceived"));
const createPaymentReceived = async (req, res, next) => {
    try {
        let paymentNumber = req.body.paymentNumber;
        if (!paymentNumber) {
            let nextNum = (await PaymentReceived_1.default.countDocuments()) + 1;
            let isUnique = false;
            while (!isUnique) {
                paymentNumber = `PR-${String(nextNum).padStart(5, '0')}`;
                const exists = await PaymentReceived_1.default.findOne({ paymentNumber });
                if (exists) {
                    nextNum++;
                }
                else {
                    isUnique = true;
                }
            }
        }
        const payment = await PaymentReceived_1.default.create({ ...req.body, paymentNumber, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || req.body.companyId, createdBy: req.user?._id });
        const populated = await PaymentReceived_1.default.findById(payment._id).populate('customer').populate('invoices.invoice');
        await Promise.resolve().then(() => __importStar(require('../../../core/events/eventBus'))).then(m => m.eventBus.emitAsync(m.EVENTS.PAYMENT_RECEIVED_CREATED, { payment: populated, companyId: populated?.companyId }));
        res.status(201).json({ success: true, data: populated });
    }
    catch (error) {
        next(error);
    }
};
exports.createPaymentReceived = createPaymentReceived;
const getPaymentsReceived = async (req, res, next) => {
    try {
        const payments = await PaymentReceived_1.default.find({ companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } })
            .populate('customer')
            .populate('invoices.invoice')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: payments });
    }
    catch (error) {
        next(error);
    }
};
exports.getPaymentsReceived = getPaymentsReceived;
const getPaymentReceivedById = async (req, res, next) => {
    try {
        const payment = await PaymentReceived_1.default.findOne({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } })
            .populate('customer')
            .populate('invoices.invoice');
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment Receipt not found' });
        }
        res.status(200).json({ success: true, data: payment });
    }
    catch (error) {
        next(error);
    }
};
exports.getPaymentReceivedById = getPaymentReceivedById;
const updatePaymentReceived = async (req, res, next) => {
    try {
        const payment = await PaymentReceived_1.default.findOneAndUpdate({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
            new: true,
            runValidators: true
        }).populate('customer').populate('invoices.invoice');
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment Receipt not found' });
        }
        res.status(200).json({ success: true, data: payment });
    }
    catch (error) {
        next(error);
    }
};
exports.updatePaymentReceived = updatePaymentReceived;
const deletePaymentReceived = async (req, res, next) => {
    try {
        const payment = await PaymentReceived_1.default.findOneAndDelete({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } });
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment Receipt not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deletePaymentReceived = deletePaymentReceived;
const PaymentAllocationService_1 = require("../services/PaymentAllocationService");
const autoAllocateCreditNote = async (req, res) => {
    try {
        const result = await PaymentAllocationService_1.PaymentAllocationService.autoAllocateCreditNote(req.params.creditNoteId);
        res.status(200).json({ success: true, data: result });
    }
    catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};
exports.autoAllocateCreditNote = autoAllocateCreditNote;
const processGatewayPayment = async (req, res) => {
    try {
        const { customerId, amount, paymentMode, referenceNumber } = req.body;
        const payment = await PaymentAllocationService_1.PaymentAllocationService.processGatewayPayment(customerId, amount, paymentMode, referenceNumber);
        res.status(201).json({ success: true, data: payment });
    }
    catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};
exports.processGatewayPayment = processGatewayPayment;
