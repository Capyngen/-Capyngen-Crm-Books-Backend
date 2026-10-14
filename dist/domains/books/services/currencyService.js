"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyService = void 0;
const OrganizationSettings_1 = __importDefault(require("../models/OrganizationSettings"));
const ExchangeRate_1 = __importDefault(require("../models/ExchangeRate"));
const CurrencyAdjustment_1 = __importDefault(require("../models/CurrencyAdjustment"));
const Invoice_1 = __importDefault(require("../../billing/models/Invoice"));
const Bill_1 = __importDefault(require("../../inventory/models/Bill"));
const ledgerService_1 = require("./ledgerService");
class CurrencyService {
    static async getInvoiceCurrentBaseBalance(invoiceId) {
        const inv = await Invoice_1.default.findById(invoiceId).lean();
        if (!inv)
            return 0;
        // Original base value of the UNPAID portion?
        // Wait, let's just get the total current base value of the remaining foreign balance.
        // Every time an adjustment runs, it records the newBaseValue of the remaining foreign balance.
        // So the easiest way is to find the MOST RECENT CurrencyAdjustment for this invoice.
        const latestAdj = await CurrencyAdjustment_1.default.findOne({ 'details.transactionId': invoiceId.toString() }).sort({ adjustmentDate: -1 }).lean();
        let currentBaseBalance = 0;
        if (latestAdj) {
            const detail = latestAdj.details.find((d) => d.transactionId === invoiceId.toString());
            currentBaseBalance = detail.newBaseValue;
        }
        else {
            // No adjustments yet, use original rate
            const foreignBalance = (inv.total || 0) - (inv.amountPaid || 0);
            currentBaseBalance = foreignBalance * (inv.exchangeRate || 1);
        }
        return currentBaseBalance;
    }
    static async getBaseCurrency(orgId) {
        const settings = await OrganizationSettings_1.default.findOne({ orgId }).lean();
        return settings?.baseCurrency || 'INR'; // Fallback only if settings missing
    }
    static async getExchangeRate(orgId, currency, date) {
        const rateDoc = await ExchangeRate_1.default.findOne({ orgId, currency, effectiveDate: { $lte: date } })
            .sort({ effectiveDate: -1 })
            .lean();
        return rateDoc?.rate || 1;
    }
    static async runCurrencyAdjustment(orgId, currency, adjustmentDate, newExchangeRate) {
        // 1. Save new rate
        await ExchangeRate_1.default.create({ orgId, currency, effectiveDate: adjustmentDate, rate: newExchangeRate });
        const baseCurrency = await this.getBaseCurrency(orgId);
        // 2. Fetch Open Invoices (AR)
        const openInvoices = await Invoice_1.default.find({ orgId, currency, status: { $ne: 'Draft' } }).lean();
        // 3. Fetch Open Bills (AP)
        const openBills = await Bill_1.default.find({ orgId, currency, status: { $ne: 'Draft' } }).lean();
        let totalGainOrLoss = 0;
        const details = [];
        const glLines = [];
        // Process AR
        for (const inv of openInvoices) {
            // In Zoho, you only revalue the unpaid portion
            const amountPaid = inv.amountPaid || 0; // naive for now, or just use balanceDue if exists
            const foreignBalance = (inv.total || 0) - amountPaid;
            if (foreignBalance > 0) {
                const oldBaseValue = foreignBalance * (inv.exchangeRate || 1);
                const newBaseValue = foreignBalance * newExchangeRate;
                const gainOrLoss = newBaseValue - oldBaseValue; // Higher rate = more base currency = Gain for AR
                if (gainOrLoss !== 0) {
                    totalGainOrLoss += gainOrLoss;
                    details.push({
                        transactionId: inv._id.toString(),
                        transactionType: 'Invoice',
                        foreignBalance,
                        oldBaseValue,
                        newBaseValue,
                        gainOrLoss
                    });
                    if (gainOrLoss > 0) {
                        glLines.push({ accountId: 'Accounts Receivable', debit: gainOrLoss, contactId: inv.customer?.toString() });
                        glLines.push({ accountId: 'Unrealized Exchange Gain/Loss', credit: gainOrLoss });
                    }
                    else {
                        glLines.push({ accountId: 'Unrealized Exchange Gain/Loss', debit: Math.abs(gainOrLoss) });
                        glLines.push({ accountId: 'Accounts Receivable', credit: Math.abs(gainOrLoss), contactId: inv.customer?.toString() });
                    }
                }
            }
        }
        // Process AP
        for (const bill of openBills) {
            const foreignBalance = (bill.totalAmount || 0); // simplifed
            if (foreignBalance > 0) {
                const oldBaseValue = foreignBalance * (bill.exchangeRate || 1);
                const newBaseValue = foreignBalance * newExchangeRate;
                // For AP, higher rate = owe more base currency = Loss
                const gainOrLoss = oldBaseValue - newBaseValue;
                if (gainOrLoss !== 0) {
                    totalGainOrLoss += gainOrLoss;
                    details.push({
                        transactionId: bill._id.toString(),
                        transactionType: 'Bill',
                        foreignBalance,
                        oldBaseValue,
                        newBaseValue,
                        gainOrLoss
                    });
                    if (gainOrLoss > 0) {
                        // Gain means newBaseValue is lower, so AP goes down
                        glLines.push({ accountId: 'Accounts Payable', debit: gainOrLoss });
                        glLines.push({ accountId: 'Unrealized Exchange Gain/Loss', credit: gainOrLoss });
                    }
                    else {
                        glLines.push({ accountId: 'Unrealized Exchange Gain/Loss', debit: Math.abs(gainOrLoss) });
                        glLines.push({ accountId: 'Accounts Payable', credit: Math.abs(gainOrLoss) });
                    }
                }
            }
        }
        // Generate Adjustment Record
        const adjustment = await CurrencyAdjustment_1.default.create({
            orgId,
            adjustmentDate,
            adjustedCurrency: currency,
            newExchangeRate,
            totalGainOrLoss,
            details
        });
        // Post GL Impact
        if (glLines.length > 0) {
            await ledgerService_1.LedgerService.postTransaction(orgId, adjustment._id.toString(), 'CurrencyAdjustment', adjustmentDate, glLines);
        }
        return adjustment;
    }
}
exports.CurrencyService = CurrencyService;
