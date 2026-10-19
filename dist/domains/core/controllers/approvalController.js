"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectTransaction = exports.approveTransaction = exports.submitForApproval = exports.getDocumentApprovalStatus = exports.getPendingCount = exports.getPendingApprovals = exports.updateRule = exports.getRules = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ApprovalWorkflowService_1 = require("../../../core/services/ApprovalWorkflowService");
const ApprovalRequest_1 = require("../../../core/models/ApprovalRequest");
const Role_1 = require("../models/Role");
const UserOrganization_1 = require("../models/UserOrganization");
const context_1 = require("../../../context");
/**
 * Helper to resolve user, orgId, and userRole from context & request
 */
async function resolveAuthContext(req) {
    const contextStore = context_1.requestContext.getStore();
    const orgId = req.org?._id?.toString() || contextStore?.orgId || req.user?.companyId || req.headers['x-org-id'];
    const user = req.user || {
        id: contextStore?.userId || req.headers['x-user-id'],
        role: contextStore?.isAdmin ? 'Admin' : 'User',
        isAdmin: contextStore?.isAdmin
    };
    const userId = user._id?.toString() || user.id || contextStore?.userId;
    let roleId = contextStore?.roleId;
    let userRole = null;
    if (orgId && (userId || user.email)) {
        const conditions = [];
        if (userId) {
            if (mongoose_1.default.isValidObjectId(userId)) {
                conditions.push({ userId: new mongoose_1.default.Types.ObjectId(userId) });
            }
            conditions.push({ userId: userId.toString() });
        }
        if (user.email) {
            conditions.push({ email: user.email.toLowerCase() });
        }
        const userOrg = await UserOrganization_1.UserOrganization.findOne({ orgId, $or: conditions }).populate('roleId').lean();
        if (userOrg) {
            if (userOrg.isAdmin) {
                user.isAdmin = true;
                user.role = 'Admin';
            }
            if (userOrg.roleId) {
                userRole = userOrg.roleId;
                roleId = userOrg.roleId._id?.toString();
            }
        }
    }
    if (!userRole && roleId) {
        userRole = await Role_1.Role.findById(roleId).lean();
    }
    return { orgId, user, userRole, roleId };
}
/**
 * GET /api/v1/approvals/rules
 * Fetch all module rules for the current organization
 */
