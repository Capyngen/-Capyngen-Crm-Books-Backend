"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveTransferOrder = exports.dispatchTransferOrder = exports.deleteTransferOrder = exports.updateTransferOrder = exports.createTransferOrder = exports.getTransferOrderById = exports.getTransferOrders = void 0;
const TransferOrder_1 = __importDefault(require("../models/TransferOrder"));
const Item_1 = __importDefault(require("../models/Item"));
const PostingEngine_1 = require("../../books/services/PostingEngine");
const context_1 = require("../../../context");
const ApprovalWorkflowService_1 = require("../../../core/services/ApprovalWorkflowService");
const tenantFilter_1 = require("../../../core/utils/tenantFilter");
const getTransferOrders = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const docs = await TransferOrder_1.default.find(tenantFilter)
            .populate('fromWarehouse', 'name code')
            .populate('toWarehouse', 'name code')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        next(error);
    }
};
exports.getTransferOrders = getTransferOrders;
const getTransferOrderById = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = Object.keys(tenantFilter).length > 0
            ? { _id: req.params.id, ...tenantFilter }
            : { _id: req.params.id };
        const doc = await TransferOrder_1.default.findOne(filter)
            .populate('fromWarehouse', 'name code')
            .populate('toWarehouse', 'name code');
        if (!doc)
            return res.status(404).json({ success: false, message: 'Transfer Order not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.getTransferOrderById = getTransferOrderById;
const createTransferOrder = async (req, res, next) => {
    try {
        const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService_1.ApprovalWorkflowService.resolveUserContext(req);
        let transferNumber = req.body.transferNumber;
        if (!transferNumber) {
            const count = await TransferOrder_1.default.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
            transferNumber = `TO-${String(count + 1).padStart(5, '0')}`;
        }
        const requestedStatus = req.body.status || 'In Transit';
        let finalStatus = requestedStatus;
        let finalApprovalStatus = 'Approved';
        if (requestedStatus === 'Draft') {
            finalStatus = 'Draft';
            finalApprovalStatus = 'Draft';
        }
        else {
            const evalResult = await ApprovalWorkflowService_1.ApprovalWorkflowService.evaluateApprovalNeed(orgId, 'transfer_orders', 0, user, userRole);
            if (evalResult.requiresApproval) {
                finalStatus = 'Draft';
                finalApprovalStatus = 'Pending';
            }
            else {
                finalStatus = 'In Transit';
                finalApprovalStatus = 'Approved';
            }
        }
        const doc = await TransferOrder_1.default.create({
            ...req.body,
            transferNumber,
            status: finalStatus,
            approvalStatus: finalApprovalStatus,
            companyId: orgId,
            orgId,
            createdBy: userId
        });
        if (finalApprovalStatus === 'Pending') {
            await ApprovalWorkflowService_1.ApprovalWorkflowService.submitForApproval({
                orgId,
                module: 'transfer_orders',
                documentId: doc._id.toString(),
                documentNumber: transferNumber,
                amount: 0,
                customerOrVendorName: 'Inter-Warehouse Transfer',
                requestedBy: userId || 'system',
                requestedByName: user?.displayName || user?.name || user?.email,
                creatorRoleId: roleId
            });
        }
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.createTransferOrder = createTransferOrder;
const updateTransferOrder = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const doc = await TransferOrder_1.default.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
        if (!doc)
            return res.status(404).json({ success: false, message: 'Transfer Order not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTransferOrder = updateTransferOrder;
const deleteTransferOrder = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const doc = await TransferOrder_1.default.findOneAndDelete(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Transfer Order not found' });
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTransferOrder = deleteTransferOrder;
const dispatchTransferOrder = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const order = await TransferOrder_1.default.findOne(filter);
        if (!order)
            return res.status(404).json({ success: false, message: 'Transfer Order not found' });
        if (order.status === 'In Transit' || order.status === 'Received') {
            return res.status(400).json({ success: false, message: `Transfer Order is already ${order.status}` });
        }
        const fromWhId = order.fromWarehouse.toString();
        // 1. Verify and deduct stock from source warehouse
        for (const line of order.items) {
            const item = await Item_1.default.findById(line.item);
            if (!item)
                continue;
            if (!item.warehouseStock)
                item.warehouseStock = [];
            let whStock = item.warehouseStock.find((ws) => ws.warehouse?.toString() === fromWhId);
            if (!whStock) {
                whStock = {
                    warehouse: order.fromWarehouse,
                    bin: line.fromBin || '',
                    stockOnHand: item.stock || 0,
                    committedStock: 0,
                    availableStock: item.stock || 0
                };
                item.warehouseStock.push(whStock);
            }
            if (whStock.stockOnHand < line.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock at source warehouse for "${item.name}". Available: ${whStock.stockOnHand}, Requested: ${line.quantity}`
                });
            }
            whStock.stockOnHand -= line.quantity;
            whStock.availableStock = Math.max(0, whStock.stockOnHand - whStock.committedStock);
            // Handle Serial Numbers if any
            if (line.serialNumbers && line.serialNumbers.length > 0 && item.serialNumbers) {
                for (const sn of line.serialNumbers) {
                    const match = item.serialNumbers.find((s) => s.serialNo === sn);
                    if (match) {
                        match.status = 'Committed';
                        match.warehouse = 'In-Transit';
                    }
                }
            }
            // Handle Batches if any
            if (line.batchNo && item.batches) {
                const batch = item.batches.find((b) => b.batchNo === line.batchNo && b.warehouse === fromWhId);
                if (batch) {
                    batch.quantity = Math.max(0, batch.quantity - line.quantity);
                }
            }
            await item.save();
        }
        order.status = 'In Transit';
        order.dispatchDate = new Date();
        order.dispatchedBy = req.user?._id?.toString() || req.user?.displayName || 'User';
        if (req.body.carrier)
            order.carrier = req.body.carrier;
        if (req.body.trackingNumber)
            order.trackingNumber = req.body.trackingNumber;
        await order.save();
        // Trigger GL Posting
        try {
            await PostingEngine_1.PostingEngine.handleEvent('STOCK_TRANSFER_DISPATCHED', {
                transferOrderId: order._id.toString(),
                companyId: orgId
            });
        }
        catch (e) {
            console.error('Failed to post stock transfer dispatch to GL:', e);
        }
        res.status(200).json({ success: true, data: order, message: 'Transfer Order dispatched successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.dispatchTransferOrder = dispatchTransferOrder;
const receiveTransferOrder = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const order = await TransferOrder_1.default.findOne(filter);
        if (!order)
            return res.status(404).json({ success: false, message: 'Transfer Order not found' });
        if (order.status !== 'In Transit') {
            return res.status(400).json({ success: false, message: 'Only In-Transit transfer orders can be received' });
        }
        const toWhId = order.toWarehouse.toString();
        // Increment stock at destination warehouse
        for (const line of order.items) {
            const item = await Item_1.default.findById(line.item);
            if (!item)
                continue;
            if (!item.warehouseStock)
                item.warehouseStock = [];
            let whStock = item.warehouseStock.find((ws) => ws.warehouse?.toString() === toWhId);
            if (!whStock) {
                whStock = {
                    warehouse: order.toWarehouse,
                    bin: line.toBin || '',
                    stockOnHand: 0,
                    committedStock: 0,
                    availableStock: 0
                };
                item.warehouseStock.push(whStock);
            }
            whStock.stockOnHand += line.quantity;
            whStock.availableStock = Math.max(0, whStock.stockOnHand - whStock.committedStock);
            if (line.toBin)
                whStock.bin = line.toBin;
            // Handle Serial Numbers
            if (line.serialNumbers && line.serialNumbers.length > 0 && item.serialNumbers) {
                for (const sn of line.serialNumbers) {
                    const match = item.serialNumbers.find((s) => s.serialNo === sn);
                    if (match) {
                        match.status = 'Available';
                        match.warehouse = toWhId;
                        if (line.toBin)
                            match.bin = line.toBin;
                    }
                }
            }
            // Handle Batches
            if (line.batchNo && item.batches) {
                const destBatch = item.batches.find((b) => b.batchNo === line.batchNo && b.warehouse === toWhId);
                if (destBatch) {
                    destBatch.quantity += line.quantity;
                    if (line.toBin)
                        destBatch.bin = line.toBin;
                }
                else {
                    item.batches.push({
                        batchNo: line.batchNo,
                        quantity: line.quantity,
                        warehouse: toWhId,
                        bin: line.toBin || '',
                        status: 'Active'
                    });
                }
            }
            await item.save();
        }
        order.status = 'Received';
        order.receivedDate = new Date();
        order.receivedBy = req.user?._id?.toString() || req.user?.displayName || 'User';
        await order.save();
        // Trigger GL Posting
        try {
            await PostingEngine_1.PostingEngine.handleEvent('STOCK_TRANSFER_RECEIVED', {
                transferOrderId: order._id.toString(),
                companyId: orgId
            });
        }
        catch (e) {
            console.error('Failed to post stock transfer receipt to GL:', e);
        }
        res.status(200).json({ success: true, data: order, message: 'Transfer Order received successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.receiveTransferOrder = receiveTransferOrder;
