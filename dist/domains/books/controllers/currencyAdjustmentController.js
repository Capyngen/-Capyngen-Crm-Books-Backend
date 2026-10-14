"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCurrencyAdjustment = exports.updateCurrencyAdjustment = exports.createCurrencyAdjustment = exports.getCurrencyAdjustmentById = exports.getCurrencyAdjustments = void 0;
const CurrencyAdjustment_1 = __importDefault(require("../models/CurrencyAdjustment"));
const getCurrencyAdjustments = async (req, res) => {
    try {
        const adjustments = await CurrencyAdjustment_1.default.find().sort({ date: -1, createdAt: -1 });
        res.json(adjustments);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getCurrencyAdjustments = getCurrencyAdjustments;
const getCurrencyAdjustmentById = async (req, res) => {
    try {
        const adjustment = await CurrencyAdjustment_1.default.findById(req.params.id);
        if (!adjustment)
            return res.status(404).json({ message: 'Not found' });
        res.json(adjustment);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getCurrencyAdjustmentById = getCurrencyAdjustmentById;
const createCurrencyAdjustment = async (req, res) => {
    try {
        const adjustment = new CurrencyAdjustment_1.default(req.body);
        const saved = await adjustment.save();
        res.status(201).json(saved);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Bad Request' });
    }
};
exports.createCurrencyAdjustment = createCurrencyAdjustment;
const updateCurrencyAdjustment = async (req, res) => {
    try {
        const updated = await CurrencyAdjustment_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated)
            return res.status(404).json({ message: 'Not found' });
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Bad Request' });
    }
};
exports.updateCurrencyAdjustment = updateCurrencyAdjustment;
const deleteCurrencyAdjustment = async (req, res) => {
    try {
        const deleted = await CurrencyAdjustment_1.default.findByIdAndDelete(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteCurrencyAdjustment = deleteCurrencyAdjustment;
