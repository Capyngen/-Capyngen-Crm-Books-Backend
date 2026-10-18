import { Request, Response } from 'express';
import { BankStatementLine } from '../models/BankStatementLine';
import { BankingRule } from '../models/BankingRule';
import { Journal } from '../models/Journal';
import BankAccount from '../models/BankAccount';
import { ChartOfAccount } from '../models/ChartOfAccount';
import { LedgerService } from '../services/ledgerService';
import mongoose from 'mongoose';

const getOrgId = (req: any): string => {
  return String(req.org?._id || req.headers?.['x-org-id'] || 'default-org');
};

// AI/Rule parsing of bank feeds for auto-categorization
const getAIAccountSuggestion = (desc: string) => {
  const input = desc.toLowerCase();
  if (input.includes('aws') || input.includes('google') || input.includes('digitalocean') || input.includes('microsoft')) {
    return { name: 'IT & Cloud Services', category: 'Expense', confidence: 95 };
  }
  if (input.includes('uber') || input.includes('lyft') || input.includes('flight') || input.includes('airline')) {
    return { name: 'Travel & Transportation', category: 'Expense', confidence: 92 };
  }
  if (input.includes('wework') || input.includes('rent') || input.includes('office')) {
    return { name: 'Rent Expense', category: 'Expense', confidence: 88 };
  }
  if (input.includes('stripe') || input.includes('paypal') || input.includes('fee')) {
    return { name: 'Bank & Processing Fees', category: 'Expense', confidence: 85 };
  }
  if (input.includes('salary') || input.includes('payroll')) {
    return { name: 'Salaries & Wages Expense', category: 'Expense', confidence: 94 };
  }
  if (input.includes('deposit') || input.includes('invoice') || input.includes('customer') || input.includes('client')) {
    return { name: 'Sales Revenue', category: 'Income', confidence: 90 };
  }
  return { name: 'General Expenses', category: 'Expense', confidence: 60 };
};

export const getReconciliationFeeds = async (req: Request | any, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { bankAccountId } = req.query;

    const filter: any = { orgId, reconciliationStatus: 'Unreconciled' };
    if (bankAccountId) filter.bankAccountId = bankAccountId;

    const feeds = await BankStatementLine.find(filter).sort({ date: -1 }).limit(100).lean();
    const rules = await BankingRule.find({ orgId, isActive: true }).sort({ order: 1 }).lean();

    // Enrich feeds with rule-matching or AI suggestions
    const enrichedFeeds = feeds.map(feed => {
      let matchedRule = null;

      for (const rule of rules) {
        const hasMatch = (rule as any).conditions?.some((c: any) =>
          c.field === 'Description' &&
          c.operator === 'Contains' &&
          feed.description.toLowerCase().includes(c.value.toLowerCase())
        );
        if (hasMatch) {
          matchedRule = rule;
          break;
        }
      }

      if (matchedRule) {
        feed.suggestedMatch = {
          matchType: 'Rule',
          confidence: 100,
          ruleId: (matchedRule as any)._id,
          accountId: (matchedRule as any).assignAccountId,
          message: `Matched by Rule: ${(matchedRule as any).ruleName}`
        };
      } else {
        const aiSuggestion = getAIAccountSuggestion(feed.description);
        feed.suggestedMatch = {
          matchType: 'AI',
          confidence: aiSuggestion.confidence,
          message: `AI suggests: ${aiSuggestion.name}`
        };
      }

      return feed;
    });

    res.json(enrichedFeeds);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching feeds' });
  }
};

