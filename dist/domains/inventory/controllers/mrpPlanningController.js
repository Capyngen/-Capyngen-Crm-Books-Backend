"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeMRPOrders = exports.getMRPPlan = void 0;
const MrpPlanningService_1 = require("../services/MrpPlanningService");
const context_1 = require("../../../context");
const getOrgId = (req) => {
    return String(req.org?._id || req.headers?.['x-org-id'] || context_1.requestContext.getStore()?.orgId || 'default-org');
};
const getMRPPlan = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const plan = await MrpPlanningService_1.MrpPlanningService.calculateMRP(orgId);
        res.json(plan);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error generating MRP plan' });
    }
};
exports.getMRPPlan = getMRPPlan;
const executeMRPOrders = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { workOrderIds = [], purchaseOrderIds = [] } = req.body;
        const result = await MrpPlanningService_1.MrpPlanningService.generateOrders(orgId, {
            workOrderIds,
            purchaseOrderIds
        });
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Error executing MRP orders' });
    }
};
exports.executeMRPOrders = executeMRPOrders;
