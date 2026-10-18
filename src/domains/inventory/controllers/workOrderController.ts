import { Request, Response, NextFunction } from 'express';
import WorkOrder from '../models/WorkOrder';
import Item from '../models/Item';
import { InventoryBOMService } from '../services/InventoryBOMService';
import { ChartOfAccount } from '../../books/models/ChartOfAccount';
import { LedgerService } from '../../books/services/ledgerService';
import { requestContext } from '../../../context';

export const getWorkOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId || req.body.orgId;
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const docs = await WorkOrder.find(filter)
      .populate('itemId', 'name sku unit purchaseRate salesRate')
      .populate('routingId', 'name')
      .populate('targetWarehouseId', 'name code')
      .populate('sourceWarehouseId', 'name code')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) { next(error); }
};

export const getWorkOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId || req.body.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];
    const doc = await WorkOrder.findOne(filter)
      .populate('itemId', 'name sku unit purchaseRate salesRate bom')
      .populate('routingId', 'name operations')
      .populate('targetWarehouseId', 'name code')
      .populate('sourceWarehouseId', 'name code');
    if (!doc) return res.status(404).json({ success: false, message: 'Work Order not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const createWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId || req.body.orgId;

    let workOrderNumber = req.body.workOrderNumber;
    if (!workOrderNumber) {
      const count = await WorkOrder.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
      workOrderNumber = `WO-${String(count + 1).padStart(5, '0')}`;
    }

    const payload = {
      ...req.body,
      workOrderNumber,
      companyId: orgId,
      orgId
    };

    const doc = await WorkOrder.create(payload);
    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const updateWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId || req.body.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];
    const doc = await WorkOrder.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Work Order not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const deleteWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId || req.body.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];
    const doc = await WorkOrder.findOneAndDelete(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Work Order not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};

// @desc    Complete work order: consumes raw materials (BOM), produces finished goods, and posts balanced manufacturing costing to General Ledger
// @route   POST /api/v1/books/inventory/work-orders/:id/complete
export const completeWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId || 'default-org';
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];

    const order = await WorkOrder.findOne(filter);
    if (!order) return res.status(404).json({ success: false, message: 'Work Order not found' });

    if (order.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Work Order is already completed' });
    }

    const qtyToProduce = Number(order.quantity || 1);
    const scrapQty = Number(order.scrapQuantity || 0);

    const finishedGood = await Item.findById(order.itemId);
    if (!finishedGood) return res.status(404).json({ message: 'Finished good item not found' });

    // 1. Calculate Standard/Actual BOM Production Costs
    let rawMaterialCost = 0;
    if (finishedGood.bom && Array.isArray(finishedGood.bom)) {
      for (const comp of finishedGood.bom) {
        const compItem = await Item.findById(comp.itemId);
        const unitRate = compItem?.purchaseRate || comp.unitCost || 100;
        const wastageFactor = 1 + ((comp.wastagePercent || 0) / 100);
        rawMaterialCost += (comp.quantity * qtyToProduce * wastageFactor) * unitRate;
      }
    } else {
      rawMaterialCost = (finishedGood.purchaseRate || 500) * qtyToProduce;
    }

    rawMaterialCost = Math.round(rawMaterialCost * 100) / 100;

    // Labor and Overhead absorption (standard 12% of material cost)
    const laborOverheadCost = Math.round(rawMaterialCost * 0.12 * 100) / 100;

    // Scrap Cost calculation
    let scrapCost = 0;
    if (scrapQty > 0 && qtyToProduce > 0) {
      scrapCost = Math.round(((scrapQty / qtyToProduce) * rawMaterialCost) * 100) / 100;
    }

    // Capitalized Finished Goods Value
    const finishedGoodsCapitalized = Math.round((rawMaterialCost - scrapCost + laborOverheadCost) * 100) / 100;

    // 2. Execute BOM Assembly in Inventory (deducts stock of components, increases finished goods)
    await InventoryBOMService.assembleKit(order.itemId, qtyToProduce);

    // 3. Update Warehouse Stock
    if (order.targetWarehouseId) {
      if (!finishedGood.warehouseStock) finishedGood.warehouseStock = [];
      let ws = finishedGood.warehouseStock.find(
        (w: any) => w.warehouse?.toString() === order.targetWarehouseId?.toString()
      );
      if (ws) {
        ws.stockOnHand += qtyToProduce;
        ws.availableStock = Math.max(0, ws.stockOnHand - (ws.committedStock || 0));
      } else {
        finishedGood.warehouseStock.push({
          warehouse: order.targetWarehouseId as any,
          bin: '',
          stockOnHand: qtyToProduce,
          committedStock: 0,
          availableStock: qtyToProduce
        } as any);
      }
      await finishedGood.save();
    }

    // 4. Double-Entry Manufacturing Costing GL Posting
    // Debit: Finished Goods Inventory (Asset)
    // Debit (if scrap): Manufacturing Scrap Expense (Expense)
    // Credit: Raw Materials Inventory (Asset)
    // Credit: Labor & Overhead Applied (WIP Absorption)
    let finishedGoodsCoa = await ChartOfAccount.findOne({ orgId, accountName: { $regex: /Finished Goods/i } });
    if (!finishedGoodsCoa) finishedGoodsCoa = await ChartOfAccount.findOne({ orgId, accountType: 'Inventory' });

    let rawMaterialsCoa = await ChartOfAccount.findOne({ orgId, accountName: { $regex: /Raw Material|Inventory Asset/i } });
    if (!rawMaterialsCoa) rawMaterialsCoa = await ChartOfAccount.findOne({ orgId, accountType: 'Inventory' });

    let overheadCoa = await ChartOfAccount.findOne({ orgId, accountName: { $regex: /Labor.*Overhead|Manufacturing Overhead/i } });
    if (!overheadCoa) overheadCoa = await ChartOfAccount.findOne({ orgId, accountCategory: 'Expense' });

    let scrapCoa = await ChartOfAccount.findOne({ orgId, accountName: { $regex: /Scrap|Spoilage/i } });
    if (!scrapCoa) scrapCoa = await ChartOfAccount.findOne({ orgId, accountCategory: 'Expense' });

    const fgAccId = finishedGoodsCoa ? finishedGoodsCoa._id.toString() : 'Finished Goods Inventory';
    const rmAccId = rawMaterialsCoa ? rawMaterialsCoa._id.toString() : 'Raw Materials Inventory';
    const ovhAccId = overheadCoa ? overheadCoa._id.toString() : 'Manufacturing Overhead Applied';
    const scrapAccId = scrapCoa ? scrapCoa._id.toString() : 'Manufacturing Scrap Expense';

    const ledgerLines: any[] = [];
    ledgerLines.push({ accountId: fgAccId, debit: finishedGoodsCapitalized, credit: 0 });
    if (scrapCost > 0) {
      ledgerLines.push({ accountId: scrapAccId, debit: scrapCost, credit: 0 });
    }
    ledgerLines.push({ accountId: rmAccId, debit: 0, credit: rawMaterialCost });
    ledgerLines.push({ accountId: ovhAccId, debit: 0, credit: laborOverheadCost });

    // Strict Double Entry Verification
    const debits = ledgerLines.reduce((s, l) => s + (l.debit || 0), 0);
    const credits = ledgerLines.reduce((s, l) => s + (l.credit || 0), 0);
    if (Math.abs(debits - credits) > 0.02) {
      // Small rounding adjustment to overhead
      const diff = debits - credits;
      ledgerLines[ledgerLines.length - 1].credit += diff;
    }

    await LedgerService.postTransaction(
      orgId,
      order._id.toString(),
      'ManufacturingAssembly',
      new Date(),
      ledgerLines
    );

    order.status = 'Completed';
    order.completedAt = new Date();
    await order.save();

    res.status(200).json({ 
      success: true, 
      data: order, 
      costing: {
        rawMaterialCost,
        laborOverheadCost,
        scrapCost,
        finishedGoodsCapitalized
      },
      message: `Work Order ${order.workOrderNumber} completed. ${qtyToProduce} unit(s) assembled into Finished Goods. Balanced manufacturing journal posted to GL.` 
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to complete work order' });
  }
};

