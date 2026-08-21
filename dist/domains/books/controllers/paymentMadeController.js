"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePaymentMade = exports.updatePaymentMade = exports.getPaymentMadeById = exports.getPaymentsMade = exports.createPaymentMade = void 0;
const PaymentMade_1 = __importDefault(require("../models/PaymentMade"));
const createPaymentMade = async (req, res, next) => {
    try {
        const doc = await PaymentMade_1.default.create(req.body);
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createPaymentMade = createPaymentMade;
const getPaymentsMade = async (req, res, next) => {
    try {
        const docs = await PaymentMade_1.default.find()
            .populate('vendorId', 'displayName companyName')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getPaymentsMade = getPaymentsMade;
const getPaymentMadeById = async (req, res, next) => {
    try {
        const doc = await PaymentMade_1.default.findById(req.params.id)
            .populate('vendorId', 'displayName email phone')
            .populate('bills.billId', 'billNumber billDate totalAmount amountDue');
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getPaymentMadeById = getPaymentMadeById;
const updatePaymentMade = async (req, res, next) => {
    try {
        const doc = await PaymentMade_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updatePaymentMade = updatePaymentMade;
const deletePaymentMade = async (req, res, next) => {
    try {
        const doc = await PaymentMade_1.default.findByIdAndDelete(req.params.id);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.deletePaymentMade = deletePaymentMade;
