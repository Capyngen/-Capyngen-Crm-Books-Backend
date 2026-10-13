import { Request, Response } from 'express';
import { BudgetScenario } from '../models/BudgetScenario';
import BudgetLine from '../models/BudgetLine';
import { ChartOfAccount } from '../models/ChartOfAccount';
import LedgerEntry from '../models/LedgerEntry';
import mongoose from 'mongoose';

export const getScenarios = async (req: Request | any, res: Response) => {
  try {
    const orgId = req.org?._id || req.headers['x-org-id'] || 'mock-org-id';
    const scenarios = await BudgetScenario.find({ orgId }).populate('fiscalYearId').sort({ createdAt: -1 });
    res.json(scenarios);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createScenario = async (req: Request | any, res: Response) => {
  try {
    const orgId = req.org?._id || req.headers['x-org-id'];
    const { name, fiscalYearId, type, periodType, description } = req.body;
    const scenario = new BudgetScenario({ orgId, name, fiscalYearId, type, periodType, description, status: 'Active' });
    await scenario.save();
    res.status(201).json(scenario);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getScenarioDetails = async (req: Request | any, res: Response) => {
  try {
    const { id } = req.params;
    const scenario = await BudgetScenario.findById(id).populate('fiscalYearId');
    const lines = await BudgetLine.find({ scenarioId: id }).populate('accountId');
    res.json({ scenario, lines });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const saveBudgetLines = async (req: Request | any, res: Response) => {
  try {
    const orgId = req.org?._id || req.headers['x-org-id'];
    const { id } = req.params; // scenarioId
    const { lines } = req.body; // Array of { accountId, totalAmount, periods: [] }

    await BudgetLine.deleteMany({ scenarioId: id });
    
    let total = 0;
    const budgetLinesToInsert = lines.map((l: any) => {
      total += Number(l.totalAmount);
      return {
        orgId,
        scenarioId: id,
        accountId: l.accountId,
        totalAmount: l.totalAmount,
        periods: l.periods
      };
    });

    if (budgetLinesToInsert.length > 0) {
      await BudgetLine.insertMany(budgetLinesToInsert);
    }

    await BudgetScenario.findByIdAndUpdate(id, { totalBudgetedAmount: total });

    res.json({ message: 'Budget saved successfully', totalBudgetedAmount: total });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// Compare actuals vs budget for variance alerts
export const getBudgetVariance = async (req: Request | any, res: Response) => {
  try {
    const orgId = req.org?._id || req.headers['x-org-id'];
    const { id } = req.params; // scenarioId

    const lines = await BudgetLine.find({ scenarioId: id }).populate('accountId');
    
    // For a real ERP, we query the LedgerEntry for each account in the budget
    // and sum up actual spending for the fiscal year period.
    const varianceData = await Promise.all(lines.map(async (line: any) => {
      // Aggregate actuals from Ledger (simulated here with a quick query or random logic if ledger empty)
      // In production, we filter by date range of the fiscal year
      const actualsAgg = await LedgerEntry.aggregate([
        { $match: { orgId, accountId: new mongoose.Types.ObjectId(line.accountId._id.toString()) } },
        { $group: { _id: null, totalDebit: { $sum: '$debit' }, totalCredit: { $sum: '$credit' } } }
      ]);
      
      const actualAmount = actualsAgg.length > 0 ? (actualsAgg[0].totalDebit - actualsAgg[0].totalCredit) : 0; // Simplified for expense
      
      return {
        accountId: line.accountId._id,
        accountName: line.accountId.accountName,
        budgeted: line.totalAmount,
        actual: actualAmount,
        variance: line.totalAmount - actualAmount,
        variancePercentage: line.totalAmount > 0 ? ((line.totalAmount - actualAmount) / line.totalAmount) * 100 : 0
      };
    }));

    res.json(varianceData);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