export const confirmMatch = async (req: Request | any, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { feedId } = req.params;
    const { accountId, createAs = 'Expense', notes } = req.body;

    const feed = await BankStatementLine.findOne({ _id: feedId, orgId });
    if (!feed) return res.status(404).json({ message: 'Feed statement line not found' });
    if (feed.reconciliationStatus === 'Reconciled') {
      return res.status(400).json({ message: 'Statement line is already reconciled' });
    }

    const bankAccount = await BankAccount.findOne({ _id: feed.bankAccountId, orgId });
    if (!bankAccount) return res.status(404).json({ message: 'Associated bank account not found' });

    // Determine target GL account
    let targetAccount = null;
    if (accountId) {
      targetAccount = await ChartOfAccount.findOne({ _id: accountId, orgId });
    }
    if (!targetAccount && feed.suggestedMatch?.accountId) {
      targetAccount = await ChartOfAccount.findOne({ _id: feed.suggestedMatch.accountId, orgId });
    }
    if (!targetAccount) {
      // Find or create account based on AI suggestion
      const ai = getAIAccountSuggestion(feed.description);
      targetAccount = await ChartOfAccount.findOne({ orgId, accountName: ai.name });
      if (!targetAccount) {
        targetAccount = new ChartOfAccount({
          orgId,
          accountName: ai.name,
          accountCode: `EXP-${Date.now().toString().slice(-4)}`,
          accountType: ai.category === 'Income' ? 'OperatingRevenue' : 'OperatingExpense',
          accountCategory: ai.category === 'Income' ? 'Income' : 'Expense',
          currency: bankAccount.currency || 'INR',
          isActive: true
        });
        await targetAccount.save();
      }
    }

    const bankCoaId = bankAccount.chartOfAccountId?.toString() || 'Bank Account';
    const targetCoaId = targetAccount._id.toString();
    const amountAbs = Math.abs(feed.amount);

    let journalDebits = 0;
    let journalCredits = 0;
    let lineItems: any[] = [];
    let ledgerLines: any[] = [];

    if (feed.amount < 0) {
      // Money spent (Withdrawal): Debit Expense/Payable, Credit Bank
      journalDebits = amountAbs;
      journalCredits = amountAbs;
      lineItems = [
        { account: targetCoaId, debits: amountAbs, credits: 0, description: feed.description },
        { account: bankCoaId, debits: 0, credits: amountAbs, description: `Bank payment: ${feed.reference || feed.description}` }
      ];
      ledgerLines = [
        { accountId: targetCoaId, debit: amountAbs, credit: 0 },
        { accountId: bankCoaId, debit: 0, credit: amountAbs }
      ];
    } else {
      // Money received (Deposit): Debit Bank, Credit Income/Receivable
      journalDebits = amountAbs;
      journalCredits = amountAbs;
      lineItems = [
        { account: bankCoaId, debits: amountAbs, credits: 0, description: `Bank deposit: ${feed.reference || feed.description}` },
        { account: targetCoaId, debits: 0, credits: amountAbs, description: feed.description }
      ];
      ledgerLines = [
        { accountId: bankCoaId, debit: amountAbs, credit: 0 },
        { accountId: targetCoaId, debit: 0, credit: amountAbs }
      ];
    }

    // 1. Create and Save System Reconciliation Journal
    const journalCount = await Journal.countDocuments({ orgId });
    const journalNumber = `RECON-${String(journalCount + 1).padStart(5, '0')}`;

    const journal = new Journal({
      orgId,
      date: feed.date,
      journalNumber,
      referenceNumber: feed.reference || `FEED-${feed._id}`,
      notes: notes || `Automated Bank Reconciliation: ${feed.description}`,
      reportingMethod: 'accrual',
      currency: bankAccount.currency || 'INR',
      lineItems,
      subTotal: amountAbs,
      total: amountAbs,
      status: 'Published'
    });
    const savedJournal = await journal.save();

    // 2. Post to General Ledger via LedgerService
    await LedgerService.postTransaction(
      orgId,
      savedJournal._id.toString(),
      'BankTransfer',
      feed.date,
      ledgerLines
    );

    // 3. Update Feed line
    feed.reconciliationStatus = 'Reconciled';
    feed.matchedTransactionId = savedJournal._id as any;
    feed.matchedTransactionModel = 'Journal';
    await feed.save();

    // 4. Update Bank Account balances
    bankAccount.reconciledBalance += feed.amount;
    bankAccount.unreconciledBalance -= feed.amount;
    await bankAccount.save();

    res.json({
      success: true,
      feed,
      journal: savedJournal,
      updatedBalances: {
        currentBalance: bankAccount.currentBalance,
        reconciledBalance: bankAccount.reconciledBalance,
        unreconciledBalance: bankAccount.unreconciledBalance
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error during reconciliation' });
  }
};

export const unmatchFeed = async (req: Request | any, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { feedId } = req.params;

    const feed = await BankStatementLine.findOne({ _id: feedId, orgId });
    if (!feed) return res.status(404).json({ message: 'Feed statement line not found' });
    if (feed.reconciliationStatus !== 'Reconciled') {
      return res.status(400).json({ message: 'Feed is not reconciled' });
    }

    const bankAccount = await BankAccount.findOne({ _id: feed.bankAccountId, orgId });

    // Void the posted reconciliation journal
    if (feed.matchedTransactionId) {
      await LedgerService.voidTransaction(orgId, feed.matchedTransactionId.toString(), new Date());
      await Journal.findByIdAndUpdate(feed.matchedTransactionId, { status: 'Void' });
    }

    // Reset feed
    feed.reconciliationStatus = 'Unreconciled';
    feed.matchedTransactionId = undefined;
    feed.matchedTransactionModel = undefined;
    await feed.save();

    // Adjust balances
    if (bankAccount) {
      bankAccount.reconciledBalance -= feed.amount;
      bankAccount.unreconciledBalance += feed.amount;
      await bankAccount.save();
    }

    res.json({ success: true, message: 'Reconciliation unmatched successfully', feed });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const autoReconcile = async (req: Request | any, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { bankAccountId } = req.body;

    const filter: any = { orgId, reconciliationStatus: 'Unreconciled' };
    if (bankAccountId) filter.bankAccountId = bankAccountId;

    const unreconciledFeeds = await BankStatementLine.find(filter);
    const rules = await BankingRule.find({ orgId, isActive: true }).sort({ order: 1 });

    let reconciledCount = 0;

    for (const feed of unreconciledFeeds) {
      let targetAccountId: any = null;

      // 1. Match by Rule
      for (const rule of rules) {
        const hasMatch = (rule as any).conditions?.some((c: any) =>
          c.field === 'Description' &&
          c.operator === 'Contains' &&
          feed.description.toLowerCase().includes(c.value.toLowerCase())
        );
        if (hasMatch) {
          targetAccountId = (rule as any).assignAccountId;
          break;
        }
      }

      // 2. High confidence AI match (>= 90%)
      if (!targetAccountId) {
        const ai = getAIAccountSuggestion(feed.description);
        if (ai.confidence >= 90) {
          const coa = await ChartOfAccount.findOne({ orgId, accountName: ai.name });
          if (coa) targetAccountId = coa._id;
        }
      }

      if (targetAccountId) {
        const bankAccount = await BankAccount.findOne({ _id: feed.bankAccountId, orgId });
        if (!bankAccount) continue;

        const bankCoaId = bankAccount.chartOfAccountId?.toString() || 'Bank Account';
        const amountAbs = Math.abs(feed.amount);

        const journal = new Journal({
          orgId,
          date: feed.date,
          journalNumber: `AUTO-RECON-${Date.now()}-${reconciledCount}`,
          referenceNumber: feed.reference || `FEED-${feed._id}`,
          notes: `Auto-reconciled: ${feed.description}`,
          reportingMethod: 'accrual',
          currency: bankAccount.currency || 'INR',
          lineItems: feed.amount < 0
            ? [
                { account: targetAccountId.toString(), debits: amountAbs, credits: 0, description: feed.description },
                { account: bankCoaId, debits: 0, credits: amountAbs, description: feed.description }
              ]
            : [
                { account: bankCoaId, debits: amountAbs, credits: 0, description: feed.description },
                { account: targetAccountId.toString(), debits: 0, credits: amountAbs, description: feed.description }
              ],
          subTotal: amountAbs,
          total: amountAbs,
          status: 'Published'
        });
        await journal.save();

        await LedgerService.postTransaction(
          orgId,
          journal._id.toString(),
          'BankTransfer',
          feed.date,
          feed.amount < 0
            ? [
                { accountId: targetAccountId.toString(), debit: amountAbs, credit: 0 },
                { accountId: bankCoaId, debit: 0, credit: amountAbs }
              ]
            : [
                { accountId: bankCoaId, debit: amountAbs, credit: 0 },
                { accountId: targetAccountId.toString(), debit: 0, credit: amountAbs }
              ]
        );

        feed.reconciliationStatus = 'Reconciled';
        feed.matchedTransactionId = journal._id as any;
        feed.matchedTransactionModel = 'Journal';
        await feed.save();

        bankAccount.reconciledBalance += feed.amount;
        bankAccount.unreconciledBalance -= feed.amount;
        await bankAccount.save();

        reconciledCount++;
      }
    }

    res.json({
      success: true,
      message: `Auto-reconciliation complete. Reconciled ${reconciledCount} transactions.`,
      reconciledCount
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Auto reconciliation failed' });
  }
};
