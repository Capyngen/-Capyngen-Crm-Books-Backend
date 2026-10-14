"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayableDetails = exports.getPayableSummary = exports.getPurchaseOrderByItem = exports.getPurchaseOrdersByVendor = exports.getPayablesRefundHistory = exports.getVendorCreditDetailsReport = exports.getAPAgingDetails = exports.getPurchaseOrderDetails = exports.getPayablesAging = void 0;
const context_1 = require("../../../context");
const advancedReportsService_1 = require("../services/advancedReportsService");
const getPayablesAging = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getAPAgingSummary(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getPayablesAging = getPayablesAging;
const getPurchaseOrderDetails = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getPurchaseOrderDetails(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getPurchaseOrderDetails = getPurchaseOrderDetails;
const getAPAgingDetails = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getAPAgingDetails(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getAPAgingDetails = getAPAgingDetails;
const getVendorCreditDetailsReport = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getVendorCreditDetails(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getVendorCreditDetailsReport = getVendorCreditDetailsReport;
const getPayablesRefundHistory = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getPayablesRefundHistory(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getPayablesRefundHistory = getPayablesRefundHistory;
const getPurchaseOrdersByVendor = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getPurchaseOrdersByVendor(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getPurchaseOrdersByVendor = getPurchaseOrdersByVendor;
const getPurchaseOrderByItem = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getPurchaseOrderByItem(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getPurchaseOrderByItem = getPurchaseOrderByItem;
const getPayableSummary = async (req, res, next) => {
    try {
        // Same as Vendor Balances logically for UI
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        // Let's redirect to standard vendor balances response shape or mock it if needed
        // For simplicity, we can fetch Bills and sum up
        const bills = await require('../models/Bill').default.find({ status: { $ne: 'Draft' } }).populate('vendorId').lean();
        const balances = {};
        for (const bill of bills) {
            const vId = bill.vendorId?._id?.toString() || 'Unknown';
            if (!balances[vId])
                balances[vId] = { vendorName: bill.vendorId?.displayName || 'Unknown', invoiced: 0, received: 0, closingBalance: 0 };
            balances[vId].invoiced += (bill.total || 0);
            balances[vId].received += ((bill.total || 0) - (bill.balanceDue || 0));
            balances[vId].closingBalance += (bill.balanceDue || 0);
        }
        const data = Object.values(balances);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getPayableSummary = getPayableSummary;
const getPayableDetails = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getPayableDetails(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getPayableDetails = getPayableDetails;
