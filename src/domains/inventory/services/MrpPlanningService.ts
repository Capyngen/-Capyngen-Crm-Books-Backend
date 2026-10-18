import Item from '../models/Item';
import WorkOrder from '../models/WorkOrder';
import PurchaseOrder from '../models/PurchaseOrder';
import SalesOrder from '../../billing/models/SalesOrder';
import mongoose from 'mongoose';

export interface IPlannedOrder {
  itemId: string;
  itemName: string;
  sku: string;
  orderType: 'Manufacturing (Work Order)' | 'Procurement (Purchase Order)';
  grossDemand: number;
  stockOnHand: number;
  inTransitPOQty: number;
  safetyStock: number;
  netRequirement: number;
  leadTimeDays: number;
  recommendedOrderDate: string;
  requiredDeliveryDate: string;
  preferredVendorId?: string;
  estimatedCost: number;
}

export class MrpPlanningService {
  static async calculateMRP(orgId: string): Promise<{
    planningHorizonDays: number;
    asOfDate: string;
    totalDemandsAnalyzed: number;
    shortageCount: number;
    totalProcurementCost: number;
    plannedWorkOrders: IPlannedOrder[];
    plannedPurchaseOrders: IPlannedOrder[];
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Fetch Confirmed Sales Orders (Demand)
    const confirmedSalesOrders = await (SalesOrder.find({
      $or: [{ orgId }, { companyId: orgId }],
      status: { $in: ['Confirmed', 'Approved', 'Open'] }
    } as any) as any).select('orderNumber items shipmentDate deliveryDate orderDate').lean();

    // 2. Fetch Items below reorder point or safety stock
    const allItems = await (Item.find({
      $or: [{ orgId }, { companyId: orgId }]
    } as any) as any).lean();

    // Demand map: itemId -> quantity needed
    const demandMap: Record<string, { grossQty: number; requiredBy: Date }> = {};

    // Collect Demand from Sales Orders
    for (const so of confirmedSalesOrders) {
      const soAny = so as any;
      const targetDate = soAny.shipmentDate || soAny.deliveryDate || soAny.orderDate || new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
      if (soAny.items && Array.isArray(soAny.items)) {
        for (const line of soAny.items) {
          const itemIdStr = line.item?.toString();
          if (itemIdStr) {
            if (!demandMap[itemIdStr]) {
              demandMap[itemIdStr] = { grossQty: 0, requiredBy: new Date(targetDate) };
            }
            demandMap[itemIdStr].grossQty += Number(line.quantity) || 1;
            if (new Date(targetDate) < demandMap[itemIdStr].requiredBy) {
              demandMap[itemIdStr].requiredBy = new Date(targetDate);
            }
          }
        }
      }
    }

    // Collect Demand from Reorder Points / Safety Stock
    for (const item of allItems) {
      const itemIdStr = item._id.toString();
      const reorderPt = Number(item.reorderPoint) || 0;
      const currentStock = Number(item.stock || item.stockOnHand || 0);

      if (reorderPt > 0 && currentStock < reorderPt) {
        const replenishmentDemand = reorderPt - currentStock;
        if (!demandMap[itemIdStr]) {
          demandMap[itemIdStr] = { grossQty: 0, requiredBy: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) };
        }
        demandMap[itemIdStr].grossQty += replenishmentDemand;
      }
    }

    // 3. Open Purchase Orders (In-transit incoming supply)
    const openPOs = await (PurchaseOrder.find({
      $or: [{ orgId }, { companyId: orgId }],
      status: { $in: ['Issued', 'Confirmed', 'Partially Received'] }
    } as any) as any).select('items expectedDeliveryDate').lean();

    const poSupplyMap: Record<string, number> = {};
    for (const po of openPOs) {
      if (po.items && Array.isArray(po.items)) {
        for (const line of po.items) {
          const id = (line as any).itemId?.toString() || (line as any).item?.toString();
          if (id) {
            poSupplyMap[id] = (poSupplyMap[id] || 0) + (Number(line.quantity) || 0);
          }
        }
      }
    }

    const plannedWorkOrders: IPlannedOrder[] = [];
    const plannedPurchaseOrders: IPlannedOrder[] = [];

