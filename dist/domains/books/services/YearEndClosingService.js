"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YearEndClosingService = void 0;
const FiscalYear_1 = require("../models/FiscalYear");
const ChartOfAccount_1 = require("../models/ChartOfAccount");
const LedgerEntry_1 = __importDefault(require("../models/LedgerEntry"));
const Journal_1 = require("../models/Journal");
const TransactionLock_1 = __importDefault(require("../models/TransactionLock"));
const BankStatementLine_1 = require("../models/BankStatementLine");
const ledgerService_1 = require("./ledgerService");
class YearEndClosingService {
    static async previewYearEndClosing(orgId, fiscalYearId) {
        const fy = await FiscalYear_1.FiscalYear.findOne({ _id: fiscalYearId, orgId });
        if (!fy)
            throw new Error('Fiscal Year not found');
        const startDate = fy.startDate;
        const endDate = fy.endDate;
        // 1. Audit Check: Pending Drafts or Unreconciled Items
        const unreconciledFeeds = await BankStatementLine_1.BankStatementLine.countDocuments({
            orgId,
            date: { $gte: startDate, $lte: endDate },
            reconciliationStatus: 'Unreconciled'
        });
        const draftJournals = await Journal_1.Journal.countDocuments({
            orgId,
            date: { $gte: startDate, $lte: endDate },
            status: 'Draft'
        });
        // 2. Fetch all Accounts
        const revenueAccounts = await ChartOfAccount_1.ChartOfAccount.find({
            orgId,
            accountCategory: 'Income'
        }).lean();
        const expenseAccounts = await ChartOfAccount_1.ChartOfAccount.find({
            orgId,
            accountCategory: 'Expense'
        }).lean();
        let retainedEarningsAccount = await ChartOfAccount_1.ChartOfAccount.findOne({
            orgId,
            accountName: { $regex: /Retained Earnings/i }
        });
        if (!retainedEarningsAccount) {
            retainedEarningsAccount = await ChartOfAccount_1.ChartOfAccount.findOne({
                orgId,
                accountCategory: 'Equity'
            });
        }
        if (!retainedEarningsAccount) {
            retainedEarningsAccount = new ChartOfAccount_1.ChartOfAccount({
                orgId,
                accountName: 'Retained Earnings',
                accountCode: 'EQ-RE-001',
                accountType: 'RetainedEarnings',
                accountCategory: 'Equity',
                currency: 'INR',
                isActive: true
            });
            await retainedEarningsAccount.save();
        }
        // 3. Compute Net Balance for each Revenue Account
        let totalRevenue = 0;
        const revenueClosingLines = [];
        for (const acc of revenueAccounts) {
            const accIdStr = acc._id.toString();
            const actualsAgg = await LedgerEntry_1.default.aggregate([
                { $match: { orgId, status: 'Posted', date: { $gte: startDate, $lte: endDate }, 'lines.accountId': { $in: [accIdStr, acc._id] } } },
                { $unwind: '$lines' },
                { $match: { 'lines.accountId': { $in: [accIdStr, acc._id] } } },
                { $group: { _id: null, totalDebit: { $sum: '$lines.debit' }, totalCredit: { $sum: '$lines.credit' } } }
            ]);
            const debits = actualsAgg.length > 0 ? actualsAgg[0].totalDebit : 0;
            const credits = actualsAgg.length > 0 ? actualsAgg[0].totalCredit : 0;
            const netRevenue = credits - debits;
            if (Math.abs(netRevenue) > 0.01) {
                totalRevenue += netRevenue;
                revenueClosingLines.push({
                    accountId: accIdStr,
                    accountName: acc.accountName,
                    currentBalance: netRevenue,
                    closingDebit: netRevenue > 0 ? netRevenue : 0,
                    closingCredit: netRevenue < 0 ? Math.abs(netRevenue) : 0
                });
            }
        }
        // 4. Compute Net Balance for each Expense Account
        let totalExpenses = 0;
        const expenseClosingLines = [];
        for (const acc of expenseAccounts) {
            const accIdStr = acc._id.toString();
            const actualsAgg = await LedgerEntry_1.default.aggregate([
                { $match: { orgId, status: 'Posted', date: { $gte: startDate, $lte: endDate }, 'lines.accountId': { $in: [accIdStr, acc._id] } } },
                { $unwind: '$lines' },
                { $match: { 'lines.accountId': { $in: [accIdStr, acc._id] } } },
                { $group: { _id: null, totalDebit: { $sum: '$lines.debit' }, totalCredit: { $sum: '$lines.credit' } } }
            ]);
            const debits = actualsAgg.length > 0 ? actualsAgg[0].totalDebit : 0;
            const credits = actualsAgg.length > 0 ? actualsAgg[0].totalCredit : 0;
            const netExpense = debits - credits;
            if (Math.abs(netExpense) > 0.01) {
                totalExpenses += netExpense;
                expenseClosingLines.push({
                    accountId: accIdStr,
                    accountName: acc.accountName,
                    currentBalance: netExpense,
                    closingDebit: netExpense < 0 ? Math.abs(netExpense) : 0,
                    closingCredit: netExpense > 0 ? netExpense : 0
                });
            }
        }
        // 5. Net Income / Loss
        const netProfitOrLoss = totalRevenue - totalExpenses; // Positive = Net Profit, Negative = Net Loss
        // Proposed Journal Line Items
        const proposedJournalLines = [];
        // Zero out Revenue (Debit revenue accounts)
        for (const rev of revenueClosingLines) {
            if (rev.closingDebit > 0) {
                proposedJournalLines.push({
                    account: rev.accountId,
                    accountName: rev.accountName,
                    debits: rev.closingDebit,
                    credits: 0,
                    description: `Year-end closing P&L sweep: ${rev.accountName}`
                });
            }
        }
        // Zero out Expenses (Credit expense accounts)
        for (const exp of expenseClosingLines) {
            if (exp.closingCredit > 0) {
                proposedJournalLines.push({
                    account: exp.accountId,
                    accountName: exp.accountName,
                    debits: 0,
                    credits: exp.closingCredit,
                    description: `Year-end closing P&L sweep: ${exp.accountName}`
                });
            }
        }
        // Offset to Retained Earnings
        if (netProfitOrLoss > 0) {
            // Net Profit: Credit Retained Earnings
            proposedJournalLines.push({
                account: retainedEarningsAccount._id.toString(),
                accountName: retainedEarningsAccount.accountName,
                debits: 0,
                credits: netProfitOrLoss,
                description: `Net Profit transferred to Retained Earnings for ${fy.yearName}`
            });
        }
        else if (netProfitOrLoss < 0) {
            // Net Loss: Debit Retained Earnings
            const lossAbs = Math.abs(netProfitOrLoss);
            proposedJournalLines.push({
                account: retainedEarningsAccount._id.toString(),
                accountName: retainedEarningsAccount.accountName,
                debits: lossAbs,
                credits: 0,
                description: `Net Loss transferred to Retained Earnings for ${fy.yearName}`
            });
        }
        const totalDebits = proposedJournalLines.reduce((sum, l) => sum + (l.debits || 0), 0);
        const totalCredits = proposedJournalLines.reduce((sum, l) => sum + (l.credits || 0), 0);
        return {
            fiscalYear: {
                _id: fy._id,
                yearName: fy.yearName,
                startDate: fy.startDate,
                endDate: fy.endDate,
                isClosed: fy.isClosed
            },
            auditChecklist: {
                unreconciledFeeds,
                draftJournals,
                canClose: unreconciledFeeds === 0 && draftJournals === 0,
                warnings: [
                    ...(unreconciledFeeds > 0 ? [`${unreconciledFeeds} bank feed statement lines remain unreconciled.`] : []),
                    ...(draftJournals > 0 ? [`${draftJournals} manual journals are still in Draft status.`] : [])
                ]
            },
            summary: {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalExpenses: Math.round(totalExpenses * 100) / 100,
                netProfitOrLoss: Math.round(netProfitOrLoss * 100) / 100,
                retainedEarningsAccountId: retainedEarningsAccount._id,
                retainedEarningsAccountName: retainedEarningsAccount.accountName,
                isDoubleEntryBalanced: Math.abs(totalDebits - totalCredits) < 0.02
            },
            proposedJournalLines
        };
    }
    static async executeYearEndClosing(orgId, fiscalYearId, notes) {
        const preview = await this.previewYearEndClosing(orgId, fiscalYearId);
        if (preview.fiscalYear.isClosed) {
            throw new Error(`Fiscal Year ${preview.fiscalYear.yearName} is already closed`);
        }
        const journalNumber = `YEC-${preview.fiscalYear.yearName.replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
        const closingDate = preview.fiscalYear.endDate;
        const lineItems = preview.proposedJournalLines.map((l) => ({
            account: l.account,
            description: l.description,
            debits: Math.round(l.debits * 100) / 100,
            credits: Math.round(l.credits * 100) / 100
        }));
        const totalDebits = lineItems.reduce((sum, l) => sum + l.debits, 0);
        // 1. Create and Save Year-End Closing Journal
        const journal = new Journal_1.Journal({
            orgId,
            date: closingDate,
            journalNumber,
            referenceNumber: `CLOSE-${preview.fiscalYear.yearName}`,
            notes: notes || `Annual Financial Close for ${preview.fiscalYear.yearName}. P&L swept to Retained Earnings.`,
            reportingMethod: 'accrual',
            currency: 'INR',
            lineItems,
            subTotal: totalDebits,
            total: totalDebits,
            status: 'Published'
        });
        const savedJournal = await journal.save();
        // 2. Post to Ledger via LedgerService
        const ledgerLines = lineItems.map((l) => ({
            accountId: l.account,
            debit: l.debits,
            credit: l.credits
        }));
        await ledgerService_1.LedgerService.postTransaction(orgId, savedJournal._id.toString(), 'YearEndClosing', closingDate, ledgerLines);
        // 3. Mark Fiscal Year as Closed and lock all its periods
        const fy = await FiscalYear_1.FiscalYear.findOne({ _id: fiscalYearId, orgId });
        if (fy) {
            fy.isClosed = true;
            if (fy.periods && Array.isArray(fy.periods)) {
                fy.periods.forEach(p => { p.isClosed = true; });
            }
            await fy.save();
        }
        // 4. Update TransactionLock so backdating into closed year is blocked
        await TransactionLock_1.default.findOneAndUpdate({ orgId }, {
            $set: {
                allLockDate: closingDate,
                reason: `Fiscal Year ${preview.fiscalYear.yearName} Closed. Backdated transactions locked.`,
                lockedBy: 'YearEndClosingEngine'
            }
        }, { upsert: true });
        return {
            success: true,
            message: `Fiscal Year ${preview.fiscalYear.yearName} closed successfully. Period locked up to ${closingDate.toISOString().split('T')[0]}.`,
            closingJournal: savedJournal,
            netProfitTransferred: preview.summary.netProfitOrLoss,
            lockedDate: closingDate
        };
    }
}
exports.YearEndClosingService = YearEndClosingService;
