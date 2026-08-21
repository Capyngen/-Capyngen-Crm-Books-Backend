import { Request, Response, NextFunction } from 'express';
import RecurringExpense from '../models/RecurringExpense';

export const createRecurringExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await RecurringExpense.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getRecurringExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await RecurringExpense.find()
      .populate('vendorId', 'displayName companyName')
      .populate('customerId', 'displayName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getRecurringExpenseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await RecurringExpense.findById(req.params.id)
      .populate('vendorId', 'displayName')
      .populate('customerId', 'displayName');
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Recurring Expense not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateRecurringExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await RecurringExpense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Recurring Expense not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteRecurringExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await RecurringExpense.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Recurring Expense not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
