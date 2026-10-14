"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMachine = exports.updateMachine = exports.createMachine = exports.getMachineById = exports.getMachines = void 0;
const Machine_1 = __importDefault(require("../models/Machine"));
const getMachines = async (req, res, next) => {
    try {
        const orgId = req.org?._id || req.body.orgId;
        const filter = orgId ? { orgId } : {};
        const docs = await Machine_1.default.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        next(error);
    }
};
exports.getMachines = getMachines;
const getMachineById = async (req, res, next) => {
    try {
        const orgId = req.org?._id || req.body.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.orgId = orgId;
        const doc = await Machine_1.default.findOne(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.getMachineById = getMachineById;
const createMachine = async (req, res, next) => {
    try {
        const orgId = req.org?._id || req.body.orgId;
        if (orgId)
            req.body.orgId = orgId;
        const doc = await Machine_1.default.create(req.body);
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.createMachine = createMachine;
const updateMachine = async (req, res, next) => {
    try {
        const orgId = req.org?._id || req.body.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.orgId = orgId;
        const doc = await Machine_1.default.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.updateMachine = updateMachine;
const deleteMachine = async (req, res, next) => {
    try {
        const orgId = req.org?._id || req.body.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.orgId = orgId;
        const doc = await Machine_1.default.findOneAndDelete(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteMachine = deleteMachine;
