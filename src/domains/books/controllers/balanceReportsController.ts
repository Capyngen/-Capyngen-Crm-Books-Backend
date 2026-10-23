import { Request, Response, NextFunction } from 'express';
import { extractOrgId } from './reportsController';
import { AdvancedReportsService } from '../services/advancedReportsService';
import Bill from '../../inventory/models/Bill';
import Customer from '../../billing/models/Customer';
import Vendor from '../../inventory/models/Vendor';
import { requestContext } from '../../../context';

export const getCustomerBalances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getCustomerBalances(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getVendorBalances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getVendorBalances(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
