import { requestContext } from '../../../context';
import { Request, Response, NextFunction } from 'express';
import PaymentReceived from '../models/PaymentReceived';
import Invoice from '../models/Invoice';
import { PostingEngine } from '../../books/services/PostingEngine';
import { ApprovalWorkflowService } from '../../../core/services/ApprovalWorkflowService';

export const createPaymentReceived = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userId } = await ApprovalWorkflowService.resolveUserContext(req);

    let paymentNumber = req.body.paymentNumber;
    if (!paymentNumber) {
      const count = await PaymentReceived.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
      paymentNumber = `PR-${String(count + 1).padStart(5, '0')}`;
    }

    const payment = await PaymentReceived.create({
      ...req.body,
      paymentNumber,
      companyId: orgId,
      orgId,
      createdBy: userId
    });

    // 1. General Ledger Double-Entry Posting
    try {
      await PostingEngine.handleEvent('PAYMENT_RECEIVED', {
        paymentId: payment._id.toString(),
        companyId: orgId,
        customerId: payment.customer?.toString(),
        amount: payment.amount,
        paymentMode: payment.paymentMode,
        depositToAccountId: payment.depositTo
      });
    } catch (glErr) {
      console.error('Failed to post payment received to GL:', glErr);
    }

    // 2. Realize Invoice Balances & Status transitions
    if (payment.invoices && Array.isArray(payment.invoices)) {
      for (const invEntry of payment.invoices) {
        const invId = (invEntry as any).invoice || (invEntry as any).invoiceId;
        const amountPaid = Number((invEntry as any).amountApplied || (invEntry as any).amount || 0);
        if (invId && amountPaid > 0) {
          const inv = await Invoice.findById(invId);
          if (inv) {
            const currentBal = inv.balanceDue ?? inv.total;
            const newBal = Math.max(0, currentBal - amountPaid);
            inv.balanceDue = newBal;
            if (newBal === 0) {
              inv.status = 'Paid';
            } else {
              inv.status = 'PartiallyPaid';
            }
            await inv.save();
          }
        }
      }
    }

    const populated = await PaymentReceived.findById(payment._id).populate('customer').populate('invoices.invoice');

    try {
      await import('../../../core/events/eventBus').then(m => m.eventBus.emitAsync(m.EVENTS.PAYMENT_RECEIVED_CREATED, { payment: populated, companyId: orgId }));
    } catch (e) {}

    res.status(201).json({ success: true, data: populated || payment });
  } catch (error) {
    next(error);
  }
};

export const getPaymentsReceived = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const payments = await PaymentReceived.find(filter)
      .populate('customer')
      .populate('invoices.invoice')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

export const getPaymentReceivedById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) {
      filter.$or = [{ companyId: orgId }, { orgId }];
    }
    const payment = await PaymentReceived.findOne(filter)
      .populate('customer')
      .populate('invoices.invoice');
      
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment Receipt not found' });
    }
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentReceived = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) {
      filter.$or = [{ companyId: orgId }, { orgId }];
    }
    const payment = await PaymentReceived.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true
    }).populate('customer').populate('invoices.invoice');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment Receipt not found' });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

export const deletePaymentReceived = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) {
      filter.$or = [{ companyId: orgId }, { orgId }];
    }
    const payment = await PaymentReceived.findOneAndDelete(filter);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment Receipt not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

import { PaymentAllocationService } from '../services/PaymentAllocationService';

export const autoAllocateCreditNote = async (req: Request, res: Response) => {
  try {
    const result = await PaymentAllocationService.autoAllocateCreditNote(req.params.creditNoteId as string);
    res.status(200).json({ success: true, data: result });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const processGatewayPayment = async (req: Request, res: Response) => {
  try {
    const { customerId, amount, paymentMode, referenceNumber } = req.body;
    const payment = await PaymentAllocationService.processGatewayPayment(customerId, amount, paymentMode, referenceNumber);
    res.status(201).json({ success: true, data: payment });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};
