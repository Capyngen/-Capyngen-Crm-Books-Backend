"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlan = exports.updatePlan = exports.createPlan = exports.getPlanById = exports.getPlans = void 0;
const context_1 = require("../../../context");
const Plan_1 = __importDefault(require("../models/Plan"));
const getPlans = async (req, res) => {
    try {
        const userId = req.user?._id;
        const filter = userId ? { userId } : {};
        const plans = await Plan_1.default.find(filter).lean();
        plans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        res.status(200).json({ success: true, count: plans.length, data: plans });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPlans = getPlans;
const getPlanById = async (req, res) => {
    try {
        const plan = await Plan_1.default.findOne({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } }).lean();
        if (!plan)
            return res.status(404).json({ success: false, message: 'Plan not found' });
        res.status(200).json({ success: true, data: plan });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPlanById = getPlanById;
const createPlan = async (req, res) => {
    try {
        const payload = { ...req.body };
        const plan = new Plan_1.default(payload);
        await plan.save();
        res.status(201).json({ success: true, data: plan });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createPlan = createPlan;
const updatePlan = async (req, res) => {
    try {
        const plan = await Plan_1.default.findOneAndUpdate({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } }, req.body, { new: true, runValidators: true });
        if (!plan)
            return res.status(404).json({ success: false, message: 'Plan not found' });
        res.status(200).json({ success: true, data: plan });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updatePlan = updatePlan;
const deletePlan = async (req, res) => {
    try {
        const plan = await Plan_1.default.findOneAndDelete({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } });
        if (!plan)
            return res.status(404).json({ success: false, message: 'Plan not found' });
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deletePlan = deletePlan;
