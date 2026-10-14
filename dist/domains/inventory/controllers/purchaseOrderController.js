"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvePOManager = exports.requestPOApproval = exports.deletePurchaseOrder = exports.updatePurchaseOrder = exports.getPurchaseOrderById = exports.getPurchaseOrders = exports.createPurchaseOrder = void 0;
const context_1 = require("../../../context");
const PurchaseOrder_1 = __importDefault(require("../models/PurchaseOrder"));
const createPurchaseOrder = async (req, res, next) => {
    try {
        const doc = await PurchaseOrder_1.default.create({ ...req.body, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || req.body.companyId, createdBy: req.user?._id });
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createPurchaseOrder = createPurchaseOrder;
const getPurchaseOrders = async (req, res, next) => {
    try {
        const docs = await PurchaseOrder_1.default.find({ companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } })
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
        const doc = await PurchaseOrder_1.default.findOne({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } })
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
        const doc = await PurchaseOrder_1.default.findOneAndUpdate({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
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
        const doc = await PurchaseOrder_1.default.findOneAndDelete({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } });
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
const PurchaseOrderApprovalService_1 = require("../services/PurchaseOrderApprovalService");
const requestPOApproval = async (req, res) => {
    try {
        const po = await PurchaseOrderApprovalService_1.PurchaseOrderApprovalService.requestApproval(req.params.id, 'system-user');
        res.status(200).json({ success: true, data: po });
    }
    catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};
exports.requestPOApproval = requestPOApproval;
const approvePOManager = async (req, res) => {
    try {
        const po = await PurchaseOrderApprovalService_1.PurchaseOrderApprovalService.approveByManager(req.params.id, 'manager-user');
        res.status(200).json({ success: true, data: po });
    }
    catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};
exports.approvePOManager = approvePOManager;
