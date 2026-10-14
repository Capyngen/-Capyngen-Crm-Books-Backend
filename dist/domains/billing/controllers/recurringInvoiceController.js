"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRecurringInvoice = exports.updateRecurringInvoice = exports.getRecurringInvoiceById = exports.getRecurringInvoices = exports.createRecurringInvoice = void 0;
const context_1 = require("../../../context");
const RecurringInvoice_1 = __importDefault(require("../models/RecurringInvoice"));
const createRecurringInvoice = async (req, res, next) => {
    try {
        const recurringInvoice = await RecurringInvoice_1.default.create({ ...req.body, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || req.body.companyId, createdBy: req.user?._id });
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
        const recurringInvoices = await RecurringInvoice_1.default.find({ companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } })
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
        const recurringInvoice = await RecurringInvoice_1.default.findOne({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } })
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
        const recurringInvoice = await RecurringInvoice_1.default.findOneAndUpdate({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
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
        const recurringInvoice = await RecurringInvoice_1.default.findOneAndDelete({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } });
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
