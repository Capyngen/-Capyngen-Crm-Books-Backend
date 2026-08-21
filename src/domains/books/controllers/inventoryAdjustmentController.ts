import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import InventoryAdjustment from '../models/InventoryAdjustment';
import Item from '../models/Item';

// @desc    Create new inventory adjustment
// @route   POST /api/v1/books/inventory-adjustments
export const createAdjustment = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const adjustment = await InventoryAdjustment.create([req.body], { session });

    // Update stock for each item in the adjustment
    for (const adjItem of req.body.items) {
      if (req.body.mode === 'quantity') {
        await Item.findByIdAndUpdate(
          adjItem.item,
          { $inc: { stock: adjItem.quantityAdjusted } },
          { session }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    // Populate item details before sending response
    const populated = await InventoryAdjustment.findById(adjustment[0]._id).populate('items.item');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Get all adjustments
// @route   GET /api/v1/books/inventory-adjustments
export const getAdjustments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adjustments = await InventoryAdjustment.find()
      .populate('items.item')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: adjustments.length, data: adjustments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single adjustment
// @route   GET /api/v1/books/inventory-adjustments/:id
export const getAdjustmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adjustment = await InventoryAdjustment.findById(req.params.id)
      .populate('items.item');
    if (!adjustment) {
      return res.status(404).json({ success: false, message: 'Adjustment not found' });
    }
    res.status(200).json({ success: true, data: adjustment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update adjustment
// @route   PUT /api/v1/books/inventory-adjustments/:id
export const updateAdjustment = async (req: Request, res: Response, next: NextFunction) => {
  // Simplistic update for now without reversing stock
  try {
    const adjustment = await InventoryAdjustment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!adjustment) return res.status(404).json({ success: false, message: 'Adjustment not found' });
    res.status(200).json({ success: true, data: adjustment });
  } catch (error) {
    next(error);
  }
};