// @desc    Explode Multi-Level Bill of Materials (BOM) hierarchy
// @route   GET /api/v1/books/inventory/work-orders/bom-explosion/:itemId
export const getBOMExplosion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const explode = async (targetItem: any, currentLevel = 1): Promise<any> => {
      if (!targetItem.bom || targetItem.bom.length === 0) {
        return {
          itemId: targetItem._id,
          name: targetItem.name,
          sku: targetItem.sku,
          level: currentLevel,
          isLeaf: true,
          unitCost: targetItem.purchaseRate || 0,
          stockOnHand: targetItem.stock || 0,
          children: []
        };
      }

      const children = await Promise.all(
        targetItem.bom.map(async (b: any) => {
          const comp = await Item.findById(b.itemId);
          if (!comp) {
            return {
              itemId: b.itemId,
              name: b.itemName || 'Unknown Component',
              level: currentLevel + 1,
              quantity: b.quantity,
              unitCost: b.unitCost || 0,
              wastagePercent: b.wastagePercent || 0,
              children: []
            };
          }
          const subTree = await explode(comp, currentLevel + 1);
          return {
            ...subTree,
            quantityRequired: b.quantity,
            wastagePercent: b.wastagePercent || 0,
            extendedCost: Math.round((b.quantity * (comp.purchaseRate || b.unitCost || 0)) * 100) / 100
          };
        })
      );

      const totalBOMCost = children.reduce((s: number, c: any) => s + (c.extendedCost || 0), 0);

      return {
        itemId: targetItem._id,
        name: targetItem.name,
        sku: targetItem.sku,
        level: currentLevel,
        isLeaf: false,
        totalBOMCost: Math.round(totalBOMCost * 100) / 100,
        stockOnHand: targetItem.stock || 0,
        children
      };
    };

    const tree = await explode(item, 1);
    res.json(tree);
  } catch (error) { next(error); }
};
