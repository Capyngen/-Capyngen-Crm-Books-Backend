"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardData = void 0;
const Invoice_1 = __importDefault(require("../../billing/models/Invoice"));
const Bill_1 = __importDefault(require("../../inventory/models/Bill"));
const ChartOfAccount_1 = require("../models/ChartOfAccount");
const getDashboardData = async (req, res) => {
    try {
        const invoices = await Invoice_1.default.find().lean();
        const bills = await Bill_1.default.find().lean();
        const watchlistedAccounts = await ChartOfAccount_1.ChartOfAccount.find({ addToWatchlist: true, status: 'Active' }).lean();
        let totalReceivables = 0;
        let totalIncome = 0;
        invoices.forEach(i => {
            if (i.balanceDue)
                totalReceivables += i.balanceDue;
            if (i.total)
                totalIncome += i.total;
        });
        let totalPayables = 0;
        bills.forEach(b => {
            if (b.totalAmount)
                totalPayables += b.totalAmount;
        });
        res.json({
            success: true,
            data: {
                totalReceivables,
                totalPayables,
                totalIncome,
                watchlist: watchlistedAccounts
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getDashboardData = getDashboardData;
