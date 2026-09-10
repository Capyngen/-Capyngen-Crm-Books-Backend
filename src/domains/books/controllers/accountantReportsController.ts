import { Request, Response, NextFunction } from 'express';
export const getTrialBalance = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ success: true, data: { accounts: [], totalDebit: 0, totalCredit: 0 } });
};
export const getGeneralLedger = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ success: true, data: { transactions: [] } });
};
export const getJournalReport = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ success: true, data: { journals: [] } });
};
