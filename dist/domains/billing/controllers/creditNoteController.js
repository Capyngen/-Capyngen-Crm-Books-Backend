"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCreditNote = exports.updateCreditNote = exports.getCreditNoteById = exports.getCreditNotes = exports.createCreditNote = void 0;
const Invoice_1 = __importDefault(require("../models/Invoice"));
const context_1 = require("../../../context");
const PostingEngine_1 = require("../../books/services/PostingEngine");
const CreditNote_1 = __importDefault(require("../models/CreditNote"));
const ApprovalWorkflowService_1 = require("../../../core/services/ApprovalWorkflowService");
const createCreditNote = async (req, res, next) => {
    try {
        const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService_1.ApprovalWorkflowService.resolveUserContext(req);
        let creditNoteNumber = req.body.creditNoteNumber;
        if (!creditNoteNumber) {
            let nextNum = (await CreditNote_1.default.countDocuments()) + 1;
            let isUnique = false;
            while (!isUnique) {
                creditNoteNumber = `CN-${String(nextNum).padStart(5, '0')}`;
                const exists = await CreditNote_1.default.findOne({ creditNoteNumber, $or: [{ orgId }, { companyId: orgId }] });
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
        const requestedStatus = req.body.status || 'Open';
        let finalStatus = requestedStatus;
        let finalApprovalStatus = 'Approved';
        if (requestedStatus === 'Draft') {
            finalStatus = 'Draft';
            finalApprovalStatus = 'Draft';
        }
        else {
            const evalResult = await ApprovalWorkflowService_1.ApprovalWorkflowService.evaluateApprovalNeed(orgId, 'credit_notes', Number(req.body.total || 0), user, userRole);
            if (evalResult.requiresApproval) {
                finalStatus = 'Draft';
                finalApprovalStatus = 'Pending';
            }
            else {
                finalStatus = 'Open';
                finalApprovalStatus = 'Approved';
            }
        }
        const creditNote = await CreditNote_1.default.create({
            ...req.body,
            creditNoteNumber,
            status: finalStatus,
            approvalStatus: finalApprovalStatus,
            companyId: orgId,
            orgId,
            createdBy: userId
        });
        if (finalApprovalStatus === 'Pending') {
            await ApprovalWorkflowService_1.ApprovalWorkflowService.submitForApproval({
                orgId,
                module: 'credit_notes',
                documentId: creditNote._id.toString(),
                documentNumber: creditNoteNumber,
                amount: Number(req.body.total || 0),
                customerOrVendorName: req.body.customerName || 'Customer',
                requestedBy: userId || 'system',
                requestedByName: user?.displayName || user?.name || user?.email,
                creatorRoleId: roleId
            });
        }
        else if (finalStatus !== 'Draft') {
            const payload = {
                creditNoteId: creditNote._id.toString(),
                companyId: orgId,
                customerId: creditNote.customer?.toString(),
                subTotal: creditNote.subTotal || 0,
                taxTotal: creditNote.taxTotal || 0,
                total: creditNote.total || 0,
                creditNoteNumber: creditNote.creditNoteNumber
            };
            await PostingEngine_1.PostingEngine.handleEvent('CREDIT_NOTE_APPROVED', payload);
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
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
        const creditNotes = await CreditNote_1.default.find(filter)
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
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const creditNote = await CreditNote_1.default.findOne(filter)
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
        const creditNote = await CreditNote_1.default.findOneAndUpdate({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
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
        const creditNote = await CreditNote_1.default.findOneAndDelete({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } });
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
