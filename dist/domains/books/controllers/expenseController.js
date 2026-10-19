"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBulkExpenses = exports.deleteExpense = exports.updateBulkExpenses = exports.updateExpense = exports.getExpenseById = exports.getExpenses = exports.createBulkExpenses = exports.createExpense = void 0;
const context_1 = require("../../../context");
const PostingEngine_1 = require("../services/PostingEngine");
const Expense_1 = __importDefault(require("../models/Expense"));
const MileageExpense_1 = __importDefault(require("../models/MileageExpense"));
const ApprovalWorkflowService_1 = require("../../../core/services/ApprovalWorkflowService");
const uuid_1 = require("uuid");
const createExpense = async (req, res, next) => {
    try {
        const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService_1.ApprovalWorkflowService.resolveUserContext(req);
        const requestedStatus = req.body.status || (req.body.paidThroughAccount ? 'Paid' : 'Approved');
        let finalStatus = requestedStatus;
        let finalApprovalStatus = 'Approved';
        if (requestedStatus === 'Draft') {
            finalStatus = 'Draft';
            finalApprovalStatus = 'Draft';
        }
        else {
            const evalResult = await ApprovalWorkflowService_1.ApprovalWorkflowService.evaluateApprovalNeed(orgId, 'expenses', Number(req.body.amount || 0), user, userRole);
            if (evalResult.requiresApproval) {
                finalStatus = 'Pending Approval';
                finalApprovalStatus = 'Pending';
            }
        }
        const doc = await Expense_1.default.create({
            ...req.body,
            status: finalStatus,
            approvalStatus: finalApprovalStatus,
            companyId: orgId,
            orgId,
            createdBy: userId
        });
        if (finalApprovalStatus === 'Pending') {
            await ApprovalWorkflowService_1.ApprovalWorkflowService.submitForApproval({
                orgId,
                module: 'expenses',
                documentId: doc._id.toString(),
                documentNumber: doc.expenseNumber || `EXP-${doc._id.toString().slice(-5).toUpperCase()}`,
                amount: Number(req.body.amount || 0),
                customerOrVendorName: req.body.vendorName || 'Expense',
                requestedBy: userId || 'system',
                requestedByName: user?.displayName || user?.name || user?.email,
                creatorRoleId: roleId
            });
        }
        else if (finalStatus !== 'Draft') {
            const isPaid = doc.status === 'Paid' || !!doc.paidThroughAccount;
            const payload = {
                expenseId: doc._id.toString(),
                companyId: orgId,
                amount: doc.amount,
                vendorId: doc.vendorId?.toString(),
                isPaid,
                accountId: doc.accountId?.toString(),
                paidThroughAccountId: doc.paidThroughAccount?.toString()
            };
            await PostingEngine_1.PostingEngine.handleEvent('EXPENSE_APPROVED', payload);
        }
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createExpense = createExpense;
const createBulkExpenses = async (req, res, next) => {
    try {
        const expenses = req.body.expenses;
        if (!expenses || !Array.isArray(expenses)) {
            return res.status(400).json({ success: false, message: 'Invalid data format. Expected an array of expenses.' });
        }
        const bulkBatchId = (0, uuid_1.v4)();
        const expensesWithBatch = expenses.map(e => ({ ...e, bulkBatchId }));
        const docs = await Expense_1.default.insertMany(expensesWithBatch);
        res.status(201).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createBulkExpenses = createBulkExpenses;
const getExpenses = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
        const regularDocs = await Expense_1.default.find(filter).populate('vendorId', 'displayName companyName').populate('customerId', 'displayName').lean();
        const mileageDocs = await MileageExpense_1.default.find(filter).populate('vendorId', 'displayName companyName').populate('customerId', 'displayName').lean();
        const mileageWithFlag = mileageDocs.map(m => ({ ...m, expenseType: 'Mileage' }));
        // Combine and sort descending by date, then createdAt
        const combined = [...regularDocs, ...mileageWithFlag].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA !== dateB)
                return dateB - dateA;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        res.status(200).json({ success: true, count: combined.length, data: combined });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getExpenses = getExpenses;
const getExpenseById = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId) {
            filter.$or = [{ companyId: orgId }, { orgId }];
        }
        let doc = await Expense_1.default.findOne(filter).populate('vendorId', 'displayName').populate('customerId', 'displayName').lean();
        if (doc) {
            return res.status(200).json({ success: true, data: doc });
        }
        // Fallback to MileageExpense
        let mileageDoc = await MileageExpense_1.default.findOne(filter).populate('vendorId', 'displayName').populate('customerId', 'displayName').lean();
        if (mileageDoc) {
            const combinedDoc = { ...mileageDoc, expenseType: 'Mileage' };
            return res.status(200).json({ success: true, data: combinedDoc });
        }
        return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getExpenseById = getExpenseById;
const updateExpense = async (req, res, next) => {
    try {
        // This endpoint should only update regular expenses (mileage uses its own API)
        const doc = await Expense_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateExpense = updateExpense;
const updateBulkExpenses = async (req, res, next) => {
    try {
        const bulkBatchId = req.params.batchId;
        const expenses = req.body.expenses;
        if (!expenses || !Array.isArray(expenses)) {
            return res.status(400).json({ success: false, message: 'Invalid data.' });
        }
        await Expense_1.default.deleteMany({ bulkBatchId });
        const expensesWithBatch = expenses.map(e => ({ ...e, bulkBatchId }));
        const docs = await Expense_1.default.insertMany(expensesWithBatch);
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateBulkExpenses = updateBulkExpenses;
const deleteExpense = async (req, res, next) => {
    try {
        let doc = await Expense_1.default.findByIdAndDelete(req.params.id);
        if (!doc) {
            doc = await MileageExpense_1.default.findByIdAndDelete(req.params.id);
        }
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.deleteExpense = deleteExpense;
const getBulkExpenses = async (req, res, next) => {
    try {
        const docs = await Expense_1.default.find({ bulkBatchId: req.params.batchId }).populate('vendorId', 'displayName').populate('customerId', 'displayName');
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getBulkExpenses = getBulkExpenses;
