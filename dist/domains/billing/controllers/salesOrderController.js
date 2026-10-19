"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToInvoice = exports.convertToDeliveryChallan = exports.fulfillSalesOrder = exports.deleteSalesOrder = exports.updateSalesOrder = exports.getSalesOrderById = exports.getSalesOrders = exports.createSalesOrder = void 0;
const context_1 = require("../../../context");
const SalesOrder_1 = __importDefault(require("../models/SalesOrder"));
const Invoice_1 = __importDefault(require("../models/Invoice"));
const DeliveryChallan_1 = __importDefault(require("../../inventory/models/DeliveryChallan"));
const CustomerBalanceService_1 = require("../services/CustomerBalanceService");
const SalesOrderFulfillmentService_1 = require("../services/SalesOrderFulfillmentService");
const ApprovalWorkflowService_1 = require("../../../core/services/ApprovalWorkflowService");
const PostingEngine_1 = require("../../books/services/PostingEngine");
const Item_1 = __importDefault(require("../../inventory/models/Item"));
const createSalesOrder = async (req, res, next) => {
    try {
        const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService_1.ApprovalWorkflowService.resolveUserContext(req);
        let salesOrderNumber = req.body.salesOrderNumber;
        if (!salesOrderNumber) {
            let nextNum = (await SalesOrder_1.default.countDocuments()) + 1;
            let isUnique = false;
            while (!isUnique) {
                salesOrderNumber = `SO-${String(nextNum).padStart(5, '0')}`;
                const exists = await SalesOrder_1.default.findOne({ salesOrderNumber, $or: [{ orgId }, { companyId: orgId }] });
                if (exists) {
                    nextNum++;
                }
                else {
                    isUnique = true;
                }
            }
        }
        // ERP Credit Limit Validation
        if (req.body.customer) {
            const total = req.body.total || 0;
            const creditCheck = await CustomerBalanceService_1.CustomerBalanceService.validateCreditLimit(req.body.customer, total);
            if (!creditCheck.allowed) {
                return res.status(400).json({
                    success: false,
                    message: `Credit Limit Exceeded! Transaction ${total}, Limit ${creditCheck.limit}, Available ${creditCheck.remaining}.`
                });
            }
        }
        const requestedStatus = req.body.status || 'Confirmed';
        let finalStatus = requestedStatus;
        let finalApprovalStatus = 'Approved';
        if (requestedStatus === 'Draft') {
            finalStatus = 'Draft';
            finalApprovalStatus = 'Draft';
        }
        else {
            const evalResult = await ApprovalWorkflowService_1.ApprovalWorkflowService.evaluateApprovalNeed(orgId, 'sales_orders', Number(req.body.total || 0), user, userRole);
            if (evalResult.requiresApproval) {
                finalStatus = 'Draft';
                finalApprovalStatus = 'Pending';
            }
            else {
                finalStatus = 'Confirmed';
                finalApprovalStatus = 'Approved';
            }
        }
        const salesOrder = await SalesOrder_1.default.create({
            ...req.body,
            salesOrderNumber,
            status: finalStatus,
            approvalStatus: finalApprovalStatus,
            companyId: orgId,
            orgId,
            createdBy: userId
        });
        if (finalApprovalStatus === 'Pending') {
            await ApprovalWorkflowService_1.ApprovalWorkflowService.submitForApproval({
                orgId,
                module: 'sales_orders',
                documentId: salesOrder._id.toString(),
                documentNumber: salesOrderNumber,
                amount: Number(req.body.total || 0),
                customerOrVendorName: req.body.customerName || 'Customer',
                requestedBy: userId || 'system',
                requestedByName: user?.displayName || user?.name || user?.email,
                creatorRoleId: roleId
            });
        }
        else if (finalStatus === 'Confirmed') {
            // Increment committed stock
            if (salesOrder.items && Array.isArray(salesOrder.items)) {
                for (const line of salesOrder.items) {
                    if (line.item) {
                        const qty = Number(line.quantity || 0);
                        await Item_1.default.findByIdAndUpdate(line.item, {
                            $inc: { committedStock: qty }
                        });
                    }
                }
            }
        }
        const populated = await SalesOrder_1.default.findById(salesOrder._id).populate('customer').populate('items.item');
        res.status(201).json({ success: true, data: populated });
    }
    catch (error) {
        next(error);
    }
};
exports.createSalesOrder = createSalesOrder;
const getSalesOrders = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
        const salesOrders = await SalesOrder_1.default.find(filter)
            .populate('customer')
            .populate('items.item')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: salesOrders });
    }
    catch (error) {
        next(error);
    }
};
exports.getSalesOrders = getSalesOrders;
const getSalesOrderById = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const salesOrder = await SalesOrder_1.default.findOne(filter)
            .populate('customer')
            .populate('items.item');
        if (!salesOrder) {
            return res.status(404).json({ success: false, message: 'Sales Order not found' });
        }
        res.status(200).json({ success: true, data: salesOrder });
    }
    catch (error) {
        next(error);
    }
};
exports.getSalesOrderById = getSalesOrderById;
const updateSalesOrder = async (req, res, next) => {
    try {
        const salesOrder = await SalesOrder_1.default.findOneAndUpdate({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
            new: true,
            runValidators: true
        }).populate('customer').populate('items.item');
        if (!salesOrder) {
            return res.status(404).json({ success: false, message: 'Sales Order not found' });
        }
        res.status(200).json({ success: true, data: salesOrder });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSalesOrder = updateSalesOrder;
const deleteSalesOrder = async (req, res, next) => {
    try {
        const salesOrder = await SalesOrder_1.default.findOneAndDelete({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } });
        if (!salesOrder) {
            return res.status(404).json({ success: false, message: 'Sales Order not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSalesOrder = deleteSalesOrder;
const fulfillSalesOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { items } = req.body;
        const userId = req.user?._id || 'system';
        const result = await SalesOrderFulfillmentService_1.SalesOrderFulfillmentService.fulfill(id, items, userId);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.fulfillSalesOrder = fulfillSalesOrder;
const convertToDeliveryChallan = async (req, res, next) => {
    try {
        const { orgId, user, userId } = await ApprovalWorkflowService_1.ApprovalWorkflowService.resolveUserContext(req);
        const so = await SalesOrder_1.default.findById(req.params.id);
        if (!so)
            return res.status(404).json({ success: false, message: 'Sales Order not found' });
        let nextNum = (await DeliveryChallan_1.default.countDocuments({ $or: [{ orgId }, { companyId: orgId }] })) + 1;
        let challanNumber = `DC-${String(nextNum).padStart(5, '0')}`;
        while (await DeliveryChallan_1.default.findOne({ challanNumber, $or: [{ orgId }, { companyId: orgId }] })) {
            nextNum++;
            challanNumber = `DC-${String(nextNum).padStart(5, '0')}`;
        }
        const dcItems = (so.items || []).map(item => ({
            item: item.item,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount
        }));
        const dc = await DeliveryChallan_1.default.create({
            orgId,
            companyId: orgId,
            challanNumber,
            customer: so.customer,
            salesOrderId: so._id,
            referenceNumber: so.salesOrderNumber,
            challanDate: new Date(),
            items: dcItems,
            subTotal: so.subTotal,
            discountType: so.discountType,
            discountValue: so.discountValue,
            discount: so.discount,
            total: so.total,
            notes: so.notes,
            terms: so.terms,
            status: 'Delivered',
            approvalStatus: 'Approved',
            createdBy: userId
        });
        // Physical stock deduction & release committed stock
        for (const line of dcItems) {
            if (line.item) {
                const qty = Number(line.quantity || 0);
                await Item_1.default.findByIdAndUpdate(line.item, {
                    $inc: { stock: -qty, currentStock: -qty, stockQuantity: -qty, committedStock: -qty }
                });
            }
        }
        // Post COGS GL entry
        await PostingEngine_1.PostingEngine.handleEvent('DELIVERY_CHALLAN_ISSUED', {
            challanId: dc._id.toString(),
            companyId: orgId,
            total: dc.total || 0,
            challanDate: dc.challanDate
        });
        const populated = await DeliveryChallan_1.default.findById(dc._id).populate('customer').populate('items.item');
        res.status(201).json({ success: true, data: populated || dc });
    }
    catch (error) {
        next(error);
    }
};
exports.convertToDeliveryChallan = convertToDeliveryChallan;
const convertToInvoice = async (req, res, next) => {
    try {
        const { orgId, user, userId } = await ApprovalWorkflowService_1.ApprovalWorkflowService.resolveUserContext(req);
        const so = await SalesOrder_1.default.findById(req.params.id);
        if (!so)
            return res.status(404).json({ success: false, message: 'Sales Order not found' });
        let nextNum = (await Invoice_1.default.countDocuments({ $or: [{ orgId }, { companyId: orgId }] })) + 1;
        let invoiceNumber = `INV-${String(nextNum).padStart(5, '0')}`;
        while (await Invoice_1.default.findOne({ invoiceNumber, $or: [{ orgId }, { companyId: orgId }] })) {
            nextNum++;
            invoiceNumber = `INV-${String(nextNum).padStart(5, '0')}`;
        }
        const invItems = (so.items || []).map(item => ({
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
            customer: so.customer,
            salesOrderId: so._id,
            referenceNumber: so.salesOrderNumber,
            invoiceDate: new Date(),
            items: invItems,
            subTotal: so.subTotal,
            discountType: so.discountType,
            discountValue: so.discountValue,
            discount: so.discount,
            taxTotal: so.taxTotal,
            total: so.total,
            balanceDue: so.total,
            notes: so.notes,
            terms: so.terms,
            status: 'Open',
            approvalStatus: 'Approved',
            postingStatus: 'Posted',
            createdBy: userId
        });
        so.status = 'Invoiced';
        await so.save();
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
