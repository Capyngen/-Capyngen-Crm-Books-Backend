import { Request, Response } from 'express';
import Item from '../../inventory/models/Item';

export const getItems = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id;
    const filter = orgId ? { companyId: orgId } : {};

    const items = await Item.find(filter).sort({ createdAt: -1 }).lean();

    res.json({ success: true, count: items.length, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getItemById = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id;
    const filter = orgId ? { _id: req.params.id, companyId: orgId } : { _id: req.params.id };
    
    const item = await Item.findOne(filter).lean();

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createItem = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id;
    const payload = { 
      ...req.body,
      companyId: orgId || req.body.companyId,
      orgId: orgId || req.body.orgId,
      createdBy: (req as any).user?._id
    };

    const item = new Item(payload);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id;
    const filter = orgId ? { _id: req.params.id, companyId: orgId } : { _id: req.params.id };

    const item = await Item.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    
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
    const orgId = (req as any).org?._id;
    const filter = orgId ? { _id: req.params.id, companyId: orgId } : { _id: req.params.id };

    const item = await Item.findOneAndDelete(filter);
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
