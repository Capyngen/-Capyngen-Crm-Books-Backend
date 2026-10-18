import { requestContext } from '../../../context';
import { LedgerService } from '../../books/services/ledgerService';
import { PostingEngine } from '../../books/services/PostingEngine';
import { validateTransactionLock } from '../../books/services/transactionLockService';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Invoice from '../models/Invoice';
import { ApprovalWorkflowService } from '../../../core/services/ApprovalWorkflowService';
import { UserOrganization } from '../../core/models/UserOrganization';

export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || (req as any).org?._id?.toString() || req.body.orgId || 'SYSTEM';
    const user = (req as any).user;
    const userId = user?._id?.toString() || user?.id || requestContext.getStore()?.userId;

    let invoiceNumber = req.body.invoiceNumber;
    if (invoiceNumber) {
      const existing = await Invoice.findOne({ invoiceNumber, orgId });
      if (existing) {
        return res.status(400).json({ success: false, message: `Invoice number ${invoiceNumber} already exists` });
      }
    }

    let userRole = null;
    let roleId = requestContext.getStore()?.roleId;
    if (orgId && (userId || user?.email)) {
      const conditions: any[] = [];
      if (userId) {
        if (mongoose.isValidObjectId(userId)) conditions.push({ userId: new mongoose.Types.ObjectId(userId) });
        conditions.push({ userId: userId.toString() });
      }
      if (user?.email) {
        conditions.push({ email: user.email.toLowerCase() });
      }
      const userOrg = await UserOrganization.findOne({ orgId, $or: conditions }).populate('roleId').lean();
      if (userOrg?.roleId) {
        userRole = userOrg.roleId;
        roleId = (userOrg.roleId as any)._id?.toString();
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
        'invoices',
        Number(req.body.total || 0),
        user,
        userRole
      );

      if (evalResult.requiresApproval) {
        finalStatus = 'Pending Approval';
        finalApprovalStatus = 'Pending';
      }
    }

    const invoice = await Invoice.create({
      ...req.body,
      status: finalStatus,
      approvalStatus: finalApprovalStatus,
      orgId,
      companyId: orgId
    });
    
    try {
      await invoice.populate('customer');
    } catch (e) {}
    try {
      await invoice.populate('items.item');
    } catch (e) {}

    if (finalApprovalStatus === 'Pending') {
      try {
        await ApprovalWorkflowService.submitForApproval({
          orgId,
          module: 'invoices',
          documentId: invoice._id.toString(),
          documentNumber: invoice.invoiceNumber,
          amount: invoice.total,
          customerOrVendorName: (invoice.customer as any)?.displayName || (invoice.customer as any)?.name || 'Customer',
          requestedBy: userId || 'system',
          requestedByName: user?.displayName || user?.name || user?.email,
          creatorRoleId: roleId
        });
      } catch (apprErr) {
        console.error('Failed to submit approval request:', apprErr);
      }
    } else if (invoice.status !== 'Draft') {
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
        await PostingEngine.handleEvent('INVOICE_APPROVED', payload);
      } catch (postErr) {
        console.error('Failed to post approved invoice to GL:', postErr);
      }

      try {
        await import('../../../core/events/eventBus').then(m => m.eventBus.emitAsync(m.EVENTS.INVOICE_CREATED, { invoice, companyId: orgId }));
      } catch (eventErr) {
        console.warn('Invoice eventBus error:', eventErr);
      }
    }

    res.status(201).json({ success: true, data: invoice });
  } catch (error: any) {
    require('fs').appendFileSync('d:/backend/error.log', new Date().toISOString() + ' ' + (error?.stack || error) + '\n');
    if (error?.code === 11000) {
      return res.status(400).json({ success: false, message: 'Invoice number already exists. Please choose a different number.' });
    }
    res.status(500).json({ success: false, message: error?.message || 'Internal server error while creating invoice' });
  }
};

export const getInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || require('../../../context').requestContext.getStore()?.orgId || (req as any).user?.companyId;
    const filter: any = orgId ? { $or: [{ orgId }, { companyId: orgId }] } : {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const invoices = await Invoice.find(filter).populate('customer').populate('items.item').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    require('fs').appendFileSync('d:/backend/error.log', new Date().toISOString() + ' ' + ((error as any).stack || error) + '\n');
    next(error);
  }
};

export const getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('customer').populate('items.item');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    require('fs').appendFileSync('d:/backend/error.log', new Date().toISOString() + ' ' + ((error as any).stack || error) + '\n');
    next(error);
  }
};

export const updateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const originalInvoice = await Invoice.findById(req.params.id);
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

    const orgId = (requestContext.getStore()?.orgId || originalInvoice.orgId || 'SYSTEM');
    const user = (req as any).user;
    const userId = user?._id?.toString() || user?.id || requestContext.getStore()?.userId;

    // Check if status is transitioning to Pending Approval
    if (req.body.status === 'Pending Approval' || req.body.approvalStatus === 'Pending') {
      let roleId = requestContext.getStore()?.roleId;
      await ApprovalWorkflowService.submitForApproval({
        orgId,
        module: 'invoices',
        documentId: req.params.id as string,
        documentNumber: originalInvoice.invoiceNumber,
        amount: Number(req.body.total ?? originalInvoice.total),
        customerOrVendorName: (originalInvoice.customer as any)?.displayName || (originalInvoice.customer as any)?.name,
        requestedBy: userId || 'system',
        requestedByName: user?.displayName || user?.name || user?.email,
        creatorRoleId: roleId
      });
      req.body.status = 'Pending Approval';
      req.body.approvalStatus = 'Pending';
    }

    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('customer').populate('items.item');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    if (invoice.status === 'Void') {
      await LedgerService.voidTransaction(orgId, invoice._id.toString(), new Date());
    } else if (invoice.status !== 'Draft' && invoice.status !== 'Pending Approval') {
      const cogsEstimate = (invoice.subTotal || 0) * 0.4;
      const adjustment = invoice.adjustment || 0;
      await LedgerService.postTransaction(orgId, invoice._id.toString(), 'Invoice', invoice.invoiceDate, [
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
  } catch (error) {
    next(error);
  }
};

export const deleteInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const originalInvoice = await Invoice.findById(req.params.id);
    if (!originalInvoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Fix for Edge Case 3: Cannot delete if payments are applied
    if (originalInvoice.balanceDue < originalInvoice.total) {
      return res.status(400).json({ success: false, message: 'Cannot delete an invoice that has payments applied. Delete payments first.' });
    }

    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    const orgId = requestContext.getStore()?.orgId || originalInvoice.orgId || 'SYSTEM';
    
    await LedgerService.deleteTransaction(orgId, originalInvoice._id.toString());
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

import { InvoiceConsolidationService } from '../services/InvoiceConsolidationService';
import { PaymentPredictionService } from '../services/PaymentPredictionService';

export const consolidateInvoices = async (req: Request, res: Response) => {
    try {
        const { customerId, invoiceIds } = req.body;
        const consolidated = await InvoiceConsolidationService.consolidateInvoices(customerId, invoiceIds, 'system');
        res.status(201).json({ success: true, data: consolidated });
    } catch (e: any) {
        res.status(400).json({ success: false, message: e.message });
    }
};

export const analyzeRisk = async (req: Request, res: Response) => {
    try {
        const analysis = await PaymentPredictionService.analyzeInvoiceRisk(req.params.id as string);
        res.status(200).json({ success: true, data: analysis });
    } catch (e: any) {
        res.status(400).json({ success: false, message: e.message });
    }
};
