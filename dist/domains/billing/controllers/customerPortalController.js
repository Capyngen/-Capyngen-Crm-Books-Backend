"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpenInvoices = exports.getStatementOfAccount = exports.getSecurePortalLink = void 0;
const CustomerPortalService_1 = require("../../billing/services/CustomerPortalService");
const getSecurePortalLink = async (req, res) => {
    try {
        const link = await CustomerPortalService_1.CustomerPortalService.generateSecurePortalLink(req.params.customerId);
        res.status(200).json({ success: true, link });
    }
    catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};
exports.getSecurePortalLink = getSecurePortalLink;
const getStatementOfAccount = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const soa = await CustomerPortalService_1.CustomerPortalService.getStatementOfAccount(req.params.customerId, new Date(startDate), new Date(endDate));
        res.status(200).json({ success: true, data: soa });
    }
    catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};
exports.getStatementOfAccount = getStatementOfAccount;
const getOpenInvoices = async (req, res) => {
    try {
        const invoices = await CustomerPortalService_1.CustomerPortalService.getOpenInvoices(req.params.customerId);
        res.status(200).json({ success: true, data: invoices });
    }
    catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};
exports.getOpenInvoices = getOpenInvoices;
