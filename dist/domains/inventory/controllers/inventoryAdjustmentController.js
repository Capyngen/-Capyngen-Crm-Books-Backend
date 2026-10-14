"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAdjustment = exports.getAdjustmentById = exports.getAdjustments = exports.createAdjustment = void 0;
const context_1 = require("../../../context");
const mongoose_1 = __importDefault(require("mongoose"));
const InventoryAdjustment_1 = __importDefault(require("../models/InventoryAdjustment"));
const Item_1 = __importDefault(require("../models/Item"));
// @desc    Create new inventory adjustment
// @route   POST /api/v1/books/inventory-adjustments
const createAdjustment = async (req, res, next) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const adjustment = await InventoryAdjustment_1.default.create([req.body], { session });
        // Update stock for each item in the adjustment
        for (const adjItem of req.body.items) {
            if (req.body.mode === 'quantity') {
                await Item_1.default.findByIdAndUpdate(adjItem.item, { $inc: { stock: adjItem.quantityAdjusted } }, { session });
            }
        }
        await session.commitTransaction();
        session.endSession();
        // Populate item details before sending response
        const populated = await InventoryAdjustment_1.default.findById(adjustment[0]._id).populate('items.item');
        res.status(201).json({ success: true, data: populated });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};
exports.createAdjustment = createAdjustment;
// @desc    Get all adjustments
// @route   GET /api/v1/books/inventory-adjustments
const getAdjustments = async (req, res, next) => {
    try {
        const adjustments = await InventoryAdjustment_1.default.find({ companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } })
            .populate('items.item')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: adjustments.length, data: adjustments });
    }
    catch (error) {
        next(error);
    }
};
exports.getAdjustments = getAdjustments;
// @desc    Get single adjustment
// @route   GET /api/v1/books/inventory-adjustments/:id
const getAdjustmentById = async (req, res, next) => {
    try {
        const adjustment = await InventoryAdjustment_1.default.findOne({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } })
            .populate('items.item');
        if (!adjustment) {
            return res.status(404).json({ success: false, message: 'Adjustment not found' });
        }
        res.status(200).json({ success: true, data: adjustment });
    }
    catch (error) {
        next(error);
    }
};
exports.getAdjustmentById = getAdjustmentById;
// @desc    Update adjustment
// @route   PUT /api/v1/books/inventory-adjustments/:id
const updateAdjustment = async (req, res, next) => {
    // Simplistic update for now without reversing stock
    try {
        const adjustment = await InventoryAdjustment_1.default.findOneAndUpdate({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } }, req.body, { new: true });
        if (!adjustment)
            return res.status(404).json({ success: false, message: 'Adjustment not found' });
        res.status(200).json({ success: true, data: adjustment });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAdjustment = updateAdjustment;
