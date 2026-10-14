"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransactionLock = exports.getTransactionLock = void 0;
const TransactionLock_1 = __importDefault(require("../models/TransactionLock"));
const context_1 = require("../../../context");
// @desc    Get transaction lock configuration
// @route   GET /api/v1/books/accountant/locks
const getTransactionLock = async (req, res, next) => {
    try {
        const store = context_1.requestContext.getStore();
        const orgId = store?.orgId;
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing orgId' });
        let lock = await TransactionLock_1.default.findOne({ orgId });
        if (!lock) {
            lock = await TransactionLock_1.default.create({ orgId });
        }
        res.status(200).json({ success: true, data: lock });
    }
    catch (error) {
        next(error);
    }
};
exports.getTransactionLock = getTransactionLock;
// @desc    Update transaction lock configuration
// @route   PUT /api/v1/books/accountant/locks
const updateTransactionLock = async (req, res, next) => {
    try {
        const store = context_1.requestContext.getStore();
        const orgId = store?.orgId;
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing orgId' });
        const lock = await TransactionLock_1.default.findOneAndUpdate({ orgId }, { ...req.body, lockedBy: req.user?._id || 'System' }, { new: true, upsert: true });
        res.status(200).json({ success: true, data: lock });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTransactionLock = updateTransactionLock;
