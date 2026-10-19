"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconcileCycleCount = exports.submitCountResults = exports.createCycleCount = exports.getCycleCountById = exports.getCycleCounts = void 0;
const CycleCount_1 = __importDefault(require("../models/CycleCount"));
const Item_1 = __importDefault(require("../models/Item"));
const InventoryAdjustment_1 = __importDefault(require("../models/InventoryAdjustment"));
const PostingEngine_1 = require("../../books/services/PostingEngine");
const context_1 = require("../../../context");
// @desc    Get all cycle counts
// @route   GET /api/v1/books/inventory/cycle-counts
const getCycleCounts = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId || req.body.orgId;
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
        const docs = await CycleCount_1.default.find(filter)
            .populate('warehouseId', 'name code')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        next(error);
    }
};
exports.getCycleCounts = getCycleCounts;
// @desc    Get single cycle count
// @route   GET /api/v1/books/inventory/cycle-counts/:id
const getCycleCountById = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId || req.body.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const doc = await CycleCount_1.default.findOne(filter)
            .populate('warehouseId', 'name code')
            .populate('lines.item', 'name sku unit');
        if (!doc)
            return res.status(404).json({ success: false, message: 'Cycle count not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.getCycleCountById = getCycleCountById;
// @desc    Create new cycle count audit
// @route   POST /api/v1/books/inventory/cycle-counts
const createCycleCount = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId || req.body.orgId;
        const warehouseId = req.body.warehouseId;
        let countNumber = req.body.countNumber;
        if (!countNumber) {
            const count = await CycleCount_1.default.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
            countNumber = `CC-${String(count + 1).padStart(5, '0')}`;
        }
        let lines = req.body.lines || [];
        // If lines not manually passed, auto-populate from warehouse items
        if (lines.length === 0 && warehouseId) {
            const itemFilter = { type: 'goods' };
            if (orgId)
                itemFilter.$or = [{ companyId: orgId }, { orgId }];
            const items = await Item_1.default.find(itemFilter).lean();
            lines = items.map((it) => {
                const whStock = it.warehouseStock?.find((ws) => ws.warehouse?.toString() === warehouseId.toString());
                const systemQty = whStock ? Number(whStock.stockOnHand || 0) : Number(it.stock || 0);
                const rate = Number(it.purchaseRate || 0);
                return {
                    item: it._id,
                    itemName: it.name,
                    sku: it.sku || '',
                    bin: whStock?.bin || '',
                    systemQuantity: systemQty,
                    countedQuantity: 0,
                    varianceQuantity: -systemQty,
                    unitCost: rate,
                    varianceValue: -(systemQty * rate),
                    notes: ''
                };
            });
        }
        const doc = await CycleCount_1.default.create({
            ...req.body,
            countNumber,
            lines,
            status: req.body.status || 'Draft',
            companyId: orgId,
            orgId
        });
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.createCycleCount = createCycleCount;
// @desc    Submit counted physical quantities
// @route   POST /api/v1/books/inventory/cycle-counts/:id/submit
const submitCountResults = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const doc = await CycleCount_1.default.findOne(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Cycle count not found' });
        const countsMap = {};
        if (req.body.counts && Array.isArray(req.body.counts)) {
            req.body.counts.forEach((c) => {
                countsMap[c.itemId || c.item] = Number(c.countedQuantity || 0);
            });
        }
        // Recalculate variances
        doc.lines.forEach((line) => {
            const itemIdStr = line.item.toString();
            if (countsMap[itemIdStr] !== undefined) {
                line.countedQuantity = countsMap[itemIdStr];
                line.varianceQuantity = line.countedQuantity - line.systemQuantity;
                line.varianceValue = Math.round(line.varianceQuantity * (line.unitCost || 0) * 100) / 100;
            }
        });
        doc.status = 'Under Review';
        doc.countedBy = req.user?._id?.toString() || req.user?.displayName || 'Auditor';
        await doc.save();
        res.status(200).json({ success: true, data: doc, message: 'Physical counts recorded. Review variances before reconciliation.' });
    }
    catch (error) {
        next(error);
    }
};
exports.submitCountResults = submitCountResults;
// @desc    Reconcile cycle count (auto-creates Inventory Adjustment & posts GL)
// @route   POST /api/v1/books/inventory/cycle-counts/:id/reconcile
const reconcileCycleCount = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const doc = await CycleCount_1.default.findOne(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Cycle count not found' });
        if (doc.status === 'Reconciled') {
            return res.status(400).json({ success: false, message: 'Cycle count is already reconciled' });
        }
        const varianceLines = doc.lines.filter((l) => l.varianceQuantity !== 0);
        if (varianceLines.length === 0) {
            doc.status = 'Reconciled';
            doc.reconciledAt = new Date();
            doc.reconciledBy = req.user?._id?.toString() || 'System';
            await doc.save();
            return res.status(200).json({ success: true, data: doc, message: 'Count perfectly matched! Zero variance to adjust.' });
        }
        // Generate automatic Inventory Adjustment
        const adjCount = await InventoryAdjustment_1.default.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
        const referenceNumber = `ADJ-CC-${String(adjCount + 1).padStart(5, '0')}`;
        let totalDiscrepancyValue = 0;
        const adjustmentItems = varianceLines.map((vl) => {
            totalDiscrepancyValue += vl.varianceValue;
            return {
                item: vl.item,
                warehouse: doc.warehouseId,
                currentStock: vl.systemQuantity,
                quantityAdjusted: vl.varianceQuantity,
                newStock: vl.countedQuantity,
                unitCost: vl.unitCost,
                valueAdjusted: vl.varianceValue
            };
        });
        const adjustment = await InventoryAdjustment_1.default.create({
            referenceNumber,
            date: new Date(),
            warehouseId: doc.warehouseId,
            reason: `Cycle Count ${doc.countNumber} Physical Audit Reconciliation`,
            description: `Auto-reconciled variance from physical inventory count ${doc.countNumber}`,
            account: 'Inventory Shrinkage & Loss',
            mode: 'quantity',
            status: 'Adjusted',
            approvalStatus: 'Approved',
            totalValue: Math.abs(totalDiscrepancyValue),
            items: adjustmentItems,
            companyId: orgId,
            orgId,
            createdBy: req.user?._id?.toString()
        });
        // Update physical stocks on items
        for (const vl of varianceLines) {
            const item = await Item_1.default.findById(vl.item);
            if (item) {
                item.stock = Math.max(0, (item.stock || 0) + vl.varianceQuantity);
                item.stockQuantity = item.stock;
                if (!item.warehouseStock)
                    item.warehouseStock = [];
                let ws = item.warehouseStock.find((w) => w.warehouse?.toString() === doc.warehouseId.toString());
                if (ws) {
                    ws.stockOnHand = Math.max(0, (ws.stockOnHand || 0) + vl.varianceQuantity);
                    ws.availableStock = Math.max(0, ws.stockOnHand - (ws.committedStock || 0));
                }
                await item.save();
            }
        }
        // Post to General Ledger
        try {
            await PostingEngine_1.PostingEngine.handleEvent('INVENTORY_ADJUSTMENT', {
                adjustmentId: adjustment._id.toString(),
                companyId: orgId,
                totalValue: Math.abs(totalDiscrepancyValue),
                isGain: totalDiscrepancyValue > 0
            });
        }
        catch (e) {
            console.error('Failed to post cycle count adjustment to GL:', e);
        }
        doc.status = 'Reconciled';
        doc.reconciledAt = new Date();
        doc.reconciledBy = req.user?._id?.toString() || 'Auditor';
        doc.adjustmentId = adjustment._id;
        await doc.save();
        res.status(200).json({
            success: true,
            data: doc,
            adjustmentId: adjustment._id,
            message: `Cycle count reconciled successfully. Created Adjustment ${referenceNumber} and posted to GL.`
        });
    }
    catch (error) {
        next(error);
    }
};
exports.reconcileCycleCount = reconcileCycleCount;
