"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.getCustomerById = exports.getCustomers = exports.createCustomer = void 0;
const context_1 = require("../../../context");
const PostingEngine_1 = require("../../books/services/PostingEngine");
const Customer_1 = __importDefault(require("../models/Customer"));
const createCustomer = async (req, res, next) => {
    try {
        const orgId = req.org?._id || context_1.requestContext.getStore()?.orgId;
        const payload = {
            ...req.body, name: req.body.name || req.body.displayName || req.body.companyName || 'Unnamed Customer',
            companyId: orgId || req.body.companyId,
            orgId: orgId || req.body.orgId,
            createdBy: req.user?._id
        };
        const customer = await Customer_1.default.create(payload);
        if (customer.openingBalance && customer.openingBalance > 0) {
            const payloadEvent = { customerId: customer._id.toString(), companyId: orgId || 'SYSTEM', openingBalance: customer.openingBalance };
            await PostingEngine_1.PostingEngine.handleEvent('CUSTOMER_OPENING_BALANCE', payloadEvent);
        }
        res.status(201).json({ success: true, data: customer });
    }
    catch (error) {
        next(error);
    }
};
exports.createCustomer = createCustomer;
const getCustomers = async (req, res, next) => {
    try {
        const orgId = req.org?._id || context_1.requestContext.getStore()?.orgId;
        const filter = orgId ? { companyId: orgId } : {};
        const customers = await Customer_1.default.find(filter).sort({ createdAt: -1 }).lean();
        res.status(200).json({ success: true, count: customers.length, data: customers });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomers = getCustomers;
const getCustomerById = async (req, res, next) => {
    try {
        const orgId = req.org?._id || context_1.requestContext.getStore()?.orgId;
        const filter = orgId ? { _id: req.params.id, companyId: orgId } : { _id: req.params.id };
        const customer = await Customer_1.default.findOne(filter).lean();
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.status(200).json({ success: true, data: customer });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerById = getCustomerById;
const updateCustomer = async (req, res, next) => {
    try {
        const orgId = req.org?._id || context_1.requestContext.getStore()?.orgId;
        const filter = orgId ? { _id: req.params.id, companyId: orgId } : { _id: req.params.id };
        if (!req.body.name && req.body.displayName)
            req.body.name = req.body.displayName;
        const customer = await Customer_1.default.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.status(200).json({ success: true, data: customer });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res, next) => {
    try {
        const orgId = req.org?._id || context_1.requestContext.getStore()?.orgId;
        const filter = orgId ? { _id: req.params.id, companyId: orgId } : { _id: req.params.id };
        const customer = await Customer_1.default.findOneAndDelete(filter);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCustomer = deleteCustomer;
