import { Request, Response } from 'express';
import BankAccount, { IBankAccount } from '../models/BankAccount';
import { BankStatementLine } from '../models/BankStatementLine';
import { ChartOfAccount } from '../models/ChartOfAccount';
import { LedgerService } from '../services/ledgerService';
import mongoose from 'mongoose';

const getOrgId = (req: any): string => {
  const org = req.org?._id || req.headers?.['x-org-id'] || 'default-org';
  return String(org);
};

export const getBankAccounts = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const accounts = await BankAccount.find({ orgId }).sort({ isPrimary: -1, createdAt: -1 }).lean();

    // Enrich with unreconciled count and last statement date
    const enriched = await Promise.all(
      accounts.map(async (acc) => {
        const unreconciledCount = await BankStatementLine.countDocuments({
          orgId,
          bankAccountId: acc._id,
          reconciliationStatus: 'Unreconciled'
        });
        const lastStatement = await BankStatementLine.findOne({
          orgId,
          bankAccountId: acc._id
        }).sort({ date: -1 }).lean();

        return {
          ...acc,
          unreconciledCount,
          lastStatementDate: lastStatement?.date || null
        };
      })
    );

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching bank accounts' });
  }
};

export const getBankAccountById = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { id } = req.params;
    const account = await BankAccount.findOne({ _id: id, orgId }).lean();
    if (!account) return res.status(404).json({ message: 'Bank account not found' });

    const recentLines = await BankStatementLine.find({
      orgId,
      bankAccountId: id
    }).sort({ date: -1 }).limit(50).lean();

    const unreconciledCount = await BankStatementLine.countDocuments({
      orgId,
      bankAccountId: id,
      reconciliationStatus: 'Unreconciled'
    });

    res.json({
      ...account,
      recentLines,
      unreconciledCount
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching bank account' });
  }
};

export const createBankAccount = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const {
      accountName,
      accountNumber,
      accountType,
      bankName,
      ifscCode,
      swiftCode,
      branch,
      currency = 'INR',
      openingBalance = 0,
      openingBalanceDate = new Date(),
      chartOfAccountId,
      isPrimary = false,
      feedSource = 'Manual'
    } = req.body;

    if (!accountName) {
      return res.status(400).json({ message: 'Account Name is required' });
    }

    // 1. Ensure or find corresponding ChartOfAccount (Asset)
    let linkedAccountId = chartOfAccountId;
    if (!linkedAccountId) {
      const coaType = accountType === 'CreditCard' ? 'CreditCard' : 'Bank';
      let coa = await ChartOfAccount.findOne({
        orgId,
        accountName: `Bank - ${accountName}`
      });

      if (!coa) {
        coa = new ChartOfAccount({
          orgId,
          accountName: `Bank - ${accountName}`,
          accountCode: `BANK-${Date.now().toString().slice(-4)}`,
          accountType: coaType,
          accountCategory: coaType === 'CreditCard' ? 'Liability' : 'Asset',
          description: `GL Ledger Account for ${accountName} (${bankName || 'General'})`,
          currency,
          isActive: true
        });
        await coa.save();
      }
      linkedAccountId = coa._id;
    }

    // 2. Create BankAccount document
    const numOpeningBalance = Number(openingBalance) || 0;
    const bankAccount = new BankAccount({
      orgId,
      accountName,
      accountNumber: accountNumber || '',
      accountType: accountType || 'Checking',
      bankName: bankName || '',
      ifscCode: ifscCode || '',
      swiftCode: swiftCode || '',
      branch: branch || '',
      currency,
      chartOfAccountId: linkedAccountId,
      openingBalance: numOpeningBalance,
      openingBalanceDate: new Date(openingBalanceDate),
      currentBalance: numOpeningBalance,
      unreconciledBalance: 0,
      reconciledBalance: numOpeningBalance,
      status: 'Active',
      isPrimary: Boolean(isPrimary),
      feedSource
    });

    const saved = await bankAccount.save();

    // 3. Post Opening Balance Entry to GL if balance != 0
    if (numOpeningBalance !== 0 && linkedAccountId) {
      // Find Opening Balance Adjustments or Retained Earnings account
      let equityAccount = await ChartOfAccount.findOne({
        orgId,
        accountName: { $regex: /Opening Balance|Retained Earnings/i }
      });
      if (!equityAccount) {
        equityAccount = await ChartOfAccount.findOne({ orgId, accountCategory: 'Equity' });
      }

      const equityAccountId = equityAccount ? equityAccount._id.toString() : 'Opening Balance Adjustments';
      const absAmount = Math.abs(numOpeningBalance);

      const glLines = numOpeningBalance > 0
        ? [
            { accountId: linkedAccountId.toString(), debit: absAmount, credit: 0 },
            { accountId: equityAccountId, debit: 0, credit: absAmount }
          ]
        : [
            { accountId: equityAccountId, debit: absAmount, credit: 0 },
            { accountId: linkedAccountId.toString(), debit: 0, credit: absAmount }
          ];

      await LedgerService.postTransaction(
        orgId,
        saved._id.toString(),
        'BankTransfer',
        new Date(openingBalanceDate),
        glLines
      );
    }

    res.status(201).json(saved);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error creating bank account' });
  }
};

