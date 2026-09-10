import Invoice from '../models/Invoice';
import { requestContext } from '../../../context';
import { LedgerService } from '../services/ledgerService';
import { Request, Response, NextFunction } from 'express';
import CreditNote from '../models/CreditNote';

export const createCreditNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let creditNoteNumber = req.body.creditNoteNumber;
    
    if (!creditNoteNumber) {
      let nextNum = (await CreditNote.countDocuments()) + 1;
      let isUnique = false;
      while (!isUnique) {
        creditNoteNumber = `CN-${String(nextNum).padStart(5, '0')}`;
        const exists = await CreditNote.findOne({ creditNoteNumber });
        if (exists) {
          nextNum++;
        } else {
          isUnique = true;
        }
      }
    }
    
    // Inherit salesperson from Invoice if linked
    if (req.body.invoiceId && !req.body.salesperson) {
      const originalInvoice = await Invoice.findById(req.body.invoiceId).lean();
      if (originalInvoice && originalInvoice.salesperson) {
        req.body.salesperson = originalInvoice.salesperson;
      }
    }
    
    const creditNote = await CreditNote.create({ ...req.body, creditNoteNumber });
    
    if (creditNote.status !== 'Draft') {
      const orgId = requestContext.getStore()?.orgId || creditNote.orgId || 'SYSTEM';
      const cogsEstimate = (creditNote.subTotal || 0) * 0.4; // rough estimate for demo
      await LedgerService.postTransaction(orgId, creditNote._id.toString(), 'Credit Note', creditNote.creditNoteDate || new Date(), [
        { accountId: 'Accounts Receivable', credit: creditNote.total, contactId: creditNote.customer?.toString() },
        { accountId: 'Sales Income', debit: creditNote.subTotal || 0 },
        { accountId: 'Tax Payable', debit: 0 }, // If tax was applied, we debit Tax Payable
        { accountId: 'Cost of Goods Sold', credit: cogsEstimate },
        { accountId: 'Inventory Asset', debit: cogsEstimate }
      ]);
    }
    const populated = await CreditNote.findById(creditNote._id).populate('customer').populate('items.item');

    
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const getCreditNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creditNotes = await CreditNote.find()
      .populate('customer')
      .populate('items.item')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: creditNotes });
  } catch (error) {
    next(error);
  }
};

export const getCreditNoteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creditNote = await CreditNote.findById(req.params.id)
      .populate('customer')
      .populate('items.item');
      
    if (!creditNote) {
      return res.status(404).json({ success: false, message: 'Credit Note not found' });
    }
    res.status(200).json({ success: true, data: creditNote });
  } catch (error) {
    next(error);
  }
};

export const updateCreditNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creditNote = await CreditNote.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('customer').populate('items.item');

    if (!creditNote) {
      return res.status(404).json({ success: false, message: 'Credit Note not found' });
    }

    res.status(200).json({ success: true, data: creditNote });
  } catch (error) {
    next(error);
  }
};

export const deleteCreditNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creditNote = await CreditNote.findByIdAndDelete(req.params.id);
    if (!creditNote) {
      return res.status(404).json({ success: false, message: 'Credit Note not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
