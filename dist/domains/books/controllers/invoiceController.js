"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInvoice = exports.updateInvoice = exports.getInvoiceById = exports.getInvoices = exports.createInvoice = void 0;
const context_1 = require("../../../context");
const ledgerService_1 = require("../services/ledgerService");
const Invoice_1 = __importDefault(require("../models/Invoice"));
const createInvoice = async (req, res, next) => {
    try {
        let invoiceNumber = req.body.invoiceNumber;
        if (invoiceNumber) {
            const existing = await Invoice_1.default.findOne({ invoiceNumber, orgId: context_1.requestContext.getStore()?.orgId || 'SYSTEM' });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Invoice number already exists' });
            }
        }
        const invoice = await Invoice_1.default.create({
            ...req.body,
            orgId: context_1.requestContext.getStore()?.orgId || 'SYSTEM'
        });
        await invoice.populate('customer');
        await invoice.populate('items.item');
        if (invoice.status !== 'Draft') {
            const orgId = (context_1.requestContext.getStore()?.orgId || invoice.orgId || 'SYSTEM');
            const cogsEstimate = (invoice.subTotal || 0) * 0.4;
            const adjustment = invoice.adjustment || 0;
            await ledgerService_1.LedgerService.postTransaction(orgId, invoice._id.toString(), 'Invoice', invoice.invoiceDate, [
                { accountId: invoice.accountsReceivable || 'Accounts Receivable', debit: invoice.total, contactId: invoice.customer?._id?.toString() || invoice.customer?.toString() },
                { accountId: 'Sales Income', credit: invoice.subTotal || 0 },
                { accountId: 'Tax Payable', credit: invoice.taxTotal || 0 },
                { accountId: 'Discount Given', debit: invoice.discount || 0 },
                { accountId: 'Adjustment', credit: adjustment > 0 ? adjustment : 0, debit: adjustment < 0 ? Math.abs(adjustment) : 0 },
                { accountId: 'Cost of Goods Sold', debit: cogsEstimate },
                { accountId: 'Inventory Asset', credit: cogsEstimate }
            ]);
        }
        res.status(201).json({ success: true, data: invoice });
    }
    catch (error) {
        require('fs').appendFileSync('d:/backend/error.log', new Date().toISOString() + ' ' + (error.stack || error) + '\n');
        next(error);
    }
};
exports.createInvoice = createInvoice;
const getInvoices = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }
        const invoices = await Invoice_1.default.find(filter).populate('customer').populate('items.item').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: invoices });
    }
    catch (error) {
        require('fs').appendFileSync('d:/backend/error.log', new Date().toISOString() + ' ' + (error.stack || error) + '\n');
        next(error);
    }
};
exports.getInvoices = getInvoices;
const getInvoiceById = async (req, res, next) => {
    try {
        const invoice = await Invoice_1.default.findById(req.params.id).populate('customer').populate('items.item');
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        res.status(200).json({ success: true, data: invoice });
    }
    catch (error) {
        require('fs').appendFileSync('d:/backend/error.log', new Date().toISOString() + ' ' + (error.stack || error) + '\n');
        next(error);
    }
};
exports.getInvoiceById = getInvoiceById;
const updateInvoice = async (req, res, next) => {
    try {
        const originalInvoice = await Invoice_1.default.findById(req.params.id);
        if (!originalInvoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        // Fix for Edge Case 3: Cannot void or edit if payments are applied
        if (originalInvoice.balanceDue < originalInvoice.total) {
            if (req.body.status === 'Void') {
                return res.status(400).json({ success: false, message: 'Cannot void an invoice that has payments applied. Delete payments first.' });
            }
        }
        if (req.body.total !== undefined) {
            // If we recalculate balance due, we should only do it for unpaid invoices
            if (originalInvoice.balanceDue === originalInvoice.total) {
                req.body.balanceDue = req.body.total;
            }
        }
        const invoice = await Invoice_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('customer').populate('items.item');
        if (!invoice)
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        const orgId = (context_1.requestContext.getStore()?.orgId || invoice.orgId || 'SYSTEM');
        if (invoice.status === 'Void') {
            await ledgerService_1.LedgerService.voidTransaction(orgId, invoice._id.toString(), new Date());
        }
        else if (invoice.status !== 'Draft') {
            const cogsEstimate = (invoice.subTotal || 0) * 0.4;
            const adjustment = invoice.adjustment || 0;
            await ledgerService_1.LedgerService.postTransaction(orgId, invoice._id.toString(), 'Invoice', invoice.invoiceDate, [
                { accountId: invoice.accountsReceivable || 'Accounts Receivable', debit: invoice.total, contactId: invoice.customer?._id?.toString() || invoice.customer?.toString() },
                { accountId: 'Sales Income', credit: invoice.subTotal || 0 },
                { accountId: 'Tax Payable', credit: invoice.taxTotal || 0 },
                { accountId: 'Discount Given', debit: invoice.discount || 0 },
                { accountId: 'Adjustment', credit: adjustment > 0 ? adjustment : 0, debit: adjustment < 0 ? Math.abs(adjustment) : 0 },
                { accountId: 'Cost of Goods Sold', debit: cogsEstimate },
                { accountId: 'Inventory Asset', credit: cogsEstimate }
            ]);
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
        const originalInvoice = await Invoice_1.default.findById(req.params.id);
        if (!originalInvoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        // Fix for Edge Case 3: Cannot delete if payments are applied
        if (originalInvoice.balanceDue < originalInvoice.total) {
            return res.status(400).json({ success: false, message: 'Cannot delete an invoice that has payments applied. Delete payments first.' });
        }
        const invoice = await Invoice_1.default.findByIdAndDelete(req.params.id);
        const orgId = context_1.requestContext.getStore()?.orgId || originalInvoice.orgId || 'SYSTEM';
        await ledgerService_1.LedgerService.deleteTransaction(orgId, originalInvoice._id.toString());
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteInvoice = deleteInvoice;
