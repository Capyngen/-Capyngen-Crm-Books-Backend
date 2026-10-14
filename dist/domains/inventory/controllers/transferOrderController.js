"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransferOrder = exports.updateTransferOrder = exports.createTransferOrder = exports.getTransferOrderById = exports.getTransferOrders = void 0;
const TransferOrder_1 = __importDefault(require("../models/TransferOrder"));
const getTransferOrders = async (req, res, next) => {
    try {
        const orgId = req.org?._id || (req.org?._id || req.body.orgId);
        const filter = orgId ? { orgId } : {};
        const docs = await TransferOrder_1.default.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        next(error);
    }
};
exports.getTransferOrders = getTransferOrders;
const getTransferOrderById = async (req, res, next) => {
    try {
        const orgId = req.org?._id || (req.org?._id || req.body.orgId);
        const filter = { _id: req.params.id };
        if (orgId)
            filter.orgId = orgId;
        const doc = await TransferOrder_1.default.findOne(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.getTransferOrderById = getTransferOrderById;
const createTransferOrder = async (req, res, next) => {
    try {
        const orgId = req.org?._id || (req.org?._id || req.body.orgId);
        if (orgId)
            req.body.orgId = orgId;
        const doc = await TransferOrder_1.default.create(req.body);
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.createTransferOrder = createTransferOrder;
const updateTransferOrder = async (req, res, next) => {
    try {
        const orgId = req.org?._id || (req.org?._id || req.body.orgId);
        const filter = { _id: req.params.id };
        if (orgId)
            filter.orgId = orgId;
        const doc = await TransferOrder_1.default.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTransferOrder = updateTransferOrder;
const deleteTransferOrder = async (req, res, next) => {
    try {
        const orgId = req.org?._id || (req.org?._id || req.body.orgId);
        const filter = { _id: req.params.id };
        if (orgId)
            filter.orgId = orgId;
        const doc = await TransferOrder_1.default.findOneAndDelete(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTransferOrder = deleteTransferOrder;
