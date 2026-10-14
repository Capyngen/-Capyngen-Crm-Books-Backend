"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fulfillSalesOrder = exports.deleteSalesOrder = exports.updateSalesOrder = exports.getSalesOrderById = exports.getSalesOrders = exports.createSalesOrder = void 0;
const context_1 = require("../../../context");
const SalesOrder_1 = __importDefault(require("../models/SalesOrder"));
const CustomerBalanceService_1 = require("../services/CustomerBalanceService");
const SalesOrderFulfillmentService_1 = require("../services/SalesOrderFulfillmentService");
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
        // ERP Credit Limit Validation
        if (req.body.customer) {
            const total = req.body.total || 0;
            const creditCheck = await CustomerBalanceService_1.CustomerBalanceService.validateCreditLimit(req.body.customer, total);
            if (!creditCheck.allowed) {
                return res.status(400).json({
                    success: false,
                    message: `Credit Limit Exceeded! Transaction ${total}, Limit ${creditCheck.limit}, Available ${creditCheck.remaining}.`
                });
            }
        }
        const salesOrder = await SalesOrder_1.default.create({ ...req.body, salesOrderNumber, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || req.body.companyId, createdBy: req.user?._id });
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
        const salesOrders = await SalesOrder_1.default.find({ companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } })
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
        const salesOrder = await SalesOrder_1.default.findOne({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } })
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
        const salesOrder = await SalesOrder_1.default.findOneAndUpdate({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
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
        const salesOrder = await SalesOrder_1.default.findOneAndDelete({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } });
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
const fulfillSalesOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { items } = req.body;
        const userId = req.user?._id || 'system';
        const result = await SalesOrderFulfillmentService_1.SalesOrderFulfillmentService.fulfill(id, items, userId);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.fulfillSalesOrder = fulfillSalesOrder;
