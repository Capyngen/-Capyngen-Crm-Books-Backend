import { AdvancedReportsService } from '../services/advancedReportsService';
import { Request, Response, NextFunction } from 'express';
import { extractOrgId } from './reportsController';

export const getExpensesByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getExpensesByCategory(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getExpenseDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getExpenseDetails(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { 
    next(error); 
  }
};

export const getPurchasesByVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getPurchasesByVendor(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getPurchasesByItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getPurchasesByItem(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
