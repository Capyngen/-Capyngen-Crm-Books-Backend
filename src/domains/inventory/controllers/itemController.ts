import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Item from '../models/Item';
import StockLedger from '../models/StockLedger';
import { buildTenantFilter } from '../../../core/utils/tenantFilter';

// @desc    Create new item
// @route   POST /api/v1/inventory/items
export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || req.body.orgId || req.body.companyId;
    const orgIdStr = orgId ? orgId.toString() : '';
    const payload = { 
      ...req.body,
      companyId: orgIdStr || req.body.companyId,
      orgId: orgIdStr || req.body.orgId,
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
    const tenantFilter = buildTenantFilter(req);

    const items = await Item.find(tenantFilter).sort({ createdAt: -1 }).lean();

    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) { 
    next(error); 
  }
};

// Helper to find item across products and items collections
export async function findItemById(id: string, tenantFilter: any = {}) {
  try {
    let item: any = await Item.findOne({ _id: id, ...tenantFilter }).lean();
    if (item) return item;

    if (mongoose.isValidObjectId(id)) {
      const objId = new mongoose.Types.ObjectId(id);
      item = await mongoose.connection.collection('items').findOne({ _id: objId, ...tenantFilter })
          || await mongoose.connection.collection('products').findOne({ _id: objId, ...tenantFilter });
      if (item) return item;
    }

    item = await mongoose.connection.collection('items').findOne({ _id: id as any, ...tenantFilter })
        || await mongoose.connection.collection('products').findOne({ _id: id as any, ...tenantFilter });
    return item;
  } catch (err) {
    return null;
  }
}

// @desc    Get single item
// @route   GET /api/v1/inventory/items/:id
export const getItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const item = await findItemById(req.params.id, tenantFilter);
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
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0 
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };

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
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0 
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };

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

export const getItemMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemId = req.params.id;
    const filter = {
      $or: [
        { itemId },
        ...(mongoose.isValidObjectId(itemId) ? [{ itemId: new mongoose.Types.ObjectId(itemId) }] : [])
      ]
    };
    const model = StockLedger || mongoose.models.StockLedger;
    let movements: any[] = [];
    if (model && typeof model.find === 'function') {
      movements = await model.find(filter).sort({ timestamp: -1, createdAt: -1 }).limit(50).lean();
    } else {
      movements = await mongoose.connection.collection('stockledgers').find(filter).sort({ timestamp: -1, createdAt: -1 }).limit(50).toArray();
    }
    res.status(200).json({ success: true, count: movements.length, data: movements });
  } catch (error) { next(error); }
};

export const getItemTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemId = req.params.id;
    const lineFilter = {
      $or: [
        { 'items.item': itemId },
        ...(mongoose.isValidObjectId(itemId) ? [{ 'items.item': new mongoose.Types.ObjectId(itemId) }] : []),
        { 'items.itemId': itemId },
        ...(mongoose.isValidObjectId(itemId) ? [{ 'items.itemId': new mongoose.Types.ObjectId(itemId) }] : [])
      ]
    };

    const [invoices, orders, purchaseOrders, bills] = await Promise.all([
      mongoose.connection.collection('invoices').find(lineFilter).sort({ createdAt: -1 }).limit(10).toArray(),
      mongoose.connection.collection('salesorders').find(lineFilter).sort({ createdAt: -1 }).limit(10).toArray(),
      mongoose.connection.collection('purchaseorders').find(lineFilter).sort({ createdAt: -1 }).limit(10).toArray(),
      mongoose.connection.collection('bills').find(lineFilter).sort({ createdAt: -1 }).limit(10).toArray()
    ]);

    res.status(200).json({
      success: true,
      data: {
        invoices,
        salesOrders: orders,
        purchaseOrders,
        bills
      }
    });
  } catch (error) { next(error); }
};

export const getItemActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemId = req.params.id;
    const item = await findItemById(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const model = StockLedger || mongoose.models.StockLedger;
    let movements: any[] = [];
    const filter = {
      $or: [
        { itemId },
        ...(mongoose.isValidObjectId(itemId) ? [{ itemId: new mongoose.Types.ObjectId(itemId) }] : [])
      ]
    };
    if (model && typeof model.find === 'function') {
      movements = await model.find(filter).sort({ timestamp: -1, createdAt: -1 }).limit(25).lean();
    } else {
      movements = await mongoose.connection.collection('stockledgers').find(filter).sort({ timestamp: -1, createdAt: -1 }).limit(25).toArray();
    }

    const activityList: any[] = [];

    // 1. Creation
    activityList.push({
      id: `act-it-create-${item._id}`,
      action: 'Item Registered',
      type: 'create',
      title: 'Item Created in Catalog',
      description: `Item "${item.name}" (SKU: ${item.sku || 'N/A'}) was registered.`,
      actorName: 'Product Manager',
      timestamp: item.createdAt || new Date(),
      date: item.createdAt || new Date()
    });

    // 2. Stock Ledger movements
    movements.forEach(m => {
      activityList.push({
        id: `act-m-${m._id}`,
        action: m.referenceDocType || 'Stock Movement',
        type: 'movement',
        title: `${m.referenceDocType} #${m.referenceDocNumber}`,
        description: `Transferred ${m.quantity} units (${m.bucketFrom} ➔ ${m.bucketTo})`,
        actorName: m.actor?.name || 'Warehouse Operator',
        timestamp: m.timestamp || m.createdAt,
        date: m.timestamp || m.createdAt
      });
    });

    activityList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.status(200).json({
      success: true,
      data: activityList,
      timeline: activityList,
      count: activityList.length
    });
  } catch (error) { next(error); }
};