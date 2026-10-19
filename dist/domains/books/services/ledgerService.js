"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
const transactionLockService_1 = require("./transactionLockService");
const LedgerEntry_1 = __importDefault(require("../models/LedgerEntry"));
class LedgerService {
    static async postTransaction(orgId, transactionId, transactionType, date, lines, options) {
        // 1. Enforce Financial Period Locking Controls
        const moduleMap = {
            Invoice: 'Sales',
            CreditNote: 'Sales',
            PaymentReceived: 'Sales',
            Bill: 'Purchases',
            VendorCredit: 'Purchases',
            PaymentMade: 'Purchases',
            Expense: 'Purchases',
            'Manual Journal': 'Accountant',
            'Manual Journal Reversal': 'Accountant',
            CurrencyAdjustment: 'Accountant',
            'Fixed Asset Depreciation': 'Accountant',
            BankTransfer: 'Banking',
            YearEndClosing: 'Accountant'
        };
        const targetModule = moduleMap[transactionType] || 'Accountant';
        await (0, transactionLockService_1.validateTransactionLock)(orgId, targetModule, date);
        await LedgerEntry_1.default.deleteMany({ orgId, transactionId });
        const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
        const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            console.error(`Double-entry violation: Debits (${totalDebit}) do not equal Credits (${totalCredit}) for ${transactionType} ${transactionId}`);
            throw new Error(`Double-entry violation: Debits (${totalDebit}) do not equal Credits (${totalCredit})`);
        }
        const entry = new LedgerEntry_1.default({
            orgId,
            transactionId,
            transactionType,
            date,
            lines: lines.map(l => ({
                accountId: l.accountId,
                debit: l.debit || 0,
                credit: l.credit || 0,
                contactId: l.contactId,
                branchId: l.branchId || options?.branchId,
                projectId: l.projectId || options?.projectId,
                reportingTagIds: l.reportingTagIds || options?.reportingTagIds || []
            }))
        });
        await entry.save();
        return entry;
    }
    static async voidTransaction(orgId, transactionId, date) {
        const originalEntry = await LedgerEntry_1.default.findOne({ orgId, transactionId });
        if (!originalEntry)
            return null;
        // Check lock on reversal date
        await (0, transactionLockService_1.validateTransactionLock)(orgId, 'Accountant', date);
        if (originalEntry.status === 'Void')
            return null;
        const reversalLines = originalEntry.lines.map(l => ({
            accountId: l.accountId,
            debit: l.credit || 0,
            credit: l.debit || 0,
            contactId: l.contactId
        }));
        const reversalEntry = new LedgerEntry_1.default({
            orgId,
            transactionId: transactionId + '_VOID',
            transactionType: originalEntry.transactionType,
            date,
            lines: reversalLines,
            status: 'Posted'
        });
        originalEntry.status = 'Void';
        await originalEntry.save();
        await reversalEntry.save();
        return reversalEntry;
    }
    static async deleteTransaction(orgId, transactionId) {
        const entry = await LedgerEntry_1.default.findOne({ orgId, transactionId });
        if (entry)
            await (0, transactionLockService_1.validateTransactionLock)(orgId, 'Accountant', entry.date);
        await LedgerEntry_1.default.deleteMany({ orgId, transactionId });
        await LedgerEntry_1.default.deleteMany({ orgId, transactionId: transactionId + '_VOID' });
    }
}
exports.LedgerService = LedgerService;
