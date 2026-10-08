import { requestContext } from '../../../context';
import { LedgerService } from '../../books/services/ledgerService';
import { validateTransactionLock } from '../../books/services/transactionLockService';
import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import Bill from '../models/Bill';

export const createBill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Bill.create({ ...req.body, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || req.body.companyId, createdBy: (req as any).user?._id });
    await doc.populate('items.item'); await import('../../../core/events/eventBus').then(m => m.eventBus.emitAsync(m.EVENTS.BILL_CREATED, { bill: doc, companyId: doc.companyId })); res.status(201).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getBills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await Bill.find({ companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })
      .populate('vendorId', 'displayName companyName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getBillById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Bill.findOne({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })
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
    const doc = await Bill.findOneAndUpdate({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
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
    const doc = await Bill.findOneAndDelete({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// @desc    Process Bill OCR
// @route   POST /api/v1/books/purchases/bills/ocr
export const processBillOCR = async (req: any, res: any, next: any) => {
  try {
    const mockOCRData = {
      vendorName: 'Acme Corp',
      billNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
      billDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0],
      amount: 1500.00,
      lineItems: [
        { name: 'Scanned Item 1', quantity: 10, rate: 100, amount: 1000 },
        { name: 'Scanned Item 2', quantity: 5, rate: 100, amount: 500 }
      ]
    };
    res.status(200).json({ success: true, data: mockOCRData });
  } catch (error) {
    next(error);
  }
};
