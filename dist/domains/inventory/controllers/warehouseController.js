"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addWarehouseBin = exports.getWarehouseStock = exports.deleteWarehouse = exports.updateWarehouse = exports.createWarehouse = exports.getWarehouseById = exports.getWarehouses = void 0;
const Warehouse_1 = __importDefault(require("../models/Warehouse"));
const Item_1 = __importDefault(require("../models/Item"));
const context_1 = require("../../../context");
const getWarehouses = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId || req.body.orgId;
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
        const docs = await Warehouse_1.default.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        next(error);
    }
};
exports.getWarehouses = getWarehouses;
const getWarehouseById = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId || req.body.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const doc = await Warehouse_1.default.findOne(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.getWarehouseById = getWarehouseById;
const createWarehouse = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId || req.body.orgId;
        const payload = {
            ...req.body,
            companyId: orgId,
            orgId
        };
        const doc = await Warehouse_1.default.create(payload);
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.createWarehouse = createWarehouse;
const updateWarehouse = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId || req.body.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const doc = await Warehouse_1.default.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
        if (!doc)
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.updateWarehouse = updateWarehouse;
const deleteWarehouse = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId || req.body.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const doc = await Warehouse_1.default.findOneAndDelete(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteWarehouse = deleteWarehouse;
// @desc Get items and stock levels in a specific warehouse
// @route GET /api/v1/books/inventory/warehouses/:id/stock
const getWarehouseStock = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const warehouseId = req.params.id;
        const filter = {
            $or: [
                { 'warehouseStock.warehouse': warehouseId },
                { defaultWarehouseId: warehouseId }
            ]
        };
        if (orgId) {
            filter.$and = [{ $or: [{ companyId: orgId }, { orgId }] }];
        }
        const items = await Item_1.default.find(filter).select('name sku unit salesRate purchaseRate stock warehouseStock trackingType');
        const stockSummary = items.map(item => {
            const whStock = item.warehouseStock?.find((ws) => ws.warehouse?.toString() === warehouseId);
            const onHand = whStock ? whStock.stockOnHand : (item.stock || 0);
            const committed = whStock ? whStock.committedStock : 0;
            const available = Math.max(0, onHand - committed);
            return {
                _id: item._id,
                name: item.name,
                sku: item.sku,
                unit: item.unit,
                salesRate: item.salesRate,
                purchaseRate: item.purchaseRate,
                stockOnHand: onHand,
                committedStock: committed,
                availableStock: available,
                bin: whStock?.bin || '',
                trackingType: item.trackingType
            };
        });
        res.status(200).json({ success: true, count: stockSummary.length, data: stockSummary });
    }
    catch (error) {
        next(error);
    }
};
exports.getWarehouseStock = getWarehouseStock;
// @desc Add a bin to a warehouse
// @route POST /api/v1/books/inventory/warehouses/:id/bins
const addWarehouseBin = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const warehouse = await Warehouse_1.default.findOne(filter);
        if (!warehouse)
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        const newBin = {
            binCode: req.body.binCode,
            name: req.body.name || req.body.binCode,
            zone: req.body.zone || 'Zone A',
            aisle: req.body.aisle || '',
            rack: req.body.rack || '',
            shelf: req.body.shelf || '',
            capacityVolume: req.body.capacityVolume || 0,
            capacityWeight: req.body.capacityWeight || 0,
            isQuarantine: Boolean(req.body.isQuarantine),
            isDamaged: Boolean(req.body.isDamaged),
            status: req.body.status || 'Active'
        };
        warehouse.bins.push(newBin);
        await warehouse.save();
        res.status(201).json({ success: true, data: warehouse });
    }
    catch (error) {
        next(error);
    }
};
exports.addWarehouseBin = addWarehouseBin;
