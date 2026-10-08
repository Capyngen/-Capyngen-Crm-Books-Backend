import { Request, Response, NextFunction } from 'express';
import Routing from '../models/Routing';

export const getRoutings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || req.body.orgId;
    const filter = orgId ? { orgId } : {};
    const docs = await Routing.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) { next(error); }
};

export const getRoutingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || req.body.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.orgId = orgId;
    const doc = await Routing.findOne(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const createRouting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || req.body.orgId;
    if (orgId) req.body.orgId = orgId;
    const doc = await Routing.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const updateRouting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || req.body.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.orgId = orgId;
    const doc = await Routing.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const deleteRouting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || req.body.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.orgId = orgId;
    const doc = await Routing.findOneAndDelete(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};
