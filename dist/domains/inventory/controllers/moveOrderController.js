"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMoveOrder = exports.updateMoveOrder = exports.executeMoveOrder = exports.createMoveOrder = exports.getMoveOrderById = exports.getMoveOrders = void 0;
const MoveOrder_1 = __importDefault(require("../models/MoveOrder"));
const tenantFilter_1 = require("../../../core/utils/tenantFilter");
const getMoveOrders = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = { ...tenantFilter };
        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.warehouse) {
            filter.$or = [
                { warehouse: req.query.warehouse },
                { warehouseName: { $regex: String(req.query.warehouse), $options: 'i' } }
            ];
        }
        if (req.query.search) {
            const s = String(req.query.search);
            filter.$or = [
                { moveOrderNumber: { $regex: s, $options: 'i' } },
                { itemName: { $regex: s, $options: 'i' } },
                { itemSku: { $regex: s, $options: 'i' } },
                { fromBin: { $regex: s, $options: 'i' } },
                { toBin: { $regex: s, $options: 'i' } }
            ];
        }
        const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
        const limit = Math.max(1, parseInt(String(req.query.limit || '50'), 10));
        const skip = (page - 1) * limit;
        const [docs, totalCount] = await Promise.all([
            MoveOrder_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            MoveOrder_1.default.countDocuments(filter)
        ]);
        res.status(200).json({
            success: true,
            message: 'Move orders retrieved successfully',
            data: docs,
            count: docs.length,
            meta: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMoveOrders = getMoveOrders;
const getMoveOrderById = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = Object.keys(tenantFilter).length > 0
            ? { _id: req.params.id, ...tenantFilter }
            : { _id: req.params.id };
        const doc = await MoveOrder_1.default.findOne(filter);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Move order not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.getMoveOrderById = getMoveOrderById;
const createMoveOrder = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const orgId = tenantFilter.orgId ||
            tenantFilter.companyId ||
            req.org?._id?.toString() ||
            req.user?.companyId ||
            'SYSTEM';
        let moveOrderNumber = req.body.moveOrderNumber || req.body.order;
        if (!moveOrderNumber) {
            const count = await MoveOrder_1.default.countDocuments({
                $or: [{ orgId }, { companyId: orgId }]
            });
            moveOrderNumber = `MO-${String(count + 1).padStart(5, '0')}`;
        }
        const doc = await MoveOrder_1.default.create({
            ...req.body,
            moveOrderNumber,
            order: moveOrderNumber,
            quantity: Number(req.body.quantity ?? req.body.qty ?? 1),
            warehouseName: req.body.warehouseName || req.body.warehouse,
            itemName: req.body.itemName || req.body.item,
            companyId: orgId,
            orgId: orgId.toString()
        });
        res.status(201).json({
            success: true,
            message: 'Move order created successfully',
            data: doc
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createMoveOrder = createMoveOrder;
const executeMoveOrder = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = Object.keys(tenantFilter).length > 0
            ? { _id: req.params.id, ...tenantFilter }
            : { _id: req.params.id };
        const doc = await MoveOrder_1.default.findOneAndUpdate(filter, {
            $set: {
                status: 'Completed',
                executedAt: new Date(),
                executedBy: req.user?.name || req.user?.email || 'User'
            }
        }, { new: true });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Move order not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Move order executed and marked Completed',
            data: doc
        });
    }
    catch (error) {
        next(error);
    }
};
exports.executeMoveOrder = executeMoveOrder;
const updateMoveOrder = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = Object.keys(tenantFilter).length > 0
            ? { _id: req.params.id, ...tenantFilter }
            : { _id: req.params.id };
        const doc = await MoveOrder_1.default.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Move order not found' });
        }
        res.status(200).json({ success: true, message: 'Move order updated', data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.updateMoveOrder = updateMoveOrder;
const deleteMoveOrder = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = Object.keys(tenantFilter).length > 0
            ? { _id: req.params.id, ...tenantFilter }
            : { _id: req.params.id };
        const doc = await MoveOrder_1.default.findOneAndDelete(filter);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Move order not found' });
        }
        res.status(200).json({ success: true, message: 'Move order deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteMoveOrder = deleteMoveOrder;
