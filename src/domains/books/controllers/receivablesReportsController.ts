import { Request, Response, NextFunction } from 'express';
import { requestContext } from '../../../context';
import { AdvancedReportsService } from '../services/advancedReportsService';

export const getReceivablesAging = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getARAgingSummary(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getInvoiceDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getInvoiceDetails(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};


export const getARAgingDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getARAgingDetails(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getSalesOrderDetailsReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getSalesOrderDetails(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getDeliveryChallanDetailsReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getDeliveryChallanDetails(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getQuoteDetailsReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getQuoteDetails(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getQuoteItemDetailsReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getQuoteItemDetails(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
export const getReceivableSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getCustomerBalances(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getReceivableDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getReceivableDetails(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
