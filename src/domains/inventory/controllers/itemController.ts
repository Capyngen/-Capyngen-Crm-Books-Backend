import { Request, Response, NextFunction } from 'express';
import Item from '../models/Item';

// @desc    Create new item
// @route   POST /api/v1/books/items
export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = { ...req.body };

    const item = await Item.create(payload);
    res.status(201).json({ success: true, data: item });
  } catch (error) { 
    next(error); 
  }
};

// @desc    Get all items
// @route   GET /api/v1/books/items
export const getItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booksItems = await Item.find({}).lean();
    const billingItems = await Item.find({}).lean();

    const allItems = [
      ...booksItems.map((i: any) => ({ ...i, sourceDomain: 'books' })),
      ...billingItems.map((i: any) => ({ ...i, sourceDomain: 'billing' }))
    ];

    allItems.sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());

    res.status(200).json({ success: true, count: allItems.length, data: allItems });
  } catch (error) { 
    next(error); 
  }
};

// @desc    Get single item
// @route   GET /api/v1/books/items/:id
export const getItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let item = await Item.findById(req.params.id).lean();
    let sourceDomain = 'books';
    
    if (!item) {
      item = await Item.findById(req.params.id).lean();
      sourceDomain = 'billing';
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.status(200).json({ success: true, data: { ...item, sourceDomain } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item
// @route   PUT /api/v1/books/items/:id
export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    if (!item) {
      item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item
// @route   DELETE /api/v1/books/items/:id
export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let item = await Item.findByIdAndDelete(req.params.id);
    
    if (!item) {
      item = await Item.findByIdAndDelete(req.params.id);
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
