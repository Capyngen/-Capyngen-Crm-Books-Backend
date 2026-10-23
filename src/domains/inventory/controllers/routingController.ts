import { Request, Response, NextFunction } from 'express';
import Routing from '../models/Routing';

function resolveOrgId(req: Request): string {
  return (req as any).org?._id?.toString() ||
    (req.headers?.['x-org-id'] as string) ||
    (req.headers?.['x-company-id'] as string) ||
    req.body?.orgId ||
    req.body?.companyId ||
    '6aa797278d301b4735f1d322';
}

export const getRoutings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = resolveOrgId(req);
    const filter = orgId ? { $or: [{ orgId }, { companyId: orgId }] } : {};
    const docs = await Routing.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) { next(error); }
};

export const getRoutingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = resolveOrgId(req);
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ orgId }, { companyId: orgId }];
    const doc = await Routing.findOne(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const createRouting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = resolveOrgId(req);
    if (orgId && req.body) req.body.orgId = orgId;
    const doc = await Routing.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const updateRouting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = resolveOrgId(req);
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ orgId }, { companyId: orgId }];
    const doc = await Routing.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const deleteRouting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = resolveOrgId(req);
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ orgId }, { companyId: orgId }];
    const doc = await Routing.findOneAndDelete(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};
