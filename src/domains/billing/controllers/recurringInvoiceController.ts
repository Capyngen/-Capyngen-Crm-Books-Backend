import { requestContext } from '../../../context';
import { Request, Response, NextFunction } from 'express';
import RecurringInvoice from '../models/RecurringInvoice';

export const createRecurringInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recurringInvoice = await RecurringInvoice.create({ ...req.body, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || req.body.companyId, createdBy: (req as any).user?._id });
    const populated = await RecurringInvoice.findById(recurringInvoice._id).populate('customer').populate('items.item');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const getRecurringInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recurringInvoices = await RecurringInvoice.find({ companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })
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
    const recurringInvoice = await RecurringInvoice.findOne({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })
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
    const recurringInvoice = await RecurringInvoice.findOneAndUpdate({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
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
    const recurringInvoice = await RecurringInvoice.findOneAndDelete({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } });
    if (!recurringInvoice) {
      return res.status(404).json({ success: false, message: 'Recurring Invoice not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
