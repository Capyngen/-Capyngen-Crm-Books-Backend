"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomer = exports.getCustomerById = exports.getCustomers = exports.createCustomer = void 0;
const Customer_1 = __importDefault(require("../models/Customer"));
// @desc    Create new customer
// @route   POST /api/v1/books/sales/customers
const createCustomer = async (req, res, next) => {
    try {
        const customer = await Customer_1.default.create(req.body);
        res.status(201).json({ success: true, data: customer });
    }
    catch (error) {
        next(error);
    }
};
exports.createCustomer = createCustomer;
// @desc    Get all customers
// @route   GET /api/v1/books/sales/customers
const getCustomers = async (req, res, next) => {
    try {
        const customers = await Customer_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: customers.length, data: customers });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomers = getCustomers;
// @desc    Get single customer
// @route   GET /api/v1/books/sales/customers/:id
const getCustomerById = async (req, res, next) => {
    try {
        const customer = await Customer_1.default.findById(req.params.id);
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
// @desc    Update customer
// @route   PUT /api/v1/books/sales/customers/:id
const updateCustomer = async (req, res, next) => {
    try {
        const customer = await Customer_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
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
