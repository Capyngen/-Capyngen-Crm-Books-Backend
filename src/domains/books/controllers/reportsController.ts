import { AdvancedReportsService } from '../services/advancedReportsService';

import { Request, Response, NextFunction } from 'express';
import LedgerEntry from '../models/LedgerEntry';
import { requestContext } from '../../../context';

// Utility to process balances
const getAccountBalances = async (orgId: string) => {
  const entries = await LedgerEntry.find({ orgId, status: 'Posted' });
  const balances: Record<string, { debit: number, credit: number, net: number }> = {};
  
  entries.forEach(entry => {
    entry.lines.forEach(line => {
      const acc = String(line.accountId);
      if (!balances[acc]) balances[acc] = { debit: 0, credit: 0, net: 0 };
      balances[acc].debit += line.debit || 0;
      balances[acc].credit += line.credit || 0;
      balances[acc].net += (line.debit || 0) - (line.credit || 0);
    });
  });
  return balances;
};






export const getTrialBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await AdvancedReportsService.getTrialBalance(orgId, startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};


export const getGeneralLedger = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getGeneralLedger(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};


export const getJournalReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getJournalReport(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};







export const getDayBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getDayBook(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getAccountTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getAccountTransactions(orgId, req.query.accountId as string);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getAccountTypeSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getAccountTypeSummary(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getDetailedGeneralLedger = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await AdvancedReportsService.getDetailedGeneralLedger(orgId, startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};


export const getProfitAndLoss = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await AdvancedReportsService.getProfitAndLoss(orgId, startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getBalanceSheet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await AdvancedReportsService.getBalanceSheet(orgId, startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getCashFlow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getCashFlowStatement(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};


export const getHorizontalPL = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getProfitAndLoss(orgId);
    
    const items = [
      ...data.details.revenueAccounts.map((a: any) => ({ accountName: a.accountName, category: 'Income', currentAmount: a.balance, priorAmount: 0 })),
      ...data.details.cogsAccounts.map((a: any) => ({ accountName: a.accountName, category: 'Cost of Goods Sold', currentAmount: a.balance, priorAmount: 0 })),
      ...data.details.expenseAccounts.map((a: any) => ({ accountName: a.accountName, category: 'Expense', currentAmount: a.balance, priorAmount: 0 }))
    ];
    
    res.status(200).json({ success: true, data: { items } });
  } catch (error) { next(error); }
};


export const getHorizontalBS = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getBalanceSheet(orgId);
    
    const items = [
      ...data.assets.accounts.map((a: any) => ({ accountName: a.accountName, category: 'Asset', currentAmount: a.balance, priorAmount: 0 })),
      ...data.liabilities.accounts.map((a: any) => ({ accountName: a.accountName, category: 'Liability', currentAmount: a.balance, priorAmount: 0 })),
      ...data.equity.accounts.map((a: any) => ({ accountName: a.accountName, category: 'Equity', currentAmount: a.balance, priorAmount: 0 }))
    ];
    
    res.status(200).json({ success: true, data: { items } });
  } catch (error) { next(error); }
};

export const getBusinessPerformanceRatios = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getBusinessPerformanceRatios(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getMovementOfEquity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const data = await AdvancedReportsService.getMovementOfEquity(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};


export const getSalesBySalesPerson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await AdvancedReportsService.getSalesBySalesPerson(orgId, startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getSalesSummaryByDate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await AdvancedReportsService.getSalesSummaryByDate(orgId, startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getProfitByItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await AdvancedReportsService.getProfitByItem(orgId, startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
