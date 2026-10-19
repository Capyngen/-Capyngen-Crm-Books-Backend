"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockTrackingService = void 0;
const Item_1 = __importDefault(require("../models/Item"));
class StockTrackingService {
    /**
     * FEFO (First-Expired-First-Out) Batch Picker
     * Automatically picks inventory from batches expiring earliest.
     */
    static async pickBatchesFEFO(itemId, warehouseId, quantityRequired) {
        const item = await Item_1.default.findById(itemId);
        if (!item)
            throw new Error('Item not found');
        if (item.trackingType !== 'Batch' || !item.batches || item.batches.length === 0) {
            return [];
        }
        const whIdStr = warehouseId ? warehouseId.toString() : '';
        // Filter active batches in warehouse (or global if warehouse not specified)
        const validBatches = item.batches.filter((b) => {
            const isMatchWh = !whIdStr || !b.warehouse || b.warehouse === whIdStr;
            const isActive = b.status === 'Active' && b.quantity > 0;
            const isNotExpired = !b.expiryDate || new Date(b.expiryDate) >= new Date();
            return isMatchWh && isActive && isNotExpired;
        });
        // Sort by expiry date ascending (FEFO)
        validBatches.sort((a, b) => {
            if (!a.expiryDate)
                return 1;
            if (!b.expiryDate)
                return -1;
            return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        });
        let remainingNeeded = quantityRequired;
        const allocations = [];
        for (const batch of validBatches) {
            if (remainingNeeded <= 0)
                break;
            const pickQty = Math.min(batch.quantity, remainingNeeded);
            batch.quantity -= pickQty;
            remainingNeeded -= pickQty;
            allocations.push({
                batchNo: batch.batchNo,
                quantityPicked: pickQty,
                expiryDate: batch.expiryDate,
                bin: batch.bin
            });
        }
        if (remainingNeeded > 0) {
            throw new Error(`Insufficient unexpired batch stock for "${item.name}". Shortage: ${remainingNeeded}`);
        }
        await item.save();
        return allocations;
    }
    /**
     * Receive Batched Goods Inward
     */
    static async receiveBatch(itemId, warehouseId, batchData) {
        const item = await Item_1.default.findById(itemId);
        if (!item)
            throw new Error('Item not found');
        const whIdStr = warehouseId ? warehouseId.toString() : '';
        if (!item.batches)
            item.batches = [];
        const existingBatch = item.batches.find((b) => b.batchNo === batchData.batchNo && (!whIdStr || b.warehouse === whIdStr));
        if (existingBatch) {
            existingBatch.quantity += Number(batchData.quantity || 0);
            if (batchData.expiryDate)
                existingBatch.expiryDate = batchData.expiryDate;
            if (batchData.mfgDate)
                existingBatch.mfgDate = batchData.mfgDate;
            if (batchData.bin)
                existingBatch.bin = batchData.bin;
            existingBatch.status = 'Active';
        }
        else {
            item.batches.push({
                batchNo: batchData.batchNo,
                mfgDate: batchData.mfgDate,
                expiryDate: batchData.expiryDate,
                quantity: Number(batchData.quantity || 0),
                warehouse: whIdStr,
                bin: batchData.bin || '',
                status: 'Active'
            });
        }
        await item.save();
        return item;
    }
    /**
     * Serial Number Dispatch & Validation
     */
    static async dispatchSerialNumbers(itemId, warehouseId, serialNumbers, newStatus = 'Sold') {
        const item = await Item_1.default.findById(itemId);
        if (!item)
            throw new Error('Item not found');
        if (item.trackingType !== 'Serial' || !item.serialNumbers) {
            return;
        }
        const whIdStr = warehouseId ? warehouseId.toString() : '';
        for (const sn of serialNumbers) {
            const match = item.serialNumbers.find((s) => s.serialNo === sn);
            if (!match) {
                throw new Error(`Serial number "${sn}" does not exist for item "${item.name}"`);
            }
            if (match.status !== 'Available') {
                throw new Error(`Serial number "${sn}" is not available (current status: ${match.status})`);
            }
            if (whIdStr && match.warehouse && match.warehouse !== whIdStr) {
                throw new Error(`Serial number "${sn}" is in warehouse ${match.warehouse}, not ${whIdStr}`);
            }
            match.status = newStatus;
        }
        await item.save();
    }
    /**
     * Serial Number Inward Receipt
     */
    static async receiveSerialNumbers(itemId, warehouseId, serialEntries) {
        const item = await Item_1.default.findById(itemId);
        if (!item)
            throw new Error('Item not found');
        if (!item.serialNumbers)
            item.serialNumbers = [];
        const whIdStr = warehouseId ? warehouseId.toString() : '';
        for (const entry of serialEntries) {
            const existing = item.serialNumbers.find((s) => s.serialNo === entry.serialNo);
            if (existing) {
                existing.status = 'Available';
                existing.warehouse = whIdStr;
                if (entry.bin)
                    existing.bin = entry.bin;
                if (entry.warrantyExpiry)
                    existing.warrantyExpiry = entry.warrantyExpiry;
            }
            else {
                item.serialNumbers.push({
                    serialNo: entry.serialNo,
                    status: 'Available',
                    warehouse: whIdStr,
                    bin: entry.bin || '',
                    addedDate: new Date().toISOString().split('T')[0],
                    warrantyExpiry: entry.warrantyExpiry || ''
                });
            }
        }
        await item.save();
    }
}
exports.StockTrackingService = StockTrackingService;
