"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRecurringInvoice = exports.updateRecurringInvoice = exports.getRecurringInvoiceById = exports.getRecurringInvoices = exports.createRecurringInvoice = void 0;
const context_1 = require("../../../context");
const mongoose_1 = __importDefault(require("mongoose"));
const RecurringInvoice_1 = __importDefault(require("../models/RecurringInvoice"));
const getTenantFilter = (req) => {
    const orgId = String(req.org?._id ||
        req.headers['x-org-id'] ||
        req.headers['x-company-id'] ||
        context_1.requestContext.getStore()?.orgId ||
        '6aa797278d301b4735f1d322');
    const conditions = [{ orgId }, { companyId: orgId }];
    if (mongoose_1.default.Types.ObjectId.isValid(orgId)) {
        const objId = new mongoose_1.default.Types.ObjectId(orgId);
        conditions.push({ orgId: objId }, { companyId: objId });
    }
    return { $or: conditions };
};
const createRecurringInvoice = async (req, res, next) => {
    try {
        const orgId = String(req.org?._id || req.headers['x-org-id'] || '6aa797278d301b4735f1d322');
        const recurringInvoice = await RecurringInvoice_1.default.create({
            ...req.body,
            companyId: orgId,
            orgId: orgId,
            createdBy: req.user?._id
        });
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
        const filter = getTenantFilter(req);
        const recurringInvoices = await RecurringInvoice_1.default.find(filter)
            .populate('customer')
            .populate('items.item')
            .sort({ createdAt: -1 });
        const enriched = recurringInvoices.map((inv) => {
            const obj = inv.toObject ? inv.toObject() : inv;
            if (!obj.total && obj.amount)
                obj.total = obj.amount;
            if (!obj.amount && obj.total)
                obj.amount = obj.total;
            if (!obj.startsOn && obj.startDate)
                obj.startsOn = obj.startDate;
            if (!obj.repeatEvery && obj.frequency)
                obj.repeatEvery = obj.frequency;
            if (obj.customer && typeof obj.customer === 'object') {
                obj.customerName = obj.customer.displayName || obj.customer.companyName || obj.customer.name;
            }
            return obj;
        });
        res.status(200).json({ success: true, count: enriched.length, data: enriched });
    }
    catch (error) {
        next(error);
    }
};
exports.getRecurringInvoices = getRecurringInvoices;
const getRecurringInvoiceById = async (req, res, next) => {
    try {
        const filter = { _id: req.params.id, ...getTenantFilter(req) };
        const recurringInvoice = await RecurringInvoice_1.default.findOne(filter)
            .populate('customer')
            .populate('items.item');
        if (!recurringInvoice) {
            return res.status(404).json({ success: false, message: 'Recurring Invoice not found' });
        }
        const obj = recurringInvoice.toObject ? recurringInvoice.toObject() : recurringInvoice;
        if (!obj.total && obj.amount)
            obj.total = obj.amount;
        if (!obj.startsOn && obj.startDate)
            obj.startsOn = obj.startDate;
        if (!obj.repeatEvery && obj.frequency)
            obj.repeatEvery = obj.frequency;
        if (obj.customer && typeof obj.customer === 'object') {
            obj.customerName = obj.customer.displayName || obj.customer.companyName || obj.customer.name;
        }
        res.status(200).json({ success: true, data: obj });
    }
    catch (error) {
        next(error);
    }
};
exports.getRecurringInvoiceById = getRecurringInvoiceById;
const updateRecurringInvoice = async (req, res, next) => {
    try {
        const filter = { _id: req.params.id, ...getTenantFilter(req) };
        const recurringInvoice = await RecurringInvoice_1.default.findOneAndUpdate(filter, req.body, {
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
        const filter = { _id: req.params.id, ...getTenantFilter(req) };
        const recurringInvoice = await RecurringInvoice_1.default.findOneAndDelete(filter);
        if (!recurringInvoice) {
            return res.status(404).json({ success: false, message: 'Recurring Invoice not found' });
        }
        res.status(200).json({ success: true, message: 'Recurring Invoice deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteRecurringInvoice = deleteRecurringInvoice;
