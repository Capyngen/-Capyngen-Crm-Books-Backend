"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reimburseClaim = exports.financeApproveClaim = exports.managerApproveClaim = exports.submitClaim = exports.getClaimById = exports.getClaims = exports.createClaim = void 0;
const EmployeeExpenseClaim_1 = __importDefault(require("../models/EmployeeExpenseClaim"));
const Employee_1 = __importDefault(require("../models/Employee"));
const PostingEngine_1 = require("../services/PostingEngine");
const createClaim = async (req, res) => {
    try {
        const orgId = req.org?._id || req.body.orgId || req.body.companyId || 'SYSTEM';
        const { employeeId, title, items, advanceAdjusted, reimbursementMethod, notes } = req.body;
        const emp = await Employee_1.default.findById(employeeId);
        if (!emp) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        const count = await EmployeeExpenseClaim_1.default.countDocuments({
            $or: [{ orgId }, { companyId: orgId }]
        });
        const claimNumber = `EXP-CLM-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
        const parsedItems = Array.isArray(items) ? items : [];
        const totalAmount = parsedItems.reduce((sum, it) => sum + Number(it.amount || 0), 0);
        const advance = Number(advanceAdjusted || 0);
        const netClaimAmount = Math.max(0, totalAmount - advance);
        const claim = new EmployeeExpenseClaim_1.default({
            claimNumber,
            orgId,
            companyId: orgId,
            employeeId: emp._id,
            employeeCode: emp.employeeCode,
            employeeName: emp.employeeName,
            department: emp.department,
            title: title || `Expense Claim ${claimNumber}`,
            expenseDate: req.body.expenseDate ? new Date(req.body.expenseDate) : new Date(),
            items: parsedItems,
            totalAmount,
            advanceAdjusted: advance,
            netClaimAmount,
            status: req.body.submitDirectly ? 'Submitted' : 'Draft',
            approvalHistory: req.body.submitDirectly ? [{
                    role: 'Employee',
                    approverId: emp._id.toString(),
                    approverName: emp.employeeName,
                    status: 'Submitted',
                    comments: 'Claim submitted for approval',
                    timestamp: new Date()
                }] : [],
            reimbursementMethod: reimbursementMethod || 'Direct Bank Transfer',
            notes
        });
        const saved = await claim.save();
        res.status(201).json({ success: true, data: saved });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Bad Request' });
    }
};
exports.createClaim = createClaim;
const getClaims = async (req, res) => {
    try {
        const orgId = req.org?._id || req.query.orgId || req.query.companyId;
        const query = {};
        if (orgId) {
            query.$or = [{ orgId }, { companyId: orgId }];
        }
        if (req.query.employeeId) {
            query.employeeId = req.query.employeeId;
        }
        if (req.query.status) {
            query.status = req.query.status;
        }
        const claims = await EmployeeExpenseClaim_1.default.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: claims, count: claims.length });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
exports.getClaims = getClaims;
const getClaimById = async (req, res) => {
    try {
        const claim = await EmployeeExpenseClaim_1.default.findById(req.params.id);
        if (!claim) {
            return res.status(404).json({ success: false, message: 'Expense claim not found' });
        }
        res.json({ success: true, data: claim });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
exports.getClaimById = getClaimById;
const submitClaim = async (req, res) => {
    try {
        const claim = await EmployeeExpenseClaim_1.default.findById(req.params.id);
        if (!claim)
            return res.status(404).json({ success: false, message: 'Claim not found' });
        claim.status = 'Submitted';
        claim.approvalHistory.push({
            role: 'Employee',
            approverId: req.user?._id,
            approverName: claim.employeeName,
            status: 'Submitted',
            comments: req.body.comments || 'Submitted for manager review',
            timestamp: new Date()
        });
        await claim.save();
        res.json({ success: true, message: 'Expense claim submitted', data: claim });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Bad Request' });
    }
};
exports.submitClaim = submitClaim;
const managerApproveClaim = async (req, res) => {
    try {
        const claim = await EmployeeExpenseClaim_1.default.findById(req.params.id);
        if (!claim)
            return res.status(404).json({ success: false, message: 'Claim not found' });
        claim.status = 'Manager_Approved';
        claim.approvalHistory.push({
            role: 'Manager',
            approverId: req.user?._id,
            approverName: req.user?.email || 'Reporting Manager',
            status: 'Manager_Approved',
            comments: req.body.comments || 'Approved by Manager',
            timestamp: new Date()
        });
        await claim.save();
        res.json({ success: true, message: 'Expense claim approved by manager', data: claim });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Bad Request' });
    }
};
exports.managerApproveClaim = managerApproveClaim;
const financeApproveClaim = async (req, res) => {
    try {
        const claim = await EmployeeExpenseClaim_1.default.findById(req.params.id);
        if (!claim)
            return res.status(404).json({ success: false, message: 'Claim not found' });
        claim.status = 'Finance_Approved';
        claim.approvalHistory.push({
            role: 'Finance Admin',
            approverId: req.user?._id,
            approverName: req.user?.email || 'Finance Dept',
            status: 'Finance_Approved',
            comments: req.body.comments || 'Verified and approved for payment',
            timestamp: new Date()
        });
        // Auto-post GL Entry for accrued expense & payable
        await PostingEngine_1.PostingEngine.handleEvent('EMPLOYEE_EXPENSE_APPROVED', {
            companyId: claim.orgId || claim.companyId,
            orgId: claim.orgId || claim.companyId,
            claimId: claim._id.toString(),
            claimNumber: claim.claimNumber,
            employeeName: claim.employeeName,
            netClaimAmount: claim.netClaimAmount,
            totalAmount: claim.totalAmount,
            date: new Date()
        });
        claim.glJournalId = `JV-${claim.claimNumber}`;
        await claim.save();
        res.json({ success: true, message: 'Expense claim verified and posted to Books GL', data: claim });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Bad Request' });
    }
};
exports.financeApproveClaim = financeApproveClaim;
const reimburseClaim = async (req, res) => {
    try {
        const claim = await EmployeeExpenseClaim_1.default.findById(req.params.id);
        if (!claim)
            return res.status(404).json({ success: false, message: 'Claim not found' });
        if (claim.status !== 'Finance_Approved') {
            return res.status(400).json({ success: false, message: 'Claim must be approved by finance before reimbursement' });
        }
        claim.status = 'Paid';
        claim.reimbursedDate = req.body.reimbursedDate ? new Date(req.body.reimbursedDate) : new Date();
        claim.reimbursementReference = req.body.referenceNumber || `BANK-TXN-${Date.now()}`;
        claim.approvalHistory.push({
            role: 'Finance Disbursal',
            approverId: req.user?._id,
            approverName: req.user?.email || 'Finance Dept',
            status: 'Paid',
            comments: `Reimbursed via ${claim.reimbursementMethod} Ref: ${claim.reimbursementReference}`,
            timestamp: new Date()
        });
        // Auto-post GL payout entry
        await PostingEngine_1.PostingEngine.handleEvent('EMPLOYEE_EXPENSE_REIMBURSED', {
            companyId: claim.orgId || claim.companyId,
            orgId: claim.orgId || claim.companyId,
            claimId: claim._id.toString(),
            claimNumber: claim.claimNumber,
            netClaimAmount: claim.netClaimAmount,
            totalAmount: claim.totalAmount,
            date: claim.reimbursedDate
        });
        await claim.save();
        res.json({ success: true, message: 'Expense claim reimbursed and reconciled in GL', data: claim });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Bad Request' });
    }
};
exports.reimburseClaim = reimburseClaim;
