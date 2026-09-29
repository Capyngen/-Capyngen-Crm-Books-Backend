import Invoice from '../models/Invoice';
import { requestContext } from '../../../context';
import { LedgerService } from '../../books/services/ledgerService';
import { PostingEngine } from '../../books/services/PostingEngine';
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
    
    const creditNote = await CreditNote.create({ ...req.body, creditNoteNumber , companyId: (req as any).org?._id || requestContext.getStore()?.orgId || req.body.companyId, createdBy: (req as any).user?._id });
    
    if (creditNote.status !== 'Draft') {
      const orgId = requestContext.getStore()?.orgId || creditNote.orgId || 'SYSTEM';
      const cogsEstimate = (creditNote.subTotal || 0) * 0.4; // rough estimate for demo
      const payload = { creditNoteId: creditNote._id.toString(), companyId: orgId, customerId: creditNote.customer?.toString(), subTotal: creditNote.subTotal, grandTotal: creditNote.total };
      await PostingEngine.handleEvent('CREDIT_NOTE_APPROVED', payload);
    }
    const populated = await CreditNote.findById(creditNote._id).populate('customer').populate('items.item');

    
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const getCreditNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creditNotes = await CreditNote.find({ companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })
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
    const creditNote = await CreditNote.findOne({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })
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
    const creditNote = await CreditNote.findOneAndUpdate({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
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
    const creditNote = await CreditNote.findOneAndDelete({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } });
    if (!creditNote) {
      return res.status(404).json({ success: false, message: 'Credit Note not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