export const updateBankAccount = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { id } = req.params;

    const updated = await BankAccount.findOneAndUpdate(
      { _id: id, orgId },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Bank account not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error updating bank account' });
  }
};

export const deleteBankAccount = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { id } = req.params;

    const hasReconciled = await BankStatementLine.findOne({
      orgId,
      bankAccountId: id,
      reconciliationStatus: 'Reconciled'
    });

    if (hasReconciled) {
      return res.status(400).json({
        message: 'Cannot delete bank account with reconciled transactions. Deactivate it instead.'
      });
    }

    await BankStatementLine.deleteMany({ orgId, bankAccountId: id });
    const deleted = await BankAccount.findOneAndDelete({ _id: id, orgId });
    if (!deleted) return res.status(404).json({ message: 'Bank account not found' });

    res.json({ message: 'Bank account and statement feeds deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting bank account' });
  }
};

export const importBankStatement = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { bankAccountId, statements } = req.body;

    if (!bankAccountId || !Array.isArray(statements) || statements.length === 0) {
      return res.status(400).json({ message: 'Valid bankAccountId and statements array required' });
    }

    const bankAccount = await BankAccount.findOne({ _id: bankAccountId, orgId });
    if (!bankAccount) return res.status(404).json({ message: 'Bank account not found' });

    const statementLinesToInsert = statements.map((line: any) => ({
      orgId,
      bankAccountId: new mongoose.Types.ObjectId(bankAccountId),
      date: new Date(line.date || Date.now()),
      description: line.description || 'Bank Transaction',
      payee: line.payee || '',
      reference: line.reference || line.referenceNumber || '',
      amount: Number(line.amount) || 0,
      reconciliationStatus: 'Unreconciled'
    }));

    const inserted = await BankStatementLine.insertMany(statementLinesToInsert);

    // Update bank account unreconciled balance
    const totalNewAmount = statementLinesToInsert.reduce((sum, line) => sum + line.amount, 0);
    bankAccount.currentBalance += totalNewAmount;
    bankAccount.unreconciledBalance += totalNewAmount;
    await bankAccount.save();

    res.status(201).json({
      message: `Successfully imported ${inserted.length} statement lines`,
      importedCount: inserted.length,
      currentBalance: bankAccount.currentBalance
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error importing bank statements' });
  }
};

export const getBankFeedSummary = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const accounts = await BankAccount.find({ orgId }).lean();

    let totalBankBalance = 0;
    let totalCreditCardDebt = 0;
    let totalUnreconciledCount = 0;

    for (const acc of accounts) {
      if (acc.accountType === 'CreditCard') {
        totalCreditCardDebt += acc.currentBalance;
      } else {
        totalBankBalance += acc.currentBalance;
      }
    }

    totalUnreconciledCount = await BankStatementLine.countDocuments({
      orgId,
      reconciliationStatus: 'Unreconciled'
    });

    res.json({
      totalBankBalance,
      totalCreditCardDebt,
      totalCashNet: totalBankBalance - totalCreditCardDebt,
      totalAccounts: accounts.length,
      totalUnreconciledCount
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching bank summary' });
  }
};
