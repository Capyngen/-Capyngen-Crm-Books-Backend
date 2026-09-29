import { Request, Response, NextFunction } from 'express';
import Invoice from '../../billing/models/Invoice';
import Bill from '../../inventory/models/Bill';
import Item from '../../inventory/models/Item';
import { requestContext } from '../../../context';

export const getBalanceSheet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId;
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing orgId' });

    // Dummy logic for Asset & Liability grouping based on Invoices and Bills
    const invoices = await Invoice.find({ status: { $ne: 'Draft' } }).lean();
    const bills = await Bill.find({ status: { $ne: 'Draft' } }).lean();
    const items = await Item.find({ type: 'goods' }).lean();

    const receivables = invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
    const payables = bills.reduce((sum, bill) => sum + (bill.balanceDue || 0), 0);
    const inventory = items.reduce((sum: any, item: any) => sum + ((item.stock || 0) * (item.purchaseRate || 0)), 0);

    // Dummy cash in bank
    const cash = 0; 
    
    const assets = receivables + inventory + cash;
    const liabilities = payables;
    const equity = assets - liabilities;

    const data = {
      assets: {
        total: assets,
        breakdown: [
          { name: 'Accounts Receivable', amount: receivables },
          { name: 'Inventory Asset', amount: inventory },
          { name: 'Cash and Equivalents', amount: cash }
        ]
      },
      liabilities: {
        total: liabilities,
        breakdown: [
          { name: 'Accounts Payable', amount: payables }
        ]
      },
      equity: {
        total: equity,
        breakdown: [
          { name: 'Retained Earnings', amount: equity }
        ]
      }
    };
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getCashFlow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Simplified for now
    const data = {
      operatingActivities: { net: 0, breakdown: [] },
      investingActivities: { net: 0, breakdown: [] },
      financingActivities: { net: 0, breakdown: [] },
      netIncreaseInCash: 0,
      endingCashBalance: 0
    };
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getHorizontalPL = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Simplified: Return periods array
    const data = {
      periods: ['Jan', 'Feb', 'Mar'],
      income: { rowName: 'Operating Income', values: [0, 0, 0] },
      expenses: { rowName: 'Operating Expenses', values: [0, 0, 0] },
      netProfit: { rowName: 'Net Profit', values: [0, 0, 0] }
    };
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getHorizontalBS = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = {
      periods: ['Q1', 'Q2', 'Q3'],
      assets: { rowName: 'Total Assets', values: [0, 0, 0] },
      liabilities: { rowName: 'Total Liabilities', values: [0, 0, 0] },
      equity: { rowName: 'Total Equity', values: [0, 0, 0] }
    };
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getMovementOfEquity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = {
      openingBalance: 0,
      netProfit: 0,
      ownerDrawings: 0,
      closingBalance: 0
    };
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
