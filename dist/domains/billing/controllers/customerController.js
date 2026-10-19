"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerStatement = exports.getCustomerTransactions = exports.deleteCustomer = exports.updateCustomer = exports.getCustomerById = exports.getCustomers = exports.createCustomer = void 0;
const context_1 = require("../../../context");
const PostingEngine_1 = require("../../books/services/PostingEngine");
const Customer_1 = __importDefault(require("../models/Customer"));
const Invoice_1 = __importDefault(require("../models/Invoice"));
const Quote_1 = __importDefault(require("../models/Quote"));
const SalesOrder_1 = __importDefault(require("../models/SalesOrder"));
const PaymentReceived_1 = __importDefault(require("../models/PaymentReceived"));
const CreditNote_1 = __importDefault(require("../models/CreditNote"));
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
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId: orgId }] } : {};
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
        const filter = orgId ? { _id: req.params.id, $or: [{ companyId: orgId }, { orgId: orgId }] } : { _id: req.params.id };
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
const getCustomerTransactions = async (req, res, next) => {
    try {
        const orgId = req.org?._id || context_1.requestContext.getStore()?.orgId;
        const customerId = req.params.id;
        const [invoices, quotes, salesOrders, paymentsReceived, creditNotes] = await Promise.all([
            Invoice_1.default.find({ customer: customerId }).sort({ invoiceDate: -1 }).lean(),
            Quote_1.default.find({ customer: customerId }).sort({ quoteDate: -1 }).lean(),
            SalesOrder_1.default.find({ customer: customerId }).sort({ salesOrderDate: -1 }).lean(),
            PaymentReceived_1.default.find({ customer: customerId }).sort({ paymentDate: -1 }).lean(),
            CreditNote_1.default.find({ customer: customerId }).sort({ creditNoteDate: -1 }).lean()
        ]);
        res.status(200).json({
            success: true,
            data: {
                invoices,
                quotes,
                salesOrders,
                paymentsReceived,
                creditNotes
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerTransactions = getCustomerTransactions;
const getCustomerStatement = async (req, res, next) => {
    try {
        const customerId = req.params.id;
        const customer = await Customer_1.default.findById(customerId).lean();
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        const [invoices, payments, creditNotes] = await Promise.all([
            Invoice_1.default.find({ customer: customerId, invoiceDate: { $gte: start, $lte: end }, status: { $ne: 'Draft' } }).lean(),
            PaymentReceived_1.default.find({ customer: customerId, paymentDate: { $gte: start, $lte: end } }).lean(),
            CreditNote_1.default.find({ customer: customerId, creditNoteDate: { $gte: start, $lte: end }, status: { $ne: 'Draft' } }).lean()
        ]);
        const openingBalance = Number(customer.openingBalance || 0);
        const statementLines = [];
        // Invoices are Debits (increase customer balance)
        invoices.forEach(inv => {
            statementLines.push({
                date: inv.invoiceDate,
                type: 'Invoice',
                reference: inv.invoiceNumber,
                details: `Invoice #${inv.invoiceNumber}`,
                debit: Number(inv.total || 0),
                credit: 0
            });
        });
        // Payments are Credits (decrease customer balance)
        payments.forEach(pmt => {
            statementLines.push({
                date: pmt.paymentDate,
                type: 'Payment',
                reference: pmt.paymentNumber,
                details: `Payment Received #${pmt.paymentNumber} (${pmt.paymentMode || 'Cash'})`,
                debit: 0,
                credit: Number(pmt.amount || 0)
            });
        });
        // Credit notes are Credits (decrease customer balance)
        creditNotes.forEach(cn => {
            statementLines.push({
                date: cn.creditNoteDate,
                type: 'Credit Note',
                reference: cn.creditNoteNumber,
                details: `Credit Note #${cn.creditNoteNumber}`,
                debit: 0,
                credit: Number(cn.total || 0)
            });
        });
        // Sort chronologically
        statementLines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let runningBalance = openingBalance;
        let totalDebit = 0;
        let totalCredit = 0;
        const transactions = statementLines.map(line => {
            runningBalance = runningBalance + line.debit - line.credit;
            totalDebit += line.debit;
            totalCredit += line.credit;
            return {
                ...line,
                balance: Math.round(runningBalance * 100) / 100
            };
        });
        res.status(200).json({
            success: true,
            data: {
                customer: {
                    id: customer._id,
                    name: customer.displayName || customer.name,
                    companyName: customer.companyName,
                    email: customer.email,
                    phone: customer.phone,
                    currency: customer.currency || 'USD',
                    billingAddress: customer.billingAddress
                },
                period: {
                    startDate: start,
                    endDate: end
                },
                openingBalance,
                totalDebit: Math.round(totalDebit * 100) / 100,
                totalCredit: Math.round(totalCredit * 100) / 100,
                closingBalance: Math.round(runningBalance * 100) / 100,
                transactions
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerStatement = getCustomerStatement;
