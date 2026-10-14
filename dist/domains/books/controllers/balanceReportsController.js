"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorBalances = exports.getCustomerBalances = void 0;
const Invoice_1 = __importDefault(require("../../billing/models/Invoice"));
const Bill_1 = __importDefault(require("../../inventory/models/Bill"));
const Customer_1 = __importDefault(require("../../billing/models/Customer"));
const Vendor_1 = __importDefault(require("../../inventory/models/Vendor"));
const context_1 = require("../../../context");
const getCustomerBalances = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId;
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing orgId' });
        // Find non-draft unpaid or partially paid invoices
        const invoices = await Invoice_1.default.find({ status: { $in: ['Sent', 'Overdue', 'PartiallyPaid'] } }).lean();
        const customers = await Customer_1.default.find({}).lean();
        const balances = {};
        invoices.forEach(inv => {
            const custId = inv.customer ? inv.customer.toString() : 'Unknown';
            if (!balances[custId])
                balances[custId] = { totalInvoiced: 0, balanceAmount: 0 };
            balances[custId].totalInvoiced += (inv.total || 0);
            balances[custId].balanceAmount += (inv.balanceDue || inv.total || 0);
        });
        const reportLines = Object.keys(balances).map(custId => {
            const cust = customers.find(c => c._id.toString() === custId);
            return {
                customerId: custId,
                customerName: cust ? cust.displayName : 'Unknown Customer',
                balanceAmount: balances[custId].balanceAmount
            };
        }).filter(row => row.balanceAmount > 0);
        reportLines.sort((a, b) => b.balanceAmount - a.balanceAmount);
        res.status(200).json({ success: true, data: reportLines });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerBalances = getCustomerBalances;
const getVendorBalances = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId;
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing orgId' });
        // Find non-draft unpaid or partially paid bills
        const bills = await Bill_1.default.find({ status: { $in: ['Open', 'Overdue', 'Partially Paid'] } }).lean();
        const vendors = await Vendor_1.default.find({}).lean();
        const balances = {};
        bills.forEach(bill => {
            const vendorId = bill.vendorId ? bill.vendorId.toString() : 'Unknown';
            if (!balances[vendorId])
                balances[vendorId] = { balanceAmount: 0 };
            balances[vendorId].balanceAmount += (bill.balanceDue || bill.total || 0);
        });
        const reportLines = Object.keys(balances).map(vendorId => {
            const vendor = vendors.find(v => v._id.toString() === vendorId);
            return {
                vendorId: vendorId,
                vendorName: vendor ? vendor.displayName : 'Unknown Vendor',
                balanceAmount: balances[vendorId].balanceAmount
            };
        }).filter(row => row.balanceAmount > 0);
        reportLines.sort((a, b) => b.balanceAmount - a.balanceAmount);
        res.status(200).json({ success: true, data: reportLines });
    }
    catch (error) {
        next(error);
    }
};
exports.getVendorBalances = getVendorBalances;
