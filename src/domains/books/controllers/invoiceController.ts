import { requestContext } from '../../../context';
import { LedgerService } from '../services/ledgerService';
import { validateTransactionLock } from '../services/transactionLockService';
import { Request, Response, NextFunction } from 'express';
import Invoice from '../models/Invoice';

export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let invoiceNumber = req.body.invoiceNumber;

    if (invoiceNumber) {
      const existing = await Invoice.findOne({ invoiceNumber, orgId: requestContext.getStore()?.orgId || 'SYSTEM' });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Invoice number already exists' });
      }
    }

    const invoice = await Invoice.create({
      ...req.body,
      orgId: requestContext.getStore()?.orgId || 'SYSTEM'
    });
    
    await invoice.populate('customer');
    await invoice.populate('items.item');

    if (invoice.status !== 'Draft') {
      const orgId = (requestContext.getStore()?.orgId || invoice.orgId || 'SYSTEM');
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

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    require('fs').appendFileSync('d:/backend/error.log', new Date().toISOString() + ' ' + ((error as any).stack || error) + '\n');
    next(error);
  }
};

export const getInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
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

    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('customer').populate('items.item');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    
    const orgId = (requestContext.getStore()?.orgId || invoice.orgId || 'SYSTEM');

    if (invoice.status === 'Void') {
      await LedgerService.voidTransaction(orgId, invoice._id.toString(), new Date());
    } else if (invoice.status !== 'Draft') {
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
