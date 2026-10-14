"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorkOrder = exports.updateWorkOrder = exports.createWorkOrder = exports.getWorkOrderById = exports.getWorkOrders = void 0;
const WorkOrder_1 = __importDefault(require("../models/WorkOrder"));
const getWorkOrders = async (req, res, next) => {
    try {
        const orgId = req.org?._id || req.body.orgId;
        const filter = orgId ? { orgId } : {};
        const docs = await WorkOrder_1.default.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        next(error);
    }
};
exports.getWorkOrders = getWorkOrders;
const getWorkOrderById = async (req, res, next) => {
    try {
        const orgId = req.org?._id || req.body.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.orgId = orgId;
        const doc = await WorkOrder_1.default.findOne(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.getWorkOrderById = getWorkOrderById;
const createWorkOrder = async (req, res, next) => {
    try {
        const orgId = req.org?._id || req.body.orgId;
        if (orgId)
            req.body.orgId = orgId;
        const doc = await WorkOrder_1.default.create(req.body);
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.createWorkOrder = createWorkOrder;
const updateWorkOrder = async (req, res, next) => {
    try {
        const orgId = req.org?._id || req.body.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.orgId = orgId;
        const doc = await WorkOrder_1.default.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.updateWorkOrder = updateWorkOrder;
const deleteWorkOrder = async (req, res, next) => {
    try {
        const orgId = req.org?._id || req.body.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.orgId = orgId;
        const doc = await WorkOrder_1.default.findOneAndDelete(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteWorkOrder = deleteWorkOrder;
