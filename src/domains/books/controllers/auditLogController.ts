import { Request, Response } from 'express';
import AuditLog from '../models/AuditLog';

const getOrgId = (req: any): string => {
  return String(req.org?._id || req.headers?.['x-org-id'] || 'default-org');
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { module, action, userId, startDate, endDate, limit = 100, page = 1 } = req.query;

    const filter: any = { orgId };
    if (module) filter.module = String(module);
    if (action) filter.action = String(action);
    if (userId) filter.userId = String(userId);

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(String(startDate));
      if (endDate) filter.createdAt.$lte = new Date(String(endDate));
    }

    const skip = (Number(page) - 1) * Number(limit);
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      logs
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching audit logs' });
  }
};

export const createAuditLog = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { module, action, recordId, oldValues, newValues, reason } = req.body;
    const userId = (req as any).user?._id?.toString() || (req as any).user?.email || 'system';

    const log = new AuditLog({
      orgId,
      userId,
      module: module || 'General',
      action: action || 'Create',
      recordId,
      oldValues,
      newValues,
      reason
    });

    await log.save();
    res.status(201).json({ success: true, log });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error creating audit log' });
  }
};
