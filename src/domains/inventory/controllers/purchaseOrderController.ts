import { requestContext } from '../../../context';
import { Request, Response, NextFunction } from 'express';
import PurchaseOrder from '../models/PurchaseOrder';

export const createPurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await PurchaseOrder.create({ ...req.body, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || req.body.companyId, createdBy: (req as any).user?._id });
    res.status(201).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPurchaseOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await PurchaseOrder.find({ companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })
      .populate('vendorId', 'displayName companyName')
      .populate('customerId', 'displayName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPurchaseOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await PurchaseOrder.findOne({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })
      .populate('vendorId', 'displayName')
      .populate('customerId', 'displayName');
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await PurchaseOrder.findOneAndUpdate({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await PurchaseOrder.findOneAndDelete({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
