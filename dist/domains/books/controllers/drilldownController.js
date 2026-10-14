"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDrilldown = void 0;
const context_1 = require("../../../context");
const Invoice_1 = __importDefault(require("../../billing/models/Invoice"));
const Bill_1 = __importDefault(require("../../inventory/models/Bill"));
const Expense_1 = __importDefault(require("../models/Expense"));
const getDrilldown = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId;
        const { accountId, customerId, vendorId, type } = req.query;
        let results = [];
        if (customerId) {
            const invoices = await Invoice_1.default.find({ orgId, customer: customerId }).populate('customer');
            results = invoices.map((inv) => ({
                _id: inv._id,
                date: inv.invoiceDate,
                transactionNumber: inv.invoiceNumber,
                sourceType: 'Invoice',
                sourceId: inv._id,
                partyName: inv.customer?.displayName || inv.customer?.companyName,
                amount: inv.total
            }));
        }
        else if (vendorId) {
            const bills = await Bill_1.default.find({ orgId, vendor: vendorId }).populate('vendor');
            results = bills.map((bill) => ({
                _id: bill._id,
                date: bill.billDate,
                transactionNumber: bill.billNumber,
                sourceType: 'Bill',
                sourceId: bill._id,
                partyName: bill.vendor?.displayName || bill.vendor?.companyName,
                amount: bill.total
            }));
        }
        else if (accountId) {
            const expenses = await Expense_1.default.find({ orgId, expenseAccount: accountId }).populate('vendor customer');
            results = expenses.map((exp) => ({
                _id: exp._id,
                date: exp.date,
                transactionNumber: exp.expenseNumber,
                sourceType: 'Expense',
                sourceId: exp._id,
                partyName: exp.vendor?.displayName || exp.vendor?.companyName || exp.customer?.name || '-',
                amount: exp.amount
            }));
        }
        results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        res.status(200).json({ success: true, data: results });
    }
    catch (error) {
        next(error);
    }
};
exports.getDrilldown = getDrilldown;
