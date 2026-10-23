import { Request, Response, NextFunction } from 'express';
import { extractOrgId } from './reportsController';
import { AdvancedReportsService } from '../services/advancedReportsService';

export const getSalesByCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getSalesByCustomer(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getSalesByItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getSalesByItem(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};


export const getSalesBySalesPerson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await AdvancedReportsService.getSalesBySalesPerson(orgId, startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};


export const getSalesSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await AdvancedReportsService.getSalesSummaryByDate(orgId, startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};


export const getProfitByItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await AdvancedReportsService.getProfitByItem(orgId, startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};


export const getSalesChannelSync = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getSalesChannelSyncSummary(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
