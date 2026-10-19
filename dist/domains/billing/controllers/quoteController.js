"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToInvoice = exports.convertToSalesOrder = exports.deleteQuote = exports.updateQuote = exports.getQuoteById = exports.getQuotes = exports.createQuote = void 0;
const context_1 = require("../../../context");
const Quote_1 = __importDefault(require("../models/Quote"));
const SalesOrder_1 = __importDefault(require("../models/SalesOrder"));
const Invoice_1 = __importDefault(require("../models/Invoice"));
const Item_1 = __importDefault(require("../../inventory/models/Item"));
const PostingEngine_1 = require("../../books/services/PostingEngine");
const ApprovalWorkflowService_1 = require("../../../core/services/ApprovalWorkflowService");
const createQuote = async (req, res, next) => {
    try {
        const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService_1.ApprovalWorkflowService.resolveUserContext(req);
        let quoteNumber = req.body.quoteNumber;
        if (!quoteNumber) {
            let nextNum = (await Quote_1.default.countDocuments({ $or: [{ orgId }, { companyId: orgId }] })) + 1;
            let isUnique = false;
            while (!isUnique) {
                quoteNumber = `QUO-${String(nextNum).padStart(5, '0')}`;
                const exists = await Quote_1.default.findOne({ quoteNumber, $or: [{ orgId }, { companyId: orgId }] });
                if (exists) {
                    nextNum++;
                }
                else {
                    isUnique = true;
                }
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
            const evalResult = await ApprovalWorkflowService_1.ApprovalWorkflowService.evaluateApprovalNeed(orgId, 'quotes', Number(req.body.total || 0), user, userRole);
            if (evalResult.requiresApproval) {
                finalStatus = 'Draft';
                finalApprovalStatus = 'Pending';
            }
            else {
                finalStatus = requestedStatus === 'Draft' ? 'Draft' : 'Sent';
                finalApprovalStatus = 'Approved';
            }
        }
        const quote = await Quote_1.default.create({
            ...req.body,
            quoteNumber,
            status: finalStatus,
            approvalStatus: finalApprovalStatus,
            companyId: orgId,
            orgId,
            createdBy: userId
        });
        if (finalApprovalStatus === 'Pending') {
            await ApprovalWorkflowService_1.ApprovalWorkflowService.submitForApproval({
                orgId,
                module: 'quotes',
                documentId: quote._id.toString(),
                documentNumber: quoteNumber,
                amount: Number(req.body.total || 0),
                customerOrVendorName: req.body.customerName || 'Customer',
                requestedBy: userId || 'system',
                requestedByName: user?.displayName || user?.name || user?.email,
                creatorRoleId: roleId
            });
        }
        const populated = await Quote_1.default.findById(quote._id).populate('customer').populate('items.item');
        res.status(201).json({ success: true, data: populated || quote });
    }
    catch (error) {
        next(error);
    }
};
exports.createQuote = createQuote;
const getQuotes = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
        const quotes = await Quote_1.default.find(filter)
            .populate('customer')
            .populate('items.item')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: quotes.length, data: quotes });
    }
    catch (error) {
        next(error);
    }
};
exports.getQuotes = getQuotes;
const getQuoteById = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const quote = await Quote_1.default.findOne(filter)
            .populate('customer')
            .populate('items.item');
        if (!quote)
            return res.status(404).json({ success: false, message: 'Quote not found' });
        res.status(200).json({ success: true, data: quote });
    }
    catch (error) {
        next(error);
    }
};
exports.getQuoteById = getQuoteById;
const updateQuote = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const quote = await Quote_1.default.findOneAndUpdate(filter, req.body, { new: true })
            .populate('customer')
            .populate('items.item');
        if (!quote)
            return res.status(404).json({ success: false, message: 'Quote not found' });
        res.status(200).json({ success: true, data: quote });
    }
    catch (error) {
        next(error);
    }
};
exports.updateQuote = updateQuote;
const deleteQuote = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const quote = await Quote_1.default.findOneAndDelete(filter);
        if (!quote)
            return res.status(404).json({ success: false, message: 'Quote not found' });
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteQuote = deleteQuote;
const convertToSalesOrder = async (req, res, next) => {
    try {
        const { orgId, user, userId } = await ApprovalWorkflowService_1.ApprovalWorkflowService.resolveUserContext(req);
        const quote = await Quote_1.default.findById(req.params.id);
        if (!quote)
            return res.status(404).json({ success: false, message: 'Quote not found' });
        let nextNum = (await SalesOrder_1.default.countDocuments({ $or: [{ orgId }, { companyId: orgId }] })) + 1;
        let salesOrderNumber = `SO-${String(nextNum).padStart(5, '0')}`;
        while (await SalesOrder_1.default.findOne({ salesOrderNumber, $or: [{ orgId }, { companyId: orgId }] })) {
            nextNum++;
            salesOrderNumber = `SO-${String(nextNum).padStart(5, '0')}`;
        }
        const soItems = (quote.items || []).map(item => ({
            item: item.item,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount
        }));
        const so = await SalesOrder_1.default.create({
            orgId,
            companyId: orgId,
            salesOrderNumber,
            customer: quote.customer,
            salesOrderDate: new Date(),
            referenceNumber: quote.quoteNumber,
            items: soItems,
            subTotal: quote.subTotal,
            discountType: quote.discountType,
            discountValue: quote.discountValue,
            discount: quote.discount,
            taxTotal: quote.taxTotal,
            total: quote.total,
            notes: quote.notes,
            terms: quote.terms,
            status: 'Confirmed',
            approvalStatus: 'Approved',
            createdBy: userId
        });
        quote.status = 'Accepted';
        quote.salesOrderId = so._id;
        await quote.save();
        // Increment committed stock
        for (const line of soItems) {
            if (line.item) {
                await Item_1.default.findByIdAndUpdate(line.item, {
                    $inc: { committedStock: Number(line.quantity || 0) }
                });
            }
        }
        const populated = await SalesOrder_1.default.findById(so._id).populate('customer').populate('items.item');
        res.status(201).json({ success: true, data: populated || so });
    }
    catch (error) {
        next(error);
    }
};
exports.convertToSalesOrder = convertToSalesOrder;
const convertToInvoice = async (req, res, next) => {
    try {
        const { orgId, user, userId } = await ApprovalWorkflowService_1.ApprovalWorkflowService.resolveUserContext(req);
        const quote = await Quote_1.default.findById(req.params.id);
        if (!quote)
            return res.status(404).json({ success: false, message: 'Quote not found' });
        let nextNum = (await Invoice_1.default.countDocuments({ $or: [{ orgId }, { companyId: orgId }] })) + 1;
        let invoiceNumber = `INV-${String(nextNum).padStart(5, '0')}`;
        while (await Invoice_1.default.findOne({ invoiceNumber, $or: [{ orgId }, { companyId: orgId }] })) {
            nextNum++;
            invoiceNumber = `INV-${String(nextNum).padStart(5, '0')}`;
        }
        const invItems = (quote.items || []).map(item => ({
            item: item.item,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount
        }));
        const invoice = await Invoice_1.default.create({
            orgId,
            companyId: orgId,
            invoiceNumber,
            customer: quote.customer,
            invoiceDate: new Date(),
            referenceNumber: quote.quoteNumber,
            items: invItems,
            subTotal: quote.subTotal,
            discountType: quote.discountType,
            discountValue: quote.discountValue,
            discount: quote.discount,
            taxTotal: quote.taxTotal,
            total: quote.total,
            balanceDue: quote.total,
            notes: quote.notes,
            terms: quote.terms,
            status: 'Open',
            approvalStatus: 'Approved',
            postingStatus: 'Posted',
            createdBy: userId
        });
        quote.status = 'Invoiced';
        quote.invoiceId = invoice._id;
        await quote.save();
        // GL Posting
        await PostingEngine_1.PostingEngine.handleEvent('INVOICE_APPROVED', {
            invoiceId: invoice._id.toString(),
            companyId: orgId,
            customerId: invoice.customer?.toString(),
            subTotal: invoice.subTotal || 0,
            taxTotal: invoice.taxTotal || 0,
            grandTotal: invoice.total || 0,
            invoiceDate: invoice.invoiceDate,
            invoiceNumber: invoice.invoiceNumber
        });
        const populated = await Invoice_1.default.findById(invoice._id).populate('customer').populate('items.item');
        res.status(201).json({ success: true, data: populated || invoice });
    }
    catch (error) {
        next(error);
    }
};
exports.convertToInvoice = convertToInvoice;
