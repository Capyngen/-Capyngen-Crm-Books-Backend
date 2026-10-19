"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCurrencyAdjustment = exports.updateCurrencyAdjustment = exports.getOpenForeignBalances = exports.createCurrencyAdjustment = exports.getCurrencyAdjustmentById = exports.getCurrencyAdjustments = void 0;
const CurrencyAdjustment_1 = __importDefault(require("../models/CurrencyAdjustment"));
const currencyService_1 = require("../services/currencyService");
const Invoice_1 = __importDefault(require("../../billing/models/Invoice"));
const Bill_1 = __importDefault(require("../../inventory/models/Bill"));
const getOrgId = (req) => {
    return String(req.org?._id || req.headers?.['x-org-id'] || 'default-org');
};
const getCurrencyAdjustments = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const adjustments = await CurrencyAdjustment_1.default.find({ orgId }).sort({ adjustmentDate: -1, createdAt: -1 });
        res.json(adjustments);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
exports.getCurrencyAdjustments = getCurrencyAdjustments;
const getCurrencyAdjustmentById = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const adjustment = await CurrencyAdjustment_1.default.findOne({ _id: req.params.id, orgId });
        if (!adjustment)
            return res.status(404).json({ message: 'Adjustment not found' });
        res.json(adjustment);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
exports.getCurrencyAdjustmentById = getCurrencyAdjustmentById;
const createCurrencyAdjustment = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { currency, adjustmentDate, newExchangeRate } = req.body;
        if (!currency || !newExchangeRate) {
            return res.status(400).json({ message: 'Currency and newExchangeRate are required' });
        }
        const date = new Date(adjustmentDate || Date.now());
        const rate = Number(newExchangeRate);
        // Run enterprise forex revaluation service:
        // Calculates unrealized gain/loss on all open AR invoices & AP bills, saves CurrencyAdjustment doc, and posts to GL
        const adjustment = await currencyService_1.CurrencyService.runCurrencyAdjustment(orgId, currency, date, rate);
        res.status(201).json({
            success: true,
            message: `Forex adjustment completed for ${currency} at rate ${rate}`,
            adjustment
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Error processing currency adjustment' });
    }
};
exports.createCurrencyAdjustment = createCurrencyAdjustment;
const getOpenForeignBalances = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { currency, proposedRate } = req.query;
        const baseCurrency = await currencyService_1.CurrencyService.getBaseCurrency(orgId);
        const filterCurrency = currency ? String(currency) : { $ne: baseCurrency };
        // Fetch open invoices
        const openInvoices = await Invoice_1.default.find({
            orgId,
            currency: filterCurrency,
            status: { $in: ['Sent', 'Partially Paid', 'Overdue'] }
        }).select('invoiceNumber customer total amountPaid exchangeRate currency dueDate').lean();
        // Fetch open bills
        const openBills = await Bill_1.default.find({
            orgId,
            currency: filterCurrency,
            status: { $in: ['Open', 'Partially Paid', 'Overdue'] }
        }).select('billNumber vendor totalAmount paidAmount exchangeRate currency dueDate').lean();
        const rate = Number(proposedRate) || 0;
        const previewInvoices = openInvoices.map((inv) => {
            const foreignBalance = (inv.total || 0) - (inv.amountPaid || 0);
            const currentBaseValue = foreignBalance * (inv.exchangeRate || 1);
            const revaluedBaseValue = rate > 0 ? foreignBalance * rate : currentBaseValue;
            const unrealizedGainLoss = revaluedBaseValue - currentBaseValue;
            return {
                _id: inv._id,
                docType: 'Invoice',
                docNumber: inv.invoiceNumber,
                currency: inv.currency,
                foreignBalance,
                bookingRate: inv.exchangeRate || 1,
                currentBaseValue,
                revaluedBaseValue,
                unrealizedGainLoss
            };
        });
        const previewBills = openBills.map((bill) => {
            const foreignBalance = (bill.totalAmount || 0) - (bill.paidAmount || 0);
            const currentBaseValue = foreignBalance * (bill.exchangeRate || 1);
            const revaluedBaseValue = rate > 0 ? foreignBalance * rate : currentBaseValue;
            // For AP, increase in base cost = loss
            const unrealizedGainLoss = currentBaseValue - revaluedBaseValue;
            return {
                _id: bill._id,
                docType: 'Bill',
                docNumber: bill.billNumber,
                currency: bill.currency,
                foreignBalance,
                bookingRate: bill.exchangeRate || 1,
                currentBaseValue,
                revaluedBaseValue,
                unrealizedGainLoss
            };
        });
        const totalProjectedGainLoss = [...previewInvoices, ...previewBills].reduce((sum, item) => sum + item.unrealizedGainLoss, 0);
        res.json({
            baseCurrency,
            currency: currency || 'All Foreign',
            proposedRate: rate,
            totalProjectedGainLoss,
            openInvoices: previewInvoices,
            openBills: previewBills
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching foreign balances' });
    }
};
exports.getOpenForeignBalances = getOpenForeignBalances;
const updateCurrencyAdjustment = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const updated = await CurrencyAdjustment_1.default.findOneAndUpdate({ _id: req.params.id, orgId }, req.body, { new: true });
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
        const orgId = getOrgId(req);
        const deleted = await CurrencyAdjustment_1.default.findOneAndDelete({ _id: req.params.id, orgId });
        if (!deleted)
            return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
exports.deleteCurrencyAdjustment = deleteCurrencyAdjustment;
