"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateItem = exports.getItemById = exports.getItems = exports.createItem = void 0;
const Item_1 = __importDefault(require("../models/Item"));
// @desc    Create new item
// @route   POST /api/v1/books/items
const createItem = async (req, res, next) => {
    try {
        const item = await Item_1.default.create(req.body);
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
        const items = await Item_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: items.length, data: items });
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
        const item = await Item_1.default.findById(req.params.id);
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
// @route   PUT /api/v1/books/items/:id
const updateItem = async (req, res, next) => {
    try {
        const item = await Item_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
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