const getRules = async (req, res, next) => {
    try {
        const { orgId } = await resolveAuthContext(req);
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing orgId' });
        const rules = await ApprovalWorkflowService_1.ApprovalWorkflowService.getAllModuleRules(orgId);
        const roles = await Role_1.Role.find({ orgId }).select('_id name description parentRoleId').lean();
        res.status(200).json({
            success: true,
            data: {
                rules,
                roles
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRules = getRules;
/**
 * PUT /api/v1/approvals/rules/:module
 * Update approval rule configuration for a module
 */
const updateRule = async (req, res, next) => {
    try {
        const { orgId } = await resolveAuthContext(req);
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing orgId' });
        const module = req.params.module;
        const { thresholdAmount, autoApproveBelowThreshold, requireParentRoleApproval, approverRoles, isActive } = req.body;
        const updated = await ApprovalWorkflowService_1.ApprovalWorkflowService.setModuleRule(orgId, module, {
            thresholdAmount: Number(thresholdAmount || 0),
            autoApproveBelowThreshold,
            requireParentRoleApproval,
            approverRoles,
            isActive
        });
        res.status(200).json({ success: true, data: updated, message: `Approval rule for ${module} updated successfully` });
    }
    catch (error) {
        next(error);
    }
};
exports.updateRule = updateRule;
/**
 * GET /api/v1/approvals/pending
 * Get list of pending approval requests that the logged-in user is authorized to approve
 */
const getPendingApprovals = async (req, res, next) => {
    try {
        const { orgId, user, userRole } = await resolveAuthContext(req);
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing orgId' });
        const pendingRequests = await ApprovalWorkflowService_1.ApprovalWorkflowService.getPendingApprovals(orgId, user, userRole);
        res.status(200).json({ success: true, data: pendingRequests });
    }
    catch (error) {
        next(error);
    }
};
exports.getPendingApprovals = getPendingApprovals;
/**
 * GET /api/v1/approvals/pending-count
 * Quick count of pending approvals for navbar notification badges
 */
const getPendingCount = async (req, res, next) => {
    try {
        const { orgId, user, userRole } = await resolveAuthContext(req);
        if (!orgId)
            return res.status(200).json({ success: true, count: 0 });
        const pendingRequests = await ApprovalWorkflowService_1.ApprovalWorkflowService.getPendingApprovals(orgId, user, userRole);
        res.status(200).json({ success: true, count: pendingRequests.length });
    }
    catch (error) {
        next(error);
    }
};
exports.getPendingCount = getPendingCount;
/**
 * GET /api/v1/approvals/document/:module/:documentId
 * Get current approval request details for a specific document
 */
const getDocumentApprovalStatus = async (req, res, next) => {
    try {
        const { orgId, user, userRole } = await resolveAuthContext(req);
        const module = req.params.module;
        const documentId = req.params.documentId;
        const request = await ApprovalRequest_1.ApprovalRequest.findOne({ orgId, module, entityId: documentId }).lean();
        if (!request) {
            return res.status(200).json({ success: true, data: null, canApprove: false });
        }
        const canApprove = ApprovalWorkflowService_1.ApprovalWorkflowService.canUserApprove(request, user, userRole);
        res.status(200).json({
            success: true,
            data: request,
            canApprove
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDocumentApprovalStatus = getDocumentApprovalStatus;
/**
 * POST /api/v1/approvals/submit
 * Submit a document for approval
 */
const submitForApproval = async (req, res, next) => {
    try {
        const { orgId, user, roleId } = await resolveAuthContext(req);
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing orgId' });
        const { module, documentId, documentNumber, amount, customerOrVendorName } = req.body;
        if (!module || !documentId) {
            return res.status(400).json({ success: false, message: 'Module and documentId are required' });
        }
        const request = await ApprovalWorkflowService_1.ApprovalWorkflowService.submitForApproval({
            orgId,
            module,
            documentId,
            documentNumber,
            amount: Number(amount || 0),
            customerOrVendorName,
            requestedBy: user._id?.toString() || user.id || 'system',
            requestedByName: user.displayName || user.name || user.email || 'Subordinate User',
            creatorRoleId: roleId
        });
        res.status(200).json({ success: true, data: request, message: 'Document submitted for approval' });
    }
    catch (error) {
        next(error);
    }
};
exports.submitForApproval = submitForApproval;
/**
 * POST /api/v1/approvals/approve
 * Approve a transaction (executes stock deduction/addition & double-entry posting)
 */
const approveTransaction = async (req, res, next) => {
    try {
        const { orgId, user, userRole } = await resolveAuthContext(req);
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing orgId' });
        const { module, documentId, comments } = req.body;
        if (!module || !documentId) {
            return res.status(400).json({ success: false, message: 'Module and documentId are required' });
        }
        const request = await ApprovalWorkflowService_1.ApprovalWorkflowService.approveTransaction({
            orgId,
            module,
            documentId,
            approverUser: user,
            approverRole: userRole,
            comments
        });
        res.status(200).json({ success: true, data: request, message: 'Transaction approved successfully' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Approval failed' });
    }
};
exports.approveTransaction = approveTransaction;
/**
 * POST /api/v1/approvals/reject
 * Reject a transaction with reason
 */
const rejectTransaction = async (req, res, next) => {
    try {
        const { orgId, user, userRole } = await resolveAuthContext(req);
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing orgId' });
        const { module, documentId, reason } = req.body;
        if (!module || !documentId) {
            return res.status(400).json({ success: false, message: 'Module and documentId are required' });
        }
        if (!reason || !reason.trim()) {
            return res.status(400).json({ success: false, message: 'Rejection reason is required' });
        }
        const request = await ApprovalWorkflowService_1.ApprovalWorkflowService.rejectTransaction({
            orgId,
            module,
            documentId,
            approverUser: user,
            approverRole: userRole,
            reason: reason.trim()
        });
        res.status(200).json({ success: true, data: request, message: 'Transaction rejected successfully' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Rejection failed' });
    }
};
exports.rejectTransaction = rejectTransaction;
