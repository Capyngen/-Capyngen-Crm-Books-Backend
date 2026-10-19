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
const Invoice_1 = __importDefault(require("../models/Invoice"));
const PostingEngine_1 = require("../../books/services/PostingEngine");
const ApprovalWorkflowService_1 = require("../../../core/services/ApprovalWorkflowService");
const createPaymentReceived = async (req, res, next) => {
    try {
        const { orgId, user, userId } = await ApprovalWorkflowService_1.ApprovalWorkflowService.resolveUserContext(req);
        let paymentNumber = req.body.paymentNumber;
        if (!paymentNumber) {
            const count = await PaymentReceived_1.default.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
            paymentNumber = `PR-${String(count + 1).padStart(5, '0')}`;
        }
        const payment = await PaymentReceived_1.default.create({
            ...req.body,
            paymentNumber,
            companyId: orgId,
            orgId,
            createdBy: userId
        });
        // 1. General Ledger Double-Entry Posting
        try {
            await PostingEngine_1.PostingEngine.handleEvent('PAYMENT_RECEIVED', {
                paymentId: payment._id.toString(),
                companyId: orgId,
                customerId: payment.customer?.toString(),
                amount: payment.amount,
                paymentMode: payment.paymentMode,
                depositToAccountId: payment.depositTo
            });
        }
        catch (glErr) {
            console.error('Failed to post payment received to GL:', glErr);
        }
        // 2. Realize Invoice Balances & Status transitions
        if (payment.invoices && Array.isArray(payment.invoices)) {
            for (const invEntry of payment.invoices) {
                const invId = invEntry.invoice || invEntry.invoiceId;
                const amountPaid = Number(invEntry.amountApplied || invEntry.amount || 0);
                if (invId && amountPaid > 0) {
                    const inv = await Invoice_1.default.findById(invId);
                    if (inv) {
                        const currentBal = inv.balanceDue ?? inv.total;
                        const newBal = Math.max(0, currentBal - amountPaid);
                        inv.balanceDue = newBal;
                        if (newBal === 0) {
                            inv.status = 'Paid';
                        }
                        else {
                            inv.status = 'PartiallyPaid';
                        }
                        await inv.save();
                    }
                }
            }
        }
        const populated = await PaymentReceived_1.default.findById(payment._id).populate('customer').populate('invoices.invoice');
        try {
            await Promise.resolve().then(() => __importStar(require('../../../core/events/eventBus'))).then(m => m.eventBus.emitAsync(m.EVENTS.PAYMENT_RECEIVED_CREATED, { payment: populated, companyId: orgId }));
        }
        catch (e) { }
        res.status(201).json({ success: true, data: populated || payment });
    }
    catch (error) {
        next(error);
    }
};
exports.createPaymentReceived = createPaymentReceived;
const getPaymentsReceived = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
        const payments = await PaymentReceived_1.default.find(filter)
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
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const payment = await PaymentReceived_1.default.findOne(filter)
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
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const payment = await PaymentReceived_1.default.findOneAndUpdate(filter, req.body, {
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
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const payment = await PaymentReceived_1.default.findOneAndDelete(filter);
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
