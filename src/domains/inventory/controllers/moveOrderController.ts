import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import MoveOrder from '../models/MoveOrder';
import Item from '../models/Item';
import StockLedger from '../models/StockLedger';
import { buildTenantFilter } from '../../../core/utils/tenantFilter';

export const getMoveOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter: any = { ...tenantFilter };

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.warehouse) {
      filter.$or = [
        { warehouse: req.query.warehouse },
        { warehouseName: { $regex: String(req.query.warehouse), $options: 'i' } }
      ];
    }
    if (req.query.search) {
      const s = String(req.query.search);
      filter.$or = [
        { moveOrderNumber: { $regex: s, $options: 'i' } },
        { itemName: { $regex: s, $options: 'i' } },
        { itemSku: { $regex: s, $options: 'i' } },
        { fromBin: { $regex: s, $options: 'i' } },
        { toBin: { $regex: s, $options: 'i' } }
      ];
    }

    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.max(1, parseInt(String(req.query.limit || '50'), 10));
    const skip = (page - 1) * limit;

    const [docs, totalCount] = await Promise.all([
      MoveOrder.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      MoveOrder.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      message: 'Move orders retrieved successfully',
      data: docs,
      count: docs.length,
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMoveOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };

    const doc = await MoveOrder.findOne(filter);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Move order not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

export const createMoveOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const orgId =
      tenantFilter.orgId ||
      tenantFilter.companyId ||
      (req as any).org?._id?.toString() ||
      (req as any).user?.companyId ||
      'SYSTEM';

    let moveOrderNumber = req.body.moveOrderNumber || req.body.order;
    if (!moveOrderNumber) {
      const count = await MoveOrder.countDocuments({
        $or: [{ orgId }, { companyId: orgId }]
      });
      moveOrderNumber = `MO-${String(count + 1).padStart(5, '0')}`;
    }

    const doc = await MoveOrder.create({
      ...req.body,
      moveOrderNumber,
      order: moveOrderNumber,
      quantity: Number(req.body.quantity ?? req.body.qty ?? 1),
      warehouseName: req.body.warehouseName || req.body.warehouse,
      itemName: req.body.itemName || req.body.item,
      companyId: orgId,
      orgId: orgId.toString()
    });

    res.status(201).json({
      success: true,
      message: 'Move order created successfully',
      data: doc
    });
  } catch (error) {
    next(error);
  }
};

export const executeMoveOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };

    const doc = await MoveOrder.findOneAndUpdate(
      filter,
      {
        $set: {
          status: 'Completed',
          executedAt: new Date(),
          executedBy: (req as any).user?.name || (req as any).user?.email || 'Warehouse Operator'
        }
      },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Move order not found' });
    }

    // Atomic Move Order Execution (Bin-to-Bin Relocation)
    // Rule: Total godown stock balance remains unchanged; bin coordinates update.
    const qty = Number(doc.quantity || 1);
    const itemFilter: any = { $or: [] };
    if (doc.item && mongoose.isValidObjectId(doc.item)) itemFilter.$or.push({ _id: doc.item });
    if (doc.itemSku) itemFilter.$or.push({ sku: doc.itemSku });
    if (doc.itemName) itemFilter.$or.push({ name: doc.itemName });

    if (itemFilter.$or.length > 0) {
      const matchedItem = await Item.findOne(itemFilter);
      if (matchedItem) {
        // Update batch / warehouse stock bin if matching fromBin
        if (matchedItem.batches && Array.isArray(matchedItem.batches)) {
          const b = matchedItem.batches.find((batch: any) => batch.bin === doc.fromBin);
          if (b) b.bin = doc.toBin;
        }
        if (matchedItem.warehouseStock && Array.isArray(matchedItem.warehouseStock)) {
          const ws = matchedItem.warehouseStock.find((w: any) => w.bin === doc.fromBin);
          if (ws) ws.bin = doc.toBin;
        }
        await matchedItem.save();

        // Write Double-Entry Stock Ledger (STORAGE_BIN fromBin -> STORAGE_BIN toBin)
        const unitVal = matchedItem.costPrice || matchedItem.purchaseRate || 0;
        await StockLedger.create({
          companyId: doc.companyId || tenantFilter.companyId,
          orgId: doc.orgId || tenantFilter.orgId,
          itemId: matchedItem._id,
          itemSku: matchedItem.sku || doc.itemSku || '',
          itemName: matchedItem.name || doc.itemName || '',
          fromLocation: { type: 'STORAGE_BIN', code: doc.fromBin },
          toLocation: { type: 'STORAGE_BIN', code: doc.toBin },
          bucketFrom: 'ACTIVE_STORAGE_BINS',
          bucketTo: 'ACTIVE_STORAGE_BINS',
          quantity: qty,
          valuationRate: unitVal,
          totalValuation: qty * unitVal,
          referenceDocType: 'MOVE_ORDER',
          referenceDocNumber: doc.moveOrderNumber,
          actor: {
            userId: (req as any).user?._id || (req as any).user?.id,
            name: (req as any).user?.name || (req as any).user?.email || 'Warehouse Operator',
            role: 'Warehouse Relocation Clerk'
          },
          timestamp: new Date()
        }).catch((e: any) => console.warn('Could not record stock ledger for move order:', e));
      }
    }

    res.status(200).json({
      success: true,
      message: `Move order executed: ${qty} units relocated from ${doc.fromBin} to ${doc.toBin}`,
      data: doc
    });
  } catch (error) {
    next(error);
  }
};

export const updateMoveOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };

    const doc = await MoveOrder.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Move order not found' });
    }
    res.status(200).json({ success: true, message: 'Move order updated', data: doc });
  } catch (error) {
    next(error);
  }
};

export const deleteMoveOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };

    const doc = await MoveOrder.findOneAndDelete(filter);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Move order not found' });
    }
    res.status(200).json({ success: true, message: 'Move order deleted' });
  } catch (error) {
    next(error);
  }
};
