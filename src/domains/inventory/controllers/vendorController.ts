import { requestContext } from '../../../context';
import { LedgerService } from '../../books/services/ledgerService';
import { Request, Response, NextFunction } from 'express';
import Vendor from '../models/Vendor';

// @desc    Create new Vendor
// @route   POST /api/v1/books/sales/Vendors
export const createVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Vendor.create({ ...req.body, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || req.body.companyId, createdBy: (req as any).user?._id });
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Vendors
// @route   GET /api/v1/books/sales/Vendors
export const getVendors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await Vendor.find({ companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Vendor
// @route   GET /api/v1/books/sales/Vendors/:id
export const getVendorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Vendor.findOne({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } });
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
