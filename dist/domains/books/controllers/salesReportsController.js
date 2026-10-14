"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalesChannelSync = exports.getProfitByItem = exports.getSalesSummary = exports.getSalesBySalesPerson = exports.getSalesByItem = exports.getSalesByCustomer = void 0;
const context_1 = require("../../../context");
const advancedReportsService_1 = require("../services/advancedReportsService");
const getSalesByCustomer = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getSalesByCustomer(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getSalesByCustomer = getSalesByCustomer;
const getSalesByItem = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getSalesByItem(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getSalesByItem = getSalesByItem;
const getSalesBySalesPerson = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
        const data = await advancedReportsService_1.AdvancedReportsService.getSalesBySalesPerson(orgId, startDate, endDate);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getSalesBySalesPerson = getSalesBySalesPerson;
const getSalesSummary = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
        const data = await advancedReportsService_1.AdvancedReportsService.getSalesSummaryByDate(orgId, startDate, endDate);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getSalesSummary = getSalesSummary;
const getProfitByItem = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
        const data = await advancedReportsService_1.AdvancedReportsService.getProfitByItem(orgId, startDate, endDate);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfitByItem = getProfitByItem;
const getSalesChannelSync = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getSalesChannelSyncSummary(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getSalesChannelSync = getSalesChannelSync;
