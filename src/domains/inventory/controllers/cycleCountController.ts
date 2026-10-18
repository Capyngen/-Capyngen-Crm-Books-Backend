import { Request, Response, NextFunction } from 'express';
import CycleCount from '../models/CycleCount';
import Item from '../models/Item';
import InventoryAdjustment from '../models/InventoryAdjustment';
import { PostingEngine } from '../../books/services/PostingEngine';
import { requestContext } from '../../../context';

// @desc    Get all cycle counts
// @route   GET /api/v1/books/inventory/cycle-counts
export const getCycleCounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId || req.body.orgId;
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const docs = await CycleCount.find(filter)
      .populate('warehouseId', 'name code')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) { next(error); }
};

// @desc    Get single cycle count
// @route   GET /api/v1/books/inventory/cycle-counts/:id
export const getCycleCountById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId || req.body.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];
    const doc = await CycleCount.findOne(filter)
      .populate('warehouseId', 'name code')
      .populate('lines.item', 'name sku unit');
    if (!doc) return res.status(404).json({ success: false, message: 'Cycle count not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

// @desc    Create new cycle count audit
// @route   POST /api/v1/books/inventory/cycle-counts
export const createCycleCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId || req.body.orgId;
    const warehouseId = req.body.warehouseId;

    let countNumber = req.body.countNumber;
    if (!countNumber) {
      const count = await CycleCount.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
      countNumber = `CC-${String(count + 1).padStart(5, '0')}`;
    }

    let lines = req.body.lines || [];

    // If lines not manually passed, auto-populate from warehouse items
    if (lines.length === 0 && warehouseId) {
      const itemFilter: any = { type: 'goods' };
      if (orgId) itemFilter.$or = [{ companyId: orgId }, { orgId }];
      const items = await Item.find(itemFilter).lean();

      lines = items.map((it: any) => {
        const whStock = it.warehouseStock?.find((ws: any) => ws.warehouse?.toString() === warehouseId.toString());
        const systemQty = whStock ? Number(whStock.stockOnHand || 0) : Number(it.stock || 0);
        const rate = Number(it.purchaseRate || 0);

        return {
          item: it._id,
          itemName: it.name,
          sku: it.sku || '',
          bin: whStock?.bin || '',
          systemQuantity: systemQty,
          countedQuantity: 0,
          varianceQuantity: -systemQty,
          unitCost: rate,
          varianceValue: -(systemQty * rate),
          notes: ''
        };
      });
    }

    const doc = await CycleCount.create({
      ...req.body,
      countNumber,
      lines,
      status: req.body.status || 'Draft',
      companyId: orgId,
      orgId
    });

    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

// @desc    Submit counted physical quantities
// @route   POST /api/v1/books/inventory/cycle-counts/:id/submit
export const submitCountResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];

    const doc = await CycleCount.findOne(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Cycle count not found' });

    const countsMap: { [itemId: string]: number } = {};
    if (req.body.counts && Array.isArray(req.body.counts)) {
      req.body.counts.forEach((c: any) => {
        countsMap[c.itemId || c.item] = Number(c.countedQuantity || 0);
      });
    }

    // Recalculate variances
    doc.lines.forEach((line: any) => {
      const itemIdStr = line.item.toString();
      if (countsMap[itemIdStr] !== undefined) {
        line.countedQuantity = countsMap[itemIdStr];
        line.varianceQuantity = line.countedQuantity - line.systemQuantity;
        line.varianceValue = Math.round(line.varianceQuantity * (line.unitCost || 0) * 100) / 100;
      }
    });

    doc.status = 'Under Review';
    doc.countedBy = (req as any).user?._id?.toString() || (req as any).user?.displayName || 'Auditor';
    await doc.save();

    res.status(200).json({ success: true, data: doc, message: 'Physical counts recorded. Review variances before reconciliation.' });
  } catch (error) { next(error); }
};

// @desc    Reconcile cycle count (auto-creates Inventory Adjustment & posts GL)
// @route   POST /api/v1/books/inventory/cycle-counts/:id/reconcile
export const reconcileCycleCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];

    const doc = await CycleCount.findOne(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Cycle count not found' });

    if (doc.status === 'Reconciled') {
      return res.status(400).json({ success: false, message: 'Cycle count is already reconciled' });
    }

    const varianceLines = doc.lines.filter((l: any) => l.varianceQuantity !== 0);

    if (varianceLines.length === 0) {
      doc.status = 'Reconciled';
      doc.reconciledAt = new Date();
      doc.reconciledBy = (req as any).user?._id?.toString() || 'System';
      await doc.save();
      return res.status(200).json({ success: true, data: doc, message: 'Count perfectly matched! Zero variance to adjust.' });
    }

    // Generate automatic Inventory Adjustment
    const adjCount = await InventoryAdjustment.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
    const referenceNumber = `ADJ-CC-${String(adjCount + 1).padStart(5, '0')}`;

    let totalDiscrepancyValue = 0;
    const adjustmentItems = varianceLines.map((vl: any) => {
      totalDiscrepancyValue += vl.varianceValue;
      return {
        item: vl.item,
        warehouse: doc.warehouseId,
        currentStock: vl.systemQuantity,
        quantityAdjusted: vl.varianceQuantity,
        newStock: vl.countedQuantity,
        unitCost: vl.unitCost,
        valueAdjusted: vl.varianceValue
      };
    });

    const adjustment = await InventoryAdjustment.create({
      referenceNumber,
      date: new Date(),
      warehouseId: doc.warehouseId,
      reason: `Cycle Count ${doc.countNumber} Physical Audit Reconciliation`,
      description: `Auto-reconciled variance from physical inventory count ${doc.countNumber}`,
      account: 'Inventory Shrinkage & Loss',
      mode: 'quantity',
      status: 'Adjusted',
      approvalStatus: 'Approved',
      totalValue: Math.abs(totalDiscrepancyValue),
      items: adjustmentItems,
      companyId: orgId,
      orgId,
      createdBy: (req as any).user?._id?.toString()
    });

    // Update physical stocks on items
    for (const vl of varianceLines) {
      const item = await Item.findById(vl.item);
      if (item) {
        item.stock = Math.max(0, (item.stock || 0) + vl.varianceQuantity);
        item.stockQuantity = item.stock;

        if (!item.warehouseStock) item.warehouseStock = [];
        let ws = item.warehouseStock.find((w: any) => w.warehouse?.toString() === doc.warehouseId.toString());
        if (ws) {
          ws.stockOnHand = Math.max(0, (ws.stockOnHand || 0) + vl.varianceQuantity);
          ws.availableStock = Math.max(0, ws.stockOnHand - (ws.committedStock || 0));
        }
        await item.save();
      }
    }

    // Post to General Ledger
    try {
      await PostingEngine.handleEvent('INVENTORY_ADJUSTMENT', {
        adjustmentId: adjustment._id.toString(),
        companyId: orgId,
        totalValue: Math.abs(totalDiscrepancyValue),
        isGain: totalDiscrepancyValue > 0
      });
    } catch (e) {
      console.error('Failed to post cycle count adjustment to GL:', e);
    }

    doc.status = 'Reconciled';
    doc.reconciledAt = new Date();
    doc.reconciledBy = (req as any).user?._id?.toString() || 'Auditor';
    doc.adjustmentId = adjustment._id as any;
    await doc.save();

    res.status(200).json({ 
      success: true, 
      data: doc, 
      adjustmentId: adjustment._id,
      message: `Cycle count reconciled successfully. Created Adjustment ${referenceNumber} and posted to GL.` 
    });
  } catch (error) { next(error); }
};
