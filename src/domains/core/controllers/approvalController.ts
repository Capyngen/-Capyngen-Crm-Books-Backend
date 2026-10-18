import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ApprovalWorkflowService } from '../../../core/services/ApprovalWorkflowService';
import { ApprovalRequest } from '../../../core/models/ApprovalRequest';
import { Role } from '../models/Role';
import { UserOrganization } from '../models/UserOrganization';
import { requestContext } from '../../../context';

/**
 * Helper to resolve user, orgId, and userRole from context & request
 */
async function resolveAuthContext(req: Request) {
  const contextStore = requestContext.getStore();
  const orgId = (req as any).org?._id?.toString() || contextStore?.orgId || (req as any).user?.companyId || req.headers['x-org-id'] as string;
  const user = (req as any).user || {
    id: contextStore?.userId || req.headers['x-user-id'] as string,
    role: contextStore?.isAdmin ? 'Admin' : 'User',
    isAdmin: contextStore?.isAdmin
  };

  const userId = user._id?.toString() || user.id || contextStore?.userId;

  let roleId = contextStore?.roleId;
  let userRole: any = null;

  if (orgId && (userId || (user as any).email)) {
    const conditions: any[] = [];
    if (userId) {
      if (mongoose.isValidObjectId(userId)) {
        conditions.push({ userId: new mongoose.Types.ObjectId(userId) });
      }
      conditions.push({ userId: userId.toString() });
    }
    if ((user as any).email) {
      conditions.push({ email: (user as any).email.toLowerCase() });
    }
    const userOrg = await UserOrganization.findOne({ orgId, $or: conditions }).populate('roleId').lean();
    if (userOrg) {
      if (userOrg.isAdmin) {
        user.isAdmin = true;
        user.role = 'Admin';
      }
      if (userOrg.roleId) {
        userRole = userOrg.roleId;
        roleId = (userOrg.roleId as any)._id?.toString();
      }
    }
  }

  if (!userRole && roleId) {
    userRole = await Role.findById(roleId).lean();
  }

  return { orgId, user, userRole, roleId };
}

/**
 * GET /api/v1/approvals/rules
 * Fetch all module rules for the current organization
 */
export const getRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = await resolveAuthContext(req);
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing orgId' });

    const rules = await ApprovalWorkflowService.getAllModuleRules(orgId);
    const roles = await Role.find({ orgId }).select('_id name description parentRoleId').lean();

    res.status(200).json({
      success: true,
      data: {
        rules,
        roles
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/approvals/rules/:module
 * Update approval rule configuration for a module
 */
export const updateRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = await resolveAuthContext(req);
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing orgId' });

    const module = req.params.module as string;
    const {
      thresholdAmount,
      autoApproveBelowThreshold,
      requireParentRoleApproval,
      approverRoles,
      isActive
    } = req.body;

    const updated = await ApprovalWorkflowService.setModuleRule(orgId, module, {
      thresholdAmount: Number(thresholdAmount || 0),
      autoApproveBelowThreshold,
      requireParentRoleApproval,
      approverRoles,
      isActive
    });

    res.status(200).json({ success: true, data: updated, message: `Approval rule for ${module} updated successfully` });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/approvals/pending
 * Get list of pending approval requests that the logged-in user is authorized to approve
 */
export const getPendingApprovals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userRole } = await resolveAuthContext(req);
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing orgId' });

    const pendingRequests = await ApprovalWorkflowService.getPendingApprovals(orgId, user, userRole);
    res.status(200).json({ success: true, data: pendingRequests });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/approvals/pending-count
 * Quick count of pending approvals for navbar notification badges
 */
export const getPendingCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userRole } = await resolveAuthContext(req);
    if (!orgId) return res.status(200).json({ success: true, count: 0 });

    const pendingRequests = await ApprovalWorkflowService.getPendingApprovals(orgId, user, userRole);
    res.status(200).json({ success: true, count: pendingRequests.length });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/approvals/document/:module/:documentId
 * Get current approval request details for a specific document
 */
export const getDocumentApprovalStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userRole } = await resolveAuthContext(req);
    const module = req.params.module as string;
    const documentId = req.params.documentId as string;

    const request = await ApprovalRequest.findOne({ orgId, module, entityId: documentId }).lean();
    if (!request) {
      return res.status(200).json({ success: true, data: null, canApprove: false });
    }

    const canApprove = ApprovalWorkflowService.canUserApprove(request as any, user, userRole);

    res.status(200).json({
      success: true,
      data: request,
      canApprove
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/approvals/submit
 * Submit a document for approval
 */
export const submitForApproval = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, roleId } = await resolveAuthContext(req);
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing orgId' });

    const { module, documentId, documentNumber, amount, customerOrVendorName } = req.body;
    if (!module || !documentId) {
      return res.status(400).json({ success: false, message: 'Module and documentId are required' });
    }

    const request = await ApprovalWorkflowService.submitForApproval({
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
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/approvals/approve
 * Approve a transaction (executes stock deduction/addition & double-entry posting)
 */
export const approveTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userRole } = await resolveAuthContext(req);
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing orgId' });

    const { module, documentId, comments } = req.body;
    if (!module || !documentId) {
      return res.status(400).json({ success: false, message: 'Module and documentId are required' });
    }

    const request = await ApprovalWorkflowService.approveTransaction({
      orgId,
      module,
      documentId,
      approverUser: user,
      approverRole: userRole,
      comments
    });

    res.status(200).json({ success: true, data: request, message: 'Transaction approved successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Approval failed' });
  }
};

/**
 * POST /api/v1/approvals/reject
 * Reject a transaction with reason
 */
export const rejectTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userRole } = await resolveAuthContext(req);
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing orgId' });

    const { module, documentId, reason } = req.body;
    if (!module || !documentId) {
      return res.status(400).json({ success: false, message: 'Module and documentId are required' });
    }
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const request = await ApprovalWorkflowService.rejectTransaction({
      orgId,
      module,
      documentId,
      approverUser: user,
      approverRole: userRole,
      reason: reason.trim()
    });

    res.status(200).json({ success: true, data: request, message: 'Transaction rejected successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Rejection failed' });
  }
};
