import mongoose from 'mongoose';
import Item from '../models/Item';

export interface IFIFOConsumptionResult {
  totalCOGS: number;
  effectiveUnitCost: number;
  consumedLayers: {
    date: Date;
    quantity: number;
    unitCost: number;
    referenceDoc?: string;
  }[];
}

export class InventoryValuationService {
  /**
   * Recalculates Weighted Average Cost (WAC) on new stock receipt
   */
  static calculateWAC(
    currentStock: number,
    currentWAC: number,
    inboundQty: number,
    inboundRate: number
  ): number {
    const totalQty = currentStock + inboundQty;
    if (totalQty <= 0) return inboundRate > 0 ? inboundRate : currentWAC;
    const totalValuation = (currentStock * currentWAC) + (inboundQty * inboundRate);
    return Math.round((totalValuation / totalQty) * 100) / 100;
  }

  /**
   * Records an inbound cost layer (from Goods Receipt or Bill)
   */
  static async recordInboundCostLayer(
    itemId: string | mongoose.Types.ObjectId,
    quantity: number,
    unitCost: number,
    referenceDoc: string = ''
  ) {
    if (quantity <= 0) return;
    const item = await Item.findById(itemId);
    if (!item) return;

    if (!item.costLayers) item.costLayers = [];

    item.costLayers.push({
      date: new Date(),
      quantity,
      unitCost,
      remainingQty: quantity,
      referenceDoc
    });

    // Update WAC rate
    const currentStock = Number(item.stock || 0);
    const currentRate = Number(item.purchaseRate || unitCost);
    item.purchaseRate = this.calculateWAC(currentStock, currentRate, quantity, unitCost);

    await item.save();
  }

  /**
   * Consumes inventory using First-In, First-Out (FIFO) cost layers
   */
  static async consumeFIFOCostLayers(
    itemId: string | mongoose.Types.ObjectId,
    quantityToIssue: number
  ): Promise<IFIFOConsumptionResult> {
    const item = await Item.findById(itemId);
    if (!item) throw new Error('Item not found');

    if (!item.costLayers || item.costLayers.length === 0) {
      const fallbackCost = Number(item.purchaseRate || 0);
      return {
        totalCOGS: fallbackCost * quantityToIssue,
        effectiveUnitCost: fallbackCost,
        consumedLayers: [{
          date: new Date(),
          quantity: quantityToIssue,
          unitCost: fallbackCost,
          referenceDoc: 'Fallback Unit Rate'
        }]
      };
    }

    // Sort by date ascending (oldest first)
    const activeLayers = (item.costLayers as any[]).filter((l: any) => l.remainingQty > 0);
    activeLayers.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let remainingNeeded = quantityToIssue;
    let totalCOGS = 0;
    const consumed: any[] = [];

    for (const layer of activeLayers) {
      if (remainingNeeded <= 0) break;
      const consumeQty = Math.min(layer.remainingQty, remainingNeeded);
      layer.remainingQty -= consumeQty;
      remainingNeeded -= consumeQty;

      const layerCost = consumeQty * layer.unitCost;
      totalCOGS += layerCost;

      consumed.push({
        date: layer.date,
        quantity: consumeQty,
        unitCost: layer.unitCost,
        referenceDoc: layer.referenceDoc
      });
    }

    // If remaining needed exceeds layers, use last known purchaseRate
    if (remainingNeeded > 0) {
      const fallbackRate = Number(item.purchaseRate || 0);
      totalCOGS += remainingNeeded * fallbackRate;
      consumed.push({
        date: new Date(),
        quantity: remainingNeeded,
        unitCost: fallbackRate,
        referenceDoc: 'Unlayered Stock'
      });
    }

    await item.save();

    const effectiveUnitCost = quantityToIssue > 0 ? Math.round((totalCOGS / quantityToIssue) * 100) / 100 : 0;
    return {
      totalCOGS: Math.round(totalCOGS * 100) / 100,
      effectiveUnitCost,
      consumedLayers: consumed
    };
  }

  /**
   * Get Live Valuation of All Items (Comparing FIFO layers vs WAC)
   */
  static async getValuationReport(orgId: string) {
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const items = await Item.find(filter).lean();

    return items.map((item: any) => {
      const stock = Number(item.stock || 0);
      const wacRate = Number(item.purchaseRate || 0);
      const wacValuation = Math.round(stock * wacRate * 100) / 100;

      // Calculate FIFO Valuation from remaining layers
      let fifoValuation = 0;
      if (item.costLayers && item.costLayers.length > 0) {
        fifoValuation = item.costLayers.reduce(
          (acc: number, l: any) => acc + (Number(l.remainingQty || 0) * Number(l.unitCost || 0)),
          0
        );
      }
      if (fifoValuation === 0 && stock > 0) {
        fifoValuation = wacValuation;
      }

      return {
        itemId: item._id,
        name: item.name,
        sku: item.sku,
        stockOnHand: stock,
        unit: item.unit || 'pcs',
        wacRate,
        wacValuation,
        fifoValuation: Math.round(fifoValuation * 100) / 100,
        variance: Math.round((fifoValuation - wacValuation) * 100) / 100,
        valuationMethod: item.valuationMethod || 'FIFO'
      };
    });
  }
}
