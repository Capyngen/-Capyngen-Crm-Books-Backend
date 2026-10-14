"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPurchasesByItem = exports.getPurchasesByVendor = exports.getExpenseDetails = exports.getExpensesByCategory = void 0;
const advancedReportsService_1 = require("../services/advancedReportsService");
const context_1 = require("../../../context");
const getExpensesByCategory = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getExpensesByCategory(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getExpensesByCategory = getExpensesByCategory;
const getExpenseDetails = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getExpenseDetails(orgId);
        console.log('GET EXPENSE DETAILS FETCHED:', data.length);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        console.log('GET EXPENSE DETAILS ERROR:', error);
        next(error);
    }
};
exports.getExpenseDetails = getExpenseDetails;
const getPurchasesByVendor = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getPurchasesByVendor(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getPurchasesByVendor = getPurchasesByVendor;
const getPurchasesByItem = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
        const data = await advancedReportsService_1.AdvancedReportsService.getPurchasesByItem(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getPurchasesByItem = getPurchasesByItem;
