import { requestContext } from '../../../context';
import { Request, Response, NextFunction } from 'express';
import Quote from '../models/Quote';
import SalesOrder from '../models/SalesOrder';
import Invoice from '../models/Invoice';
import Item from '../../inventory/models/Item';
import { PostingEngine } from '../../books/services/PostingEngine';
import { ApprovalWorkflowService } from '../../../core/services/ApprovalWorkflowService';

export const createQuote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService.resolveUserContext(req);

    let quoteNumber = req.body.quoteNumber;
    if (!quoteNumber) {
      let nextNum = (await Quote.countDocuments({ $or: [{ orgId }, { companyId: orgId }] })) + 1;
      let isUnique = false;
      while (!isUnique) {
        quoteNumber = `QUO-${String(nextNum).padStart(5, '0')}`;
        const exists = await Quote.findOne({ quoteNumber, $or: [{ orgId }, { companyId: orgId }] });
        if (exists) {
          nextNum++;
        } else {
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
    } else {
      const evalResult = await ApprovalWorkflowService.evaluateApprovalNeed(
        orgId,
        'quotes',
        Number(req.body.total || 0),
        user,
        userRole
      );

      if (evalResult.requiresApproval) {
        finalStatus = 'Draft';
        finalApprovalStatus = 'Pending';
      } else {
        finalStatus = requestedStatus === 'Draft' ? 'Draft' : 'Sent';
        finalApprovalStatus = 'Approved';
      }
    }

    const quote = await Quote.create({
      ...req.body,
      quoteNumber,
      status: finalStatus,
      approvalStatus: finalApprovalStatus,
      companyId: orgId,
      orgId,
      createdBy: userId
    });

    if (finalApprovalStatus === 'Pending') {
      await ApprovalWorkflowService.submitForApproval({
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

    const populated = await Quote.findById(quote._id).populate('customer').populate('items.item');
    res.status(201).json({ success: true, data: populated || quote });
  } catch (error) {
    next(error);
  }
};

import { buildTenantFilter } from '../../../core/utils/tenantFilter';

export const getQuotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const quotes = await Quote.find(tenantFilter)
      .populate('customer')
      .populate('items.item')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: quotes.length, data: quotes });
  } catch (error) {
    next(error);
  }
};

export const getQuoteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0 
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };

    const quote = await Quote.findOne(filter)
      .populate('customer')
      .populate('items.item');
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });
    res.status(200).json({ success: true, data: quote });
  } catch (error) {
    next(error);
  }
};

export const updateQuote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0 
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };

    const quote = await Quote.findOneAndUpdate(filter, req.body, { new: true })
      .populate('customer')
      .populate('items.item');
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });
    res.status(200).json({ success: true, data: quote });
  } catch (error) {
    next(error);
  }
};

export const deleteQuote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0 
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };

    const quote = await Quote.findOneAndDelete(filter);
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const convertToSalesOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userId } = await ApprovalWorkflowService.resolveUserContext(req);
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });

    let nextNum = (await SalesOrder.countDocuments({ $or: [{ orgId }, { companyId: orgId }] })) + 1;
    let salesOrderNumber = `SO-${String(nextNum).padStart(5, '0')}`;
    while (await SalesOrder.findOne({ salesOrderNumber, $or: [{ orgId }, { companyId: orgId }] })) {
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

    const so = await SalesOrder.create({
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
    quote.salesOrderId = (so as any)._id;
    await quote.save();

    // Increment committed stock
    for (const line of soItems) {
      if (line.item) {
        await Item.findByIdAndUpdate(line.item, {
          $inc: { committedStock: Number(line.quantity || 0) }
        });
      }
    }

    const populated = await SalesOrder.findById((so as any)._id).populate('customer').populate('items.item');
    res.status(201).json({ success: true, data: populated || so });
  } catch (error) {
    next(error);
  }
};

export const convertToInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userId } = await ApprovalWorkflowService.resolveUserContext(req);
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });

    let nextNum = (await Invoice.countDocuments({ $or: [{ orgId }, { companyId: orgId }] })) + 1;
    let invoiceNumber = `INV-${String(nextNum).padStart(5, '0')}`;
    while (await Invoice.findOne({ invoiceNumber, $or: [{ orgId }, { companyId: orgId }] })) {
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

    const invoice = await Invoice.create({
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
    quote.invoiceId = (invoice as any)._id;
    await quote.save();

    // GL Posting
    await PostingEngine.handleEvent('INVOICE_APPROVED', {
      invoiceId: (invoice as any)._id.toString(),
      companyId: orgId,
      customerId: (invoice as any).customer?.toString(),
      subTotal: (invoice as any).subTotal || 0,
      taxTotal: (invoice as any).taxTotal || 0,
      grandTotal: (invoice as any).total || 0,
      invoiceDate: (invoice as any).invoiceDate,
      invoiceNumber: (invoice as any).invoiceNumber
    });

    const populated = await Invoice.findById((invoice as any)._id).populate('customer').populate('items.item');
    res.status(201).json({ success: true, data: populated || invoice });
  } catch (error) {
    next(error);
  }
};
