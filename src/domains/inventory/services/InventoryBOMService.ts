import mongoose from 'mongoose';
import Item from '../models/Item';

export class InventoryBOMService {
  /**
   * Assembles a Kit/BOM/Assembly item.
   * Increases the stock of the Kit/Assembly while deducting the stock of its raw materials (BOM items).
   */
  static async assembleKit(kitItemId: string | string[] | mongoose.Types.ObjectId, quantityToAssemble: number) {
    const kit = await Item.findById(kitItemId);
    if (!kit || !kit.bom || kit.bom.length === 0) {
      throw new Error('Item does not have a Bill of Materials (BOM) configured');
    }

    // 1. Validate all raw materials first
    const componentsToUpdate: { doc: any; deductQty: number }[] = [];
    for (const component of kit.bom) {
      const wastageFactor = 1 + ((component.wastagePercent || 0) / 100);
      const requiredQty = Math.ceil(component.quantity * quantityToAssemble * wastageFactor * 100) / 100;
      const rawMaterial = await Item.findById(component.itemId);

      if (!rawMaterial) {
        throw new Error(`BOM component ${component.itemName || component.itemId} not found`);
      }
      if ((rawMaterial.stock || 0) < requiredQty) {
        throw new Error(
          `Insufficient stock for component "${rawMaterial.name}". Required: ${requiredQty}, Available: ${rawMaterial.stock || 0}`
        );
      }
      componentsToUpdate.push({ doc: rawMaterial, deductQty: requiredQty });
    }

    // 2. Deduct raw materials
    for (const entry of componentsToUpdate) {
      entry.doc.stock = Math.max(0, (entry.doc.stock || 0) - entry.deductQty);
      entry.doc.stockQuantity = entry.doc.stock;
      await entry.doc.save();
    }

    // 3. Increase Kit / Assembly Stock
    kit.stock = (kit.stock || 0) + Number(quantityToAssemble);
    kit.stockQuantity = kit.stock;
    await kit.save();

    return kit;
  }
}
