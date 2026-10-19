"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRemittanceAdvice = exports.processDisbursement = exports.deletePaymentMade = exports.updatePaymentMade = exports.getPaymentMadeById = exports.getPaymentsMade = exports.createPaymentMade = void 0;
const context_1 = require("../../../context");
const PaymentMade_1 = __importDefault(require("../models/PaymentMade"));
const Bill_1 = __importDefault(require("../../inventory/models/Bill"));
const PostingEngine_1 = require("../services/PostingEngine");
const ApprovalWorkflowService_1 = require("../../../core/services/ApprovalWorkflowService");
const createPaymentMade = async (req, res, next) => {
    try {
        const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService_1.ApprovalWorkflowService.resolveUserContext(req);
        let paymentNumber = req.body.paymentNumber;
        if (!paymentNumber) {
            const count = await PaymentMade_1.default.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
            paymentNumber = `PMT-${String(count + 1).padStart(5, '0')}`;
        }
        const requestedStatus = req.body.status || 'Closed';
        let finalStatus = requestedStatus;
        let finalApprovalStatus = 'Approved';
        const amount = Number(req.body.amount || 0);
        const evalResult = await ApprovalWorkflowService_1.ApprovalWorkflowService.evaluateApprovalNeed(orgId, 'payments_made', amount, user, userRole);
        if (evalResult.requiresApproval) {
            finalStatus = 'Open';
            finalApprovalStatus = 'Pending';
        }
        else {
            finalStatus = 'Closed';
            finalApprovalStatus = 'Approved';
        }
        const doc = await PaymentMade_1.default.create({
            ...req.body,
            paymentNumber,
            status: finalStatus,
            approvalStatus: finalApprovalStatus,
            companyId: orgId,
            orgId,
            createdBy: userId
        });
        if (finalApprovalStatus === 'Pending') {
            await ApprovalWorkflowService_1.ApprovalWorkflowService.submitForApproval({
                orgId,
                module: 'payments_made',
                documentId: doc._id.toString(),
                documentNumber: paymentNumber,
                amount,
                customerOrVendorName: req.body.vendorName || 'Vendor',
                requestedBy: userId || 'system',
                requestedByName: user?.displayName || user?.name || user?.email,
                creatorRoleId: roleId
            });
        }
        else if (finalStatus === 'Closed') {
            // 1. Post to General Ledger
            await PostingEngine_1.PostingEngine.handleEvent('PAYMENT_MADE', {
                paymentId: doc._id.toString(),
                companyId: orgId,
                vendorId: doc.vendorId?.toString(),
                amount: doc.amount,
                paymentMode: doc.paymentMode,
                paidThrough: doc.paidThrough,
                referenceNumber: doc.referenceNumber
            });
            // 2. Reduce bill balances if linked
            if (doc.bills && Array.isArray(doc.bills)) {
                for (const b of doc.bills) {
                    if (b.billId && b.amountApplied) {
                        const billDoc = await Bill_1.default.findById(b.billId);
                        if (billDoc) {
                            const currentBalance = billDoc.balanceDue ?? billDoc.total;
                            const newBalance = Math.max(0, currentBalance - b.amountApplied);
                            billDoc.balanceDue = newBalance;
                            if (newBalance === 0) {
                                billDoc.status = 'Paid';
                            }
                            await billDoc.save();
                        }
                    }
                }
            }
        }
        const populated = await PaymentMade_1.default.findById(doc._id)
            .populate('vendorId', 'displayName companyName')
            .populate('bills.billId', 'billNumber billDate total balanceDue');
        res.status(201).json({ success: true, data: populated || doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createPaymentMade = createPaymentMade;
const getPaymentsMade = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
        const docs = await PaymentMade_1.default.find(filter)
            .populate('vendorId', 'displayName companyName')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getPaymentsMade = getPaymentsMade;
const getPaymentMadeById = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const doc = await PaymentMade_1.default.findOne(filter)
            .populate('vendorId', 'displayName email phone')
            .populate('bills.billId', 'billNumber billDate total balanceDue');
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getPaymentMadeById = getPaymentMadeById;
const updatePaymentMade = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const doc = await PaymentMade_1.default.findOneAndUpdate(filter, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updatePaymentMade = updatePaymentMade;
const deletePaymentMade = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const doc = await PaymentMade_1.default.findOneAndDelete(filter);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.deletePaymentMade = deletePaymentMade;
// @desc    Process Disbursement
const processDisbursement = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const doc = await PaymentMade_1.default.findOne(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        doc.disbursementStatus = 'Processed';
        await doc.save();
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.processDisbursement = processDisbursement;
// @desc    Send Remittance Advice
const sendRemittanceAdvice = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const doc = await PaymentMade_1.default.findOne(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        doc.remittanceAdviceSent = true;
        await doc.save();
        res.status(200).json({ success: true, data: doc, message: 'Remittance advice sent to vendor' });
    }
    catch (error) {
        next(error);
    }
};
exports.sendRemittanceAdvice = sendRemittanceAdvice;