    // Helper to explode and schedule
    const processDemand = (item: any, grossDemand: number, requiredDate: Date) => {
      const stock = Number(item.stock || item.stockOnHand || 0);
      const safety = Number(item.safetyStock || 0);
      const inTransit = poSupplyMap[item._id.toString()] || 0;

      // Net Requirement Formula: Gross Demand + Safety Stock - Stock On Hand - In-Transit Supply
      const net = Math.max(0, grossDemand + safety - stock - inTransit);

      if (net > 0) {
        const leadDays = Number(item.leadTimeDays) || (item.bom && item.bom.length > 0 ? 5 : 7);
        const orderDate = new Date(requiredDate.getTime() - leadDays * 24 * 60 * 60 * 1000);
        const hasBOM = item.bom && Array.isArray(item.bom) && item.bom.length > 0;

        const planned: IPlannedOrder = {
          itemId: item._id.toString(),
          itemName: item.name,
          sku: item.sku || 'N/A',
          orderType: hasBOM ? 'Manufacturing (Work Order)' : 'Procurement (Purchase Order)',
          grossDemand,
          stockOnHand: stock,
          inTransitPOQty: inTransit,
          safetyStock: safety,
          netRequirement: Math.ceil(net),
          leadTimeDays: leadDays,
          recommendedOrderDate: orderDate.toISOString().split('T')[0],
          requiredDeliveryDate: requiredDate.toISOString().split('T')[0],
          preferredVendorId: item.preferredVendorId || undefined,
          estimatedCost: Math.round(net * (item.purchaseRate || item.costPrice || 100))
        };

        if (hasBOM) {
          plannedWorkOrders.push(planned);
          // Explode BOM children for manufactured assembly
          for (const comp of item.bom) {
            const compItem = (allItems as any[]).find((i: any) => i._id.toString() === comp.itemId?.toString());
            if (compItem) {
              const compDemand = comp.quantity * net * (1 + (comp.wastagePercent || 0) / 100);
              processDemand(compItem, compDemand, orderDate);
            }
          }
        } else {
          // Avoid duplicate planned PO entries for the same raw material by aggregating
          const existing = plannedPurchaseOrders.find(p => p.itemId === item._id.toString());
          if (existing) {
            existing.grossDemand += grossDemand;
            existing.netRequirement += Math.ceil(net);
            existing.estimatedCost += Math.round(net * (item.purchaseRate || item.costPrice || 100));
          } else {
            plannedPurchaseOrders.push(planned);
          }
        }
      }
    };

    // Run MRP processing for all demands
    for (const itemIdStr of Object.keys(demandMap)) {
      const item = (allItems as any[]).find((i: any) => i._id.toString() === itemIdStr);
      if (item) {
        processDemand(item, demandMap[itemIdStr].grossQty, demandMap[itemIdStr].requiredBy);
      }
    }

    const totalProcurementCost = plannedPurchaseOrders.reduce((s, p) => s + p.estimatedCost, 0);

    return {
      planningHorizonDays: 60,
      asOfDate: today.toISOString().split('T')[0],
      totalDemandsAnalyzed: Object.keys(demandMap).length,
      shortageCount: plannedWorkOrders.length + plannedPurchaseOrders.length,
      totalProcurementCost,
      plannedWorkOrders,
      plannedPurchaseOrders
    };
  }

  static async generateOrders(orgId: string, selections: {
    workOrderIds: string[];
    purchaseOrderIds: string[];
  }) {
    const mrp = await this.calculateMRP(orgId);
    let workOrdersCreated = 0;
    let purchaseOrdersCreated = 0;

    // 1. Generate Work Orders
    for (const pwo of mrp.plannedWorkOrders) {
      if (selections.workOrderIds.includes(pwo.itemId)) {
        const count = await WorkOrder.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
        const wo = new WorkOrder({
          orgId,
          companyId: orgId,
          workOrderNumber: `WO-MRP-${String(count + 1).padStart(5, '0')}`,
          itemId: new mongoose.Types.ObjectId(pwo.itemId),
          quantity: pwo.netRequirement,
          status: 'Planned',
          startDate: new Date(pwo.recommendedOrderDate),
          endDate: new Date(pwo.requiredDeliveryDate),
          notes: `Auto-generated by Material Requirements Planning (MRP-II) engine.`
        });
        await wo.save();
        workOrdersCreated++;
      }
    }

    // 2. Generate Purchase Orders
    for (const ppo of mrp.plannedPurchaseOrders) {
      if (selections.purchaseOrderIds.includes(ppo.itemId)) {
        const count = await PurchaseOrder.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
        const po = new PurchaseOrder({
          orgId,
          companyId: orgId,
          purchaseOrderNumber: `PO-MRP-${String(count + 1).padStart(5, '0')}`,
          vendorId: ppo.preferredVendorId ? new mongoose.Types.ObjectId(ppo.preferredVendorId) : new mongoose.Types.ObjectId(),
          orderDate: new Date(ppo.recommendedOrderDate),
          expectedDeliveryDate: new Date(ppo.requiredDeliveryDate),
          items: [
            {
              itemId: new mongoose.Types.ObjectId(ppo.itemId),
              quantity: ppo.netRequirement,
              rate: Math.round(ppo.estimatedCost / ppo.netRequirement),
              amount: ppo.estimatedCost
            }
          ],
          totalAmount: ppo.estimatedCost,
          status: 'Issued',
          notes: `Auto-generated by MRP procurement schedule.`
        });
        await po.save();
        purchaseOrdersCreated++;
      }
    }

    return {
      success: true,
      message: `MRP order execution completed. Created ${workOrdersCreated} Work Orders and ${purchaseOrdersCreated} Purchase Orders.`,
      workOrdersCreated,
      purchaseOrdersCreated
    };
  }
}
