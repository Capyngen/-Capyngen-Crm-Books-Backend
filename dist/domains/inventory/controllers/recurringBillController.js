"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRecurringBill = exports.updateRecurringBill = exports.getRecurringBillById = exports.getRecurringBills = exports.createRecurringBill = void 0;
const context_1 = require("../../../context");
const RecurringBill_1 = __importDefault(require("../models/RecurringBill"));
const createRecurringBill = async (req, res, next) => {
    try {
        const doc = await RecurringBill_1.default.create({ ...req.body, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || req.body.companyId, createdBy: req.user?._id });
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createRecurringBill = createRecurringBill;
const getRecurringBills = async (req, res, next) => {
    try {
        const docs = await RecurringBill_1.default.find({ companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } })
            .populate('vendorId', 'displayName companyName')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getRecurringBills = getRecurringBills;
const getRecurringBillById = async (req, res, next) => {
    try {
        const doc = await RecurringBill_1.default.findOne({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } })
            .populate('vendorId', 'displayName')
            .populate('lineItems.itemId', 'name')
            .populate('lineItems.customerId', 'displayName');
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Recurring Bill not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getRecurringBillById = getRecurringBillById;
const updateRecurringBill = async (req, res, next) => {
    try {
        const doc = await RecurringBill_1.default.findOneAndUpdate({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Recurring Bill not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateRecurringBill = updateRecurringBill;
const deleteRecurringBill = async (req, res, next) => {
    try {
        const doc = await RecurringBill_1.default.findOneAndDelete({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Recurring Bill not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.deleteRecurringBill = deleteRecurringBill;
