"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeightedAverageCostSummary = exports.getInventoryTurnoverByAmount = exports.getABCClassification = exports.getInventoryTurnoverByQuantity = exports.getInventoryAdjustmentDetails = exports.getInventoryAdjustmentSummary = exports.getStockSummary = exports.getInventoryAgingSummary = exports.getCommittedStockDetails = exports.getFifoCostLotTracking = exports.getInventoryValuationSummary = exports.getInventorySummary = void 0;
const context_1 = require("../../../context");
const advancedReportsService_1 = require("../../books/services/advancedReportsService");
const getInventorySummary = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getInventorySummary(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getInventorySummary = getInventorySummary;
const getInventoryValuationSummary = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getInventoryValuation(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getInventoryValuationSummary = getInventoryValuationSummary;
const getFifoCostLotTracking = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getFifoCostLotTracking(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getFifoCostLotTracking = getFifoCostLotTracking;
const getCommittedStockDetails = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getCommittedStockDetails(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getCommittedStockDetails = getCommittedStockDetails;
const getInventoryAgingSummary = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getInventoryAgingSummary(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getInventoryAgingSummary = getInventoryAgingSummary;
const getStockSummary = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getStockSummary(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getStockSummary = getStockSummary;
const getInventoryAdjustmentSummary = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getInventoryAdjustmentSummary(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getInventoryAdjustmentSummary = getInventoryAdjustmentSummary;
const getInventoryAdjustmentDetails = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getInventoryAdjustmentDetails(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getInventoryAdjustmentDetails = getInventoryAdjustmentDetails;
const getInventoryTurnoverByQuantity = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getInventoryTurnoverByQuantity(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getInventoryTurnoverByQuantity = getInventoryTurnoverByQuantity;
const getABCClassification = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getABCClassification(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getABCClassification = getABCClassification;
const getInventoryTurnoverByAmount = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getInventoryTurnoverByAmount(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getInventoryTurnoverByAmount = getInventoryTurnoverByAmount;
const getWeightedAverageCostSummary = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getWeightedAverageCostSummary(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getWeightedAverageCostSummary = getWeightedAverageCostSummary;
