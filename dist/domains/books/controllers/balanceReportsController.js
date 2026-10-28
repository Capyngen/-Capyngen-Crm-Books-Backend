"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorBalances = exports.getCustomerBalances = void 0;
const reportsController_1 = require("./reportsController");
const advancedReportsService_1 = require("../services/advancedReportsService");
const getCustomerBalances = async (req, res, next) => {
    try {
        const orgId = await (0, reportsController_1.extractOrgId)(req);
        const data = await advancedReportsService_1.AdvancedReportsService.getCustomerBalances(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerBalances = getCustomerBalances;
const getVendorBalances = async (req, res, next) => {
    try {
        const orgId = await (0, reportsController_1.extractOrgId)(req);
        const data = await advancedReportsService_1.AdvancedReportsService.getVendorBalances(orgId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getVendorBalances = getVendorBalances;
