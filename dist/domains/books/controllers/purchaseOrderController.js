"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePurchaseOrder = exports.updatePurchaseOrder = exports.getPurchaseOrderById = exports.getPurchaseOrders = exports.createPurchaseOrder = void 0;
const PurchaseOrder_1 = __importDefault(require("../models/PurchaseOrder"));
const createPurchaseOrder = async (req, res, next) => {
    try {
        const doc = await PurchaseOrder_1.default.create(req.body);
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createPurchaseOrder = createPurchaseOrder;
const getPurchaseOrders = async (req, res, next) => {
    try {
        const docs = await PurchaseOrder_1.default.find()
            .populate('vendorId', 'displayName companyName')
            .populate('customerId', 'displayName')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getPurchaseOrders = getPurchaseOrders;
const getPurchaseOrderById = async (req, res, next) => {
    try {
        const doc = await PurchaseOrder_1.default.findById(req.params.id)
            .populate('vendorId', 'displayName')
            .populate('customerId', 'displayName');
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Purchase Order not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getPurchaseOrderById = getPurchaseOrderById;
const updatePurchaseOrder = async (req, res, next) => {
    try {
        const doc = await PurchaseOrder_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Purchase Order not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updatePurchaseOrder = updatePurchaseOrder;
const deletePurchaseOrder = async (req, res, next) => {
    try {
        const doc = await PurchaseOrder_1.default.findByIdAndDelete(req.params.id);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Purchase Order not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.deletePurchaseOrder = deletePurchaseOrder;
