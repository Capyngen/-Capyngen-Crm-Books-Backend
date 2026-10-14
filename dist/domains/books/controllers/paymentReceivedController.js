"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePaymentReceived = exports.updatePaymentReceived = exports.getPaymentReceivedById = exports.getPaymentsReceived = exports.createPaymentReceived = void 0;
const PaymentReceived_1 = __importDefault(require("../models/PaymentReceived"));
const createPaymentReceived = async (req, res, next) => {
    try {
        let paymentNumber = req.body.paymentNumber;
        if (!paymentNumber) {
            let nextNum = (await PaymentReceived_1.default.countDocuments()) + 1;
            let isUnique = false;
            while (!isUnique) {
                paymentNumber = `PR-${String(nextNum).padStart(5, '0')}`;
                const exists = await PaymentReceived_1.default.findOne({ paymentNumber });
                if (exists) {
                    nextNum++;
                }
                else {
                    isUnique = true;
                }
            }
        }
        const payment = await PaymentReceived_1.default.create({ ...req.body, paymentNumber });
        const populated = await PaymentReceived_1.default.findById(payment._id).populate('customer').populate('invoices.invoice');
        res.status(201).json({ success: true, data: populated });
    }
    catch (error) {
        next(error);
    }
};
exports.createPaymentReceived = createPaymentReceived;
const getPaymentsReceived = async (req, res, next) => {
    try {
        const payments = await PaymentReceived_1.default.find()
            .populate('customer')
            .populate('invoices.invoice')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: payments });
    }
    catch (error) {
        next(error);
    }
};
exports.getPaymentsReceived = getPaymentsReceived;
const getPaymentReceivedById = async (req, res, next) => {
    try {
        const payment = await PaymentReceived_1.default.findById(req.params.id)
            .populate('customer')
            .populate('invoices.invoice');
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment Receipt not found' });
        }
        res.status(200).json({ success: true, data: payment });
    }
    catch (error) {
        next(error);
    }
};
exports.getPaymentReceivedById = getPaymentReceivedById;
const updatePaymentReceived = async (req, res, next) => {
    try {
        const payment = await PaymentReceived_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('customer').populate('invoices.invoice');
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment Receipt not found' });
        }
        res.status(200).json({ success: true, data: payment });
    }
    catch (error) {
        next(error);
    }
};
exports.updatePaymentReceived = updatePaymentReceived;
const deletePaymentReceived = async (req, res, next) => {
    try {
        const payment = await PaymentReceived_1.default.findByIdAndDelete(req.params.id);
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment Receipt not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deletePaymentReceived = deletePaymentReceived;
