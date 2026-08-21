import { Request, Response, NextFunction } from 'express';
import RecurringInvoice from '../models/RecurringInvoice';

export const createRecurringInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recurringInvoice = await RecurringInvoice.create(req.body);
    const populated = await RecurringInvoice.findById(recurringInvoice._id).populate('customer').populate('items.item');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const getRecurringInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recurringInvoices = await RecurringInvoice.find()
      .populate('customer')
      .populate('items.item')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: recurringInvoices });
  } catch (error) {
    next(error);
  }
};

export const getRecurringInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recurringInvoice = await RecurringInvoice.findById(req.params.id)
      .populate('customer')
      .populate('items.item');
      
    if (!recurringInvoice) {
      return res.status(404).json({ success: false, message: 'Recurring Invoice not found' });
    }
    res.status(200).json({ success: true, data: recurringInvoice });
  } catch (error) {
    next(error);
  }
};

export const updateRecurringInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recurringInvoice = await RecurringInvoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('customer').populate('items.item');

    if (!recurringInvoice) {
      return res.status(404).json({ success: false, message: 'Recurring Invoice not found' });
    }

    res.status(200).json({ success: true, data: recurringInvoice });
  } catch (error) {
    next(error);
  }
};

export const deleteRecurringInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recurringInvoice = await RecurringInvoice.findByIdAndDelete(req.params.id);
    if (!recurringInvoice) {
      return res.status(404).json({ success: false, message: 'Recurring Invoice not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
