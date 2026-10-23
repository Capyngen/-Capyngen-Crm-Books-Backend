"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeRisk = exports.consolidateInvoices = exports.deleteInvoice = exports.updateInvoice = exports.getInvoiceById = exports.getInvoices = exports.createInvoice = void 0;
const context_1 = require("../../../context");
const ledgerService_1 = require("../../books/services/ledgerService");
const PostingEngine_1 = require("../../books/services/PostingEngine");
const mongoose_1 = __importDefault(require("mongoose"));
const Invoice_1 = __importDefault(require("../models/Invoice"));
const ApprovalWorkflowService_1 = require("../../../core/services/ApprovalWorkflowService");
const UserOrganization_1 = require("../../core/models/UserOrganization");
const createInvoice = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || req.org?._id?.toString() || req.body.orgId || 'SYSTEM';
        const user = req.user;
        const userId = user?._id?.toString() || user?.id || context_1.requestContext.getStore()?.userId;
        let invoiceNumber = req.body.invoiceNumber;
        if (invoiceNumber) {
            const existing = await Invoice_1.default.findOne({ invoiceNumber, orgId });
            if (existing) {
                return res.status(400).json({ success: false, message: `Invoice number ${invoiceNumber} already exists` });
            }
        }
        let userRole = null;
        let roleId = context_1.requestContext.getStore()?.roleId;
        if (orgId && (userId || user?.email)) {
            const conditions = [];
            if (userId) {
                if (mongoose_1.default.isValidObjectId(userId))
                    conditions.push({ userId: new mongoose_1.default.Types.ObjectId(userId) });
                conditions.push({ userId: userId.toString() });
            }
            if (user?.email) {
                conditions.push({ email: user.email.toLowerCase() });
            }
            const userOrg = await UserOrganization_1.UserOrganization.findOne({ orgId, $or: conditions }).populate('roleId').lean();
            if (userOrg?.roleId) {
                userRole = userOrg.roleId;
                roleId = userOrg.roleId._id?.toString();
            }
        }
        const requestedStatus = req.body.status || 'Draft';
        let finalStatus = requestedStatus;
        let finalApprovalStatus = 'Approved';
        if (requestedStatus === 'Draft') {
            finalStatus = 'Draft';
            finalApprovalStatus = 'Draft';
        }
        else {
            const evalResult = await ApprovalWorkflowService_1.ApprovalWorkflowService.evaluateApprovalNeed(orgId, 'invoices', Number(req.body.total || 0), user, userRole);
            if (evalResult.requiresApproval) {
                finalStatus = 'Pending Approval';
                finalApprovalStatus = 'Pending';
            }
        }
        const invoice = await Invoice_1.default.create({
            ...req.body,
            status: finalStatus,
            approvalStatus: finalApprovalStatus,
            orgId,
            companyId: orgId
        });
        try {
            await invoice.populate('customer');
        }
        catch (e) { }
        try {
            await invoice.populate('items.item');
        }
        catch (e) { }
        if (finalApprovalStatus === 'Pending') {
            try {
                await ApprovalWorkflowService_1.ApprovalWorkflowService.submitForApproval({
                    orgId,
                    module: 'invoices',
                    documentId: invoice._id.toString(),
                    documentNumber: invoice.invoiceNumber,
                    amount: invoice.total,
                    customerOrVendorName: invoice.customer?.displayName || invoice.customer?.name || 'Customer',
                    requestedBy: userId || 'system',
                    requestedByName: user?.displayName || user?.name || user?.email,
                    creatorRoleId: roleId
                });
            }
            catch (apprErr) {
                console.error('Failed to submit approval request:', apprErr);
            }
        }
        else if (invoice.status !== 'Draft') {
            const payload = {
                invoiceId: invoice._id.toString(),
                companyId: orgId,
                customerId: invoice.customer?._id?.toString() || invoice.customer?.toString(),
                subTotal: invoice.subTotal || 0,
                taxTotal: invoice.taxTotal || 0,
                grandTotal: invoice.total || 0,
                invoiceDate: invoice.invoiceDate,
                invoiceNumber: invoice.invoiceNumber
            };
            try {
                await PostingEngine_1.PostingEngine.handleEvent('INVOICE_APPROVED', payload);
            }
            catch (postErr) {
                console.error('Failed to post approved invoice to GL:', postErr);
            }
            try {
                await Promise.resolve().then(() => __importStar(require('../../../core/events/eventBus'))).then(m => m.eventBus.emitAsync(m.EVENTS.INVOICE_CREATED, { invoice, companyId: orgId }));
            }
            catch (eventErr) {
                console.warn('Invoice eventBus error:', eventErr);
            }
        }
        res.status(201).json({ success: true, data: invoice });
    }
    catch (error) {
        require('fs').appendFileSync('d:/backend/error.log', new Date().toISOString() + ' ' + (error?.stack || error) + '\n');
        if (error?.code === 11000) {
            return res.status(400).json({ success: false, message: 'Invoice number already exists. Please choose a different number.' });
        }
        res.status(500).json({ success: false, message: error?.message || 'Internal server error while creating invoice' });
    }
};
exports.createInvoice = createInvoice;
const tenantFilter_1 = require("../../../core/utils/tenantFilter");
const getInvoices = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = { ...tenantFilter };
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
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = Object.keys(tenantFilter).length > 0
            ? { _id: req.params.id, ...tenantFilter }
            : { _id: req.params.id };
        const invoice = await Invoice_1.default.findOne(filter).populate('customer').populate('items.item');
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
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const originalInvoice = await Invoice_1.default.findOne({ _id: req.params.id, ...tenantFilter });
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
        const orgId = (context_1.requestContext.getStore()?.orgId || originalInvoice.orgId || 'SYSTEM');
        const user = req.user;
        const userId = user?._id?.toString() || user?.id || context_1.requestContext.getStore()?.userId;
        // Check if status is transitioning to Pending Approval
        if (req.body.status === 'Pending Approval' || req.body.approvalStatus === 'Pending') {
            let roleId = context_1.requestContext.getStore()?.roleId;
            await ApprovalWorkflowService_1.ApprovalWorkflowService.submitForApproval({
                orgId,
                module: 'invoices',
                documentId: req.params.id,
                documentNumber: originalInvoice.invoiceNumber,
                amount: Number(req.body.total ?? originalInvoice.total),
                customerOrVendorName: originalInvoice.customer?.displayName || originalInvoice.customer?.name,
                requestedBy: userId || 'system',
                requestedByName: user?.displayName || user?.name || user?.email,
                creatorRoleId: roleId
            });
            req.body.status = 'Pending Approval';
            req.body.approvalStatus = 'Pending';
        }
        const invoice = await Invoice_1.default.findOneAndUpdate({ _id: req.params.id, ...tenantFilter }, req.body, { new: true, runValidators: true }).populate('customer').populate('items.item');
        if (!invoice)
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        if (invoice.status === 'Void') {
            await ledgerService_1.LedgerService.voidTransaction(orgId, invoice._id.toString(), new Date());
        }
        else if (invoice.status !== 'Draft' && invoice.status !== 'Pending Approval') {
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
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const originalInvoice = await Invoice_1.default.findOne({ _id: req.params.id, ...tenantFilter });
        if (!originalInvoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        // Fix for Edge Case 3: Cannot delete if payments are applied
        if (originalInvoice.balanceDue < originalInvoice.total) {
            return res.status(400).json({ success: false, message: 'Cannot delete an invoice that has payments applied. Delete payments first.' });
        }
        const invoice = await Invoice_1.default.findOneAndDelete({ _id: req.params.id, ...tenantFilter });
        const orgId = context_1.requestContext.getStore()?.orgId || originalInvoice.orgId || 'SYSTEM';
        await ledgerService_1.LedgerService.deleteTransaction(orgId, originalInvoice._id.toString());
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteInvoice = deleteInvoice;
const InvoiceConsolidationService_1 = require("../services/InvoiceConsolidationService");
const PaymentPredictionService_1 = require("../services/PaymentPredictionService");
const consolidateInvoices = async (req, res) => {
    try {
        const { customerId, invoiceIds } = req.body;
        const consolidated = await InvoiceConsolidationService_1.InvoiceConsolidationService.consolidateInvoices(customerId, invoiceIds, 'system');
        res.status(201).json({ success: true, data: consolidated });
    }
    catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};
exports.consolidateInvoices = consolidateInvoices;
const analyzeRisk = async (req, res) => {
    try {
        const analysis = await PaymentPredictionService_1.PaymentPredictionService.analyzeInvoiceRisk(req.params.id);
        res.status(200).json({ success: true, data: analysis });
    }
    catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};
exports.analyzeRisk = analyzeRisk;
