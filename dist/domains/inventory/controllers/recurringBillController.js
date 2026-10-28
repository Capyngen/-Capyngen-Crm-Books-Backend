"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRecurringBill = exports.updateRecurringBill = exports.getRecurringBillById = exports.getRecurringBills = exports.createRecurringBill = void 0;
const context_1 = require("../../../context");
const mongoose_1 = __importDefault(require("mongoose"));
const RecurringBill_1 = __importDefault(require("../models/RecurringBill"));
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
const createRecurringBill = async (req, res, next) => {
    try {
        const orgId = String(req.org?._id || req.headers['x-org-id'] || '6aa797278d301b4735f1d322');
        const doc = await RecurringBill_1.default.create({
            ...req.body,
            companyId: orgId,
            orgId: orgId,
            createdBy: req.user?._id
        });
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createRecurringBill = createRecurringBill;
const getRecurringBills = async (req, res, next) => {
    try {
        const filter = getTenantFilter(req);
        const docs = await RecurringBill_1.default.find(filter)
            .populate('vendorId', 'displayName companyName vendorName')
            .populate('vendor', 'displayName companyName vendorName')
            .sort({ createdAt: -1 });
        const enriched = docs.map((b) => {
            const obj = b.toObject ? b.toObject() : b;
            if (!obj.total && obj.amount)
                obj.total = obj.amount;
            if (!obj.amount && obj.total)
                obj.amount = obj.total;
            if (!obj.totalAmount && (obj.total || obj.amount))
                obj.totalAmount = obj.total || obj.amount;
            const v = obj.vendorId || obj.vendor;
            if (v && typeof v === 'object') {
                obj.vendorName = v.displayName || v.vendorName || v.companyName;
            }
            return obj;
        });
        res.status(200).json({ success: true, count: enriched.length, data: enriched });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getRecurringBills = getRecurringBills;
const getRecurringBillById = async (req, res, next) => {
    try {
        const filter = { _id: req.params.id, ...getTenantFilter(req) };
        const doc = await RecurringBill_1.default.findOne(filter)
            .populate('vendorId', 'displayName companyName vendorName')
            .populate('vendor', 'displayName companyName vendorName')
            .populate('lineItems.itemId', 'name')
            .populate('lineItems.customerId', 'displayName');
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Recurring Bill not found' });
        }
        const obj = doc.toObject ? doc.toObject() : doc;
        if (!obj.total && obj.amount)
            obj.total = obj.amount;
        if (!obj.totalAmount && (obj.total || obj.amount))
            obj.totalAmount = obj.total || obj.amount;
        const v = obj.vendorId || obj.vendor;
        if (v && typeof v === 'object') {
            obj.vendorName = v.displayName || v.vendorName || v.companyName;
        }
        res.status(200).json({ success: true, data: obj });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getRecurringBillById = getRecurringBillById;
const updateRecurringBill = async (req, res, next) => {
    try {
        const filter = { _id: req.params.id, ...getTenantFilter(req) };
        const doc = await RecurringBill_1.default.findOneAndUpdate(filter, req.body, {
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
        const filter = { _id: req.params.id, ...getTenantFilter(req) };
        const doc = await RecurringBill_1.default.findOneAndDelete(filter);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Recurring Bill not found' });
        }
        res.status(200).json({ success: true, message: 'Recurring Bill deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.deleteRecurringBill = deleteRecurringBill;
