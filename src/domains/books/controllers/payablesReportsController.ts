import { Request, Response, NextFunction } from 'express';
import { requestContext } from '../../../context';
import { AdvancedReportsService } from '../services/advancedReportsService';

export const getPayablesAging = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getAPAgingSummary(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};


export const getPurchaseOrderDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getPurchaseOrderDetails(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getAPAgingDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getAPAgingDetails(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getVendorCreditDetailsReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getVendorCreditDetails(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getPayablesRefundHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getPayablesRefundHistory(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getPurchaseOrdersByVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getPurchaseOrdersByVendor(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getPurchaseOrderByItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getPurchaseOrderByItem(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getPayableSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Same as Vendor Balances logically for UI
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    // Let's redirect to standard vendor balances response shape or mock it if needed
    // For simplicity, we can fetch Bills and sum up
    const bills = await require('../models/Bill').default.find({ status: { $ne: 'Draft' } }).populate('vendorId').lean();
    const balances: Record<string, any> = {};
    for (const bill of bills) {
        const vId = (bill.vendorId as any)?._id?.toString() || 'Unknown';
        if(!balances[vId]) balances[vId] = { vendorName: (bill.vendorId as any)?.displayName || 'Unknown', invoiced: 0, received: 0, closingBalance: 0 };
        balances[vId].invoiced += (bill.total || 0);
        balances[vId].received += ((bill.total || 0) - (bill.balanceDue || 0));
        balances[vId].closingBalance += (bill.balanceDue || 0);
    }
    const data = Object.values(balances);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getPayableDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getPayableDetails(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
