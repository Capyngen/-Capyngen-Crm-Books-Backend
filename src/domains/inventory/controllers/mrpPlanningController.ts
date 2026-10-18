import { Request, Response } from 'express';
import { MrpPlanningService } from '../services/MrpPlanningService';
import { requestContext } from '../../../context';

const getOrgId = (req: any): string => {
  return String(req.org?._id || req.headers?.['x-org-id'] || requestContext.getStore()?.orgId || 'default-org');
};

export const getMRPPlan = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const plan = await MrpPlanningService.calculateMRP(orgId);
    res.json(plan);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error generating MRP plan' });
  }
};

export const executeMRPOrders = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { workOrderIds = [], purchaseOrderIds = [] } = req.body;

    const result = await MrpPlanningService.generateOrders(orgId, {
      workOrderIds,
      purchaseOrderIds
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error executing MRP orders' });
  }
};
