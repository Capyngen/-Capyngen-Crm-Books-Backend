import { LedgerService } from '../services/ledgerService';
import { Request, Response, NextFunction } from 'express';
import PaymentMade from '../models/PaymentMade';

export const createPaymentMade = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await PaymentMade.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPaymentsMade = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await PaymentMade.find()
      .populate('vendorId', 'displayName companyName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPaymentMadeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await PaymentMade.findById(req.params.id)
      .populate('vendorId', 'displayName email phone')
      .populate('bills.billId', 'billNumber billDate totalAmount amountDue');
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePaymentMade = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await PaymentMade.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePaymentMade = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await PaymentMade.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// @desc    Process Disbursement
// @route   POST /api/v1/books/purchases/payments-made/:id/disburse
export const processDisbursement = async (req: any, res: any, next: any) => {
  try {
    const doc = await PaymentMade.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    doc.disbursementStatus = 'Processed';
    await doc.save();
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

// @desc    Send Remittance Advice
// @route   POST /api/v1/books/purchases/payments-made/:id/remittance
export const sendRemittanceAdvice = async (req: any, res: any, next: any) => {
  try {
    const doc = await PaymentMade.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    doc.remittanceAdviceSent = true;
    await doc.save();
    res.status(200).json({ success: true, data: doc, message: 'Remittance advice sent to vendor' });
  } catch (error) { next(error); }
};
