"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWarehouse = exports.updateWarehouse = exports.createWarehouse = exports.getWarehouseById = exports.getWarehouses = void 0;
const Warehouse_1 = __importDefault(require("../models/Warehouse"));
const getWarehouses = async (req, res, next) => {
    try {
        const orgId = req.org?._id || (req.org?._id || req.body.orgId);
        const filter = orgId ? { orgId } : {};
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
        const orgId = req.org?._id || (req.org?._id || req.body.orgId);
        const filter = { _id: req.params.id };
        if (orgId)
            filter.orgId = orgId;
        const doc = await Warehouse_1.default.findOne(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.getWarehouseById = getWarehouseById;
const createWarehouse = async (req, res, next) => {
    try {
        const orgId = req.org?._id || (req.org?._id || req.body.orgId);
        if (orgId)
            req.body.orgId = orgId;
        const doc = await Warehouse_1.default.create(req.body);
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.createWarehouse = createWarehouse;
const updateWarehouse = async (req, res, next) => {
    try {
        const orgId = req.org?._id || (req.org?._id || req.body.orgId);
        const filter = { _id: req.params.id };
        if (orgId)
            filter.orgId = orgId;
        const doc = await Warehouse_1.default.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.updateWarehouse = updateWarehouse;
const deleteWarehouse = async (req, res, next) => {
    try {
        const orgId = req.org?._id || (req.org?._id || req.body.orgId);
        const filter = { _id: req.params.id };
        if (orgId)
            filter.orgId = orgId;
        const doc = await Warehouse_1.default.findOneAndDelete(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteWarehouse = deleteWarehouse;
