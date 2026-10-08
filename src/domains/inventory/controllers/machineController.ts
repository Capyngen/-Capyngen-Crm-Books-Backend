import { Request, Response, NextFunction } from 'express';
import Machine from '../models/Machine';

export const getMachines = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || req.body.orgId;
    const filter = orgId ? { orgId } : {};
    const docs = await Machine.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) { next(error); }
};

export const getMachineById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || req.body.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.orgId = orgId;
    const doc = await Machine.findOne(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const createMachine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || req.body.orgId;
    if (orgId) req.body.orgId = orgId;
    const doc = await Machine.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const updateMachine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || req.body.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.orgId = orgId;
    const doc = await Machine.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const deleteMachine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || req.body.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.orgId = orgId;
    const doc = await Machine.findOneAndDelete(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};
