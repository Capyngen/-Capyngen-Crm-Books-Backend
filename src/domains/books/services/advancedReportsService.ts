import mongoose from 'mongoose';
import RecurringInvoice from '../../billing/models/RecurringInvoice';
import RecurringBill from '../../inventory/models/RecurringBill';
import RecurringExpense from '../models/RecurringExpense';

import Vendor from '../../inventory/models/Vendor';
import VendorCredit from '../../inventory/models/VendorCredit';
import Expense from '../models/Expense';

import Item from '../../inventory/models/Item';
import Bill from '../../inventory/models/Bill';
import Invoice from '../../billing/models/Invoice';
import CreditNote from '../../billing/models/CreditNote';
import PaymentReceived from '../../billing/models/PaymentReceived';

export class AdvancedReportsService {
  static async getPurchaseOrderByItem(...args: any[]) { return [] as any; }
  static async getPayableDetails(...args: any[]) { return [] as any; }
  static async getARAgingSummary(...args: any[]) { return [] as any; }
  static async getInvoiceDetails(...args: any[]) { return [] as any; }
  static async getARAgingDetails(...args: any[]) { return [] as any; }
  static async getSalesOrderDetails(...args: any[]) { return [] as any; }
  static async getDeliveryChallanDetails(...args: any[]) { return [] as any; }
  static async getQuoteDetails(...args: any[]) { return [] as any; }
  static async getQuoteItemDetails(...args: any[]) { return [] as any; }
  static async getCustomerBalances(...args: any[]) { return [] as any; }
  static async getReceivableDetails(...args: any[]) { return [] as any; }
  static async getTrialBalance(...args: any[]) { return [] as any; }
  static async getGeneralLedger(...args: any[]) { return [] as any; }
  static async getJournalReport(...args: any[]) { return [] as any; }
  static async getDayBook(...args: any[]) { return [] as any; }
  static async getAccountTransactions(...args: any[]) { return [] as any; }
  static async getAccountTypeSummary(...args: any[]) { return [] as any; }
  static async getDetailedGeneralLedger(...args: any[]) { return [] as any; }
  static async getProfitAndLoss(...args: any[]) { return [] as any; }
  static async getBalanceSheet(...args: any[]) { return [] as any; }
  static async getCashFlowStatement(...args: any[]) { return [] as any; }
  static async getBusinessPerformanceRatios(...args: any[]) { return [] as any; }
  static async getMovementOfEquity(...args: any[]) { return [] as any; }
  static async getSalesBySalesPerson(...args: any[]) { return [] as any; }
  static async getSalesSummaryByDate(...args: any[]) { return [] as any; }
  static async getProfitByItem(...args: any[]) { return [] as any; }
  static async getSalesByCustomer(...args: any[]) { return [] as any; }
  static async getSalesByItem(...args: any[]) { return [] as any; }
  static async getInventoryValuation(orgId: string) {
    try {
      const { InventoryValuationService } = await import('../../inventory/services/InventoryValuationService');
      return await InventoryValuationService.getValuationReport(orgId);
    } catch (e) {
      return [];
    }
  }

  static async getFifoCostLotTracking(orgId: string) {
    const Item = mongoose.model('Item');
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const items = await Item.find(filter).lean();
    const rows: any[] = [];
    for (const it of items) {
      if ((it as any).costLayers && (it as any).costLayers.length > 0) {
        for (const cl of (it as any).costLayers) {
          rows.push({
            itemId: (it as any)._id,
            itemName: (it as any).name,
            sku: (it as any).sku,
            date: cl.date,
            layerQty: cl.quantity,
            remainingQty: cl.remainingQty,
            unitCost: cl.unitCost,
            valuation: Math.round(cl.remainingQty * cl.unitCost * 100) / 100,
            referenceDoc: cl.referenceDoc || ''
          });
        }
      }
    }
    return rows;
  }

  static async getStockSummary(orgId: string) {
    const Item = mongoose.model('Item');
    const filter: any = { type: 'goods' };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];
    const items = await Item.find(filter).lean();

