"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.updateItem = exports.getItemById = exports.getItems = exports.createItem = void 0;
const Item_1 = __importDefault(require("../models/Item"));
const BillingItem_1 = __importDefault(require("../../billing/models/BillingItem"));
// @desc    Create new item
// @route   POST /api/v1/books/items
const createItem = async (req, res, next) => {
    try {
        const payload = { ...req.body };
        const item = await Item_1.default.create(payload);
        res.status(201).json({ success: true, data: item });
    }
    catch (error) {
        next(error);
    }
};
exports.createItem = createItem;
// @desc    Get all items
// @route   GET /api/v1/books/items
const getItems = async (req, res, next) => {
    try {
        const booksItems = await Item_1.default.find({}).lean();
        const billingItems = await BillingItem_1.default.find({}).lean();
        const allItems = [
            ...booksItems.map((i) => ({ ...i, sourceDomain: 'books' })),
            ...billingItems.map((i) => ({ ...i, sourceDomain: 'billing' }))
        ];
        allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        res.status(200).json({ success: true, count: allItems.length, data: allItems });
    }
    catch (error) {
        next(error);
    }
};
exports.getItems = getItems;
// @desc    Get single item
// @route   GET /api/v1/books/items/:id
const getItemById = async (req, res, next) => {
    try {
        let item = await Item_1.default.findById(req.params.id).lean();
        let sourceDomain = 'books';
        if (!item) {
            item = await BillingItem_1.default.findById(req.params.id).lean();
            sourceDomain = 'billing';
        }
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.status(200).json({ success: true, data: { ...item, sourceDomain } });
    }
    catch (error) {
        next(error);
    }
};
exports.getItemById = getItemById;
// @desc    Update item
// @route   PUT /api/v1/books/items/:id
const updateItem = async (req, res, next) => {
    try {
        let item = await Item_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) {
            item = await BillingItem_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        }
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
// @route   DELETE /api/v1/books/items/:id
const deleteItem = async (req, res, next) => {
    try {
        let item = await Item_1.default.findByIdAndDelete(req.params.id);
        if (!item) {
            item = await BillingItem_1.default.findByIdAndDelete(req.params.id);
        }
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
