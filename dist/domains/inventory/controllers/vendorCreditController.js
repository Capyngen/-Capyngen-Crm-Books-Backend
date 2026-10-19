"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVendorCredit = exports.updateVendorCredit = exports.getVendorCreditById = exports.getVendorCredits = exports.createVendorCredit = void 0;
const context_1 = require("../../../context");
const PostingEngine_1 = require("../../books/services/PostingEngine");
const VendorCredit_1 = __importDefault(require("../models/VendorCredit"));
const ApprovalWorkflowService_1 = require("../../../core/services/ApprovalWorkflowService");
const createVendorCredit = async (req, res, next) => {
    try {
        const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService_1.ApprovalWorkflowService.resolveUserContext(req);
        let vendorCreditNumber = req.body.vendorCreditNumber;
        if (!vendorCreditNumber) {
            const count = await VendorCredit_1.default.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
            vendorCreditNumber = `DN-${String(count + 1).padStart(5, '0')}`;
        }
        const requestedStatus = req.body.status || 'Open';
        let finalStatus = requestedStatus;
        let finalApprovalStatus = 'Approved';
        const total = Number(req.body.totalAmount || req.body.total || 0);
        if (requestedStatus === 'Draft') {
            finalStatus = 'Draft';
            finalApprovalStatus = 'Draft';
        }
        else {
            const evalResult = await ApprovalWorkflowService_1.ApprovalWorkflowService.evaluateApprovalNeed(orgId, 'vendor_credits', total, user, userRole);
            if (evalResult.requiresApproval) {
                finalStatus = 'Draft';
                finalApprovalStatus = 'Pending';
            }
            else {
                finalStatus = 'Open';
                finalApprovalStatus = 'Approved';
            }
        }
        const vc = await VendorCredit_1.default.create({
            ...req.body,
            vendorCreditNumber,
            totalAmount: total,
            status: finalStatus,
            approvalStatus: finalApprovalStatus,
            companyId: orgId,
            orgId,
            createdBy: userId
        });
        if (finalApprovalStatus === 'Pending') {
            await ApprovalWorkflowService_1.ApprovalWorkflowService.submitForApproval({
                orgId,
                module: 'vendor_credits',
                documentId: vc._id.toString(),
                documentNumber: vendorCreditNumber,
                amount: total,
                customerOrVendorName: req.body.vendorName || 'Vendor',
                requestedBy: userId || 'system',
                requestedByName: user?.displayName || user?.name || user?.email,
                creatorRoleId: roleId
            });
        }
        else if (finalStatus !== 'Draft') {
            const payload = {
                creditId: vc._id.toString(),
                companyId: orgId,
                vendorId: vc.vendorId?.toString(),
                total
            };
            await PostingEngine_1.PostingEngine.handleEvent('VENDOR_CREDIT_APPROVED', payload);
        }
        const populated = await VendorCredit_1.default.findById(vc._id).populate('vendorId', 'displayName companyName');
        res.status(201).json({ success: true, data: populated || vc });
    }
    catch (error) {
        next(error);
    }
};
exports.createVendorCredit = createVendorCredit;
const getVendorCredits = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
        const docs = await VendorCredit_1.default.find(filter)
            .populate('vendorId', 'displayName companyName')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        next(error);
    }
};
exports.getVendorCredits = getVendorCredits;
const getVendorCreditById = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const doc = await VendorCredit_1.default.findOne(filter)
            .populate('vendorId', 'displayName companyName');
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Vendor Credit not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.getVendorCreditById = getVendorCreditById;
const updateVendorCredit = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const doc = await VendorCredit_1.default.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Vendor Credit not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.updateVendorCredit = updateVendorCredit;
const deleteVendorCredit = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const doc = await VendorCredit_1.default.findOneAndDelete(filter);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Vendor Credit not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteVendorCredit = deleteVendorCredit;
