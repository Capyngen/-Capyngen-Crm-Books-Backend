"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.updateItem = exports.createItem = exports.getItemById = exports.getItems = void 0;
const Item_1 = __importDefault(require("../../inventory/models/Item"));
const getItems = async (req, res) => {
    try {
        const orgId = req.org?._id;
        const filter = orgId ? { companyId: orgId } : {};
        const items = await Item_1.default.find(filter).sort({ createdAt: -1 }).lean();
        res.json({ success: true, count: items.length, data: items });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getItems = getItems;
const getItemById = async (req, res) => {
    try {
        const orgId = req.org?._id;
        const filter = orgId ? { _id: req.params.id, companyId: orgId } : { _id: req.params.id };
        const item = await Item_1.default.findOne(filter).lean();
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.json({ success: true, data: item });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getItemById = getItemById;
const createItem = async (req, res) => {
    try {
        const orgId = req.org?._id;
        const payload = {
            ...req.body,
            companyId: orgId || req.body.companyId,
            orgId: orgId || req.body.orgId,
            createdBy: req.user?._id
        };
        const item = new Item_1.default(payload);
        await item.save();
        res.status(201).json({ success: true, data: item });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createItem = createItem;
const updateItem = async (req, res) => {
    try {
        const orgId = req.org?._id;
        const filter = orgId ? { _id: req.params.id, companyId: orgId } : { _id: req.params.id };
        const item = await Item_1.default.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.json({ success: true, data: item });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateItem = updateItem;
const deleteItem = async (req, res) => {
    try {
        const orgId = req.org?._id;
        const filter = orgId ? { _id: req.params.id, companyId: orgId } : { _id: req.params.id };
        const item = await Item_1.default.findOneAndDelete(filter);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.json({ success: true, message: 'Item deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteItem = deleteItem;
