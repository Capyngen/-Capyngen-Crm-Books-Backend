import { AdvancedReportsService } from '../services/advancedReportsService';

import { Request, Response, NextFunction } from 'express';
import Expense from '../models/Expense';
import Bill from '../../inventory/models/Bill';
import { requestContext } from '../../../context';


export const getExpensesByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getExpensesByCategory(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};



export const getExpenseDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getExpenseDetails(orgId);
    console.log('GET EXPENSE DETAILS FETCHED:', data.length);
    res.status(200).json({ success: true, data });
  } catch (error) { 
    console.log('GET EXPENSE DETAILS ERROR:', error);
    next(error); 
  }
};


export const getPurchasesByVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getPurchasesByVendor(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};


export const getPurchasesByItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getPurchasesByItem(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
