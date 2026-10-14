"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleKit = exports.deleteItem = exports.updateItem = exports.getItemById = exports.getItems = exports.createItem = void 0;
const Item_1 = __importDefault(require("../models/Item"));
// @desc    Create new item
// @route   POST /api/v1/inventory/items
const createItem = async (req, res, next) => {
    try {
        const orgId = req.org?._id;
        const payload = {
            ...req.body,
            companyId: orgId || req.body.companyId,
            orgId: orgId || req.body.orgId,
            createdBy: req.user?._id
        };
        const item = await Item_1.default.create(payload);
        res.status(201).json({ success: true, data: item });
    }
    catch (error) {
        next(error);
    }
};
exports.createItem = createItem;
// @desc    Get all items
// @route   GET /api/v1/inventory/items
const getItems = async (req, res, next) => {
    try {
        const orgId = req.org?._id;
        const filter = orgId ? { companyId: orgId } : {};
        const items = await Item_1.default.find(filter).sort({ createdAt: -1 }).lean();
        res.status(200).json({ success: true, count: items.length, data: items });
    }
    catch (error) {
        next(error);
    }
};
exports.getItems = getItems;
// @desc    Get single item
// @route   GET /api/v1/inventory/items/:id
const getItemById = async (req, res, next) => {
    try {
        const orgId = req.org?._id;
        const filter = orgId ? { _id: req.params.id, companyId: orgId } : { _id: req.params.id };
        const item = await Item_1.default.findOne(filter).lean();
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.status(200).json({ success: true, data: item });
    }
    catch (error) {
        next(error);
    }
};
exports.getItemById = getItemById;
// @desc    Update item
// @route   PUT /api/v1/inventory/items/:id
const updateItem = async (req, res, next) => {
    try {
        const orgId = req.org?._id;
        const filter = orgId ? { _id: req.params.id, companyId: orgId } : { _id: req.params.id };
        const item = await Item_1.default.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.status(200).json({ success: true, data: item });
    }
    catch (error) {
        next(error);
    }
};
exports.updateItem = updateItem;
// @desc    Delete item
// @route   DELETE /api/v1/inventory/items/:id
const deleteItem = async (req, res, next) => {
    try {
        const orgId = req.org?._id;
        const filter = orgId ? { _id: req.params.id, companyId: orgId } : { _id: req.params.id };
        const item = await Item_1.default.findOneAndDelete(filter);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteItem = deleteItem;
const InventoryBOMService_1 = require("../services/InventoryBOMService");
const assembleKit = async (req, res) => {
    try {
        const { quantity } = req.body;
        const kit = await InventoryBOMService_1.InventoryBOMService.assembleKit(req.params.id, quantity || 1);
        res.status(200).json({ success: true, data: kit });
    }
    catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};
exports.assembleKit = assembleKit;
