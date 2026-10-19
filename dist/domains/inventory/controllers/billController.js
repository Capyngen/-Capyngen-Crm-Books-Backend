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
exports.processBillOCR = exports.deleteBill = exports.updateBill = exports.getBillById = exports.getBills = exports.createBill = void 0;
const context_1 = require("../../../context");
const PostingEngine_1 = require("../../books/services/PostingEngine");
const mongoose_1 = __importDefault(require("mongoose"));
const Bill_1 = __importDefault(require("../models/Bill"));
const ApprovalWorkflowService_1 = require("../../../core/services/ApprovalWorkflowService");
const UserOrganization_1 = require("../../core/models/UserOrganization");
const createBill = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId || req.body.companyId || 'SYSTEM';
        const user = req.user;
        const userId = user?._id?.toString() || user?.id || context_1.requestContext.getStore()?.userId;
        let userRole = null;
        let roleId = context_1.requestContext.getStore()?.roleId;
        if (orgId && (userId || user?.email)) {
            const conditions = [];
            if (userId) {
                if (mongoose_1.default.isValidObjectId(userId))
                    conditions.push({ userId: new mongoose_1.default.Types.ObjectId(userId) });
                conditions.push({ userId: userId.toString() });
            }
            if (user?.email) {
                conditions.push({ email: user.email.toLowerCase() });
            }
            const userOrg = await UserOrganization_1.UserOrganization.findOne({ orgId, $or: conditions }).populate('roleId').lean();
            if (userOrg?.roleId) {
                userRole = userOrg.roleId;
                roleId = userOrg.roleId._id?.toString();
            }
        }
        const requestedStatus = req.body.status || 'Open';
        let finalStatus = requestedStatus;
        let finalApprovalStatus = 'Approved';
        const billAmount = Number(req.body.totalAmount || req.body.total || 0);
        if (requestedStatus === 'Draft') {
            finalStatus = 'Draft';
            finalApprovalStatus = 'Draft';
        }
        else {
            const evalResult = await ApprovalWorkflowService_1.ApprovalWorkflowService.evaluateApprovalNeed(orgId, 'bills', billAmount, user, userRole);
            if (evalResult.requiresApproval) {
                finalStatus = 'Pending Approval';
                finalApprovalStatus = 'Pending';
            }
        }
        const doc = await Bill_1.default.create({
            ...req.body,
            status: finalStatus,
            approvalStatus: finalApprovalStatus,
            companyId: orgId,
            orgId,
            createdBy: userId
        });
        if (finalApprovalStatus === 'Pending') {
            await ApprovalWorkflowService_1.ApprovalWorkflowService.submitForApproval({
                orgId,
                module: 'bills',
                documentId: doc._id.toString(),
                documentNumber: doc.billNumber,
                amount: billAmount,
                customerOrVendorName: req.body.vendorName,
                requestedBy: userId || 'system',
                requestedByName: user?.displayName || user?.name || user?.email,
                creatorRoleId: roleId
            });
        }
        else if (doc.status !== 'Draft') {
            await doc.populate('items.item');
            try {
                await Promise.resolve().then(() => __importStar(require('../../../core/events/eventBus'))).then(m => m.eventBus.emitAsync(m.EVENTS.BILL_CREATED, { bill: doc, companyId: doc.companyId }));
            }
            catch (eventErr) {
                console.warn('Bill eventBus error:', eventErr);
            }
            const payload = {
                billId: doc._id.toString(),
                companyId: orgId,
                vendorId: doc.vendorId?.toString(),
                subTotal: doc.subTotal || 0,
                taxTotal: doc.taxTotal || 0,
                grandTotal: doc.total || 0,
                billDate: doc.billDate,
                billNumber: doc.billNumber
            };
            try {
                await PostingEngine_1.PostingEngine.handleEvent('BILL_APPROVED', payload);
            }
            catch (postErr) {
                console.error('Failed to post bill to GL:', postErr);
            }
        }
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createBill = createBill;
const getBills = async (req, res, next) => {
    try {
        const orgId = req.org?._id || context_1.requestContext.getStore()?.orgId;
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
        if (req.query.status) {
            filter.status = req.query.status;
        }
        const docs = await Bill_1.default.find(filter)
            .populate('vendorId', 'displayName companyName')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getBills = getBills;
const getBillById = async (req, res, next) => {
    try {
        const orgId = req.org?._id || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const doc = await Bill_1.default.findOne(filter)
            .populate('vendorId', 'displayName')
            .populate('lineItems.itemId', 'name')
            .populate('lineItems.customerId', 'displayName');
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getBillById = getBillById;
const updateBill = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const user = req.user;
        const userId = user?._id?.toString() || user?.id || context_1.requestContext.getStore()?.userId;
        if (req.body.status === 'Pending Approval' || req.body.approvalStatus === 'Pending') {
            const originalBill = await Bill_1.default.findById(req.params.id);
            let roleId = context_1.requestContext.getStore()?.roleId;
            await ApprovalWorkflowService_1.ApprovalWorkflowService.submitForApproval({
                orgId,
                module: 'bills',
                documentId: req.params.id,
                documentNumber: req.body.billNumber || originalBill?.billNumber,
                amount: Number(req.body.totalAmount ?? originalBill?.totalAmount ?? 0),
                customerOrVendorName: req.body.vendorName,
                requestedBy: userId || 'system',
                requestedByName: user?.displayName || user?.name || user?.email,
                creatorRoleId: roleId
            });
            req.body.status = 'Pending Approval';
            req.body.approvalStatus = 'Pending';
        }
        const doc = await Bill_1.default.findOneAndUpdate({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateBill = updateBill;
const deleteBill = async (req, res, next) => {
    try {
        const doc = await Bill_1.default.findOneAndDelete({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.deleteBill = deleteBill;
// @desc    Process Bill OCR
// @route   POST /api/v1/books/purchases/bills/ocr
const processBillOCR = async (req, res, next) => {
    try {
        const mockOCRData = {
            vendorName: 'Acme Corp',
            billNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
            billDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: 1500.00,
            lineItems: [
                { name: 'Scanned Item 1', quantity: 10, rate: 100, amount: 1000 },
                { name: 'Scanned Item 2', quantity: 5, rate: 100, amount: 500 }
            ]
        };
        res.status(200).json({ success: true, data: mockOCRData });
    }
    catch (error) {
        next(error);
    }
};
exports.processBillOCR = processBillOCR;
