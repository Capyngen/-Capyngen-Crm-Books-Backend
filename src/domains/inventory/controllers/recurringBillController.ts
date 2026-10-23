import { requestContext } from '../../../context';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import RecurringBill from '../models/RecurringBill';

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

export const createRecurringBill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = String((req as any).org?._id || req.headers['x-org-id'] || '6aa797278d301b4735f1d322');
    const doc = await RecurringBill.create({
      ...req.body,
      companyId: orgId,
      orgId: orgId,
      createdBy: (req as any).user?._id
    });
    res.status(201).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getRecurringBills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = getTenantFilter(req);
    const docs = await RecurringBill.find(filter)
      .populate('vendorId', 'displayName companyName vendorName')
      .populate('vendor', 'displayName companyName vendorName')
      .sort({ createdAt: -1 });

    const enriched = docs.map((b: any) => {
      const obj = b.toObject ? b.toObject() : b;
      if (!obj.total && obj.amount) obj.total = obj.amount;
      if (!obj.amount && obj.total) obj.amount = obj.total;
      if (!obj.totalAmount && (obj.total || obj.amount)) obj.totalAmount = obj.total || obj.amount;
      const v = obj.vendorId || obj.vendor;
      if (v && typeof v === 'object') {
        obj.vendorName = v.displayName || v.vendorName || v.companyName;
      }
      return obj;
    });

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getRecurringBillById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = { _id: req.params.id, ...getTenantFilter(req) };
    const doc = await RecurringBill.findOne(filter)
      .populate('vendorId', 'displayName companyName vendorName')
      .populate('vendor', 'displayName companyName vendorName')
      .populate('lineItems.itemId', 'name')
      .populate('lineItems.customerId', 'displayName');
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Recurring Bill not found' });
    }
    const obj: any = doc.toObject ? doc.toObject() : doc;
    if (!obj.total && obj.amount) obj.total = obj.amount;
    if (!obj.totalAmount && (obj.total || obj.amount)) obj.totalAmount = obj.total || obj.amount;
    const v = obj.vendorId || obj.vendor;
    if (v && typeof v === 'object') {
      obj.vendorName = v.displayName || v.vendorName || v.companyName;
    }
    res.status(200).json({ success: true, data: obj });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateRecurringBill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = { _id: req.params.id, ...getTenantFilter(req) };
    const doc = await RecurringBill.findOneAndUpdate(filter, req.body, {
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
    const filter = { _id: req.params.id, ...getTenantFilter(req) };
    const doc = await RecurringBill.findOneAndDelete(filter);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Recurring Bill not found' });
    }
    res.status(200).json({ success: true, message: 'Recurring Bill deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
