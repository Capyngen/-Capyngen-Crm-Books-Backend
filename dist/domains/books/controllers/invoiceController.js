"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInvoice = exports.updateInvoice = exports.getInvoiceById = exports.getInvoices = exports.createInvoice = void 0;
const Invoice_1 = __importDefault(require("../models/Invoice"));
const createInvoice = async (req, res, next) => {
    try {
        let invoiceNumber = req.body.invoiceNumber;
        if (!invoiceNumber) {
            let nextNum = (await Invoice_1.default.countDocuments()) + 1;
            let isUnique = false;
            while (!isUnique) {
                invoiceNumber = `INV-${String(nextNum).padStart(5, '0')}`;
                const exists = await Invoice_1.default.findOne({ invoiceNumber });
                if (exists) {
                    nextNum++;
                }
                else {
                    isUnique = true;
                }
            }
        }
        // Balance due is initially the total amount
        const balanceDue = req.body.total || 0;
        const invoice = await Invoice_1.default.create({ ...req.body, invoiceNumber, balanceDue });
        const populated = await Invoice_1.default.findById(invoice._id).populate('customer').populate('items.item');
        res.status(201).json({ success: true, data: populated });
    }
    catch (error) {
        next(error);
    }
};
exports.createInvoice = createInvoice;
const getInvoices = async (req, res, next) => {
    try {
        const invoices = await Invoice_1.default.find()
            .populate('customer')
            .populate('items.item')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: invoices });
    }
    catch (error) {
        next(error);
    }
};
exports.getInvoices = getInvoices;
const getInvoiceById = async (req, res, next) => {
    try {
        const invoice = await Invoice_1.default.findById(req.params.id)
            .populate('customer')
            .populate('items.item');
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        res.status(200).json({ success: true, data: invoice });
    }
    catch (error) {
        next(error);
    }
};
exports.getInvoiceById = getInvoiceById;
const updateInvoice = async (req, res, next) => {
    try {
        // Note: In a real ERP, changing the total of an invoice should recalculate balanceDue 
        // by subtracting any applied payments. For now, we'll assume editing only happens when unpaid.
        if (req.body.total !== undefined) {
            req.body.balanceDue = req.body.total; // Simple assumption for now
        }
        const invoice = await Invoice_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('customer').populate('items.item');
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        res.status(200).json({ success: true, data: invoice });
    }
    catch (error) {
        next(error);
    }
};
exports.updateInvoice = updateInvoice;
const deleteInvoice = async (req, res, next) => {
    try {
        const invoice = await Invoice_1.default.findByIdAndDelete(req.params.id);
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteInvoice = deleteInvoice;
