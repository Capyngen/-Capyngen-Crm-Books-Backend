import mongoose from 'mongoose';
import Item from '../models/Item';
import { StockLedger } from '../models/StockLedger';

export class InventoryBOMService {
  /**
   * Assembles a Kit/BOM/Assembly item.
   * Increases the stock of the Kit/Assembly while deducting the stock of its raw materials (BOM items).
   * Writes double-entry StockLedger records for audit traceability.
   */
  static async assembleKit(
    kitItemId: string | string[] | mongoose.Types.ObjectId,
    quantityToAssemble: number,
    meta?: {
      orgId?: string;
      referenceDocNumber?: string;
      actor?: { userId?: string; name?: string; role?: string };
    }
  ) {
    const kit = await Item.findById(kitItemId);
    if (!kit || !kit.bom || kit.bom.length === 0) {
      throw new Error('Item does not have a Bill of Materials (BOM) configured');
    }

    const orgId = meta?.orgId || kit.orgId || kit.companyId;

    // 1. Validate all raw materials first
    const componentsToUpdate: { doc: any; deductQty: number; unitCost: number }[] = [];
    for (const component of kit.bom) {
      const wastageFactor = 1 + ((component.wastagePercent || 0) / 100);
      const requiredQty = Math.ceil(component.quantity * quantityToAssemble * wastageFactor * 100) / 100;
      const rawMaterial = await Item.findById(component.itemId);

      if (!rawMaterial) {
        throw new Error(`BOM component ${component.itemName || component.itemId} not found`);
      }
      const availableQty = rawMaterial.stockOnHand !== undefined ? rawMaterial.stockOnHand : (rawMaterial.stock || 0);
      if (availableQty < requiredQty) {
        throw new Error(
          `Insufficient stock for component "${rawMaterial.name}". Required: ${requiredQty}, Available: ${availableQty}`
        );
      }
      componentsToUpdate.push({
        doc: rawMaterial,
        deductQty: requiredQty,
        unitCost: rawMaterial.costPrice || rawMaterial.purchaseRate || component.unitCost || 0
      });
    }

    // 2. Deduct raw materials and write StockLedger
    for (const entry of componentsToUpdate) {
      const currentOnHand = entry.doc.stockOnHand !== undefined ? entry.doc.stockOnHand : (entry.doc.stock || 0);
      entry.doc.stockOnHand = Math.max(0, currentOnHand - entry.deductQty);
      entry.doc.stock = entry.doc.stockOnHand;
      entry.doc.stockQuantity = entry.doc.stockOnHand;
      if (entry.doc.warehouseStock && Array.isArray(entry.doc.warehouseStock) && entry.doc.warehouseStock[0]) {
        entry.doc.warehouseStock[0].stockOnHand = Math.max(0, (entry.doc.warehouseStock[0].stockOnHand || 0) - entry.deductQty);
        entry.doc.warehouseStock[0].availableStock = Math.max(0, entry.doc.warehouseStock[0].stockOnHand - (entry.doc.warehouseStock[0].committedStock || 0));
      }
      await entry.doc.save();

      if (meta?.referenceDocNumber) {
        await StockLedger.create({
          companyId: orgId,
          orgId,
          itemId: entry.doc._id,
          itemSku: entry.doc.sku || '',
          itemName: entry.doc.name || '',
          fromLocation: { type: 'STORAGE_BIN', code: entry.doc.warehouseStock?.[0]?.bin || 'RM-BIN' },
          toLocation: { type: 'WIP_SHOP_FLOOR', code: 'WIP-ASSEMBLY-LINE-01' },
          bucketFrom: 'ACTIVE_STORAGE_BINS',
          bucketTo: 'WIP_SHOP_FLOOR',
          quantity: entry.deductQty,
          valuationRate: entry.unitCost,
          totalValuation: entry.deductQty * entry.unitCost,
          referenceDocType: 'WORK_ORDER',
          referenceDocNumber: meta.referenceDocNumber,
          actor: meta.actor || { name: 'Shop Floor Assembly Lead', role: 'Production Operator' },
          timestamp: new Date()
        }).catch(err => console.warn('Could not write RM consumption ledger:', err));
      }
    }

    // 3. Increase Kit / Assembly Stock and write StockLedger
    const kitOnHand = kit.stockOnHand !== undefined ? kit.stockOnHand : (kit.stock || 0);
    kit.stockOnHand = kitOnHand + Number(quantityToAssemble);
    kit.stock = kit.stockOnHand;
    kit.stockQuantity = kit.stockOnHand;
    if (kit.warehouseStock && Array.isArray(kit.warehouseStock) && kit.warehouseStock[0]) {
      kit.warehouseStock[0].stockOnHand = (kit.warehouseStock[0].stockOnHand || 0) + Number(quantityToAssemble);
      kit.warehouseStock[0].availableStock = Math.max(0, kit.warehouseStock[0].stockOnHand - (kit.warehouseStock[0].committedStock || 0));
    }
    await kit.save();

    if (meta?.referenceDocNumber) {
      const kitRate = kit.costPrice || kit.purchaseRate || 0;
      await StockLedger.create({
        companyId: orgId,
        orgId,
        itemId: kit._id,
        itemSku: kit.sku || '',
        itemName: kit.name || '',
        fromLocation: { type: 'WIP_SHOP_FLOOR', code: 'WIP-ASSEMBLY-LINE-01' },
        toLocation: { type: 'STORAGE_BIN', code: kit.warehouseStock?.[0]?.bin || 'FG-BIN-01' },
        bucketFrom: 'WIP_SHOP_FLOOR',
        bucketTo: 'ACTIVE_STORAGE_BINS',
        quantity: Number(quantityToAssemble),
        valuationRate: kitRate,
        totalValuation: Number(quantityToAssemble) * kitRate,
        referenceDocType: 'WORK_ORDER_CAPITALIZATION',
        referenceDocNumber: meta.referenceDocNumber,
        actor: meta.actor || { name: 'Final Quality Inspector', role: 'QC / Production Manager' },
        timestamp: new Date()
      }).catch(err => console.warn('Could not write FG capitalization ledger:', err));
    }

    return kit;
  }
}
