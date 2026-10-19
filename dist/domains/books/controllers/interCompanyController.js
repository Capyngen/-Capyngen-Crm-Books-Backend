"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConsolidatedEliminations = exports.approveTransaction = exports.createTransaction = exports.getTransactions = void 0;
const InterCompanyTransaction_1 = require("../models/InterCompanyTransaction");
const Journal_1 = require("../models/Journal");
const ChartOfAccount_1 = require("../models/ChartOfAccount");
const ledgerService_1 = require("../services/ledgerService");
const mongoose_1 = __importDefault(require("mongoose"));
const getOrgId = (req) => {
    const orgIdRaw = req.org?._id || req.headers?.['x-org-id'];
    return orgIdRaw ? String(orgIdRaw) : 'default-org';
};
const getTransactions = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const transactions = await InterCompanyTransaction_1.InterCompanyTransaction.find({
            $or: [{ fromOrgId: orgId }, { toOrgId: orgId }]
        }).sort({ transactionDate: -1 }).lean();
        res.json(transactions);
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getTransactions = getTransactions;
const createTransaction = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const data = req.body;
        const count = await InterCompanyTransaction_1.InterCompanyTransaction.countDocuments();
        const referenceNumber = `ICT-${String(count + 1).padStart(5, '0')}`;
        const transaction = new InterCompanyTransaction_1.InterCompanyTransaction({
            ...data,
            referenceNumber,
            fromOrgId: orgId,
            status: 'Pending'
        });
        await transaction.save();
        res.status(201).json(transaction);
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createTransaction = createTransaction;
const approveTransaction = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const transaction = await InterCompanyTransaction_1.InterCompanyTransaction.findById(id).session(session);
        if (!transaction)
            throw new Error('Transaction not found');
        if (transaction.status !== 'Pending')
            throw new Error('Only Pending transactions can be approved');
        const amount = Number(transaction.amount);
        // 1. Resolve or create Intercompany Clearing accounts for both entities
        // Originating Company: Due From Affiliate (Asset)
        let dueFromAccount = await ChartOfAccount_1.ChartOfAccount.findOne({
            orgId: transaction.fromOrgId,
            accountName: { $regex: /Due From.*Affiliate|Intercompany Receivable/i }
        }).session(session);
        if (!dueFromAccount) {
            dueFromAccount = new ChartOfAccount_1.ChartOfAccount({
                orgId: transaction.fromOrgId,
                accountName: 'Due From Affiliate / Subsidiary',
                accountCode: 'IC-REC-001',
                accountType: 'OtherCurrentAsset',
                accountCategory: 'Asset',
                currency: transaction.currency || 'INR',
                isActive: true
            });
            await dueFromAccount.save({ session });
        }
        // Receiving Company: Due To Parent/Affiliate (Liability)
        let dueToAccount = await ChartOfAccount_1.ChartOfAccount.findOne({
            orgId: transaction.toOrgId,
            accountName: { $regex: /Due To.*Parent|Due To.*Affiliate|Intercompany Payable/i }
        }).session(session);
        if (!dueToAccount) {
            dueToAccount = new ChartOfAccount_1.ChartOfAccount({
                orgId: transaction.toOrgId,
                accountName: 'Due To Parent / Affiliate',
                accountCode: 'IC-PAY-001',
                accountType: 'OtherCurrentLiability',
                accountCategory: 'Liability',
                currency: transaction.currency || 'INR',
                isActive: true
            });
            await dueToAccount.save({ session });
        }
        // 2. Generate Journal for Originating Company (fromOrgId)
        // Debit: Due From Affiliate (Asset)
        // Credit: Originating Account (Bank / Expense / Asset)
        const fromJournalNumber = `ICT-OUT-${Date.now().toString().slice(-6)}`;
        const fromJournal = new Journal_1.Journal({
            orgId: transaction.fromOrgId,
            date: transaction.transactionDate,
            journalNumber: fromJournalNumber,
            notes: `Inter-Company Transfer Out: ${transaction.description || 'Intercompany Transfer'} to ${transaction.toOrgId}`,
            reportingMethod: 'accrual',
            currency: transaction.currency || 'INR',
            subTotal: amount,
            total: amount,
            status: 'Published',
            lineItems: [
                {
                    account: dueFromAccount._id.toString(),
                    debits: amount,
                    credits: 0,
                    description: `Intercompany Receivable from ${transaction.toOrgId}`
                },
                {
                    account: transaction.fromAccountId,
                    debits: 0,
                    credits: amount,
                    description: `Transfer Out to ${transaction.toOrgId}`
                }
            ]
        });
        await fromJournal.save({ session });
        // 3. Generate Journal for Receiving Company (toOrgId)
        // Debit: Receiving Account (Bank / Expense / Asset)
        // Credit: Due To Parent / Affiliate (Liability)
        const toJournalNumber = `ICT-IN-${Date.now().toString().slice(-6)}`;
        const toJournal = new Journal_1.Journal({
            orgId: transaction.toOrgId,
            date: transaction.transactionDate,
            journalNumber: toJournalNumber,
            notes: `Inter-Company Transfer In: ${transaction.description || 'Intercompany Transfer'} from ${transaction.fromOrgId}`,
            reportingMethod: 'accrual',
            currency: transaction.currency || 'INR',
            subTotal: amount,
            total: amount,
            status: 'Published',
            lineItems: [
                {
                    account: transaction.toAccountId,
                    debits: amount,
                    credits: 0,
                    description: `Transfer In from ${transaction.fromOrgId}`
                },
                {
                    account: dueToAccount._id.toString(),
                    debits: 0,
                    credits: amount,
                    description: `Intercompany Payable to ${transaction.fromOrgId}`
                }
            ]
        });
        await toJournal.save({ session });
        transaction.status = 'Posted';
        transaction.fromJournalId = fromJournal._id.toString();
        transaction.toJournalId = toJournal._id.toString();
        await transaction.save({ session });
        await session.commitTransaction();
        session.endSession();
        // 4. Post Ledger Entries for both entities (outside MongoDB multi-doc session)
        await ledgerService_1.LedgerService.postTransaction(transaction.fromOrgId, fromJournal._id.toString(), 'Manual Journal', transaction.transactionDate, [
            { accountId: dueFromAccount._id.toString(), debit: amount, credit: 0 },
            { accountId: transaction.fromAccountId, debit: 0, credit: amount }
        ]);
        await ledgerService_1.LedgerService.postTransaction(transaction.toOrgId, toJournal._id.toString(), 'Manual Journal', transaction.transactionDate, [
            { accountId: transaction.toAccountId, debit: amount, credit: 0 },
            { accountId: dueToAccount._id.toString(), debit: 0, credit: amount }
        ]);
        res.json(transaction);
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.approveTransaction = approveTransaction;
const getConsolidatedEliminations = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { counterpartyOrgId } = req.query;
        const filter = { status: 'Posted' };
        if (counterpartyOrgId) {
            filter.$or = [
                { fromOrgId: orgId, toOrgId: counterpartyOrgId },
                { fromOrgId: counterpartyOrgId, toOrgId: orgId }
            ];
        }
        else {
            filter.$or = [{ fromOrgId: orgId }, { toOrgId: orgId }];
        }
        const transactions = await InterCompanyTransaction_1.InterCompanyTransaction.find(filter).lean();
        let totalDueFrom = 0;
        let totalDueTo = 0;
        const items = transactions.map(t => {
            const isSender = t.fromOrgId === orgId;
            if (isSender) {
                totalDueFrom += t.amount;
            }
            else {
                totalDueTo += t.amount;
            }
            return {
                _id: t._id,
                date: t.transactionDate,
                fromOrgId: t.fromOrgId,
                toOrgId: t.toOrgId,
                amount: t.amount,
                currency: t.currency,
                description: t.description,
                status: t.status,
                nature: isSender ? 'Intercompany Receivable' : 'Intercompany Payable',
                eliminationDebit: isSender ? 0 : t.amount,
                eliminationCredit: isSender ? t.amount : 0
            };
        });
        // In a fully reconciled intercompany environment, Net Elimination Variance = 0
        const netEliminationVariance = totalDueFrom - totalDueTo;
        res.json({
            reportingEntity: orgId,
            counterparty: counterpartyOrgId || 'All Group Entities',
            grossDueFrom: totalDueFrom,
            grossDueTo: totalDueTo,
            eliminationAdjustment: Math.min(totalDueFrom, totalDueTo),
            netEliminationVariance,
            isBalanced: Math.abs(netEliminationVariance) < 0.01,
            transactions: items
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getConsolidatedEliminations = getConsolidatedEliminations;
