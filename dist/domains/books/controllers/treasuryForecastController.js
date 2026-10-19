"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCashForecast = void 0;
const TreasuryForecastService_1 = require("../services/TreasuryForecastService");
const getOrgId = (req) => {
    return String(req.org?._id || req.headers?.['x-org-id'] || 'default-org');
};
const getCashForecast = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const horizon = Number(req.query.days) || 90;
        const forecast = await TreasuryForecastService_1.TreasuryForecastService.getTreasuryForecast(orgId, horizon);
        res.json(forecast);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error generating cash forecast' });
    }
};
exports.getCashForecast = getCashForecast;
