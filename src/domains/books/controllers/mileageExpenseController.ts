import { Request, Response, NextFunction } from 'express';
import MileageExpense from '../models/MileageExpense';

export const createMileageExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await MileageExpense.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMileageExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await MileageExpense.find()
      .populate('vendorId', 'displayName companyName')
      .populate('customerId', 'displayName')
      .sort({ date: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMileageExpenseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await MileageExpense.findById(req.params.id)
      .populate('vendorId', 'displayName')
      .populate('customerId', 'displayName');
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Mileage Expense not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateMileageExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await MileageExpense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Mileage Expense not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteMileageExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await MileageExpense.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Mileage Expense not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
