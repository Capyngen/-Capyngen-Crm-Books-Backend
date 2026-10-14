"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReceivableDetails = exports.getReceivableSummary = exports.getQuoteItemDetailsReport = exports.getQuoteDetailsReport = exports.getDeliveryChallanDetailsReport = exports.getSalesOrderDetailsReport = exports.getARAgingDetails = exports.getInvoiceDetails = exports.getReceivablesAging = void 0;
const context_1 = require("../../../context");
const advancedReportsService_1 = require("../services/advancedReportsService");
const getReceivablesAging = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getARAgingSummary(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getReceivablesAging = getReceivablesAging;
const getInvoiceDetails = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getInvoiceDetails(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getInvoiceDetails = getInvoiceDetails;
const getARAgingDetails = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getARAgingDetails(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getARAgingDetails = getARAgingDetails;
const getSalesOrderDetailsReport = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getSalesOrderDetails(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getSalesOrderDetailsReport = getSalesOrderDetailsReport;
const getDeliveryChallanDetailsReport = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getDeliveryChallanDetails(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getDeliveryChallanDetailsReport = getDeliveryChallanDetailsReport;
const getQuoteDetailsReport = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getQuoteDetails(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getQuoteDetailsReport = getQuoteDetailsReport;
const getQuoteItemDetailsReport = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getQuoteItemDetails(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getQuoteItemDetailsReport = getQuoteItemDetailsReport;
const getReceivableSummary = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getCustomerBalances(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getReceivableSummary = getReceivableSummary;
const getReceivableDetails = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getReceivableDetails(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getReceivableDetails = getReceivableDetails;
