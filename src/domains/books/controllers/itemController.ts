import { Request, Response, NextFunction } from 'express';
import Item from '../models/Item';

// @desc    Create new item
// @route   POST /api/v1/books/items
export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await Item.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) { 
    next(error); 
  }
};

// @desc    Get all items
// @route   GET /api/v1/books/items
export const getItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) { 
    next(error); 
  }
};

// @desc    Get single item
// @route   GET /api/v1/books/items/:id
export const getItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) { 
    next(error); 
  }
};

// @desc    Update item
// @route   PUT /api/v1/books/items/:id
export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) { 
    next(error); 
  }
};
