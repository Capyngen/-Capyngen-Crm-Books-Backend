"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRecurringExpense = exports.updateRecurringExpense = exports.getRecurringExpenseById = exports.getRecurringExpenses = exports.createRecurringExpense = void 0;
const RecurringExpense_1 = __importDefault(require("../models/RecurringExpense"));
const createRecurringExpense = async (req, res, next) => {
    try {
        const doc = await RecurringExpense_1.default.create(req.body);
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createRecurringExpense = createRecurringExpense;
const getRecurringExpenses = async (req, res, next) => {
    try {
        const docs = await RecurringExpense_1.default.find()
            .populate('vendorId', 'displayName companyName')
            .populate('customerId', 'displayName')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getRecurringExpenses = getRecurringExpenses;
const getRecurringExpenseById = async (req, res, next) => {
    try {
        const doc = await RecurringExpense_1.default.findById(req.params.id)
            .populate('vendorId', 'displayName')
            .populate('customerId', 'displayName');
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Recurring Expense not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getRecurringExpenseById = getRecurringExpenseById;
const updateRecurringExpense = async (req, res, next) => {
    try {
        const doc = await RecurringExpense_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Recurring Expense not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateRecurringExpense = updateRecurringExpense;
const deleteRecurringExpense = async (req, res, next) => {
    try {
        const doc = await RecurringExpense_1.default.findByIdAndDelete(req.params.id);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Recurring Expense not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.deleteRecurringExpense = deleteRecurringExpense;
