import { Request, Response, NextFunction } from 'express';
import { requestContext } from '../../../context';
import { AdvancedReportsService } from '../../books/services/advancedReportsService';

export const getInventorySummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getInventorySummary(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getInventoryValuationSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getInventoryValuation(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getFifoCostLotTracking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getFifoCostLotTracking(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
export const getCommittedStockDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getCommittedStockDetails(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
export const getInventoryAgingSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getInventoryAgingSummary(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
export const getStockSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getStockSummary(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
export const getInventoryAdjustmentSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getInventoryAdjustmentSummary(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
export const getInventoryAdjustmentDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getInventoryAdjustmentDetails(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
export const getInventoryTurnoverByQuantity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getInventoryTurnoverByQuantity(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
export const getABCClassification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getABCClassification(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
export const getInventoryTurnoverByAmount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getInventoryTurnoverByAmount(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
export const getWeightedAverageCostSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getWeightedAverageCostSummary(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