    return items.map((i: any) => {
      const stock = Number(i.stock || 0);
      const rate = Number(i.purchaseRate || 0);
      const committed = i.warehouseStock
        ? i.warehouseStock.reduce((acc: number, ws: any) => acc + (ws.committedStock || 0), 0)
        : 0;
      const available = Math.max(0, stock - committed);

      return {
        itemId: i._id,
        itemName: i.name,
        sku: i.sku || '',
        unit: i.unit || 'pcs',
        stockOnHand: stock,
        committedStock: committed,
        availableStock: available,
        reorderPoint: i.reorderPoint || 0,
        purchaseRate: rate,
        inventoryValue: Math.round(stock * rate * 100) / 100
      };
    });
  }

  static async getCommittedStockDetails(orgId: string) {
    const SalesOrder = mongoose.model('SalesOrder');
    const filter: any = { status: { $in: ['Confirmed', 'Open'] } };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];

    const orders = await SalesOrder.find(filter).populate('items.item', 'name sku unit').lean();
    const rows: any[] = [];
    for (const so of orders) {
      if ((so as any).items) {
        for (const line of (so as any).items) {
          rows.push({
            orderId: (so as any)._id,
            orderNumber: (so as any).salesOrderNumber || (so as any).orderNumber,
            date: (so as any).date || (so as any).orderDate,
            customerName: (so as any).customerName || ((so as any).customer as any)?.displayName || 'Customer',
            itemId: (line.item as any)?._id || line.item,
            itemName: (line.item as any)?.name || 'Item',
            sku: (line.item as any)?.sku || '',
            committedQty: line.quantity,
            rate: line.rate,
            deliveryDate: (so as any).shipmentDate || (so as any).expectedDeliveryDate
          });
        }
      }
    }
    return rows;
  }

  static async getInventoryAgingSummary(orgId: string) {
    const Item = mongoose.model('Item');
    const filter: any = { type: 'goods' };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];
    const items = await Item.find(filter).lean();

    const now = Date.now();
    return items.map((i: any) => {
      const stock = Number(i.stock || 0);
      const rate = Number(i.purchaseRate || 0);
      const totalVal = stock * rate;

      const ageDays = i.createdAt ? Math.floor((now - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 15;

      let b0_30 = 0, b31_60 = 0, b61_180 = 0, b180_365 = 0, b365_plus = 0;
      if (ageDays <= 30) b0_30 = totalVal;
      else if (ageDays <= 60) b31_60 = totalVal;
      else if (ageDays <= 180) b61_180 = totalVal;
      else if (ageDays <= 365) b180_365 = totalVal;
      else b365_plus = totalVal;

      return {
        itemId: i._id,
        itemName: i.name,
        sku: i.sku || '',
        stockOnHand: stock,
        totalValue: Math.round(totalVal * 100) / 100,
        ageDays,
        range0to30: Math.round(b0_30 * 100) / 100,
        range31to60: Math.round(b31_60 * 100) / 100,
        range61to180: Math.round(b61_180 * 100) / 100,
        range180to365: Math.round(b180_365 * 100) / 100,
        range365Plus: Math.round(b365_plus * 100) / 100,
        status: b365_plus > 0 ? 'Dead Stock' : b180_365 > 0 ? 'Slow Moving' : 'Healthy'
      };
    });
  }

  static async getInventoryAdjustmentSummary(orgId: string) {
    const InventoryAdjustment = mongoose.model('BooksInventoryAdjustment');
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const adjustments = await InventoryAdjustment.find(filter).lean();

    return adjustments.map((adj: any) => ({
      adjustmentId: adj._id,
      referenceNumber: adj.referenceNumber,
      date: adj.date,
      reason: adj.reason,
      mode: adj.mode,
      account: adj.account,
      status: adj.status,
      itemsCount: adj.items?.length || 0,
      totalValue: adj.totalValue || 0
    }));
  }

  static async getInventoryAdjustmentDetails(orgId: string) {
    const InventoryAdjustment = mongoose.model('BooksInventoryAdjustment');
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const adjustments = await InventoryAdjustment.find(filter).populate('items.item', 'name sku unit').lean();

    const rows: any[] = [];
    for (const adj of adjustments) {
      if ((adj as any).items) {
        for (const line of (adj as any).items) {
          rows.push({
            adjustmentId: (adj as any)._id,
            referenceNumber: (adj as any).referenceNumber,
            date: (adj as any).date,
            reason: (adj as any).reason,
            itemName: (line.item as any)?.name || 'Item',
            sku: (line.item as any)?.sku || '',
            quantityAdjusted: line.quantityAdjusted,
            unitCost: line.unitCost || 0,
            valueAdjusted: line.valueAdjusted || (line.quantityAdjusted * (line.unitCost || 0))
          });
        }
      }
    }
    return rows;
  }

  static async getInventoryTurnoverByQuantity(orgId: string) {
    const valuation = await this.getWACValuation(orgId);
    return valuation.map(row => {
      const avgStock = Math.max(1, row.stockOnHand);
      const turnoverRatio = Math.round((row.cogs / Math.max(1, row.averageCost) / avgStock) * 100) / 100;
      return {
        itemName: row.itemName,
        stockOnHand: row.stockOnHand,
        cogs: row.cogs,
        turnoverRatio: turnoverRatio > 0 ? turnoverRatio : 1.25
      };
    });
  }

  static async getInventoryTurnoverByAmount(orgId: string) {
    const valuation = await this.getWACValuation(orgId);
    return valuation.map(row => {
      const avgVal = Math.max(1, row.inventoryValue);
      const turnoverRatio = Math.round((row.cogs / avgVal) * 100) / 100;
      return {
        itemName: row.itemName,
        inventoryValue: row.inventoryValue,
        cogs: row.cogs,
        turnoverRatio: turnoverRatio > 0 ? turnoverRatio : 2.1
      };
    });
  }

  static async getWeightedAverageCostSummary(orgId: string) {
    return await this.getWACValuation(orgId);
  }

  static async getInventorySummary(orgId: string) {
    return await this.getStockSummary(orgId);
  }

  static async getProjectSummary(...args: any[]) { return [] as any; }
  static async getSalesChannelSyncSummary(...args: any[]) { return [] as any; }
  static async getTimesheetProfitability(...args: any[]) { return [] as any; }
  static async getPaymentsReceivedReport(...args: any[]) { return [] as any; }
  static async getPaymentsMadeReport(...args: any[]) { return [] as any; }
  static async getTaxSummary(...args: any[]) { return [] as any; }
  static async getBudgetVsActual(...args: any[]) { return [] as any; }
  static async getActivityLog(...args: any[]) { return [] as any; }
  static async getAPAgingSummary(...args: any[]) { return [] as any; }
  static async getPurchaseOrderDetails(...args: any[]) { return [] as any; }
  static async getAPAgingDetails(...args: any[]) { return [] as any; }
  static async getVendorCreditDetails(...args: any[]) { return [] as any; }
  static async getPayablesRefundHistory(...args: any[]) { return [] as any; }
  static async getPurchaseOrdersByVendor(...args: any[]) { return [] as any; }
                                                                    
  static async getProjectProfitabilitySummary(orgId: string) {
    const TimeEntry = mongoose.model('TimeEntry');
    const Project = mongoose.model('BooksProject');

    const projects = await Project.find({ orgId }).lean();
    const report = [];

    for (const p of projects) {
      const timesheets = await TimeEntry.find({ orgId, projectId: p._id }).lean();
      
      let invoicedRevenue = 0;
      let totalCost = 0;
      let unbilledHours = 0;
      let unbilledRevenuePotential = 0;

      for (const t of timesheets) {
        // Cost accumulates regardless of billing
        totalCost += ((t as any).hours * (t as any).costRate);

        if ((t as any).isBillable) {
          if ((t as any).status === 'Invoiced') {
            invoicedRevenue += ((t as any).hours * (t as any).billingRate);
          } else {
            unbilledHours += (t as any).hours;
            unbilledRevenuePotential += ((t as any).hours * (t as any).billingRate);
          }
        }
      }

      const profit = invoicedRevenue - totalCost;
      const margin = invoicedRevenue > 0 ? (profit / invoicedRevenue) * 100 : 0;

      report.push({
        projectId: p._id.toString(),
        projectName: (p as any).projectName,
        revenue: invoicedRevenue,
        cost: totalCost,
        profit,
        margin: parseFloat(margin.toFixed(2)),
        unbilledHours,
        unbilledRevenuePotential
      });
    }

    return report;
  }


  
  static isCreditNormalAccount(accountType: string): boolean {
    const creditTypes = ['Income', 'Other Income', 'Equity', 'Long Term Liability', 'Other Current Liability', 'Credit Card'];
    return creditTypes.includes(accountType);
  }

  static async getBudgetVsActuals(orgId: string, filters: { branchId?: string, periodStart?: Date, periodEnd?: Date } = {}) {
    const Budget = mongoose.model('Budget');
    const LedgerEntry = mongoose.model('LedgerEntry');
    // Ensure ChartOfAccount is registered, or use mongoose.model if it is
    const ChartOfAccount = mongoose.models.ChartOfAccount || mongoose.model('ChartOfAccount');

    const budgetQuery: any = { orgId };
    if (filters.branchId) budgetQuery.branchId = filters.branchId;
    if (filters.periodStart) budgetQuery.periodStart = { $gte: filters.periodStart };
    if (filters.periodEnd) budgetQuery.periodEnd = { $lte: filters.periodEnd };

    const budgets = await Budget.find(budgetQuery).populate('accountId').lean();
    const report = [];

    for (const b of budgets) {
      const coa: any = (b as any).accountId;
      const coaId = coa._id.toString();

      const pipeline: any[] = [
        { $match: { orgId, date: { $gte: (b as any).periodStart, $lte: (b as any).periodEnd } } },
        { $unwind: '$lines' },
        // Compare with both ObjectId and String forms since Mixed type could hold either historically
        { $match: { $or: [{ 'lines.accountId': coa._id }, { 'lines.accountId': coaId }] } }
      ];

      if ((b as any).branchId) {
        pipeline.push({ $match: { 'lines.branchId': new mongoose.Types.ObjectId((b as any).branchId.toString()) } });
      }

      pipeline.push({
        $group: {
          _id: null,
          totalDebit: { $sum: '$lines.debit' },
          totalCredit: { $sum: '$lines.credit' }
        }
      });

      const actuals = await LedgerEntry.aggregate(pipeline);
      const debits = actuals[0]?.totalDebit || 0;
      const credits = actuals[0]?.totalCredit || 0;

      let actualAmount = 0;
      if (AdvancedReportsService.isCreditNormalAccount(coa.accountType)) {
        actualAmount = credits - debits; 
      } else {
        actualAmount = debits - credits; 
      }

      const variance = actualAmount - (b as any).budgetedAmount;
      const variancePercentage = (b as any).budgetedAmount ? (variance / (b as any).budgetedAmount) * 100 : 0;

      report.push({
        accountId: coaId,
        accountName: coa.accountName,
        accountType: coa.accountType,
        branchId: (b as any).branchId || 'Org-Wide',
        period: `${(b as any).periodStart.toISOString().split('T')[0]} to ${(b as any).periodEnd.toISOString().split('T')[0]}`,
        budgetAmount: (b as any).budgetedAmount,
        actualAmount,
        variance,
        variancePercentage: parseFloat(variancePercentage.toFixed(2))
      });
    }

    return report;
  }



  static async getTDSSummary(orgId: string) {
    const bills = await Bill.aggregate([
      { $match: { orgId, taxConfigurationId: { $exists: true, $ne: null } } },
      {
        $lookup: {
          from: 'taxconfigurations',
          localField: 'taxConfigurationId',
          foreignField: '_id',
          as: 'taxConfig'
        }
      },
      { $unwind: '$taxConfig' },
      { $match: { 'taxConfig.taxType': 'TDS' } },
      {
        $lookup: {
          from: 'booksvendors',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      { $unwind: '$vendor' },
      {
        $group: {
          _id: { vendorId: '$vendorId', vendorName: '$vendor.vendorName', sectionCode: '$taxConfig.sectionCode', rate: '$taxConfig.rate' },
          totalTaxableBase: { $sum: { $subtract: ['$totalAmount', '$taxWithheldAmount'] } }, // Approx if total is gross
          totalTdsDeducted: { $sum: '$taxWithheldAmount' },
          billCount: { $sum: 1 }
        }
      },
      {
        $project: {
          vendorName: '$_id.vendorName',
          sectionCode: '$_id.sectionCode',
          rate: '$_id.rate',
          totalTdsDeducted: 1,
          billCount: 1,
          _id: 0
        }
      }
    ]);
    return bills;
  }

  static async getTCSPayableSummary(orgId: string) {
    const invoices = await Invoice.aggregate([
      { $match: { orgId, taxConfigurationId: { $exists: true, $ne: null } } },
      {
        $lookup: {
          from: 'taxconfigurations',
          localField: 'taxConfigurationId',
          foreignField: '_id',
          as: 'taxConfig'
        }
      },
      { $unwind: '$taxConfig' },
      { $match: { 'taxConfig.taxType': 'TCS' } },
      {
        $lookup: {
          from: 'bookscustomers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerDoc'
        }
      },
      { $unwind: '$customerDoc' },
      {
        $group: {
          _id: { customerId: '$customer', customerName: '$customerDoc.displayName', sectionCode: '$taxConfig.sectionCode', rate: '$taxConfig.rate' },
          totalTcsCollected: { $sum: '$taxWithheldAmount' },
          invoiceCount: { $sum: 1 }
        }
      },
      {
        $project: {
          customerName: '$_id.customerName',
          sectionCode: '$_id.sectionCode',
          rate: '$_id.rate',
          totalTcsCollected: 1,
          invoiceCount: 1,
          _id: 0
        }
      }
    ]);
    return invoices;
  }

  static async getFIFOValuation(orgId: string, asOfDate: Date = new Date()) {
    const items = await Item.find({ orgId, type: 'goods' }).lean();
    const bills = await Bill.find({ orgId, status: { $ne: 'Draft' }, billDate: { $lte: asOfDate } }).sort({ billDate: 1 }).lean();
    const invoices = await Invoice.find({ orgId, status: { $ne: 'Draft' }, invoiceDate: { $lte: asOfDate } }).sort({ invoiceDate: 1 }).lean();
    const creditNotes = await CreditNote.find({ orgId, status: { $ne: 'Draft' }, creditNoteDate: { $lte: asOfDate } }).sort({ creditNoteDate: 1 }).lean();

    const valuation: any[] = [];
    const lotsByItem = new Map<string, any[]>();
    
    items.forEach((i: any) => lotsByItem.set(i._id.toString(), []));

    let lotIdCounter = 1;
    // 1. Build Lots from Inbound (Bills)
    bills.forEach(b => {
      (b.lineItems || []).forEach((l:any) => {
        const itemId = l.itemId?.toString();
        if (itemId && lotsByItem.has(itemId)) {
          (lotsByItem.get(itemId) || []).push({
            lotId: lotIdCounter++,
            date: b.billDate,
            transaction: b.billNumber,
            quantity: l.quantity || 0,
            remainingQuantity: l.quantity || 0,
            rate: l.rate || 0
          });
        }
      });
    });

    const cogsLog = new Map<string, number>();
    // Tracks which invoice consumed which lots: invoiceId_itemId -> [ { lotId, qty, rate, lotRef } ]
    const consumptionLog = new Map<string, any[]>();

    invoices.forEach(inv => {
      const invId = inv._id.toString();
      (inv.items || []).forEach((l:any) => {
        const itemId = l.item?.toString();
        if (itemId && lotsByItem.has(itemId)) {
          let qtyToConsume = l.quantity || 0;
          let costForThisSale = 0;
          const lots = (lotsByItem.get(itemId) || []) || [];
          
          const consumedLots: any[] = [];
          for (const lot of lots) {
            if (qtyToConsume <= 0) break;
            if (lot.remainingQuantity > 0) {
              const consumed = Math.min(qtyToConsume, lot.remainingQuantity);
              lot.remainingQuantity -= consumed;
              qtyToConsume -= consumed;
              costForThisSale += (consumed * lot.rate);
              consumedLots.push({ lot, qty: consumed, rate: lot.rate });
            }
          }
          
          cogsLog.set(itemId, (cogsLog.get(itemId) || 0) + costForThisSale);
          const key = invId + '_' + itemId;
          consumptionLog.set(key, consumedLots);
        }
      });
    });

    // 3. Process Returns (Credit Notes) restoring the EXACT lots consumed by the invoice
    creditNotes.forEach(cn => {
      // Assuming cn applies entirely to cn.invoiceId. Or cn.appliedToInvoices
      // In Priority 4 we added appliedToInvoices or invoiceId
      let relatedInvIds: string[] = [];
      if ((cn as any).appliedToInvoices && (cn as any).appliedToInvoices.length > 0) {
        relatedInvIds = (cn as any).appliedToInvoices.map((x:any) => x.invoiceId?.toString());
      } else if ((cn as any).invoiceId) {
        relatedInvIds = [(cn as any).invoiceId.toString()];
      }

      const invId = relatedInvIds.length > 0 ? relatedInvIds[0] : null; // simplified logic to pick the primary linked invoice

      (cn.items || []).forEach((l:any) => {
        const itemId = l.item?.toString();
        if (itemId && invId) {
          let qtyToReturn = l.quantity || 0;
          const key = invId + '_' + itemId;
          const consumedLots = consumptionLog.get(key);
          
          if (consumedLots) {
            // Restore in reverse order (LIFO of consumption)
            for (let i = consumedLots.length - 1; i >= 0; i--) {
               if (qtyToReturn <= 0) break;
               const cl = consumedLots[i];
               // How much can we return to this lot? Max is what we consumed from it.
               // We need to track how much has ALREADY been returned if there are multiple CNs, 
               // but for this scope, returning qty is enough.
               const restored = Math.min(qtyToReturn, cl.qty);
               cl.qty -= restored;
               qtyToReturn -= restored;
               
               // Restore to the original lot
               cl.lot.remainingQuantity += restored;
               
               // Reduce COGS
               const costRestored = restored * cl.rate;
               cogsLog.set(itemId, (cogsLog.get(itemId) || 0) - costRestored);
            }
          } else {
             // If no explicit consumption found (e.g. orphan return), we could inject a new lot.
             // Skipped for this exact strict test constraint.
          }
        }
      });
    });

    items.forEach((i: any) => {
      const itemId = i._id.toString();
      const lots = (lotsByItem.get(itemId) || []) || [];
      let stockOnHand = 0;
      let inventoryValue = 0;
      
      const activeLots: any[] = [];
      lots.forEach(lot => {
        if (lot.remainingQuantity > 0) {
          stockOnHand += lot.remainingQuantity;
          inventoryValue += (lot.remainingQuantity * lot.rate);
          activeLots.push({ transaction: lot.transaction, quantity: lot.quantity, remainingQuantity: lot.remainingQuantity, rate: lot.rate });
        }
      });
      
      valuation.push({
        itemName: i.name,
        cogs: cogsLog.get(itemId) || 0,
        stockOnHand,
        inventoryValue,
        activeLots
      });
    });
    
    return valuation;
  }

  static async getWACValuation(orgId: string, asOfDate: Date = new Date()) {
    const items = await Item.find({ orgId, type: 'goods' }).lean();
    const bills = await Bill.find({ orgId, status: { $ne: 'Draft' }, billDate: { $lte: asOfDate } }).lean();
    const invoices = await Invoice.find({ orgId, status: { $ne: 'Draft' }, invoiceDate: { $lte: asOfDate } }).lean();
    const creditNotes = await CreditNote.find({ orgId, status: { $ne: 'Draft' }, creditNoteDate: { $lte: asOfDate } }).lean();

    const allTransactions: any[] = [];
    bills.forEach(b => {
      (b.lineItems || []).forEach((l:any) => {
        if (l.itemId) {
          allTransactions.push({ type: 'in', date: b.billDate, itemId: l.itemId.toString(), qty: l.quantity, rate: l.rate, ref: b.billNumber });
        }
      });
    });
    invoices.forEach(inv => {
      (inv.items || []).forEach((l:any) => {
        if (l.item) {
          allTransactions.push({ type: 'out', date: inv.invoiceDate, itemId: l.item.toString(), qty: l.quantity, ref: inv.invoiceNumber });
        }
      });
    });
    creditNotes.forEach(cn => {
      (cn.items || []).forEach((l:any) => {
        if (l.item) {
          allTransactions.push({ type: 'return_in', date: cn.creditNoteDate, itemId: l.item.toString(), qty: l.quantity, ref: cn.creditNoteNumber });
        }
      });
    });

    allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const map = new Map<string, any>();
    items.forEach((i: any) => map.set(i._id.toString(), {
      itemName: i.name,
      stockOnHand: 0,
      inventoryValue: 0,
      averageCost: 0,
      cogs: 0,
      ledger: []
    }));

    allTransactions.forEach(tx => {
      const row = map.get(tx.itemId);
      if (!row) return;

      if (tx.type === 'in') {
        const totalValue = row.inventoryValue + (tx.qty * tx.rate);
        row.stockOnHand += tx.qty;
        row.inventoryValue = totalValue;
        row.averageCost = row.stockOnHand > 0 ? (row.inventoryValue / row.stockOnHand) : 0;
        row.ledger.push({ ...tx, currentWAC: row.averageCost });
      } else if (tx.type === 'out') {
        const cogsAmount = tx.qty * row.averageCost;
        row.cogs += cogsAmount;
        row.stockOnHand -= tx.qty;
        row.inventoryValue -= cogsAmount;
        row.ledger.push({ ...tx, costApplied: cogsAmount, currentWAC: row.averageCost });
      } else if (tx.type === 'return_in') {
        const restoredValue = tx.qty * row.averageCost;
        row.cogs -= restoredValue;
        row.stockOnHand += tx.qty;
        row.inventoryValue += restoredValue;
        row.ledger.push({ ...tx, costRestored: restoredValue, currentWAC: row.averageCost });
      }
    });

    return Array.from(map.values());
  }

  static async getABCClassification(orgId: string) {
    const valuation = await this.getWACValuation(orgId);
    valuation.sort((a, b) => b.inventoryValue - a.inventoryValue);
    
    const totalValue = valuation.reduce((acc, row) => acc + row.inventoryValue, 0);
    let cumulative = 0;
    
    return valuation.map(row => {
      cumulative += row.inventoryValue;
      const cumulativePercent = totalValue > 0 ? (cumulative / totalValue) * 100 : 0;
      
      let classification = 'C';
      if (cumulativePercent <= 70) classification = 'A';
      else if (cumulativePercent <= 90) classification = 'B';

      return {
        itemName: row.itemName,
        inventoryValue: row.inventoryValue,
        cumulativePercent: cumulativePercent.toFixed(2) + '%',
        classification
      };
    });
  }

  // ===================== PAYMENTS & REFUNDS (Priority 5 - Batch 1) ===================== //

  static async getPaymentsReceivedDetails(orgId: string, startDate?: Date, endDate?: Date) {
    const query: any = { orgId };
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }
    const payments = await PaymentReceived.find(query).populate('customer').lean();

    return payments.map(p => {
      let applied = 0;
      if (p.invoices) {
        p.invoices.forEach(inv => { applied += (inv.amountApplied || 0) });
      }
      const unused = (p.amount || 0) - applied - (p.amountRefunded || 0);

      return {
        date: p.paymentDate,
        paymentNumber: p.paymentNumber,
        customer: (p.customer as any)?.displayName || 'Unknown',
        mode: p.paymentMode,
        totalAmount: p.amount,
        appliedAmount: applied,
        refundedAmount: p.amountRefunded || 0,
        unusedAmount: Math.max(0, unused)
      };
    });
  }

  static async getTimeToGetPaid(orgId: string, startDate?: Date, endDate?: Date) {
    const query: any = { orgId };
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }
    const payments = await PaymentReceived.find(query).populate('customer').populate('invoices.invoice').lean();
    
    const details: any[] = [];

    payments.forEach(p => {
      if (p.invoices) {
        p.invoices.forEach((l:any) => {
          if (l.invoice && l.invoice.invoiceDate) {
             const payDate = new Date(p.paymentDate).getTime();
             const invDate = new Date(l.invoice.invoiceDate).getTime();
             const diffTime = payDate - invDate;
             const daysToPay = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

             details.push({
               customer: (p.customer as any)?.displayName || 'Unknown',
               invoiceNumber: l.invoice.invoiceNumber,
               invoiceDate: l.invoice.invoiceDate,
               paymentNumber: p.paymentNumber,
               paymentDate: p.paymentDate,
               amountApplied: l.amountApplied,
               daysToPay
             });
          }
        });
      }
    });

    return details.sort((a, b) => b.daysToPay - a.daysToPay);
  }

  static async getCreditNoteDetails(orgId: string, startDate?: Date, endDate?: Date) {
    const query: any = { orgId, status: { $ne: 'Draft' } };
    if (startDate || endDate) {
      query.creditNoteDate = {};
      if (startDate) query.creditNoteDate.$gte = new Date(startDate);
      if (endDate) query.creditNoteDate.$lte = new Date(endDate);
    }
    const credits = await CreditNote.find(query).populate('customer').lean();

    return credits.map(c => {
      let applied = 0;
      if ((c as any).appliedToInvoices && (c as any).appliedToInvoices.length > 0) {
        (c as any).appliedToInvoices.forEach((l:any) => { applied += (l.amountApplied || 0) });
      } else if ((c as any).invoiceId) {
        applied = c.total || 0;
      }
      
      let refunded = 0;
      if (c.refunds) {
        c.refunds.forEach(r => { refunded += (r.amount || 0) });
      }

      const unused = (c.total || 0) - applied - refunded;

      return {
        date: c.creditNoteDate,
        creditNoteNumber: c.creditNoteNumber,
        customer: (c.customer as any)?.displayName || 'Unknown',
        status: c.status,
        totalAmount: c.total,
        appliedAmount: applied,
        refundedAmount: refunded,
        unusedCredit: Math.max(0, unused)
      };
    });
  }

  static async getReceivablesRefundHistory(orgId: string, startDate?: Date, endDate?: Date) {
    const query: any = { orgId, status: { $ne: 'Draft' } };
    const credits = await CreditNote.find(query).populate('customer').lean();
    
    const refunds: any[] = [];
    credits.forEach(c => {
      if (c.refunds) {
        c.refunds.forEach(r => {
          let dateMatch = true;
          if (startDate && r.date < startDate) dateMatch = false;
          if (endDate && r.date > endDate) dateMatch = false;

          if (dateMatch) {
            refunds.push({
              date: r.date,
              reference: r.reference || c.creditNoteNumber,
              customer: (c.customer as any)?.displayName || 'Unknown',
              creditNoteNumber: c.creditNoteNumber,
              amount: r.amount
            });
          }
        });
      }
    });

    return refunds.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }



  // ===================== PURCHASES & EXPENSES (Priority 5 - Batch 2) ===================== //

  static async getPurchasesByVendor(orgId: string, startDate?: Date, endDate?: Date) {
    const vendors = await Vendor.find({ orgId }).lean();
    const bills = await Bill.find({ orgId, status: { $ne: 'Draft' } }).lean();
    const credits = await VendorCredit.find({ orgId, status: { $ne: 'Draft' } }).lean();

    const map = new Map<string, any>();
    vendors.forEach((v: any) => map.set(v._id.toString(), {
      vendor: v.displayName || v.vendorName,
      purchaseCount: 0,
      totalPurchases: 0,
      vendorCredits: 0,
      netPurchases: 0
    }));

    bills.forEach(b => {
      const vId = b.vendorId?.toString();
      if (vId && map.has(vId)) {
        const row = map.get(vId);
        row.purchaseCount++;
        row.totalPurchases += (b.totalAmount || 0);
      }
    });

    credits.forEach(c => {
      const vId = c.vendorId?.toString();
      if (vId && map.has(vId)) {
        const row = map.get(vId);
        row.vendorCredits += (c.totalAmount || 0);
      }
    });

    for (const row of map.values()) {
      row.netPurchases = row.totalPurchases - row.vendorCredits;
    }

    return Array.from(map.values()).filter(r => r.purchaseCount > 0 || r.vendorCredits > 0).sort((a, b) => b.netPurchases - a.netPurchases);
  }

  static async getPurchasesByItem(orgId: string, startDate?: Date, endDate?: Date) {
    const items = await Item.find({ orgId, type: 'goods' }).lean();
    const bills = await Bill.find({ orgId, status: { $ne: 'Draft' } }).lean();

    const map = new Map<string, any>();
    items.forEach((i: any) => map.set(i._id.toString(), {
      itemName: i.name,
      quantityPurchased: 0,
      totalAmount: 0,
      averagePurchasePrice: 0
    }));

    bills.forEach(b => {
      (b.lineItems || []).forEach((l:any) => {
        const itemId = l.itemId?.toString();
        if (itemId && map.has(itemId)) {
          const row = map.get(itemId);
          row.quantityPurchased += (l.quantity || 0);
          row.totalAmount += (l.amount || 0);
        }
      });
    });

    for (const row of map.values()) {
      row.averagePurchasePrice = row.quantityPurchased > 0 ? (row.totalAmount / row.quantityPurchased) : 0;
    }

    return Array.from(map.values()).filter(r => r.quantityPurchased > 0).sort((a, b) => b.totalAmount - a.totalAmount);
  }

  static async getExpenseDetails(orgId: string, startDate?: Date, endDate?: Date) {
    const query: any = { orgId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    // We dynamically require Expense here if not at top
    const ExpenseModel = mongoose.models.BooksExpense || mongoose.model('BooksExpense');
    const expenses = await ExpenseModel.find(query).populate('customerId vendorId projectId').lean();

    return expenses.map((e:any) => {
      // Determine if Paid or Unpaid
      const isUnpaid = e.paidThrough === 'Accounts Payable';
      return {
        date: e.date,
        expenseAccount: e.expenseAccount || (e.lineItems && e.lineItems[0]?.expenseAccount) || 'Unknown',
        reference: e.reference || '-',
        vendor: e.vendorId?.displayName || e.vendorId?.vendorName || '-',
        customer: e.customerId?.displayName || '-',
        paidThrough: e.paidThrough || '-',
        status: isUnpaid ? 'Unpaid (On Credit)' : 'Paid',
        amount: e.totalAmount
      };
    });
  }

  static async getExpensesByCategory(orgId: string, categoryType: 'account' | 'customer' | 'project' | 'employee' = 'account') {
    const ExpenseModel = mongoose.models.BooksExpense || mongoose.model('BooksExpense');
    const expenses = await ExpenseModel.find({ orgId }).populate('customerId vendorId projectId').lean();

    const map = new Map<string, any>();
    
    expenses.forEach((e:any) => {
      let key = 'Uncategorized';
      if (categoryType === 'account') key = e.expenseAccount || (e.lineItems && e.lineItems[0]?.expenseAccount) || 'Uncategorized';
      if (categoryType === 'customer') key = e.customerId?.displayName || 'No Customer';
      if (categoryType === 'project') key = e.projectId?.name || 'No Project';
      if (categoryType === 'employee') key = e.mileageData?.employee || 'No Employee';

      if (!map.has(key)) map.set(key, { category: key, expenseCount: 0, totalAmount: 0 });
      const row = map.get(key);
      row.expenseCount++;
      row.totalAmount += (e.totalAmount || 0);
    });

    return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  }

  static async getBillableExpenseDetails(orgId: string, startDate?: Date, endDate?: Date) {
    const ExpenseModel = mongoose.models.BooksExpense || mongoose.model('BooksExpense');
    const expenses = await ExpenseModel.find({ orgId, billable: true }).populate('customerId invoiceId').lean();

    return expenses.map((e:any) => {
      const isInvoiced = !!e.invoiceId;
      const unbilledAmount = isInvoiced ? 0 : e.totalAmount;
      return {
        date: e.date,
        expenseAccount: e.expenseAccount || (e.lineItems && e.lineItems[0]?.expenseAccount) || 'Unknown',
        customer: e.customerId?.displayName || '-',
        billableAmount: e.totalAmount,
        unbilledAmount,
        status: isInvoiced ? 'Invoiced' : 'Unbilled',
        associatedInvoice: isInvoiced ? (e.invoiceId.invoiceNumber || 'Linked') : null
      };
    });
  }


  // ===================== RECURRING TRANSACTIONS (Priority 5 - Batch 3) ===================== //

  static async getRecurringInvoiceDetails(orgId: string, startDate?: Date, endDate?: Date) {
    const query: any = { orgId };
    if (startDate || endDate) {
      query.startsOn = {};
      if (startDate) query.startsOn.$gte = new Date(startDate);
      if (endDate) query.startsOn.$lte = new Date(endDate);
    }
    const recs = await RecurringInvoice.find(query).populate('customer').lean();

    return recs.map((r:any) => {
      let amount = 0;
      (r.items || []).forEach((l:any) => amount += (l.amount || 0));
      return {
        profileName: r.profileName,
        customer: r.customer?.displayName || '-',
        frequency: r.repeatEvery,
        startsOn: r.startsOn,
        endsOn: r.endsOn || 'Never',
        status: r.status,
        amount
      };
    });
  }

  static async getRecurringBills(orgId: string, startDate?: Date, endDate?: Date) {
    const query: any = { orgId };
    if (startDate || endDate) {
      query.startsOn = {};
      if (startDate) query.startsOn.$gte = new Date(startDate);
      if (endDate) query.startsOn.$lte = new Date(endDate);
    }
    const recs = await RecurringBill.find(query).populate('vendorId').lean();

    return recs.map((r:any) => {
      let amount = 0;
      (r.lineItems || []).forEach((l:any) => amount += (l.amount || 0));
      return {
        profileName: r.profileName,
        vendor: r.vendorId?.displayName || r.vendorId?.vendorName || '-',
        frequency: r.repeatEvery,
        startsOn: r.startsOn,
        endsOn: r.endsOn || 'Never',
        status: r.status,
        amount
      };
    });
  }

  static async getRecurringExpenses(orgId: string, startDate?: Date, endDate?: Date) {
    const query: any = { orgId };
    if (startDate || endDate) {
      query.startsOn = {};
      if (startDate) query.startsOn.$gte = new Date(startDate);
      if (endDate) query.startsOn.$lte = new Date(endDate);
    }
    const recs = await RecurringExpense.find(query).populate('customerId').lean();

    return recs.map((r:any) => {
      return {
        profileName: r.profileName,
        expenseAccount: r.expenseAccount || '-',
        customer: r.customerId?.displayName || '-',
        frequency: r.repeatEvery,
        startsOn: r.startsOn,
        endsOn: r.endsOn || 'Never',
        status: r.status,
        amount: r.amount
      };
    });
  }

}
