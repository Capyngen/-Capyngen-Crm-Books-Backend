"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdjustment = exports.updateAdjustment = exports.getAdjustmentById = exports.getAdjustments = exports.createAdjustment = void 0;
const context_1 = require("../../../context");
const InventoryAdjustment_1 = __importDefault(require("../models/InventoryAdjustment"));
const Item_1 = __importDefault(require("../models/Item"));
const PostingEngine_1 = require("../../books/services/PostingEngine");
const ApprovalWorkflowService_1 = require("../../../core/services/ApprovalWorkflowService");
// @desc    Create new inventory adjustment
// @route   POST /api/v1/books/inventory-adjustments
const createAdjustment = async (req, res, next) => {
    try {
        const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService_1.ApprovalWorkflowService.resolveUserContext(req);
        let referenceNumber = req.body.referenceNumber;
        if (!referenceNumber) {
            const count = await InventoryAdjustment_1.default.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
            referenceNumber = `ADJ-${String(count + 1).padStart(5, '0')}`;
        }
        const requestedStatus = req.body.status || 'Adjusted';
        let finalStatus = requestedStatus;
        let finalApprovalStatus = 'Approved';
        // Calculate estimated total value
        let totalValue = 0;
        if (req.body.items && Array.isArray(req.body.items)) {
            for (const itm of req.body.items) {
                totalValue += Math.abs(Number(itm.valueAdjusted || (itm.quantityAdjusted || 0) * (itm.costPrice || 0)));
            }
        }
        if (requestedStatus === 'Draft') {
            finalStatus = 'Draft';
            finalApprovalStatus = 'Draft';
        }
        else {
            const evalResult = await ApprovalWorkflowService_1.ApprovalWorkflowService.evaluateApprovalNeed(orgId, 'inventory_adjustments', totalValue, user, userRole);
            if (evalResult.requiresApproval) {
                finalStatus = 'Draft';
                finalApprovalStatus = 'Pending';
            }
            else {
                finalStatus = 'Adjusted';
                finalApprovalStatus = 'Approved';
            }
        }
        const adjustment = await InventoryAdjustment_1.default.create({
            ...req.body,
            referenceNumber,
            status: finalStatus,
            approvalStatus: finalApprovalStatus,
            companyId: orgId,
            orgId,
            createdBy: userId
        });
        if (finalApprovalStatus === 'Pending') {
            await ApprovalWorkflowService_1.ApprovalWorkflowService.submitForApproval({
                orgId,
                module: 'inventory_adjustments',
                documentId: adjustment._id.toString(),
                documentNumber: referenceNumber,
                amount: totalValue,
                customerOrVendorName: 'Stock Adjustment',
                requestedBy: userId || 'system',
                requestedByName: user?.displayName || user?.name || user?.email,
                creatorRoleId: roleId
            });
        }
        else if (finalStatus === 'Adjusted') {
            // 1. Update stock and warehouse-specific stock
            if (req.body.items && Array.isArray(req.body.items)) {
                for (const adjItem of req.body.items) {
                    const qty = Number(adjItem.quantityAdjusted || 0);
                    if (qty !== 0) {
                        const item = await Item_1.default.findById(adjItem.item);
                        if (item) {
                            item.stock = Math.max(0, (item.stock || 0) + qty);
                            item.stockQuantity = item.stock;
                            const targetWh = adjItem.warehouse || adjustment.warehouseId || item.defaultWarehouseId;
                            if (targetWh) {
                                if (!item.warehouseStock)
                                    item.warehouseStock = [];
                                let ws = item.warehouseStock.find((w) => w.warehouse?.toString() === targetWh.toString());
                                if (ws) {
                                    ws.stockOnHand = Math.max(0, (ws.stockOnHand || 0) + qty);
                                    ws.availableStock = Math.max(0, ws.stockOnHand - (ws.committedStock || 0));
                                }
                                else {
                                    item.warehouseStock.push({
                                        warehouse: targetWh,
                                        bin: '',
                                        stockOnHand: Math.max(0, qty),
                                        committedStock: 0,
                                        availableStock: Math.max(0, qty)
                                    });
                                }
                            }
                            await item.save();
                        }
                    }
                }
            }
            // 2. Post to General Ledger
            try {
                await PostingEngine_1.PostingEngine.handleEvent('INVENTORY_ADJUSTMENT', {
                    adjustmentId: adjustment._id.toString(),
                    companyId: orgId
                });
            }
            catch (postErr) {
                console.error('Failed to post inventory adjustment to GL:', postErr);
            }
        }
        const populated = await InventoryAdjustment_1.default.findById(adjustment._id).populate('items.item');
        res.status(201).json({ success: true, data: populated || adjustment });
    }
    catch (error) {
        next(error);
    }
};
exports.createAdjustment = createAdjustment;
// @desc    Get all adjustments
// @route   GET /api/v1/books/inventory-adjustments
const getAdjustments = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
        const adjustments = await InventoryAdjustment_1.default.find(filter)
            .populate('items.item')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: adjustments.length, data: adjustments });
    }
    catch (error) {
        next(error);
    }
};
exports.getAdjustments = getAdjustments;
// @desc    Get single adjustment
// @route   GET /api/v1/books/inventory-adjustments/:id
const getAdjustmentById = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const adjustment = await InventoryAdjustment_1.default.findOne(filter)
            .populate('items.item');
        if (!adjustment) {
            return res.status(404).json({ success: false, message: 'Adjustment not found' });
        }
        res.status(200).json({ success: true, data: adjustment });
    }
    catch (error) {
        next(error);
    }
};
exports.getAdjustmentById = getAdjustmentById;
// @desc    Update adjustment
// @route   PUT /api/v1/books/inventory-adjustments/:id
const updateAdjustment = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const adjustment = await InventoryAdjustment_1.default.findOneAndUpdate(filter, req.body, { new: true });
        if (!adjustment)
            return res.status(404).json({ success: false, message: 'Adjustment not found' });
        res.status(200).json({ success: true, data: adjustment });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAdjustment = updateAdjustment;
// @desc    Delete adjustment
// @route   DELETE /api/v1/books/inventory-adjustments/:id
const deleteAdjustment = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const doc = await InventoryAdjustment_1.default.findOneAndDelete(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Adjustment not found' });
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAdjustment = deleteAdjustment;
