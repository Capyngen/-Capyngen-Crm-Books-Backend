import { requestContext } from '../../../context';
import { LedgerService } from '../../books/services/ledgerService';
import { Request, Response, NextFunction } from 'express';
import Vendor from '../models/Vendor';

// @desc    Create new Vendor
// @route   POST /api/v1/books/sales/Vendors
export const createVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId2 = (req as any).org?._id || requestContext.getStore()?.orgId;
    const doc = await Vendor.create({ ...req.body, orgId: orgId2 || req.body.orgId, companyId: orgId2 || req.body.companyId, createdBy: (req as any).user?._id });
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Vendors
// @route   GET /api/v1/books/sales/Vendors
export const getVendors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || requestContext.getStore()?.orgId;
      const filter = orgId ? { $or: [{ companyId: orgId }, { orgId: orgId }] } : {};
      const docs = await Vendor.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Vendor
// @route   GET /api/v1/books/sales/Vendors/:id
export const getVendorById = async (req: Request, res: Response, next: NextFunction) => {
  console.log('HIT getVendorById', req.params.id);
  try {
    const orgId = (req as any).org?._id || requestContext.getStore()?.orgId;
      const filter: any = { _id: req.params.id };
      if (orgId) filter.companyId = orgId;
      const doc = await Vendor.findOne(filter);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Vendor
// @route   PUT /api/v1/books/sales/Vendors/:id
export const updateVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Vendor.findOneAndUpdate({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

import { VendorOnboardingService } from '../services/VendorOnboardingService';

export const updateVendorOnboarding = async (req: Request, res: Response) => {
    try {
        const { status, notes } = req.body;
        const vendor = await VendorOnboardingService.updateOnboardingStatus(req.params.id, status, 'system-user', notes);
        res.status(200).json({ success: true, data: vendor });
    } catch (e: any) { res.status(400).json({ success: false, message: e.message }); }
};
