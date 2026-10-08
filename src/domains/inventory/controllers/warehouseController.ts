import { Request, Response, NextFunction } from 'express';
import Warehouse from '../models/Warehouse';
import { requestContext } from '@/core/middlewares/requestContext';

export const getWarehouses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || ((req as any).org?._id || req.body.orgId);
    const filter = orgId ? { orgId } : {};
    const docs = await Warehouse.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) { next(error); }
};

export const getWarehouseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || ((req as any).org?._id || req.body.orgId);
    const filter: any = { _id: req.params.id };
    if (orgId) filter.orgId = orgId;
    const doc = await Warehouse.findOne(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const createWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || ((req as any).org?._id || req.body.orgId);
    if (orgId) req.body.orgId = orgId;
    const doc = await Warehouse.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const updateWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || ((req as any).org?._id || req.body.orgId);
    const filter: any = { _id: req.params.id };
    if (orgId) filter.orgId = orgId;
    const doc = await Warehouse.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const deleteWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || ((req as any).org?._id || req.body.orgId);
    const filter: any = { _id: req.params.id };
    if (orgId) filter.orgId = orgId;
    const doc = await Warehouse.findOneAndDelete(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};
