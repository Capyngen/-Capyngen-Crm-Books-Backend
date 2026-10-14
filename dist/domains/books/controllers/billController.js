"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBill = exports.updateBill = exports.getBillById = exports.getBills = exports.createBill = void 0;
const Bill_1 = __importDefault(require("../models/Bill"));
const createBill = async (req, res, next) => {
    try {
        const doc = await Bill_1.default.create(req.body);
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createBill = createBill;
const getBills = async (req, res, next) => {
    try {
        const docs = await Bill_1.default.find()
            .populate('vendorId', 'displayName companyName')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getBills = getBills;
const getBillById = async (req, res, next) => {
    try {
        const doc = await Bill_1.default.findById(req.params.id)
            .populate('vendorId', 'displayName')
            .populate('lineItems.itemId', 'name')
            .populate('lineItems.customerId', 'displayName');
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getBillById = getBillById;
const updateBill = async (req, res, next) => {
    try {
        const doc = await Bill_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateBill = updateBill;
const deleteBill = async (req, res, next) => {
    try {
        const doc = await Bill_1.default.findByIdAndDelete(req.params.id);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.deleteBill = deleteBill;
