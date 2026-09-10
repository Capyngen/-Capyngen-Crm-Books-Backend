import { Request, Response, NextFunction } from 'express';
import RecurringBill from '../models/RecurringBill';

export const createRecurringBill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await RecurringBill.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getRecurringBills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await RecurringBill.find()
      .populate('vendorId', 'displayName companyName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getRecurringBillById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await RecurringBill.findById(req.params.id)
      .populate('vendorId', 'displayName')
      .populate('lineItems.itemId', 'name')
      .populate('lineItems.customerId', 'displayName');
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Recurring Bill not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateRecurringBill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await RecurringBill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Recurring Bill not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteRecurringBill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await RecurringBill.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Recurring Bill not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
