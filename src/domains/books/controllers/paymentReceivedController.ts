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
    
    const payment = await PaymentReceived.create({ ...req.body, paymentNumber });
    const populated = await PaymentReceived.findById(payment._id).populate('customer').populate('invoices.invoice');
    
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const getPaymentsReceived = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await PaymentReceived.find()
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
    const payment = await PaymentReceived.findById(req.params.id)
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
    const payment = await PaymentReceived.findByIdAndUpdate(req.params.id, req.body, {
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
    const payment = await PaymentReceived.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment Receipt not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
