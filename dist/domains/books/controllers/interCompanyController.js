"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveTransaction = exports.createTransaction = exports.getTransactions = void 0;
const InterCompanyTransaction_1 = require("../models/InterCompanyTransaction");
const Journal_1 = require("../models/Journal");
const mongoose_1 = __importDefault(require("mongoose"));
const getOrgId = (req) => {
    const orgIdRaw = req.org?._id || req.headers['x-org-id'];
    return orgIdRaw ? String(orgIdRaw) : undefined;
};
const getTransactions = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing Org ID' });
        // Find transactions where current org is either sender or receiver
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
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing Org ID' });
        const data = req.body;
        const transaction = new InterCompanyTransaction_1.InterCompanyTransaction({
            ...data,
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
        // Generate Journal for Originating Company (fromOrgId)
        const fromJournal = new Journal_1.Journal({
            orgId: transaction.fromOrgId,
            date: transaction.transactionDate,
            journalNumber: 'ICT-OUT-' + Date.now(),
            notes: 'Inter-Company Transfer Out: ' + transaction.description,
            reportingMethod: 'both',
            currency: transaction.currency,
            subTotal: transaction.amount,
            total: transaction.amount,
            lineItems: [
                { account: transaction.fromAccountId, debits: 0, credits: transaction.amount, description: 'ICT Transfer Out' },
                // Dummy balancing leg to a clearing account (Assuming user has one, else we just use the same for demo)
                { account: transaction.fromAccountId, debits: transaction.amount, credits: 0, description: 'ICT Clearing' }
            ]
        });
        await fromJournal.save({ session });
        // Generate Journal for Receiving Company (toOrgId)
        const toJournal = new Journal_1.Journal({
            orgId: transaction.toOrgId,
            date: transaction.transactionDate,
            journalNumber: 'ICT-IN-' + Date.now(),
            notes: 'Inter-Company Transfer In: ' + transaction.description,
            reportingMethod: 'both',
            currency: transaction.currency,
            subTotal: transaction.amount,
            total: transaction.amount,
            lineItems: [
                { account: transaction.toAccountId, debits: transaction.amount, credits: 0, description: 'ICT Transfer In' },
                { account: transaction.toAccountId, debits: 0, credits: transaction.amount, description: 'ICT Clearing' }
            ]
        });
        await toJournal.save({ session });
        transaction.status = 'Posted';
        transaction.fromJournalId = fromJournal._id.toString();
        transaction.toJournalId = toJournal._id.toString();
        await transaction.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.json(transaction);
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.approveTransaction = approveTransaction;
