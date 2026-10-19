"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTdsReturn = exports.getGSTR3B = exports.getGSTR2B = exports.getGSTR1 = void 0;
const GstComplianceService_1 = require("../services/GstComplianceService");
const getOrgId = (req) => {
    return String(req.org?._id || req.headers?.['x-org-id'] || 'default-org');
};
const getGSTR1 = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const month = req.query.month ? Number(req.query.month) : undefined;
        const year = req.query.year ? Number(req.query.year) : undefined;
        const data = await GstComplianceService_1.GstComplianceService.getGSTR1Summary(orgId, month, year);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error generating GSTR-1 summary' });
    }
};
exports.getGSTR1 = getGSTR1;
const getGSTR2B = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const month = req.query.month ? Number(req.query.month) : undefined;
        const year = req.query.year ? Number(req.query.year) : undefined;
        const data = await GstComplianceService_1.GstComplianceService.getGSTR2BITCReconciliation(orgId, month, year);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error generating GSTR-2B reconciliation' });
    }
};
exports.getGSTR2B = getGSTR2B;
const getGSTR3B = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const month = req.query.month ? Number(req.query.month) : undefined;
        const year = req.query.year ? Number(req.query.year) : undefined;
        const data = await GstComplianceService_1.GstComplianceService.getGSTR3BSummary(orgId, month, year);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error generating GSTR-3B summary' });
    }
};
exports.getGSTR3B = getGSTR3B;
const getTdsReturn = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const quarter = req.query.quarter ? Number(req.query.quarter) : undefined;
        const year = req.query.year ? Number(req.query.year) : undefined;
        const data = await GstComplianceService_1.GstComplianceService.getTdsForm26QSummary(orgId, quarter, year);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error generating TDS return summary' });
    }
};
exports.getTdsReturn = getTdsReturn;
