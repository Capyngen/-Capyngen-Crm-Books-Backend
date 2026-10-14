"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuote = exports.updateQuote = exports.getQuoteById = exports.getQuotes = exports.createQuote = void 0;
const context_1 = require("../../../context");
const Quote_1 = __importDefault(require("../models/Quote"));
const createQuote = async (req, res, next) => {
    try {
        let quoteNumber = req.body.quoteNumber;
        if (!quoteNumber) {
            let nextNum = (await Quote_1.default.countDocuments()) + 1;
            let isUnique = false;
            while (!isUnique) {
                quoteNumber = `QUO-${String(nextNum).padStart(5, '0')}`;
                const exists = await Quote_1.default.findOne({ quoteNumber });
                if (exists) {
                    nextNum++;
                }
                else {
                    isUnique = true;
                }
            }
        }
        const quote = await Quote_1.default.create({ ...req.body, quoteNumber, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || req.body.companyId, createdBy: req.user?._id });
        const populated = await Quote_1.default.findById(quote._id).populate('customer').populate('items.item');
        res.status(201).json({ success: true, data: populated });
    }
    catch (error) {
        next(error);
    }
};
exports.createQuote = createQuote;
const getQuotes = async (req, res, next) => {
    try {
        const quotes = await Quote_1.default.find({ companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } })
            .populate('customer')
            .populate('items.item')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: quotes.length, data: quotes });
    }
    catch (error) {
        next(error);
    }
};
exports.getQuotes = getQuotes;
const getQuoteById = async (req, res, next) => {
    try {
        const quote = await Quote_1.default.findOne({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } })
            .populate('customer')
            .populate('items.item');
        if (!quote)
            return res.status(404).json({ success: false, message: 'Quote not found' });
        res.status(200).json({ success: true, data: quote });
    }
    catch (error) {
        next(error);
    }
};
exports.getQuoteById = getQuoteById;
const updateQuote = async (req, res, next) => {
    try {
        const quote = await Quote_1.default.findOneAndUpdate({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } }, req.body, { new: true })
            .populate('customer')
            .populate('items.item');
        if (!quote)
            return res.status(404).json({ success: false, message: 'Quote not found' });
        res.status(200).json({ success: true, data: quote });
    }
    catch (error) {
        next(error);
    }
};
exports.updateQuote = updateQuote;
const deleteQuote = async (req, res, next) => {
    try {
        const quote = await Quote_1.default.findOneAndDelete({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } });
        if (!quote)
            return res.status(404).json({ success: false, message: 'Quote not found' });
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteQuote = deleteQuote;
