import { requestContext } from '../../../context';
import { AdvancedReportsService } from '../services/advancedReportsService';

import { Request, Response, NextFunction } from 'express';
export const getProjectSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getProjectSummary(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
export const getTimesheetProfitability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getTimesheetProfitability(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getPaymentsReceivedReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getPaymentsReceivedReport(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getPaymentsMadeReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getPaymentsMadeReport(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
export const getTaxSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getTaxSummary(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
export const getBudgetVsActual = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getBudgetVsActual(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
export const getActivityLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getActivityLog(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
