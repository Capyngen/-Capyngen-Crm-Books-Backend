"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLandedCost = exports.applyLandedCost = exports.createLandedCost = exports.getLandedCostById = exports.getLandedCosts = void 0;
const LandedCost_1 = __importDefault(require("../models/LandedCost"));
const Item_1 = __importDefault(require("../models/Item"));
const PostingEngine_1 = require("../../books/services/PostingEngine");
const context_1 = require("../../../context");
// @desc    Get all landed cost records
// @route   GET /api/v1/books/inventory/landed-costs
const getLandedCosts = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId || req.body.orgId;
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
        const docs = await LandedCost_1.default.find(filter)
            .populate('items.item', 'name sku unit')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        next(error);
    }
};
exports.getLandedCosts = getLandedCosts;
// @desc    Get single landed cost record
// @route   GET /api/v1/books/inventory/landed-costs/:id
const getLandedCostById = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId || req.body.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const doc = await LandedCost_1.default.findOne(filter).populate('items.item', 'name sku unit');
        if (!doc)
            return res.status(404).json({ success: false, message: 'Landed cost record not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.getLandedCostById = getLandedCostById;
// @desc    Create new landed cost allocation
// @route   POST /api/v1/books/inventory/landed-costs
const createLandedCost = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId || req.body.orgId;
        let landedCostNumber = req.body.landedCostNumber;
        if (!landedCostNumber) {
            const count = await LandedCost_1.default.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
            landedCostNumber = `LC-${String(count + 1).padStart(5, '0')}`;
        }
        const charges = req.body.charges || [];
        const totalCharges = charges.reduce((acc, c) => acc + Number(c.amount || 0), 0);
        const items = req.body.items || [];
        const allocationBasis = req.body.allocationBasis || 'Value';
        // Compute denominator based on allocation basis
        let totalBasis = 0;
        for (const it of items) {
            if (allocationBasis === 'Quantity') {
                totalBasis += Number(it.quantity || 1);
            }
            else if (allocationBasis === 'Weight') {
                totalBasis += Number(it.weight || 1) * Number(it.quantity || 1);
            }
            else {
                // Value basis
                totalBasis += Number(it.totalOriginalValue || (it.quantity * it.originalUnitRate) || 0);
            }
        }
        // Allocate charges proportionally
        const allocatedItems = items.map((it) => {
            const qty = Number(it.quantity || 1);
            const originalRate = Number(it.originalUnitRate || 0);
            const originalVal = Number(it.totalOriginalValue || (qty * originalRate));
            let basisPortion = 0;
            if (allocationBasis === 'Quantity')
                basisPortion = qty;
            else if (allocationBasis === 'Weight')
                basisPortion = Number(it.weight || 1) * qty;
            else
                basisPortion = originalVal;
            const allocatedPortion = totalBasis > 0 ? (basisPortion / totalBasis) * totalCharges : 0;
            const allocatedPerUnit = qty > 0 ? allocatedPortion / qty : 0;
            const newUnitCost = Math.round((originalRate + allocatedPerUnit) * 100) / 100;
            return {
                ...it,
                quantity: qty,
                originalUnitRate: originalRate,
                totalOriginalValue: originalVal,
                allocatedLandedCost: Math.round(allocatedPortion * 100) / 100,
                newUnitCost
            };
        });
        const doc = await LandedCost_1.default.create({
            ...req.body,
            landedCostNumber,
            totalCharges,
            allocationBasis,
            items: allocatedItems,
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
exports.createLandedCost = createLandedCost;
// @desc    Apply landed cost to inventory items & post to GL
// @route   POST /api/v1/books/inventory/landed-costs/:id/apply
const applyLandedCost = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const doc = await LandedCost_1.default.findOne(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Landed cost record not found' });
        if (doc.status === 'Applied') {
            return res.status(400).json({ success: false, message: 'Landed cost is already applied' });
        }
        // Update unit cost of each item and record cost layer
        for (const line of doc.items) {
            const item = await Item_1.default.findById(line.item);
            if (!item)
                continue;
            item.purchaseRate = line.newUnitCost;
            if (!item.costLayers)
                item.costLayers = [];
            item.costLayers.push({
                date: new Date(),
                quantity: line.quantity,
                unitCost: line.newUnitCost,
                remainingQty: line.quantity,
                referenceDoc: `Landed Cost ${doc.landedCostNumber}`
            });
            await item.save();
        }
        doc.status = 'Applied';
        doc.appliedAt = new Date();
        doc.appliedBy = req.user?._id?.toString() || req.user?.displayName || 'User';
        await doc.save();
        // Post GL entry
        try {
            await PostingEngine_1.PostingEngine.handleEvent('LANDED_COST_APPLIED', {
                landedCostId: doc._id.toString(),
                companyId: orgId,
                totalAmount: doc.totalCharges
            });
        }
        catch (e) {
            console.error('Failed to post landed cost to GL:', e);
        }
        res.status(200).json({
            success: true,
            data: doc,
            message: `Landed cost of ₹${doc.totalCharges} successfully applied and capitalized into inventory.`
        });
    }
    catch (error) {
        next(error);
    }
};
exports.applyLandedCost = applyLandedCost;
// @desc    Delete landed cost
// @route   DELETE /api/v1/books/inventory/landed-costs/:id
const deleteLandedCost = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.$or = [{ companyId: orgId }, { orgId }];
        const doc = await LandedCost_1.default.findOne(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Landed cost not found' });
        if (doc.status === 'Applied') {
            return res.status(400).json({ success: false, message: 'Cannot delete an already applied landed cost record' });
        }
        await LandedCost_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteLandedCost = deleteLandedCost;
