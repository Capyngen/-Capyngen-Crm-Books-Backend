import { requestContext } from '../../../context';
import { LedgerService } from '../../books/services/ledgerService';
import { Request, Response, NextFunction } from 'express';
import PaymentReceived from '../models/PaymentReceived';

export const createPaymentReceived = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let paymentNumber = req.body.paymentNumber;
    
    if (!paymentNumber) {
      let nextNum = (await PaymentReceived.countDocuments()) + 1;
      let isUnique = false;
      while (!isUnique) {
        paymentNumber = `PR-${String(nextNum).padStart(5, '0')}`;
        const exists = await PaymentReceived.findOne({ paymentNumber });
        if (exists) {
          nextNum++;
        } else {
          isUnique = true;
        }
      }
    }
    
    const payment = await PaymentReceived.create({ ...req.body, paymentNumber , companyId: (req as any).org?._id || requestContext.getStore()?.orgId || req.body.companyId, createdBy: (req as any).user?._id });
    const populated = await PaymentReceived.findById(payment._id).populate('customer').populate('invoices.invoice');
    
    await import('../../../core/events/eventBus').then(m => m.eventBus.emitAsync(m.EVENTS.PAYMENT_RECEIVED_CREATED, { payment: populated, companyId: (populated as any)?.companyId })); res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const getPaymentsReceived = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await PaymentReceived.find({ companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })
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
    const payment = await PaymentReceived.findOne({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })
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
    const payment = await PaymentReceived.findOneAndUpdate({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
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
    const payment = await PaymentReceived.findOneAndDelete({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } });
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
