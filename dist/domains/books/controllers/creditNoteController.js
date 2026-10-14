"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCreditNote = exports.updateCreditNote = exports.getCreditNoteById = exports.getCreditNotes = exports.createCreditNote = void 0;
const Invoice_1 = __importDefault(require("../models/Invoice"));
const context_1 = require("../../../context");
const ledgerService_1 = require("../services/ledgerService");
const CreditNote_1 = __importDefault(require("../models/CreditNote"));
const createCreditNote = async (req, res, next) => {
    try {
        let creditNoteNumber = req.body.creditNoteNumber;
        if (!creditNoteNumber) {
            let nextNum = (await CreditNote_1.default.countDocuments()) + 1;
            let isUnique = false;
            while (!isUnique) {
                creditNoteNumber = `CN-${String(nextNum).padStart(5, '0')}`;
                const exists = await CreditNote_1.default.findOne({ creditNoteNumber });
                if (exists) {
                    nextNum++;
                }
                else {
                    isUnique = true;
                }
            }
        }
        // Inherit salesperson from Invoice if linked
        if (req.body.invoiceId && !req.body.salesperson) {
            const originalInvoice = await Invoice_1.default.findById(req.body.invoiceId).lean();
            if (originalInvoice && originalInvoice.salesperson) {
                req.body.salesperson = originalInvoice.salesperson;
            }
        }
        const creditNote = await CreditNote_1.default.create({ ...req.body, creditNoteNumber });
        if (creditNote.status !== 'Draft') {
            const orgId = context_1.requestContext.getStore()?.orgId || creditNote.orgId || 'SYSTEM';
            const cogsEstimate = (creditNote.subTotal || 0) * 0.4; // rough estimate for demo
            await ledgerService_1.LedgerService.postTransaction(orgId, creditNote._id.toString(), 'Credit Note', creditNote.creditNoteDate || new Date(), [
                { accountId: 'Accounts Receivable', credit: creditNote.total, contactId: creditNote.customer?.toString() },
                { accountId: 'Sales Income', debit: creditNote.subTotal || 0 },
                { accountId: 'Tax Payable', debit: 0 }, // If tax was applied, we debit Tax Payable
                { accountId: 'Cost of Goods Sold', credit: cogsEstimate },
                { accountId: 'Inventory Asset', debit: cogsEstimate }
            ]);
        }
        const populated = await CreditNote_1.default.findById(creditNote._id).populate('customer').populate('items.item');
        res.status(201).json({ success: true, data: populated });
    }
    catch (error) {
        next(error);
    }
};
exports.createCreditNote = createCreditNote;
const getCreditNotes = async (req, res, next) => {
    try {
        const creditNotes = await CreditNote_1.default.find()
            .populate('customer')
            .populate('items.item')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: creditNotes });
    }
    catch (error) {
        next(error);
    }
};
exports.getCreditNotes = getCreditNotes;
const getCreditNoteById = async (req, res, next) => {
    try {
        const creditNote = await CreditNote_1.default.findById(req.params.id)
            .populate('customer')
            .populate('items.item');
        if (!creditNote) {
            return res.status(404).json({ success: false, message: 'Credit Note not found' });
        }
        res.status(200).json({ success: true, data: creditNote });
    }
    catch (error) {
        next(error);
    }
};
exports.getCreditNoteById = getCreditNoteById;
const updateCreditNote = async (req, res, next) => {
    try {
        const creditNote = await CreditNote_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('customer').populate('items.item');
        if (!creditNote) {
            return res.status(404).json({ success: false, message: 'Credit Note not found' });
        }
        res.status(200).json({ success: true, data: creditNote });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCreditNote = updateCreditNote;
const deleteCreditNote = async (req, res, next) => {
    try {
        const creditNote = await CreditNote_1.default.findByIdAndDelete(req.params.id);
        if (!creditNote) {
            return res.status(404).json({ success: false, message: 'Credit Note not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCreditNote = deleteCreditNote;
