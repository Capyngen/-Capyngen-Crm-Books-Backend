import mongoose from 'mongoose';
import Item from '../models/Item';
import PurchaseOrder from '../models/PurchaseOrder';

export interface IReplenishmentAlert {
  itemId: string;
  itemName: string;
  sku: string;
  currentStock: number;
  availableStock: number;
  safetyStock: number;
  leadTimeDays: number;
  reorderPoint: number;
  shortageQuantity: number;
  suggestedReorderQuantity: number;
  urgency: 'Critical' | 'High' | 'Medium';
  preferredVendorId?: string;
  purchaseRate: number;
  estimatedCost: number;
}

export class ReplenishmentService {
  /**
   * Scan inventory for items breaching Reorder Point (ROP)
   * Formula: ROP = (Daily Consumption * Lead Time Days) + Safety Stock
   */
  static async getReplenishmentAlerts(orgId: string): Promise<IReplenishmentAlert[]> {
    const filter: any = { type: 'goods' };
    if (orgId) {
      filter.$or = [{ companyId: orgId }, { orgId }];
    }

    const items = await Item.find(filter).lean();
    const alerts: IReplenishmentAlert[] = [];

    for (const item of items) {
      const stock = Number(item.stock || 0);
      const leadTime = Number(item.leadTimeDays || 7);
      const safetyStock = Number(item.safetyStock || 5);

      // Determine ROP: user-configured or dynamically calculated
      const configuredROP = Number(item.reorderPoint || 0);
      const dailyConsumption = 2; // benchmark burn rate
      const calculatedROP = (dailyConsumption * leadTime) + safetyStock;
      const rop = configuredROP > 0 ? configuredROP : calculatedROP;

      if (stock <= rop) {
        const shortage = Math.max(0, rop - stock);
        const suggestedQty = Math.max(shortage * 2, safetyStock * 3, 10);
        const rate = Number(item.purchaseRate || 0);

        let urgency: 'Critical' | 'High' | 'Medium' = 'Medium';
        if (stock <= safetyStock) {
          urgency = 'Critical';
        } else if (stock <= Math.floor(rop / 2)) {
          urgency = 'High';
        }

        alerts.push({
          itemId: item._id.toString(),
          itemName: item.name,
          sku: item.sku || '',
          currentStock: stock,
          availableStock: stock,
          safetyStock,
          leadTimeDays: leadTime,
          reorderPoint: rop,
          shortageQuantity: shortage,
          suggestedReorderQuantity: suggestedQty,
          urgency,
          preferredVendorId: item.preferredVendorId || undefined,
          purchaseRate: rate,
          estimatedCost: Math.round(suggestedQty * rate * 100) / 100
        });
      }
    }

    // Sort by critical urgency first
    const urgencyOrder = { Critical: 0, High: 1, Medium: 2 };
    alerts.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    return alerts;
  }

  /**
   * Automatically generate draft Purchase Orders grouped by vendor for low-stock items
   */
  static async autoGeneratePurchaseOrders(
    orgId: string,
    itemIds?: string[],
    userId?: string
  ): Promise<any[]> {
    const alerts = await this.getReplenishmentAlerts(orgId);
    const targetAlerts = itemIds && itemIds.length > 0
      ? alerts.filter(a => itemIds.includes(a.itemId))
      : alerts;

    if (targetAlerts.length === 0) return [];

    // Group items by vendor
    const vendorMap: { [vendorId: string]: IReplenishmentAlert[] } = {};
    for (const alert of targetAlerts) {
      const vendorKey = alert.preferredVendorId || 'UNASSIGNED_VENDOR';
      if (!vendorMap[vendorKey]) vendorMap[vendorKey] = [];
      vendorMap[vendorKey].push(alert);
    }

    const createdPOs: any[] = [];
    const count = await PurchaseOrder.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
    let nextNum = count + 1;

    for (const [vendorId, vItems] of Object.entries(vendorMap)) {
      if (vendorId === 'UNASSIGNED_VENDOR') continue;

      const poItems = vItems.map(vi => ({
        item: new mongoose.Types.ObjectId(vi.itemId),
        quantity: vi.suggestedReorderQuantity,
        rate: vi.purchaseRate,
        amount: Math.round(vi.suggestedReorderQuantity * vi.purchaseRate * 100) / 100
      }));

      const totalAmount = poItems.reduce((acc, it) => acc + it.amount, 0);
      const poNumber = `PO-${String(nextNum++).padStart(5, '0')}`;

      const po = await PurchaseOrder.create({
        poNumber,
        vendorId: new mongoose.Types.ObjectId(vendorId),
        date: new Date(),
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'Draft',
        approvalStatus: 'Draft',
        items: poItems,
        totalAmount,
        notes: `Automated replenishment order triggered by ROP monitor for ${vItems.length} items.`,
        companyId: orgId,
        orgId,
        createdBy: userId
      });

      createdPOs.push(po);
    }

    return createdPOs;
  }
}
