"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivityLog = exports.getBudgetVsActual = exports.getTaxSummary = exports.getPaymentsMadeReport = exports.getPaymentsReceivedReport = exports.getTimesheetProfitability = exports.getProjectSummary = void 0;
const context_1 = require("../../../context");
const advancedReportsService_1 = require("../services/advancedReportsService");
const getProjectSummary = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getProjectSummary(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getProjectSummary = getProjectSummary;
const getTimesheetProfitability = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getTimesheetProfitability(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getTimesheetProfitability = getTimesheetProfitability;
const getPaymentsReceivedReport = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getPaymentsReceivedReport(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getPaymentsReceivedReport = getPaymentsReceivedReport;
const getPaymentsMadeReport = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getPaymentsMadeReport(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getPaymentsMadeReport = getPaymentsMadeReport;
const getTaxSummary = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getTaxSummary(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getTaxSummary = getTaxSummary;
const getBudgetVsActual = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getBudgetVsActual(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getBudgetVsActual = getBudgetVsActual;
const getActivityLog = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getActivityLog(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getActivityLog = getActivityLog;
