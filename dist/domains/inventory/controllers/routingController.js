"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRouting = exports.updateRouting = exports.createRouting = exports.getRoutingById = exports.getRoutings = void 0;
const Routing_1 = __importDefault(require("../models/Routing"));
const getRoutings = async (req, res, next) => {
    try {
        const orgId = req.org?._id || req.body.orgId;
        const filter = orgId ? { orgId } : {};
        const docs = await Routing_1.default.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        next(error);
    }
};
exports.getRoutings = getRoutings;
const getRoutingById = async (req, res, next) => {
    try {
        const orgId = req.org?._id || req.body.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.orgId = orgId;
        const doc = await Routing_1.default.findOne(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.getRoutingById = getRoutingById;
const createRouting = async (req, res, next) => {
    try {
        const orgId = req.org?._id || req.body.orgId;
        if (orgId)
            req.body.orgId = orgId;
        const doc = await Routing_1.default.create(req.body);
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.createRouting = createRouting;
const updateRouting = async (req, res, next) => {
    try {
        const orgId = req.org?._id || req.body.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.orgId = orgId;
        const doc = await Routing_1.default.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.updateRouting = updateRouting;
const deleteRouting = async (req, res, next) => {
    try {
        const orgId = req.org?._id || req.body.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.orgId = orgId;
        const doc = await Routing_1.default.findOneAndDelete(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteRouting = deleteRouting;
