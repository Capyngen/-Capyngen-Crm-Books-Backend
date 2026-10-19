"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToInvoice = exports.deleteDeliveryChallan = exports.updateDeliveryChallan = exports.getDeliveryChallanById = exports.getDeliveryChallans = exports.createDeliveryChallan = void 0;
const context_1 = require("../../../context");
const DeliveryChallan_1 = __importDefault(require("../models/DeliveryChallan"));
const Invoice_1 = __importDefault(require("../../billing/models/Invoice"));
const ApprovalWorkflowService_1 = require("../../../core/services/ApprovalWorkflowService");
const PostingEngine_1 = require("../../books/services/PostingEngine");
const Item_1 = __importDefault(require("../models/Item"));
const createDeliveryChallan = async (req, res, next) => {
    try {
        const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService_1.ApprovalWorkflowService.resolveUserContext(req);
        let challanNumber = req.body.challanNumber;
        if (!challanNumber) {
            let nextNum = (await DeliveryChallan_1.default.countDocuments({ $or: [{ orgId }, { companyId: orgId }] })) + 1;
            let isUnique = false;
            while (!isUnique) {
                challanNumber = `DC-${String(nextNum).padStart(5, '0')}`;
                const exists = await DeliveryChallan_1.default.findOne({ challanNumber, $or: [{ orgId }, { companyId: orgId }] });
                if (exists) {
                    nextNum++;
                }
                else {
                    isUnique = true;
                }
            }
        }
        const requestedStatus = req.body.status || 'Delivered';
        let finalStatus = requestedStatus;
        let finalApprovalStatus = 'Approved';
        if (requestedStatus === 'Draft') {
            finalStatus = 'Draft';
            finalApprovalStatus = 'Draft';
        }
        else {
            const evalResult = await ApprovalWorkflowService_1.ApprovalWorkflowService.evaluateApprovalNeed(orgId, 'delivery_challans', Number(req.body.total || 0), user, userRole);
            if (evalResult.requiresApproval) {
                finalStatus = 'Draft';
                finalApprovalStatus = 'Pending';
            }
            else {
                finalStatus = 'Delivered';
                finalApprovalStatus = 'Approved';
            }
        }
        const deliveryChallan = await DeliveryChallan_1.default.create({
            ...req.body,
            challanNumber,
            status: finalStatus,
            approvalStatus: finalApprovalStatus,
            companyId: orgId,
            orgId,
            createdBy: userId
        });
        if (finalApprovalStatus === 'Pending') {
            await ApprovalWorkflowService_1.ApprovalWorkflowService.submitForApproval({
                orgId,
                module: 'delivery_challans',
                documentId: deliveryChallan._id.toString(),
                documentNumber: challanNumber,
                amount: Number(req.body.total || 0),
                customerOrVendorName: req.body.customerName || 'Customer',
                requestedBy: userId || 'system',
                requestedByName: user?.displayName || user?.name || user?.email,
                creatorRoleId: roleId
            });
        }
        else if (finalStatus === 'Delivered') {
            // Deduct stock
            if (deliveryChallan.items && Array.isArray(deliveryChallan.items)) {
                for (const line of deliveryChallan.items) {
                    if (line.item) {
                        const itemDoc = await Item_1.default.findById(line.item);
                        if (itemDoc && itemDoc.type !== 'service') {
                            const qty = Number(line.quantity || 0);
                            await Item_1.default.findByIdAndUpdate(line.item, {
                                $inc: { stock: -qty, currentStock: -qty, stockQuantity: -qty }
                            });
                        }
                    }
                }
            }
            await PostingEngine_1.PostingEngine.handleEvent('DELIVERY_CHALLAN_ISSUED', {
                challanId: deliveryChallan._id.toString(),
                companyId: orgId,
                total: deliveryChallan.total || 0
            });
        }
        const populated = await DeliveryChallan_1.default.findById(deliveryChallan._id).populate('customer').populate('items.item');
        res.status(201).json({ success: true, data: populated });
    }
    catch (error) {
        next(error);
    }
};
exports.createDeliveryChallan = createDeliveryChallan;
const getDeliveryChallans = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
        const challans = await DeliveryChallan_1.default.find(filter)
            .populate('customer')
            .populate('items.item')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: challans });
    }
    catch (error) {
        next(error);
    }
};
exports.getDeliveryChallans = getDeliveryChallans;
const getDeliveryChallanById = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const challan = await DeliveryChallan_1.default.findOne(filter)
            .populate('customer')
            .populate('items.item');
        if (!challan) {
            return res.status(404).json({ success: false, message: 'Delivery Challan not found' });
        }
        res.status(200).json({ success: true, data: challan });
    }
    catch (error) {
        next(error);
    }
};
exports.getDeliveryChallanById = getDeliveryChallanById;
const updateDeliveryChallan = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const challan = await DeliveryChallan_1.default.findOneAndUpdate(filter, req.body, {
            new: true,
            runValidators: true
        }).populate('customer').populate('items.item');
        if (!challan) {
            return res.status(404).json({ success: false, message: 'Delivery Challan not found' });
        }
        res.status(200).json({ success: true, data: challan });
    }
    catch (error) {
        next(error);
    }
};
exports.updateDeliveryChallan = updateDeliveryChallan;
const deleteDeliveryChallan = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        const challan = await DeliveryChallan_1.default.findOneAndDelete(filter);
        if (!challan) {
            return res.status(404).json({ success: false, message: 'Delivery Challan not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDeliveryChallan = deleteDeliveryChallan;
const convertToInvoice = async (req, res, next) => {
    try {
        const { orgId, user, userId } = await ApprovalWorkflowService_1.ApprovalWorkflowService.resolveUserContext(req);
        const dc = await DeliveryChallan_1.default.findById(req.params.id);
        if (!dc)
            return res.status(404).json({ success: false, message: 'Delivery Challan not found' });
        let nextNum = (await Invoice_1.default.countDocuments({ $or: [{ orgId }, { companyId: orgId }] })) + 1;
        let invoiceNumber = `INV-${String(nextNum).padStart(5, '0')}`;
        while (await Invoice_1.default.findOne({ invoiceNumber, $or: [{ orgId }, { companyId: orgId }] })) {
            nextNum++;
            invoiceNumber = `INV-${String(nextNum).padStart(5, '0')}`;
        }
        const invItems = (dc.items || []).map((item) => ({
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
            customer: dc.customer,
            referenceNumber: dc.challanNumber,
            salesOrderId: dc.salesOrderId,
            invoiceDate: new Date(),
            items: invItems,
            subTotal: dc.subTotal,
            discountType: dc.discountType,
            discountValue: dc.discountValue,
            discount: dc.discount,
            total: dc.total,
            balanceDue: dc.total,
            notes: dc.notes,
            terms: dc.terms,
            status: 'Open',
            approvalStatus: 'Approved',
            postingStatus: 'Posted',
            createdBy: userId
        });
        dc.invoiceId = invoice._id;
        dc.status = 'Closed';
        await dc.save();
        // GL Posting for Invoice
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
