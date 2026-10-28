"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPurchasesByItem = exports.getPurchasesByVendor = exports.getExpenseDetails = exports.getExpensesByCategory = void 0;
const advancedReportsService_1 = require("../services/advancedReportsService");
const reportsController_1 = require("./reportsController");
const getExpensesByCategory = async (req, res, next) => {
    try {
        const orgId = await (0, reportsController_1.extractOrgId)(req);
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
        const orgId = await (0, reportsController_1.extractOrgId)(req);
        const data = await advancedReportsService_1.AdvancedReportsService.getExpenseDetails(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getExpenseDetails = getExpenseDetails;
const getPurchasesByVendor = async (req, res, next) => {
    try {
        const orgId = await (0, reportsController_1.extractOrgId)(req);
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
        const orgId = await (0, reportsController_1.extractOrgId)(req);
        const data = await advancedReportsService_1.AdvancedReportsService.getPurchasesByItem(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getPurchasesByItem = getPurchasesByItem;
