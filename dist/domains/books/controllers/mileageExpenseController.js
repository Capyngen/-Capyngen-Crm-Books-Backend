"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMileageExpense = exports.updateMileageExpense = exports.getMileageExpenseById = exports.getMileageExpenses = exports.createMileageExpense = void 0;
const MileageExpense_1 = __importDefault(require("../models/MileageExpense"));
const createMileageExpense = async (req, res, next) => {
    try {
        const doc = await MileageExpense_1.default.create(req.body);
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createMileageExpense = createMileageExpense;
const getMileageExpenses = async (req, res, next) => {
    try {
        const docs = await MileageExpense_1.default.find()
            .populate('vendorId', 'displayName companyName')
            .populate('customerId', 'displayName')
            .sort({ date: -1, createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getMileageExpenses = getMileageExpenses;
const getMileageExpenseById = async (req, res, next) => {
    try {
        const doc = await MileageExpense_1.default.findById(req.params.id)
            .populate('vendorId', 'displayName')
            .populate('customerId', 'displayName');
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Mileage Expense not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getMileageExpenseById = getMileageExpenseById;
const updateMileageExpense = async (req, res, next) => {
    try {
        const doc = await MileageExpense_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Mileage Expense not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateMileageExpense = updateMileageExpense;
const deleteMileageExpense = async (req, res, next) => {
    try {
        const doc = await MileageExpense_1.default.findByIdAndDelete(req.params.id);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Mileage Expense not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.deleteMileageExpense = deleteMileageExpense;
