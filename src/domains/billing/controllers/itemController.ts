import { Request, Response } from 'express';
import BillingItem from '../models/BillingItem';
import BooksItem from '../../books/models/Item';

export const getItems = async (req: Request, res: Response) => {
  console.log('GET /api/v1/billing/items called');
  try {
    const userId = (req as any).user?._id;
    const filter = userId ? { userId } : {};

    const billingItems = await BillingItem.find(filter).lean();
    const booksItems = await BooksItem.find(filter).lean();
    
    const allItems = [
      ...billingItems.map(i => ({ ...i, sourceDomain: 'billing' })),
      ...booksItems.map(i => ({ ...i, sourceDomain: 'books' }))
    ];

    // Sort by createdAt descending
    allItems.sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());

    res.json({ success: true, count: allItems.length, data: allItems });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getItemById = async (req: Request, res: Response) => {
  try {
    let item = await BillingItem.findById(req.params.id).lean();
    let sourceDomain = 'billing';
    
    if (!item) {
      item = await BooksItem.findById(req.params.id).lean();
      sourceDomain = 'books';
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: { ...item, sourceDomain } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createItem = async (req: Request, res: Response) => {
  try {
    const payload = { ...req.body };

    const item = new BillingItem(payload);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    let item = await BillingItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    if (!item) {
      item = await BooksItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    let item = await BillingItem.findByIdAndDelete(req.params.id);
    
    if (!item) {
      item = await BooksItem.findByIdAndDelete(req.params.id);
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
