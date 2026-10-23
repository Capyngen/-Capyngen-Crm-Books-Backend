import { Request, Response, NextFunction } from 'express';
import { extractOrgId } from './reportsController';
import { AdvancedReportsService } from '../services/advancedReportsService';

export const getPayablesAging = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getAPAgingSummary(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getPurchaseOrderDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getPurchaseOrderDetails(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getAPAgingDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getAPAgingDetails(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getVendorCreditDetailsReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getVendorCreditDetails(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getPayablesRefundHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getPayablesRefundHistory(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getPurchaseOrdersByVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getPurchaseOrdersByVendor(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getPurchaseOrderByItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getPurchaseOrderByItem(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getPayableSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getPayableSummary(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getPayableDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getPayableDetails(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
