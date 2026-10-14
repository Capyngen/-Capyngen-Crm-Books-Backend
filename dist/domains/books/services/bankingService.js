"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const BankStatementLine_1 = require("../models/BankStatementLine");
const PaymentReceived_1 = __importDefault(require("../../billing/models/PaymentReceived"));
const PaymentMade_1 = __importDefault(require("../models/PaymentMade"));
const Expense_1 = __importDefault(require("../models/Expense"));
const LedgerEntry_1 = __importDefault(require("../models/LedgerEntry"));
const ledgerService_1 = require("./ledgerService");
class BankingService {
    static async getSuggestedMatches(lineId) {
        const line = await BankStatementLine_1.BankStatementLine.findById(lineId).lean();
        if (!line)
            throw new Error('Line not found');
        const minDate = new Date(line.date);
        minDate.setDate(minDate.getDate() - 3);
        const maxDate = new Date(line.date);
        maxDate.setDate(maxDate.getDate() + 3);
        const matchCandidates = [];
        const absoluteAmount = Math.abs(line.amount);
        if (line.amount > 0) {
            const prs = await PaymentReceived_1.default.find({
                orgId: line.orgId,
                amount: absoluteAmount,
                paymentDate: { $gte: minDate, $lte: maxDate }
            }).lean();
            matchCandidates.push(...prs.map(p => ({ type: 'PaymentReceived', id: p._id, date: p.paymentDate, amount: p.amount })));
        }
        else {
            const pms = await PaymentMade_1.default.find({
                orgId: line.orgId,
                amount: absoluteAmount,
                paymentDate: { $gte: minDate, $lte: maxDate }
            }).lean();
            matchCandidates.push(...pms.map(p => ({ type: 'PaymentMade', id: p._id, date: p.paymentDate, amount: p.amount })));
            const exps = await Expense_1.default.find({
                orgId: line.orgId,
                totalAmount: absoluteAmount,
                date: { $gte: minDate, $lte: maxDate }
            }).lean();
            matchCandidates.push(...exps.map(p => ({ type: 'Expense', id: p._id, date: p.date, amount: p.totalAmount })));
        }
        return matchCandidates;
    }
    static async matchTransaction(lineId, transactionId, transactionType) {
        const line = await BankStatementLine_1.BankStatementLine.findById(lineId);
        if (!line)
            throw new Error('Line not found');
        line.status = 'Matched';
        line.linkedTransactionId = transactionId;
        line.linkedTransactionType = transactionType;
        await line.save();
        return line;
    }
    static async unmatchTransaction(lineId) {
        const line = await BankStatementLine_1.BankStatementLine.findById(lineId);
        if (!line)
            throw new Error('Line not found');
        line.status = 'Unreconciled';
        line.linkedTransactionId = undefined;
        line.linkedTransactionType = undefined;
        await line.save();
        return line;
    }
    static async categorizeTransaction(lineId, accountId, contactId) {
        const line = await BankStatementLine_1.BankStatementLine.findById(lineId);
        if (!line)
            throw new Error('Line not found');
        const transactionId = new mongoose_1.default.Types.ObjectId().toString();
        const glLines = [];
        if (line.amount < 0) {
            glLines.push({ accountId: accountId, debit: Math.abs(line.amount), contactId });
            glLines.push({ accountId: 'Bank', credit: Math.abs(line.amount) });
        }
        else {
            glLines.push({ accountId: 'Bank', debit: line.amount });
            glLines.push({ accountId: accountId, credit: line.amount, contactId });
        }
        await ledgerService_1.LedgerService.postTransaction(line.orgId, transactionId, 'ManualJournal', line.date, glLines);
        line.status = 'Categorized';
        line.linkedTransactionId = transactionId;
        line.linkedTransactionType = 'ManualJournal';
        await line.save();
        return line;
    }
    static async getReconciliationStatus(orgId, bankAccountId, statementEndingBalance) {
        const allGL = await LedgerEntry_1.default.aggregate([
            { $match: { orgId } },
            { $unwind: '$lines' },
            { $match: { 'lines.accountId': 'Bank' } },
            { $group: { _id: null, totalDebit: { $sum: '$lines.debit' }, totalCredit: { $sum: '$lines.credit' } } }
        ]);
        const booksBalance = (allGL[0]?.totalDebit || 0) - (allGL[0]?.totalCredit || 0);
        const statementLines = await BankStatementLine_1.BankStatementLine.find({ orgId, bankAccountId }).lean();
        let calculatedStatementBalance = 0;
        let unreconciledCount = 0;
        statementLines.forEach((l) => {
            calculatedStatementBalance += l.amount;
            if (l.status === 'Unreconciled')
                unreconciledCount++;
        });
        const targetStatementBalance = statementEndingBalance !== undefined ? statementEndingBalance : calculatedStatementBalance;
        return {
            booksBalance,
            statementEndingBalance: targetStatementBalance,
            difference: targetStatementBalance - booksBalance,
            unreconciledCount
        };
    }
}
exports.BankingService = BankingService;
