"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayableDetails = exports.getPayableSummary = exports.getPurchaseOrderByItem = exports.getPurchaseOrdersByVendor = exports.getPayablesRefundHistory = exports.getVendorCreditDetailsReport = exports.getAPAgingDetails = exports.getPurchaseOrderDetails = exports.getPayablesAging = void 0;
const reportsController_1 = require("./reportsController");
const advancedReportsService_1 = require("../services/advancedReportsService");
const getPayablesAging = async (req, res, next) => {
    try {
        const orgId = await (0, reportsController_1.extractOrgId)(req);
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
        const orgId = await (0, reportsController_1.extractOrgId)(req);
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
        const orgId = await (0, reportsController_1.extractOrgId)(req);
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
        const orgId = await (0, reportsController_1.extractOrgId)(req);
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
        const orgId = await (0, reportsController_1.extractOrgId)(req);
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
        const orgId = await (0, reportsController_1.extractOrgId)(req);
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
        const orgId = await (0, reportsController_1.extractOrgId)(req);
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
        const orgId = await (0, reportsController_1.extractOrgId)(req);
        const data = await advancedReportsService_1.AdvancedReportsService.getPayableSummary(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getPayableSummary = getPayableSummary;
const getPayableDetails = async (req, res, next) => {
    try {
        const orgId = await (0, reportsController_1.extractOrgId)(req);
        const data = await advancedReportsService_1.AdvancedReportsService.getPayableDetails(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getPayableDetails = getPayableDetails;
