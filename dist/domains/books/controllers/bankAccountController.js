"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBankFeedSummary = exports.importBankStatement = exports.deleteBankAccount = exports.updateBankAccount = exports.createBankAccount = exports.getBankAccountById = exports.getBankAccounts = void 0;
const BankAccount_1 = __importDefault(require("../models/BankAccount"));
const BankStatementLine_1 = require("../models/BankStatementLine");
const ChartOfAccount_1 = require("../models/ChartOfAccount");
const ledgerService_1 = require("../services/ledgerService");
const mongoose_1 = __importDefault(require("mongoose"));
const getOrgId = (req) => {
    const org = req.org?._id || req.headers?.['x-org-id'] || 'default-org';
    return String(org);
};
const getBankAccounts = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const accounts = await BankAccount_1.default.find({ orgId }).sort({ isPrimary: -1, createdAt: -1 }).lean();
        // Enrich with unreconciled count and last statement date
        const enriched = await Promise.all(accounts.map(async (acc) => {
            const unreconciledCount = await BankStatementLine_1.BankStatementLine.countDocuments({
                orgId,
                bankAccountId: acc._id,
                reconciliationStatus: 'Unreconciled'
            });
            const lastStatement = await BankStatementLine_1.BankStatementLine.findOne({
                orgId,
                bankAccountId: acc._id
            }).sort({ date: -1 }).lean();
            return {
                ...acc,
                unreconciledCount,
                lastStatementDate: lastStatement?.date || null
            };
        }));
        res.json(enriched);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching bank accounts' });
    }
};
exports.getBankAccounts = getBankAccounts;
const getBankAccountById = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { id } = req.params;
        const account = await BankAccount_1.default.findOne({ _id: id, orgId }).lean();
        if (!account)
            return res.status(404).json({ message: 'Bank account not found' });
        const recentLines = await BankStatementLine_1.BankStatementLine.find({
            orgId,
            bankAccountId: id
        }).sort({ date: -1 }).limit(50).lean();
        const unreconciledCount = await BankStatementLine_1.BankStatementLine.countDocuments({
            orgId,
            bankAccountId: id,
            reconciliationStatus: 'Unreconciled'
        });
        res.json({
            ...account,
            recentLines,
            unreconciledCount
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching bank account' });
    }
};
exports.getBankAccountById = getBankAccountById;
const createBankAccount = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { accountName, accountNumber, accountType, bankName, ifscCode, swiftCode, branch, currency = 'INR', openingBalance = 0, openingBalanceDate = new Date(), chartOfAccountId, isPrimary = false, feedSource = 'Manual' } = req.body;
        if (!accountName) {
            return res.status(400).json({ message: 'Account Name is required' });
        }
        // 1. Ensure or find corresponding ChartOfAccount (Asset)
        let linkedAccountId = chartOfAccountId;
        if (!linkedAccountId) {
            const coaType = accountType === 'CreditCard' ? 'CreditCard' : 'Bank';
            let coa = await ChartOfAccount_1.ChartOfAccount.findOne({
                orgId,
                accountName: `Bank - ${accountName}`
            });
            if (!coa) {
                coa = new ChartOfAccount_1.ChartOfAccount({
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
        const bankAccount = new BankAccount_1.default({
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
            let equityAccount = await ChartOfAccount_1.ChartOfAccount.findOne({
                orgId,
                accountName: { $regex: /Opening Balance|Retained Earnings/i }
            });
            if (!equityAccount) {
                equityAccount = await ChartOfAccount_1.ChartOfAccount.findOne({ orgId, accountCategory: 'Equity' });
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
            await ledgerService_1.LedgerService.postTransaction(orgId, saved._id.toString(), 'BankTransfer', new Date(openingBalanceDate), glLines);
        }
        res.status(201).json(saved);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Error creating bank account' });
    }
};
exports.createBankAccount = createBankAccount;
const updateBankAccount = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { id } = req.params;
        const updated = await BankAccount_1.default.findOneAndUpdate({ _id: id, orgId }, { $set: req.body }, { new: true });
        if (!updated)
            return res.status(404).json({ message: 'Bank account not found' });
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Error updating bank account' });
    }
};
exports.updateBankAccount = updateBankAccount;
const deleteBankAccount = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { id } = req.params;
        const hasReconciled = await BankStatementLine_1.BankStatementLine.findOne({
            orgId,
            bankAccountId: id,
            reconciliationStatus: 'Reconciled'
        });
        if (hasReconciled) {
            return res.status(400).json({
                message: 'Cannot delete bank account with reconciled transactions. Deactivate it instead.'
            });
        }
        await BankStatementLine_1.BankStatementLine.deleteMany({ orgId, bankAccountId: id });
        const deleted = await BankAccount_1.default.findOneAndDelete({ _id: id, orgId });
        if (!deleted)
            return res.status(404).json({ message: 'Bank account not found' });
        res.json({ message: 'Bank account and statement feeds deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error deleting bank account' });
    }
};
exports.deleteBankAccount = deleteBankAccount;
const importBankStatement = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { bankAccountId, statements } = req.body;
        if (!bankAccountId || !Array.isArray(statements) || statements.length === 0) {
            return res.status(400).json({ message: 'Valid bankAccountId and statements array required' });
        }
        const bankAccount = await BankAccount_1.default.findOne({ _id: bankAccountId, orgId });
        if (!bankAccount)
            return res.status(404).json({ message: 'Bank account not found' });
        const statementLinesToInsert = statements.map((line) => ({
            orgId,
            bankAccountId: new mongoose_1.default.Types.ObjectId(bankAccountId),
            date: new Date(line.date || Date.now()),
            description: line.description || 'Bank Transaction',
            payee: line.payee || '',
            reference: line.reference || line.referenceNumber || '',
            amount: Number(line.amount) || 0,
            reconciliationStatus: 'Unreconciled'
        }));
        const inserted = await BankStatementLine_1.BankStatementLine.insertMany(statementLinesToInsert);
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
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Error importing bank statements' });
    }
};
exports.importBankStatement = importBankStatement;
const getBankFeedSummary = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const accounts = await BankAccount_1.default.find({ orgId }).lean();
        let totalBankBalance = 0;
        let totalCreditCardDebt = 0;
        let totalUnreconciledCount = 0;
        for (const acc of accounts) {
            if (acc.accountType === 'CreditCard') {
                totalCreditCardDebt += acc.currentBalance;
            }
            else {
                totalBankBalance += acc.currentBalance;
            }
        }
        totalUnreconciledCount = await BankStatementLine_1.BankStatementLine.countDocuments({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching bank summary' });
    }
};
exports.getBankFeedSummary = getBankFeedSummary;
