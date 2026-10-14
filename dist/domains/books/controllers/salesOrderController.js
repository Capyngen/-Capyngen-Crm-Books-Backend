"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSalesOrder = exports.updateSalesOrder = exports.getSalesOrderById = exports.getSalesOrders = exports.createSalesOrder = void 0;
const SalesOrder_1 = __importDefault(require("../models/SalesOrder"));
const createSalesOrder = async (req, res, next) => {
    try {
        let salesOrderNumber = req.body.salesOrderNumber;
        if (!salesOrderNumber) {
            let nextNum = (await SalesOrder_1.default.countDocuments()) + 1;
            let isUnique = false;
            while (!isUnique) {
                salesOrderNumber = `SO-${String(nextNum).padStart(5, '0')}`;
                const exists = await SalesOrder_1.default.findOne({ salesOrderNumber });
                if (exists) {
                    nextNum++;
                }
                else {
                    isUnique = true;
                }
            }
        }
        const salesOrder = await SalesOrder_1.default.create({ ...req.body, salesOrderNumber });
        const populated = await SalesOrder_1.default.findById(salesOrder._id).populate('customer').populate('items.item');
        res.status(201).json({ success: true, data: populated });
    }
    catch (error) {
        next(error);
    }
};
exports.createSalesOrder = createSalesOrder;
const getSalesOrders = async (req, res, next) => {
    try {
        const salesOrders = await SalesOrder_1.default.find()
            .populate('customer')
            .populate('items.item')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: salesOrders });
    }
    catch (error) {
        next(error);
    }
};
exports.getSalesOrders = getSalesOrders;
const getSalesOrderById = async (req, res, next) => {
    try {
        const salesOrder = await SalesOrder_1.default.findById(req.params.id)
            .populate('customer')
            .populate('items.item');
        if (!salesOrder) {
            return res.status(404).json({ success: false, message: 'Sales Order not found' });
        }
        res.status(200).json({ success: true, data: salesOrder });
    }
    catch (error) {
        next(error);
    }
};
exports.getSalesOrderById = getSalesOrderById;
const updateSalesOrder = async (req, res, next) => {
    try {
        const salesOrder = await SalesOrder_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('customer').populate('items.item');
        if (!salesOrder) {
            return res.status(404).json({ success: false, message: 'Sales Order not found' });
        }
        res.status(200).json({ success: true, data: salesOrder });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSalesOrder = updateSalesOrder;
const deleteSalesOrder = async (req, res, next) => {
    try {
        const salesOrder = await SalesOrder_1.default.findByIdAndDelete(req.params.id);
        if (!salesOrder) {
            return res.status(404).json({ success: false, message: 'Sales Order not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSalesOrder = deleteSalesOrder;
