"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRecurringBill = exports.updateRecurringBill = exports.getRecurringBillById = exports.getRecurringBills = exports.createRecurringBill = void 0;
const RecurringBill_1 = __importDefault(require("../models/RecurringBill"));
const createRecurringBill = async (req, res, next) => {
    try {
        const doc = await RecurringBill_1.default.create(req.body);
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createRecurringBill = createRecurringBill;
const getRecurringBills = async (req, res, next) => {
    try {
        const docs = await RecurringBill_1.default.find()
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
        const doc = await RecurringBill_1.default.findById(req.params.id)
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
        const doc = await RecurringBill_1.default.findByIdAndUpdate(req.params.id, req.body, {
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
        const doc = await RecurringBill_1.default.findByIdAndDelete(req.params.id);
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
