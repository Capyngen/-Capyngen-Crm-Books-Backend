import { Request, Response, NextFunction } from 'express';
import Vendor from '../models/Vendor';

// @desc    Create new Vendor
// @route   POST /api/v1/books/sales/Vendors
export const createVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Vendor.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Vendors
// @route   GET /api/v1/books/sales/Vendors
export const getVendors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await Vendor.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Vendor
// @route   GET /api/v1/books/sales/Vendors/:id
export const getVendorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Vendor.findById(req.params.id);
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
    const doc = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
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
