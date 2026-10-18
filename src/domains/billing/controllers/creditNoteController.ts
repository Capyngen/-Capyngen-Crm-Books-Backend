import Invoice from '../models/Invoice';
import { requestContext } from '../../../context';
import { LedgerService } from '../../books/services/ledgerService';
import { PostingEngine } from '../../books/services/PostingEngine';
import { Request, Response, NextFunction } from 'express';
import CreditNote from '../models/CreditNote';
import { ApprovalWorkflowService } from '../../../core/services/ApprovalWorkflowService';

export const createCreditNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService.resolveUserContext(req);

    let creditNoteNumber = req.body.creditNoteNumber;
    
    if (!creditNoteNumber) {
      let nextNum = (await CreditNote.countDocuments()) + 1;
      let isUnique = false;
      while (!isUnique) {
        creditNoteNumber = `CN-${String(nextNum).padStart(5, '0')}`;
        const exists = await CreditNote.findOne({ creditNoteNumber, $or: [{ orgId }, { companyId: orgId }] });
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
      if (originalInvoice && (originalInvoice as any).salesperson) {
        req.body.salesperson = (originalInvoice as any).salesperson;
      }
    }

    const requestedStatus = req.body.status || 'Open';
    let finalStatus = requestedStatus;
    let finalApprovalStatus = 'Approved';

    if (requestedStatus === 'Draft') {
      finalStatus = 'Draft';
      finalApprovalStatus = 'Draft';
    } else {
      const evalResult = await ApprovalWorkflowService.evaluateApprovalNeed(
        orgId,
        'credit_notes',
        Number(req.body.total || 0),
        user,
        userRole
      );

      if (evalResult.requiresApproval) {
        finalStatus = 'Draft';
        finalApprovalStatus = 'Pending';
      } else {
        finalStatus = 'Open';
        finalApprovalStatus = 'Approved';
      }
    }
    
    const creditNote = await CreditNote.create({
      ...req.body,
      creditNoteNumber,
      status: finalStatus,
      approvalStatus: finalApprovalStatus,
      companyId: orgId,
      orgId,
      createdBy: userId
    });
    
    if (finalApprovalStatus === 'Pending') {
      await ApprovalWorkflowService.submitForApproval({
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
    } else if (finalStatus !== 'Draft') {
      const payload = {
        creditNoteId: creditNote._id.toString(),
        companyId: orgId,
        customerId: creditNote.customer?.toString(),
        subTotal: creditNote.subTotal || 0,
        taxTotal: (creditNote as any).taxTotal || 0,
        total: creditNote.total || 0,
        creditNoteNumber: creditNote.creditNoteNumber
      };
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
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const creditNotes = await CreditNote.find(filter)
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
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) {
      filter.$or = [{ companyId: orgId }, { orgId }];
    }
    const creditNote = await CreditNote.findOne(filter)
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
