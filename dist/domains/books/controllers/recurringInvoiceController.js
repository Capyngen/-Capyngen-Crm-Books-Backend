"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRecurringInvoice = exports.updateRecurringInvoice = exports.getRecurringInvoiceById = exports.getRecurringInvoices = exports.createRecurringInvoice = void 0;
const RecurringInvoice_1 = __importDefault(require("../models/RecurringInvoice"));
const createRecurringInvoice = async (req, res, next) => {
    try {
        const recurringInvoice = await RecurringInvoice_1.default.create(req.body);
        const populated = await RecurringInvoice_1.default.findById(recurringInvoice._id).populate('customer').populate('items.item');
        res.status(201).json({ success: true, data: populated });
    }
    catch (error) {
        next(error);
    }
};
exports.createRecurringInvoice = createRecurringInvoice;
const getRecurringInvoices = async (req, res, next) => {
    try {
        const recurringInvoices = await RecurringInvoice_1.default.find()
            .populate('customer')
            .populate('items.item')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: recurringInvoices });
    }
    catch (error) {
        next(error);
    }
};
exports.getRecurringInvoices = getRecurringInvoices;
const getRecurringInvoiceById = async (req, res, next) => {
    try {
        const recurringInvoice = await RecurringInvoice_1.default.findById(req.params.id)
            .populate('customer')
            .populate('items.item');
        if (!recurringInvoice) {
            return res.status(404).json({ success: false, message: 'Recurring Invoice not found' });
        }
        res.status(200).json({ success: true, data: recurringInvoice });
    }
    catch (error) {
        next(error);
    }
};
exports.getRecurringInvoiceById = getRecurringInvoiceById;
const updateRecurringInvoice = async (req, res, next) => {
    try {
        const recurringInvoice = await RecurringInvoice_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('customer').populate('items.item');
        if (!recurringInvoice) {
            return res.status(404).json({ success: false, message: 'Recurring Invoice not found' });
        }
        res.status(200).json({ success: true, data: recurringInvoice });
    }
    catch (error) {
        next(error);
    }
};
exports.updateRecurringInvoice = updateRecurringInvoice;
const deleteRecurringInvoice = async (req, res, next) => {
    try {
        const recurringInvoice = await RecurringInvoice_1.default.findByIdAndDelete(req.params.id);
        if (!recurringInvoice) {
            return res.status(404).json({ success: false, message: 'Recurring Invoice not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteRecurringInvoice = deleteRecurringInvoice;
