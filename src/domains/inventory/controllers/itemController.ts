import { Request, Response, NextFunction } from 'express';
import Item from '../models/Item';

// @desc    Create new item
// @route   POST /api/v1/inventory/items
export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id;
    const payload = { 
      ...req.body,
      companyId: orgId || req.body.companyId,
      orgId: orgId || req.body.orgId,
      createdBy: (req as any).user?._id
    };

    const item = await Item.create(payload);
    res.status(201).json({ success: true, data: item });
  } catch (error) { 
    next(error); 
  }
};

// @desc    Get all items
// @route   GET /api/v1/inventory/items
export const getItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id;
    const filter = orgId ? { companyId: orgId } : {};

    const items = await Item.find(filter).sort({ createdAt: -1 }).lean();

    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) { 
    next(error); 
  }
};

// @desc    Get single item
// @route   GET /api/v1/inventory/items/:id
export const getItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id;
    const filter = orgId ? { _id: req.params.id, companyId: orgId } : { _id: req.params.id };

    const item = await Item.findOne(filter).lean();
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item
// @route   PUT /api/v1/inventory/items/:id
export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id;
    const filter = orgId ? { _id: req.params.id, companyId: orgId } : { _id: req.params.id };

    const item = await Item.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item
// @route   DELETE /api/v1/inventory/items/:id
export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id;
    const filter = orgId ? { _id: req.params.id, companyId: orgId } : { _id: req.params.id };

    const item = await Item.findOneAndDelete(filter);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

import { InventoryBOMService } from '../services/InventoryBOMService';
export const assembleKit = async (req: Request, res: Response) => {
    try {
        const { quantity } = req.body;
        const kit = await InventoryBOMService.assembleKit(req.params.id, quantity || 1);
        res.status(200).json({ success: true, data: kit });
    } catch (e: any) { res.status(400).json({ success: false, message: e.message }); }
};