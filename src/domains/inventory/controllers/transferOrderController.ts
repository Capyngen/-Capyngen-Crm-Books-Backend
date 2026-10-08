import { Request, Response, NextFunction } from 'express';
import TransferOrder from '../models/TransferOrder';
import { requestContext } from '@/core/middlewares/requestContext';

export const getTransferOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || ((req as any).org?._id || req.body.orgId);
    const filter = orgId ? { orgId } : {};
    const docs = await TransferOrder.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) { next(error); }
};

export const getTransferOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || ((req as any).org?._id || req.body.orgId);
    const filter: any = { _id: req.params.id };
    if (orgId) filter.orgId = orgId;
    const doc = await TransferOrder.findOne(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const createTransferOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || ((req as any).org?._id || req.body.orgId);
    if (orgId) req.body.orgId = orgId;
    const doc = await TransferOrder.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const updateTransferOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || ((req as any).org?._id || req.body.orgId);
    const filter: any = { _id: req.params.id };
    if (orgId) filter.orgId = orgId;
    const doc = await TransferOrder.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const deleteTransferOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || ((req as any).org?._id || req.body.orgId);
    const filter: any = { _id: req.params.id };
    if (orgId) filter.orgId = orgId;
    const doc = await TransferOrder.findOneAndDelete(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};
