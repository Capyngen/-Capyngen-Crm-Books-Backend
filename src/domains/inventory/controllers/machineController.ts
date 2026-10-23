import { Request, Response, NextFunction } from 'express';
import Machine from '../models/Machine';

function resolveOrgId(req: Request): string {
  return (req as any).org?._id?.toString() ||
    (req.headers?.['x-org-id'] as string) ||
    (req.headers?.['x-company-id'] as string) ||
    req.body?.orgId ||
    req.body?.companyId ||
    '6aa797278d301b4735f1d322';
}

export const getMachines = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = resolveOrgId(req);
    const filter = orgId ? { $or: [{ orgId }, { companyId: orgId }] } : {};
    const docs = await Machine.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) { next(error); }
};

export const getMachineById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = resolveOrgId(req);
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ orgId }, { companyId: orgId }];
    const doc = await Machine.findOne(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const createMachine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = resolveOrgId(req);
    if (orgId && req.body) req.body.orgId = orgId;
    const doc = await Machine.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const updateMachine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = resolveOrgId(req);
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ orgId }, { companyId: orgId }];
    const doc = await Machine.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const deleteMachine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = resolveOrgId(req);
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ orgId }, { companyId: orgId }];
    const doc = await Machine.findOneAndDelete(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};
