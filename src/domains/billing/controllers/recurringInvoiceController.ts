import { requestContext } from '../../../context';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import RecurringInvoice from '../models/RecurringInvoice';

const getTenantFilter = (req: Request) => {
  const orgId = String(
    (req as any).org?._id ||
    req.headers['x-org-id'] ||
    req.headers['x-company-id'] ||
    requestContext.getStore()?.orgId ||
    '6aa797278d301b4735f1d322'
  );
  const conditions: any[] = [{ orgId }, { companyId: orgId }];
  if (mongoose.Types.ObjectId.isValid(orgId)) {
    const objId = new mongoose.Types.ObjectId(orgId);
    conditions.push({ orgId: objId }, { companyId: objId });
  }
  return { $or: conditions };
};

export const createRecurringInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = String((req as any).org?._id || req.headers['x-org-id'] || '6aa797278d301b4735f1d322');
    const recurringInvoice = await RecurringInvoice.create({
      ...req.body,
      companyId: orgId,
      orgId: orgId,
      createdBy: (req as any).user?._id
    });
    const populated = await RecurringInvoice.findById(recurringInvoice._id).populate('customer').populate('items.item');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const getRecurringInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = getTenantFilter(req);
    const recurringInvoices = await RecurringInvoice.find(filter)
      .populate('customer')
      .populate('items.item')
      .sort({ createdAt: -1 });

    const enriched = recurringInvoices.map((inv: any) => {
      const obj = inv.toObject ? inv.toObject() : inv;
      if (!obj.total && obj.amount) obj.total = obj.amount;
      if (!obj.amount && obj.total) obj.amount = obj.total;
      if (!obj.startsOn && obj.startDate) obj.startsOn = obj.startDate;
      if (!obj.repeatEvery && obj.frequency) obj.repeatEvery = obj.frequency;
      if (obj.customer && typeof obj.customer === 'object') {
        obj.customerName = obj.customer.displayName || obj.customer.companyName || obj.customer.name;
      }
      return obj;
    });

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const getRecurringInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = { _id: req.params.id, ...getTenantFilter(req) };
    const recurringInvoice = await RecurringInvoice.findOne(filter)
      .populate('customer')
      .populate('items.item');
      
    if (!recurringInvoice) {
      return res.status(404).json({ success: false, message: 'Recurring Invoice not found' });
    }
    const obj: any = recurringInvoice.toObject ? recurringInvoice.toObject() : recurringInvoice;
    if (!obj.total && obj.amount) obj.total = obj.amount;
    if (!obj.startsOn && obj.startDate) obj.startsOn = obj.startDate;
    if (!obj.repeatEvery && obj.frequency) obj.repeatEvery = obj.frequency;
    if (obj.customer && typeof obj.customer === 'object') {
      obj.customerName = obj.customer.displayName || obj.customer.companyName || obj.customer.name;
    }
    res.status(200).json({ success: true, data: obj });
  } catch (error) {
    next(error);
  }
};

export const updateRecurringInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = { _id: req.params.id, ...getTenantFilter(req) };
    const recurringInvoice = await RecurringInvoice.findOneAndUpdate(filter, req.body, {
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
    const filter = { _id: req.params.id, ...getTenantFilter(req) };
    const recurringInvoice = await RecurringInvoice.findOneAndDelete(filter);
    if (!recurringInvoice) {
      return res.status(404).json({ success: false, message: 'Recurring Invoice not found' });
    }
    res.status(200).json({ success: true, message: 'Recurring Invoice deleted successfully' });
  } catch (error) {
    next(error);
  }
};
