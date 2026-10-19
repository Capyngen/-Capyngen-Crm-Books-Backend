"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryValuationService = void 0;
const Item_1 = __importDefault(require("../models/Item"));
class InventoryValuationService {
    /**
     * Recalculates Weighted Average Cost (WAC) on new stock receipt
     */
    static calculateWAC(currentStock, currentWAC, inboundQty, inboundRate) {
        const totalQty = currentStock + inboundQty;
        if (totalQty <= 0)
            return inboundRate > 0 ? inboundRate : currentWAC;
        const totalValuation = (currentStock * currentWAC) + (inboundQty * inboundRate);
        return Math.round((totalValuation / totalQty) * 100) / 100;
    }
    /**
     * Records an inbound cost layer (from Goods Receipt or Bill)
     */
    static async recordInboundCostLayer(itemId, quantity, unitCost, referenceDoc = '') {
        if (quantity <= 0)
            return;
        const item = await Item_1.default.findById(itemId);
        if (!item)
            return;
        if (!item.costLayers)
            item.costLayers = [];
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
    static async consumeFIFOCostLayers(itemId, quantityToIssue) {
        const item = await Item_1.default.findById(itemId);
        if (!item)
            throw new Error('Item not found');
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
        const activeLayers = item.costLayers.filter((l) => l.remainingQty > 0);
        activeLayers.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let remainingNeeded = quantityToIssue;
        let totalCOGS = 0;
        const consumed = [];
        for (const layer of activeLayers) {
            if (remainingNeeded <= 0)
                break;
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
    static async getValuationReport(orgId) {
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
        const items = await Item_1.default.find(filter).lean();
        return items.map((item) => {
            const stock = Number(item.stock || 0);
            const wacRate = Number(item.purchaseRate || 0);
            const wacValuation = Math.round(stock * wacRate * 100) / 100;
            // Calculate FIFO Valuation from remaining layers
            let fifoValuation = 0;
            if (item.costLayers && item.costLayers.length > 0) {
                fifoValuation = item.costLayers.reduce((acc, l) => acc + (Number(l.remainingQty || 0) * Number(l.unitCost || 0)), 0);
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
exports.InventoryValuationService = InventoryValuationService;
