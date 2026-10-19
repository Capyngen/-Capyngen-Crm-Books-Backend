"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToReceive = exports.convertToBill = exports.approvePOManager = exports.requestPOApproval = exports.deletePurchaseOrder = exports.updatePurchaseOrder = exports.getPurchaseOrderById = exports.getPurchaseOrders = exports.createPurchaseOrder = void 0;
const context_1 = require("../../../context");
const mongoose_1 = __importDefault(require("mongoose"));
const PurchaseOrder_1 = __importDefault(require("../models/PurchaseOrder"));
const Bill_1 = __importDefault(require("../models/Bill"));
const ApprovalWorkflowService_1 = require("../../../core/services/ApprovalWorkflowService");
const createPurchaseOrder = async (req, res, next) => {
    try {
        const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService_1.ApprovalWorkflowService.resolveUserContext(req);
        const requestedStatus = req.body.status || 'Issued';
        let finalStatus = requestedStatus;
        let finalApprovalStatus = 'Approved';
        if (requestedStatus === 'Draft') {
            finalStatus = 'Draft';
            finalApprovalStatus = 'Draft';
        }
        else {
            const evalResult = await ApprovalWorkflowService_1.ApprovalWorkflowService.evaluateApprovalNeed(orgId, 'purchase_orders', Number(req.body.total || 0), user, userRole);
            if (evalResult.requiresApproval) {
                finalStatus = 'Draft';
                finalApprovalStatus = 'Pending';
            }
            else {
                finalStatus = 'Issued';
                finalApprovalStatus = 'Approved';
            }
        }
        const doc = await PurchaseOrder_1.default.create({
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
                module: 'purchase_orders',
                documentId: doc._id.toString(),
                documentNumber: doc.purchaseOrderNumber,
                amount: Number(req.body.total || 0),
                customerOrVendorName: req.body.vendorName || 'Vendor',
                requestedBy: userId || 'system',
                requestedByName: user?.displayName || user?.name || user?.email,
                creatorRoleId: roleId
            });
        }
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createPurchaseOrder = createPurchaseOrder;
const getPurchaseOrders = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
        const docs = await PurchaseOrder_1.default.find(filter)
            .populate('vendorId', 'displayName companyName')
            .populate('customerId', 'displayName')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getPurchaseOrders = getPurchaseOrders;
const getPurchaseOrderById = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const doc = await PurchaseOrder_1.default.findOne(filter)
            .populate('vendorId', 'displayName')
            .populate('customerId', 'displayName');
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Purchase Order not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getPurchaseOrderById = getPurchaseOrderById;
const updatePurchaseOrder = async (req, res, next) => {
    try {
        const doc = await PurchaseOrder_1.default.findOneAndUpdate({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Purchase Order not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updatePurchaseOrder = updatePurchaseOrder;
const deletePurchaseOrder = async (req, res, next) => {
    try {
        const doc = await PurchaseOrder_1.default.findOneAndDelete({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Purchase Order not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.deletePurchaseOrder = deletePurchaseOrder;
const PurchaseOrderApprovalService_1 = require("../services/PurchaseOrderApprovalService");
const requestPOApproval = async (req, res) => {
    try {
        const po = await PurchaseOrderApprovalService_1.PurchaseOrderApprovalService.requestApproval(req.params.id, 'system-user');
        res.status(200).json({ success: true, data: po });
    }
    catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};
exports.requestPOApproval = requestPOApproval;
const approvePOManager = async (req, res) => {
    try {
        const po = await PurchaseOrderApprovalService_1.PurchaseOrderApprovalService.approveByManager(req.params.id, 'manager-user');
        res.status(200).json({ success: true, data: po });
    }
    catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};
exports.approvePOManager = approvePOManager;
const convertToBill = async (req, res, next) => {
    try {
        const po = await PurchaseOrder_1.default.findById(req.params.id);
        if (!po) {
            return res.status(404).json({ success: false, message: 'Purchase Order not found' });
        }
        const orgId = po.companyId || po.orgId || req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const count = await Bill_1.default.countDocuments({ $or: [{ companyId: orgId }, { orgId }] });
        const billNumber = `BILL-${String(count + 1).padStart(5, '0')}`;
        const newBill = await Bill_1.default.create({
            orgId,
            companyId: orgId,
            vendorId: po.vendorId,
            billNumber,
            orderNumber: po.poNumber,
            purchaseOrderId: po._id,
            billDate: new Date(),
            dueDate: po.deliveryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            accountsPayable: 'Accounts Payable',
            lineItems: po.lineItems.map((item) => ({
                itemId: item.itemId,
                account: item.account || 'Cost of Goods Sold',
                quantity: item.quantity,
                rate: item.rate,
                discount: 0,
                amount: item.amount
            })),
            subTotal: po.subTotal,
            discount: po.discount || 0,
            discountType: po.discountType || 'amount',
            taxWithheldType: po.taxWithheldType || 'none',
            taxWithheldAmount: po.taxWithheldAmount || 0,
            adjustment: po.adjustment || 0,
            totalAmount: po.totalAmount,
            balanceDue: po.totalAmount,
            status: 'Open',
            approvalStatus: 'Approved',
            createdBy: req.user?._id || 'system'
        });
        po.status = 'Billed';
        await po.save();
        res.status(201).json({
            success: true,
            message: 'Purchase Order successfully converted to Bill',
            data: newBill
        });
    }
    catch (error) {
        next(error);
    }
};
exports.convertToBill = convertToBill;
const convertToReceive = async (req, res, next) => {
    try {
        const po = await PurchaseOrder_1.default.findById(req.params.id);
        if (!po) {
            return res.status(404).json({ success: false, message: 'Purchase Order not found' });
        }
        // Increment physical warehouse stock for line items
        const Item = mongoose_1.default.models.BooksItem || mongoose_1.default.models.Item;
        if (Item) {
            for (const line of po.lineItems) {
                if (line.itemId) {
                    await Item.findByIdAndUpdate(line.itemId, {
                        $inc: { stockOnHand: line.quantity }
                    });
                }
            }
        }
        po.status = 'Billed'; // Or mark as Issued/Received
        await po.save();
        res.status(200).json({
            success: true,
            message: 'Items received into inventory warehouse stock successfully',
            data: po
        });
    }
    catch (error) {
        next(error);
    }
};
exports.convertToReceive = convertToReceive;
