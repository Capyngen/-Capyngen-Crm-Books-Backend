import { requestContext } from '../../../context';
import { LedgerService } from '../../books/services/ledgerService';
import { validateTransactionLock } from '../../books/services/transactionLockService';
import { Request, Response, NextFunction } from 'express';
import Bill from '../models/Bill';

export const createBill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Bill.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getBills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await Bill.find()
      .populate('vendorId', 'displayName companyName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getBillById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Bill.findById(req.params.id)
      .populate('vendorId', 'displayName')
      .populate('lineItems.itemId', 'name')
      .populate('lineItems.customerId', 'displayName');
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateBill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Bill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteBill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Bill.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
