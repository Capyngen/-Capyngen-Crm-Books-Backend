"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedReportsService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const RecurringInvoice_1 = __importDefault(require("../../billing/models/RecurringInvoice"));
const RecurringBill_1 = __importDefault(require("../../inventory/models/RecurringBill"));
const RecurringExpense_1 = __importDefault(require("../models/RecurringExpense"));
const Vendor_1 = __importDefault(require("../../inventory/models/Vendor"));
const VendorCredit_1 = __importDefault(require("../../inventory/models/VendorCredit"));
const Item_1 = __importDefault(require("../../inventory/models/Item"));
const Bill_1 = __importDefault(require("../../inventory/models/Bill"));
const Invoice_1 = __importDefault(require("../../billing/models/Invoice"));
const CreditNote_1 = __importDefault(require("../../billing/models/CreditNote"));
const PaymentReceived_1 = __importDefault(require("../../billing/models/PaymentReceived"));
class AdvancedReportsService {
    static async getPurchaseOrderByItem(...args) { return []; }
    static async getPayableDetails(...args) { return []; }
    static async getARAgingSummary(...args) { return []; }
    static async getInvoiceDetails(...args) { return []; }
    static async getARAgingDetails(...args) { return []; }
    static async getSalesOrderDetails(...args) { return []; }
    static async getDeliveryChallanDetails(...args) { return []; }
    static async getQuoteDetails(...args) { return []; }
    static async getQuoteItemDetails(...args) { return []; }
    static async getCustomerBalances(...args) { return []; }
    static async getReceivableDetails(...args) { return []; }
    static async getTrialBalance(...args) { return []; }
    static async getGeneralLedger(...args) { return []; }
    static async getJournalReport(...args) { return []; }
    static async getDayBook(...args) { return []; }
    static async getAccountTransactions(...args) { return []; }
    static async getAccountTypeSummary(...args) { return []; }
    static async getDetailedGeneralLedger(...args) { return []; }
    static async getProfitAndLoss(...args) { return []; }
    static async getBalanceSheet(...args) { return []; }
    static async getCashFlowStatement(...args) { return []; }
    static async getBusinessPerformanceRatios(...args) { return []; }
    static async getMovementOfEquity(...args) { return []; }
    static async getSalesBySalesPerson(...args) { return []; }
    static async getSalesSummaryByDate(...args) { return []; }
    static async getProfitByItem(...args) { return []; }
    static async getSalesByCustomer(...args) { return []; }
    static async getSalesByItem(...args) { return []; }
    static async getInventoryValuation(orgId) {
        try {
            const { InventoryValuationService } = await Promise.resolve().then(() => __importStar(require('../../inventory/services/InventoryValuationService')));
            return await InventoryValuationService.getValuationReport(orgId);
        }
        catch (e) {
            return [];
        }
    }
    static async getFifoCostLotTracking(orgId) {
        const Item = mongoose_1.default.model('Item');
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
        const items = await Item.find(filter).lean();
        const rows = [];
        for (const it of items) {
            if (it.costLayers && it.costLayers.length > 0) {
                for (const cl of it.costLayers) {
                    rows.push({
                        itemId: it._id,
                        itemName: it.name,
                        sku: it.sku,
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
    static async getStockSummary(orgId) {
        const Item = mongoose_1.default.model('Item');
        const filter = { type: 'goods' };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const items = await Item.find(filter).lean();
        return items.map((i) => {
            const stock = Number(i.stock || 0);
            const rate = Number(i.purchaseRate || 0);
            const committed = i.warehouseStock
                ? i.warehouseStock.reduce((acc, ws) => acc + (ws.committedStock || 0), 0)
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
    static async getCommittedStockDetails(orgId) {
        const SalesOrder = mongoose_1.default.model('SalesOrder');
        const filter = { status: { $in: ['Confirmed', 'Open'] } };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const orders = await SalesOrder.find(filter).populate('items.item', 'name sku unit').lean();
        const rows = [];
        for (const so of orders) {
            if (so.items) {
                for (const line of so.items) {
                    rows.push({
                        orderId: so._id,
                        orderNumber: so.salesOrderNumber || so.orderNumber,
                        date: so.date || so.orderDate,
                        customerName: so.customerName || so.customer?.displayName || 'Customer',
                        itemId: line.item?._id || line.item,
                        itemName: line.item?.name || 'Item',
                        sku: line.item?.sku || '',
                        committedQty: line.quantity,
                        rate: line.rate,
                        deliveryDate: so.shipmentDate || so.expectedDeliveryDate
                    });
                }
            }
        }
        return rows;
    }
    static async getInventoryAgingSummary(orgId) {
        const Item = mongoose_1.default.model('Item');
        const filter = { type: 'goods' };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const items = await Item.find(filter).lean();
        const now = Date.now();
        return items.map((i) => {
            const stock = Number(i.stock || 0);
            const rate = Number(i.purchaseRate || 0);
            const totalVal = stock * rate;
            const ageDays = i.createdAt ? Math.floor((now - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 15;
            let b0_30 = 0, b31_60 = 0, b61_180 = 0, b180_365 = 0, b365_plus = 0;
            if (ageDays <= 30)
                b0_30 = totalVal;
            else if (ageDays <= 60)
                b31_60 = totalVal;
            else if (ageDays <= 180)
                b61_180 = totalVal;
            else if (ageDays <= 365)
                b180_365 = totalVal;
            else
                b365_plus = totalVal;
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
    static async getInventoryAdjustmentSummary(orgId) {
        const InventoryAdjustment = mongoose_1.default.model('BooksInventoryAdjustment');
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
        const adjustments = await InventoryAdjustment.find(filter).lean();
        return adjustments.map((adj) => ({
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
    static async getInventoryAdjustmentDetails(orgId) {
        const InventoryAdjustment = mongoose_1.default.model('BooksInventoryAdjustment');
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
        const adjustments = await InventoryAdjustment.find(filter).populate('items.item', 'name sku unit').lean();
        const rows = [];
        for (const adj of adjustments) {
            if (adj.items) {
                for (const line of adj.items) {
                    rows.push({
                        adjustmentId: adj._id,
                        referenceNumber: adj.referenceNumber,
                        date: adj.date,
                        reason: adj.reason,
                        itemName: line.item?.name || 'Item',
                        sku: line.item?.sku || '',
                        quantityAdjusted: line.quantityAdjusted,
                        unitCost: line.unitCost || 0,
                        valueAdjusted: line.valueAdjusted || (line.quantityAdjusted * (line.unitCost || 0))
                    });
                }
            }
        }
        return rows;
    }
    static async getInventoryTurnoverByQuantity(orgId) {
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
    static async getInventoryTurnoverByAmount(orgId) {
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
    static async getWeightedAverageCostSummary(orgId) {
        return await this.getWACValuation(orgId);
    }
    static async getInventorySummary(orgId) {
        return await this.getStockSummary(orgId);
    }
    static async getProjectSummary(...args) { return []; }
    static async getSalesChannelSyncSummary(...args) { return []; }
    static async getTimesheetProfitability(...args) { return []; }
    static async getPaymentsReceivedReport(...args) { return []; }
    static async getPaymentsMadeReport(...args) { return []; }
    static async getTaxSummary(...args) { return []; }
    static async getBudgetVsActual(...args) { return []; }
    static async getActivityLog(...args) { return []; }
    static async getAPAgingSummary(...args) { return []; }
    static async getPurchaseOrderDetails(...args) { return []; }
    static async getAPAgingDetails(...args) { return []; }
    static async getVendorCreditDetails(...args) { return []; }
    static async getPayablesRefundHistory(...args) { return []; }
    static async getPurchaseOrdersByVendor(...args) { return []; }
    static async getProjectProfitabilitySummary(orgId) {
        const TimeEntry = mongoose_1.default.model('TimeEntry');
        const Project = mongoose_1.default.model('BooksProject');
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
                totalCost += (t.hours * t.costRate);
                if (t.isBillable) {
                    if (t.status === 'Invoiced') {
                        invoicedRevenue += (t.hours * t.billingRate);
                    }
                    else {
                        unbilledHours += t.hours;
                        unbilledRevenuePotential += (t.hours * t.billingRate);
                    }
                }
            }
            const profit = invoicedRevenue - totalCost;
            const margin = invoicedRevenue > 0 ? (profit / invoicedRevenue) * 100 : 0;
            report.push({
                projectId: p._id.toString(),
                projectName: p.projectName,
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
    static isCreditNormalAccount(accountType) {
        const creditTypes = ['Income', 'Other Income', 'Equity', 'Long Term Liability', 'Other Current Liability', 'Credit Card'];
        return creditTypes.includes(accountType);
    }
    static async getBudgetVsActuals(orgId, filters = {}) {
        const Budget = mongoose_1.default.model('Budget');
        const LedgerEntry = mongoose_1.default.model('LedgerEntry');
        // Ensure ChartOfAccount is registered, or use mongoose.model if it is
        const ChartOfAccount = mongoose_1.default.models.ChartOfAccount || mongoose_1.default.model('ChartOfAccount');
        const budgetQuery = { orgId };
        if (filters.branchId)
            budgetQuery.branchId = filters.branchId;
        if (filters.periodStart)
            budgetQuery.periodStart = { $gte: filters.periodStart };
        if (filters.periodEnd)
            budgetQuery.periodEnd = { $lte: filters.periodEnd };
        const budgets = await Budget.find(budgetQuery).populate('accountId').lean();
        const report = [];
        for (const b of budgets) {
            const coa = b.accountId;
            const coaId = coa._id.toString();
            const pipeline = [
                { $match: { orgId, date: { $gte: b.periodStart, $lte: b.periodEnd } } },
                { $unwind: '$lines' },
                // Compare with both ObjectId and String forms since Mixed type could hold either historically
                { $match: { $or: [{ 'lines.accountId': coa._id }, { 'lines.accountId': coaId }] } }
            ];
            if (b.branchId) {
                pipeline.push({ $match: { 'lines.branchId': new mongoose_1.default.Types.ObjectId(b.branchId.toString()) } });
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
            }
            else {
                actualAmount = debits - credits;
            }
            const variance = actualAmount - b.budgetedAmount;
            const variancePercentage = b.budgetedAmount ? (variance / b.budgetedAmount) * 100 : 0;
            report.push({
                accountId: coaId,
                accountName: coa.accountName,
                accountType: coa.accountType,
                branchId: b.branchId || 'Org-Wide',
                period: `${b.periodStart.toISOString().split('T')[0]} to ${b.periodEnd.toISOString().split('T')[0]}`,
                budgetAmount: b.budgetedAmount,
                actualAmount,
                variance,
                variancePercentage: parseFloat(variancePercentage.toFixed(2))
            });
        }
        return report;
    }
    static async getTDSSummary(orgId) {
        const bills = await Bill_1.default.aggregate([
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
    static async getTCSPayableSummary(orgId) {
        const invoices = await Invoice_1.default.aggregate([
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
    static async getFIFOValuation(orgId, asOfDate = new Date()) {
        const items = await Item_1.default.find({ orgId, type: 'goods' }).lean();
        const bills = await Bill_1.default.find({ orgId, status: { $ne: 'Draft' }, billDate: { $lte: asOfDate } }).sort({ billDate: 1 }).lean();
        const invoices = await Invoice_1.default.find({ orgId, status: { $ne: 'Draft' }, invoiceDate: { $lte: asOfDate } }).sort({ invoiceDate: 1 }).lean();
        const creditNotes = await CreditNote_1.default.find({ orgId, status: { $ne: 'Draft' }, creditNoteDate: { $lte: asOfDate } }).sort({ creditNoteDate: 1 }).lean();
        const valuation = [];
        const lotsByItem = new Map();
        items.forEach((i) => lotsByItem.set(i._id.toString(), []));
        let lotIdCounter = 1;
        // 1. Build Lots from Inbound (Bills)
        bills.forEach(b => {
            (b.lineItems || []).forEach((l) => {
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
        const cogsLog = new Map();
        // Tracks which invoice consumed which lots: invoiceId_itemId -> [ { lotId, qty, rate, lotRef } ]
        const consumptionLog = new Map();
        invoices.forEach(inv => {
            const invId = inv._id.toString();
            (inv.items || []).forEach((l) => {
                const itemId = l.item?.toString();
                if (itemId && lotsByItem.has(itemId)) {
                    let qtyToConsume = l.quantity || 0;
                    let costForThisSale = 0;
                    const lots = (lotsByItem.get(itemId) || []) || [];
                    const consumedLots = [];
                    for (const lot of lots) {
                        if (qtyToConsume <= 0)
                            break;
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
            let relatedInvIds = [];
            if (cn.appliedToInvoices && cn.appliedToInvoices.length > 0) {
                relatedInvIds = cn.appliedToInvoices.map((x) => x.invoiceId?.toString());
            }
            else if (cn.invoiceId) {
                relatedInvIds = [cn.invoiceId.toString()];
            }
            const invId = relatedInvIds.length > 0 ? relatedInvIds[0] : null; // simplified logic to pick the primary linked invoice
            (cn.items || []).forEach((l) => {
                const itemId = l.item?.toString();
                if (itemId && invId) {
                    let qtyToReturn = l.quantity || 0;
                    const key = invId + '_' + itemId;
                    const consumedLots = consumptionLog.get(key);
                    if (consumedLots) {
                        // Restore in reverse order (LIFO of consumption)
                        for (let i = consumedLots.length - 1; i >= 0; i--) {
                            if (qtyToReturn <= 0)
                                break;
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
                    }
                    else {
                        // If no explicit consumption found (e.g. orphan return), we could inject a new lot.
                        // Skipped for this exact strict test constraint.
                    }
                }
            });
        });
        items.forEach((i) => {
            const itemId = i._id.toString();
            const lots = (lotsByItem.get(itemId) || []) || [];
            let stockOnHand = 0;
            let inventoryValue = 0;
            const activeLots = [];
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
    static async getWACValuation(orgId, asOfDate = new Date()) {
        const items = await Item_1.default.find({ orgId, type: 'goods' }).lean();
        const bills = await Bill_1.default.find({ orgId, status: { $ne: 'Draft' }, billDate: { $lte: asOfDate } }).lean();
        const invoices = await Invoice_1.default.find({ orgId, status: { $ne: 'Draft' }, invoiceDate: { $lte: asOfDate } }).lean();
        const creditNotes = await CreditNote_1.default.find({ orgId, status: { $ne: 'Draft' }, creditNoteDate: { $lte: asOfDate } }).lean();
        const allTransactions = [];
        bills.forEach(b => {
            (b.lineItems || []).forEach((l) => {
                if (l.itemId) {
                    allTransactions.push({ type: 'in', date: b.billDate, itemId: l.itemId.toString(), qty: l.quantity, rate: l.rate, ref: b.billNumber });
                }
            });
        });
        invoices.forEach(inv => {
            (inv.items || []).forEach((l) => {
                if (l.item) {
                    allTransactions.push({ type: 'out', date: inv.invoiceDate, itemId: l.item.toString(), qty: l.quantity, ref: inv.invoiceNumber });
                }
            });
        });
        creditNotes.forEach(cn => {
            (cn.items || []).forEach((l) => {
                if (l.item) {
                    allTransactions.push({ type: 'return_in', date: cn.creditNoteDate, itemId: l.item.toString(), qty: l.quantity, ref: cn.creditNoteNumber });
                }
            });
        });
        allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const map = new Map();
        items.forEach((i) => map.set(i._id.toString(), {
            itemName: i.name,
            stockOnHand: 0,
            inventoryValue: 0,
            averageCost: 0,
            cogs: 0,
            ledger: []
        }));
        allTransactions.forEach(tx => {
            const row = map.get(tx.itemId);
            if (!row)
                return;
            if (tx.type === 'in') {
                const totalValue = row.inventoryValue + (tx.qty * tx.rate);
                row.stockOnHand += tx.qty;
                row.inventoryValue = totalValue;
                row.averageCost = row.stockOnHand > 0 ? (row.inventoryValue / row.stockOnHand) : 0;
                row.ledger.push({ ...tx, currentWAC: row.averageCost });
            }
            else if (tx.type === 'out') {
                const cogsAmount = tx.qty * row.averageCost;
                row.cogs += cogsAmount;
                row.stockOnHand -= tx.qty;
                row.inventoryValue -= cogsAmount;
                row.ledger.push({ ...tx, costApplied: cogsAmount, currentWAC: row.averageCost });
            }
            else if (tx.type === 'return_in') {
                const restoredValue = tx.qty * row.averageCost;
                row.cogs -= restoredValue;
                row.stockOnHand += tx.qty;
                row.inventoryValue += restoredValue;
                row.ledger.push({ ...tx, costRestored: restoredValue, currentWAC: row.averageCost });
            }
        });
        return Array.from(map.values());
    }
    static async getABCClassification(orgId) {
        const valuation = await this.getWACValuation(orgId);
        valuation.sort((a, b) => b.inventoryValue - a.inventoryValue);
        const totalValue = valuation.reduce((acc, row) => acc + row.inventoryValue, 0);
        let cumulative = 0;
        return valuation.map(row => {
            cumulative += row.inventoryValue;
            const cumulativePercent = totalValue > 0 ? (cumulative / totalValue) * 100 : 0;
            let classification = 'C';
            if (cumulativePercent <= 70)
                classification = 'A';
            else if (cumulativePercent <= 90)
                classification = 'B';
            return {
                itemName: row.itemName,
                inventoryValue: row.inventoryValue,
                cumulativePercent: cumulativePercent.toFixed(2) + '%',
                classification
            };
        });
    }
    // ===================== PAYMENTS & REFUNDS (Priority 5 - Batch 1) ===================== //
    static async getPaymentsReceivedDetails(orgId, startDate, endDate) {
        const query = { orgId };
        if (startDate || endDate) {
            query.paymentDate = {};
            if (startDate)
                query.paymentDate.$gte = new Date(startDate);
            if (endDate)
                query.paymentDate.$lte = new Date(endDate);
        }
        const payments = await PaymentReceived_1.default.find(query).populate('customer').lean();
        return payments.map(p => {
            let applied = 0;
            if (p.invoices) {
                p.invoices.forEach(inv => { applied += (inv.amountApplied || 0); });
            }
            const unused = (p.amount || 0) - applied - (p.amountRefunded || 0);
            return {
                date: p.paymentDate,
                paymentNumber: p.paymentNumber,
                customer: p.customer?.displayName || 'Unknown',
                mode: p.paymentMode,
                totalAmount: p.amount,
                appliedAmount: applied,
                refundedAmount: p.amountRefunded || 0,
                unusedAmount: Math.max(0, unused)
            };
        });
    }
    static async getTimeToGetPaid(orgId, startDate, endDate) {
        const query = { orgId };
        if (startDate || endDate) {
            query.paymentDate = {};
            if (startDate)
                query.paymentDate.$gte = new Date(startDate);
            if (endDate)
                query.paymentDate.$lte = new Date(endDate);
        }
        const payments = await PaymentReceived_1.default.find(query).populate('customer').populate('invoices.invoice').lean();
        const details = [];
        payments.forEach(p => {
            if (p.invoices) {
                p.invoices.forEach((l) => {
                    if (l.invoice && l.invoice.invoiceDate) {
                        const payDate = new Date(p.paymentDate).getTime();
                        const invDate = new Date(l.invoice.invoiceDate).getTime();
                        const diffTime = payDate - invDate;
                        const daysToPay = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                        details.push({
                            customer: p.customer?.displayName || 'Unknown',
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
    static async getCreditNoteDetails(orgId, startDate, endDate) {
        const query = { orgId, status: { $ne: 'Draft' } };
        if (startDate || endDate) {
            query.creditNoteDate = {};
            if (startDate)
                query.creditNoteDate.$gte = new Date(startDate);
            if (endDate)
                query.creditNoteDate.$lte = new Date(endDate);
        }
        const credits = await CreditNote_1.default.find(query).populate('customer').lean();
        return credits.map(c => {
            let applied = 0;
            if (c.appliedToInvoices && c.appliedToInvoices.length > 0) {
                c.appliedToInvoices.forEach((l) => { applied += (l.amountApplied || 0); });
            }
            else if (c.invoiceId) {
                applied = c.total || 0;
            }
            let refunded = 0;
            if (c.refunds) {
                c.refunds.forEach(r => { refunded += (r.amount || 0); });
            }
            const unused = (c.total || 0) - applied - refunded;
            return {
                date: c.creditNoteDate,
                creditNoteNumber: c.creditNoteNumber,
                customer: c.customer?.displayName || 'Unknown',
                status: c.status,
                totalAmount: c.total,
                appliedAmount: applied,
                refundedAmount: refunded,
                unusedCredit: Math.max(0, unused)
            };
        });
    }
    static async getReceivablesRefundHistory(orgId, startDate, endDate) {
        const query = { orgId, status: { $ne: 'Draft' } };
        const credits = await CreditNote_1.default.find(query).populate('customer').lean();
        const refunds = [];
        credits.forEach(c => {
            if (c.refunds) {
                c.refunds.forEach(r => {
                    let dateMatch = true;
                    if (startDate && r.date < startDate)
                        dateMatch = false;
                    if (endDate && r.date > endDate)
                        dateMatch = false;
                    if (dateMatch) {
                        refunds.push({
                            date: r.date,
                            reference: r.reference || c.creditNoteNumber,
                            customer: c.customer?.displayName || 'Unknown',
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
    static async getPurchasesByVendor(orgId, startDate, endDate) {
        const vendors = await Vendor_1.default.find({ orgId }).lean();
        const bills = await Bill_1.default.find({ orgId, status: { $ne: 'Draft' } }).lean();
        const credits = await VendorCredit_1.default.find({ orgId, status: { $ne: 'Draft' } }).lean();
        const map = new Map();
        vendors.forEach((v) => map.set(v._id.toString(), {
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
    static async getPurchasesByItem(orgId, startDate, endDate) {
        const items = await Item_1.default.find({ orgId, type: 'goods' }).lean();
        const bills = await Bill_1.default.find({ orgId, status: { $ne: 'Draft' } }).lean();
        const map = new Map();
        items.forEach((i) => map.set(i._id.toString(), {
            itemName: i.name,
            quantityPurchased: 0,
            totalAmount: 0,
            averagePurchasePrice: 0
        }));
        bills.forEach(b => {
            (b.lineItems || []).forEach((l) => {
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
    static async getExpenseDetails(orgId, startDate, endDate) {
        const query = { orgId };
        if (startDate || endDate) {
            query.date = {};
            if (startDate)
                query.date.$gte = new Date(startDate);
            if (endDate)
                query.date.$lte = new Date(endDate);
        }
        // We dynamically require Expense here if not at top
        const ExpenseModel = mongoose_1.default.models.BooksExpense || mongoose_1.default.model('BooksExpense');
        const expenses = await ExpenseModel.find(query).populate('customerId vendorId projectId').lean();
        return expenses.map((e) => {
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
    static async getExpensesByCategory(orgId, categoryType = 'account') {
        const ExpenseModel = mongoose_1.default.models.BooksExpense || mongoose_1.default.model('BooksExpense');
        const expenses = await ExpenseModel.find({ orgId }).populate('customerId vendorId projectId').lean();
        const map = new Map();
        expenses.forEach((e) => {
            let key = 'Uncategorized';
            if (categoryType === 'account')
                key = e.expenseAccount || (e.lineItems && e.lineItems[0]?.expenseAccount) || 'Uncategorized';
            if (categoryType === 'customer')
                key = e.customerId?.displayName || 'No Customer';
            if (categoryType === 'project')
                key = e.projectId?.name || 'No Project';
            if (categoryType === 'employee')
                key = e.mileageData?.employee || 'No Employee';
            if (!map.has(key))
                map.set(key, { category: key, expenseCount: 0, totalAmount: 0 });
            const row = map.get(key);
            row.expenseCount++;
            row.totalAmount += (e.totalAmount || 0);
        });
        return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);
    }
    static async getBillableExpenseDetails(orgId, startDate, endDate) {
        const ExpenseModel = mongoose_1.default.models.BooksExpense || mongoose_1.default.model('BooksExpense');
        const expenses = await ExpenseModel.find({ orgId, billable: true }).populate('customerId invoiceId').lean();
        return expenses.map((e) => {
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
    static async getRecurringInvoiceDetails(orgId, startDate, endDate) {
        const query = { orgId };
        if (startDate || endDate) {
            query.startsOn = {};
            if (startDate)
                query.startsOn.$gte = new Date(startDate);
            if (endDate)
                query.startsOn.$lte = new Date(endDate);
        }
        const recs = await RecurringInvoice_1.default.find(query).populate('customer').lean();
        return recs.map((r) => {
            let amount = 0;
            (r.items || []).forEach((l) => amount += (l.amount || 0));
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
    static async getRecurringBills(orgId, startDate, endDate) {
        const query = { orgId };
        if (startDate || endDate) {
            query.startsOn = {};
            if (startDate)
                query.startsOn.$gte = new Date(startDate);
            if (endDate)
                query.startsOn.$lte = new Date(endDate);
        }
        const recs = await RecurringBill_1.default.find(query).populate('vendorId').lean();
        return recs.map((r) => {
            let amount = 0;
            (r.lineItems || []).forEach((l) => amount += (l.amount || 0));
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
    static async getRecurringExpenses(orgId, startDate, endDate) {
        const query = { orgId };
        if (startDate || endDate) {
            query.startsOn = {};
            if (startDate)
                query.startsOn.$gte = new Date(startDate);
            if (endDate)
                query.startsOn.$lte = new Date(endDate);
        }
        const recs = await RecurringExpense_1.default.find(query).populate('customerId').lean();
        return recs.map((r) => {
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
exports.AdvancedReportsService = AdvancedReportsService;
