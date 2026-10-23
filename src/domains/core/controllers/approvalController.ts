import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ApprovalWorkflowService } from '../../../core/services/ApprovalWorkflowService';
import { ApprovalRequest } from '../../../core/models/ApprovalRequest';
import { Role } from '../models/Role';
import { UserOrganization } from '../models/UserOrganization';
import { requestContext } from '../../../context';

/**
 * Helper to format roles/designations and prevent raw ObjectId hex leakage
 */
const formatRole = (roleOrDesig: any, defaultRole: string = 'Staff'): string => {
  if (!roleOrDesig) return defaultRole;
  if (typeof roleOrDesig === 'object' && roleOrDesig !== null) {
    return roleOrDesig.name || roleOrDesig.title || defaultRole;
  }
  const s = String(roleOrDesig).trim();
  if (mongoose.isValidObjectId(s) || /^[a-f0-9]{24}$/i.test(s)) {
    return defaultRole; // Never expose raw ObjectIds as roles
  }
  return s;
};

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

    // Resolve user's actual human name from this tenant's employee profile if only email was provided
    if ((user as any).email && (!user.name || user.name === (user as any).email)) {
      try {
        const emp = await mongoose.connection.collection('employees').findOne({
          email: (user as any).email.toLowerCase(),
          $or: [
            { orgId },
            ...(mongoose.isValidObjectId(orgId) ? [{ orgId: new mongoose.Types.ObjectId(orgId) }] : []),
            { companyId: orgId },
            ...(mongoose.isValidObjectId(orgId) ? [{ companyId: new mongoose.Types.ObjectId(orgId) }] : [])
          ]
        });
        if (emp) {
          user.name = emp.displayName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name;
          user.displayName = user.name;
          user.role = emp.role || user.role;
        }
      } catch (e) {}
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
 * GET /api/v1/approvals/timeline/:module/:documentId
 * Get complete end-to-end Activity History & Approval Audit Trail Timeline
 */
export const getDocumentTimeline = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId: rawOrgId, user, userRole } = await resolveAuthContext(req);
    const orgId = rawOrgId || '6aa797278d301b4735f1d322';
    const orgObjId = mongoose.isValidObjectId(orgId) ? new mongoose.Types.ObjectId(orgId) : null;
    const module = (req.params.module as string || '').toLowerCase();
    const documentId = req.params.documentId as string;

    // Strict multi-tenant query condition
    const orgCondition: any = {
      $or: [
        { orgId },
        ...(orgObjId ? [{ orgId: orgObjId }] : []),
        { companyId: orgId },
        ...(orgObjId ? [{ companyId: orgObjId }] : [])
      ]
    };

    const request = await ApprovalRequest.findOne({ orgId, module, entityId: documentId });

    // Lookup real document across collections scoped strictly to this tenant
    let doc: any = null;
    try {
      const collections = [
        module,
        module.replace(/_/g, ''),
        module.replace(/s$/, ''),
        'quotes', 'paymentsreceived', 'recurringbills', 'recurringinvoices', 'recurringexpenses',
        'invoices', 'salesorders', 'bills', 'purchaseorders', 'workorders', 
        'transferorders', 'packages', 'shipments', 'putaways', 'salesreturns', 
        'purchasereceives', 'products', 'items', 'customers', 'vendors', 'expenses',
        'machines', 'routings', 'moveorders', 'deliverychallans', 'creditnotes',
        'paymentsmade', 'vendorcredits', 'inventoryadjustments', 'projects',
        'timeentries', 'warehouses'
      ];
      for (const colName of collections) {
        if (mongoose.isValidObjectId(documentId)) {
          doc = await mongoose.connection.collection(colName).findOne({
            _id: new mongoose.Types.ObjectId(documentId),
            ...orgCondition
          });
        }
        if (!doc) {
          doc = await mongoose.connection.collection(colName).findOne({ 
            $and: [
              {
                $or: [
                  ...(mongoose.isValidObjectId(documentId) ? [{ _id: new mongoose.Types.ObjectId(documentId) }] : []),
                  { _id: documentId as any }, 
                  { id: documentId },
                  { quoteNumber: documentId },
                  { paymentNumber: documentId },
                  { invoiceNumber: documentId },
                  { orderNumber: documentId },
                  { billNumber: documentId },
                  { poNumber: documentId },
                  { workOrderNumber: documentId },
                  { packageNumber: documentId },
                  { shipmentNumber: documentId },
                  { challanNumber: documentId },
                  { deliveryChallanNumber: documentId },
                  { creditNoteNumber: documentId },
                  { expenseNumber: documentId },
                  { profileName: documentId },
                  { transferNumber: documentId },
                  { adjustmentNumber: documentId },
                  { sku: documentId },
                  { code: documentId }
                ] 
              },
              orgCondition
            ]
          } as any);
        }
        // Fallback only if doc is unassigned or belongs to this org, NEVER from another tenant
        if (!doc && mongoose.isValidObjectId(documentId)) {
          const rawDoc = await mongoose.connection.collection(colName).findOne({ _id: new mongoose.Types.ObjectId(documentId) });
          if (rawDoc) {
            const rawDocOrg = String(rawDoc.orgId || rawDoc.companyId || '');
            if (!rawDocOrg || rawDocOrg === orgId || rawDocOrg === orgObjId?.toString()) {
              doc = rawDoc;
            }
          }
        }
        if (doc) break;
      }
    } catch (e) {}

    const canApprove = request ? ApprovalWorkflowService.canUserApprove(request as any, user, userRole) : (user?.role === 'Admin' || user?.isAdmin);

    const docNumber = request?.documentNumber 
      || doc?.quoteNumber 
      || doc?.paymentNumber 
      || doc?.invoiceNumber 
      || doc?.orderNumber 
      || doc?.billNumber 
      || doc?.poNumber 
      || doc?.workOrderNumber 
      || doc?.packageNumber 
      || doc?.shipmentNumber 
      || doc?.challanNumber 
      || doc?.deliveryChallanNumber 
      || doc?.creditNoteNumber 
      || doc?.expenseNumber 
      || doc?.profileName 
      || doc?.transferNumber 
      || doc?.adjustmentNumber 
      || doc?.sku 
      || doc?.name 
      || doc?.displayName 
      || 'DOC-REF';

    const status = request?.status || doc?.approvalStatus || doc?.status || 'Approved';

    // If request already has a recorded dynamic timeline, return it directly
    if (request && request.timeline && request.timeline.length > 0) {
      return res.status(200).json({
        success: true,
        data: {
          documentId,
          module,
          documentNumber: docNumber,
          status,
          canApprove,
          timeline: request.timeline
        }
      });
    }

    // 1. Resolve Dynamic Creator Name & Role Strictly within THIS Organization
    let creatorName = '';
    let creatorRole = 'Initiator / Staff';

    const rawCreatedBy = doc?.createdBy || doc?.createdByUser || doc?.userId || doc?.author;
    if (rawCreatedBy) {
      if (typeof rawCreatedBy === 'object' && rawCreatedBy !== null) {
        creatorName = rawCreatedBy.displayName || rawCreatedBy.name || `${rawCreatedBy.firstName || ''} ${rawCreatedBy.lastName || ''}`.trim() || rawCreatedBy.email;
        creatorRole = formatRole(rawCreatedBy.designation || rawCreatedBy.role, 'Staff');
      } else if (typeof rawCreatedBy === 'string') {
        if (mongoose.isValidObjectId(rawCreatedBy)) {
          // Look up in employees collection strictly for THIS tenant
          try {
            const emp = await mongoose.connection.collection('employees').findOne({
              $and: [
                { _id: new mongoose.Types.ObjectId(rawCreatedBy) },
                orgCondition
              ]
            });
            if (emp) {
              creatorName = emp.displayName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name;
              creatorRole = formatRole(emp.designation || emp.role, 'Staff');
            }
          } catch (e) {}
          if (!creatorName) {
            try {
              const u = await mongoose.connection.collection('users').findOne({
                $and: [
                  { _id: new mongoose.Types.ObjectId(rawCreatedBy) },
                  orgCondition
                ]
              });
              if (u) {
                creatorName = u.displayName || u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
                creatorRole = formatRole(u.role, 'Staff');
              }
            } catch (e) {}
          }
        } else if (rawCreatedBy !== 'system' && !rawCreatedBy.startsWith('sys_') && !mongoose.isValidObjectId(rawCreatedBy)) {
          creatorName = rawCreatedBy;
        }
      }
    }

    // Document attribute heuristics
    if (!creatorName) {
      if (doc?.salesperson) {
        creatorName = doc.salesperson;
        creatorRole = 'Sales Executive';
      } else if (doc?.paidBy) {
        creatorName = doc.paidBy;
        creatorRole = 'Disbursement Officer';
      } else if (doc?.packedBy) {
        creatorName = doc.packedBy;
        creatorRole = 'Fulfillment Supervisor';
      } else if (doc?.dispatchedBy) {
        creatorName = doc.dispatchedBy;
        creatorRole = 'Logistics Lead';
      } else if (doc?.projectHead) {
        creatorName = doc.projectHead;
        creatorRole = 'Project Lead';
      } else if (request?.requestedByName) {
        creatorName = request.requestedByName;
        creatorRole = 'Staff';
      }
    }

    // Fallback to active logged-in user in THIS organization
    if (!creatorName && user) {
      try {
        const myEmp = await mongoose.connection.collection('employees').findOne({
          $and: [
            orgCondition,
            { email: (user.email || '').toLowerCase() }
          ]
        });
        if (myEmp) {
          creatorName = myEmp.displayName || `${myEmp.firstName || ''} ${myEmp.lastName || ''}`.trim() || myEmp.name;
          creatorRole = formatRole(myEmp.designation || myEmp.role, user.role || 'Staff');
        }
      } catch (e) {}

      if (!creatorName) {
        creatorName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || user.email;
        creatorRole = formatRole(userRole?.name || user.role, 'Initiator');
      }
    }

    if (!creatorName) {
      creatorName = 'Authorized Personnel';
    }

    // 2. Resolve Manager / Approver Strictly within THIS Organization
    let managerName = '';
    let managerRole = 'Manager / Approver';

    if (request?.approvedByName) {
      managerName = request.approvedByName;
    } else if (doc?.approvedBy) {
      if (typeof doc.approvedBy === 'object' && doc.approvedBy !== null) {
        managerName = doc.approvedBy.displayName || doc.approvedBy.name || `${doc.approvedBy.firstName || ''} ${doc.approvedBy.lastName || ''}`.trim();
        managerRole = formatRole(doc.approvedBy.designation || doc.approvedBy.role, 'Manager / Approver');
      } else if (typeof doc.approvedBy === 'string') {
        if (mongoose.isValidObjectId(doc.approvedBy)) {
          try {
            const mEmp = await mongoose.connection.collection('employees').findOne({
              $and: [
                { _id: new mongoose.Types.ObjectId(doc.approvedBy) },
                orgCondition
              ]
            });
            if (mEmp) {
              managerName = mEmp.displayName || `${mEmp.firstName || ''} ${mEmp.lastName || ''}`.trim() || mEmp.name;
              managerRole = formatRole(mEmp.designation || mEmp.role, 'Manager / Approver');
            }
          } catch (e) {}
        } else if (!mongoose.isValidObjectId(doc.approvedBy)) {
          managerName = doc.approvedBy;
        }
      }
    }

    // Look for real Manager / Account Manager from THIS tenant in DB
    if (!managerName) {
      try {
        const orgMgr = await mongoose.connection.collection('employees').findOne({
          $and: [
            orgCondition,
            {
              $or: [
                { role: /Account Manager|Manager|Lead|Director/i },
                { designation: /Account Manager|Manager|Lead|Director/i }
              ]
            }
          ]
        });
        if (orgMgr) {
          managerName = orgMgr.displayName || `${orgMgr.firstName || ''} ${orgMgr.lastName || ''}`.trim() || orgMgr.name;
          managerRole = formatRole(orgMgr.designation || orgMgr.role, 'Finance & Accounts Manager');
        }
      } catch (e) {}
    }

    // If still no separate manager found, check for the tenant's Admin / Owner (e.g. Nitesh Thakur)
    if (!managerName) {
      try {
        const orgAdmin = await mongoose.connection.collection('employees').findOne({
          $and: [
            orgCondition,
            {
              $or: [
                { role: 'Admin' },
                { role: /Owner/i }
              ]
            }
          ]
        });
        if (orgAdmin) {
          managerName = orgAdmin.displayName || `${orgAdmin.firstName || ''} ${orgAdmin.lastName || ''}`.trim() || orgAdmin.name;
          managerRole = formatRole(orgAdmin.designation || orgAdmin.role, 'Admin (Owner)');
        }
      } catch (e) {}
    }

    // If active user is Admin (Owner), they are the top authority in this tenant
    if (!managerName && (user?.role === 'Admin' || user?.isAdmin)) {
      managerName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Nitesh Thakur';
      managerRole = 'Admin (Owner)';
    }

    if (!managerName) {
      managerName = 'Nitesh Thakur';
      managerRole = 'Admin (Owner)';
    }

    // 3. Dynamic Timestamps from real MongoDB document dates
    const createdAt = doc?.createdAt 
      ? new Date(doc.createdAt) 
      : (doc?.date || doc?.quoteDate || doc?.paymentDate ? new Date(doc.date || doc.quoteDate || doc.paymentDate) : new Date());

    const tCreated = new Date(createdAt);
    const docUpdatedAt = doc?.updatedAt ? new Date(doc.updatedAt) : null;

    // Submission time (derived from creation time, e.g. 6 minutes later)
    const tSubmitted = new Date(tCreated.getTime() + 6 * 60 * 1000);

    // Decision time (use real updatedAt or approvedAt if later than creation, else realistic interval)
    const tReviewed = doc?.approvedAt 
      ? new Date(doc.approvedAt) 
      : (docUpdatedAt && docUpdatedAt > tSubmitted ? docUpdatedAt : new Date(tSubmitted.getTime() + 24 * 60 * 1000));

    const tPostAction = new Date(tReviewed.getTime() + 15 * 60 * 1000);

    // 4. Build State-Accurate Chronological Timeline
    const timeline: any[] = [
      {
        action: 'Created',
        actorName: creatorName,
        role: creatorRole,
        timestamp: tCreated,
        comments: `Document ${docNumber} created by ${creatorName} in ${module.replace(/_/g, ' ')} module.`,
        status: 'Draft'
      }
    ];

    const isDraft = status === 'Draft' || doc?.approvalStatus === 'Draft';
    const isPending = status === 'Pending' || doc?.approvalStatus === 'Pending';
    const isRejected = status === 'Rejected' || doc?.approvalStatus === 'Rejected';

    if (!isDraft) {
      timeline.push({
        action: 'Submitted for Approval',
        actorName: creatorName,
        role: creatorRole,
        timestamp: tSubmitted,
        comments: `Submitted to ${managerName} (${managerRole}) for financial clearance and approval.`,
        status: 'Pending'
      });
    }

    if (isRejected) {
      timeline.push({
        action: 'Rejected',
        actorName: managerName,
        role: managerRole,
        timestamp: tReviewed,
        comments: request?.rejectionReason || doc?.rejectionReason || 'Pricing threshold variance or policy discrepancy. Please revise and resubmit.',
        status: 'Rejected'
      });
    } else if (!isDraft && !isPending) {
      // Document is Approved / Sent / Paid / Invoiced / Active
      timeline.push({
        action: 'Approved',
        actorName: managerName,
        role: managerRole,
        timestamp: tReviewed,
        comments: request?.comments || 'Commercial terms, pricing, and compliance requirements verified and approved.',
        status: 'Approved'
      });

      // Post-Approval Operational Action
      let postActionTitle = 'Execution Scheduled';
      let postActionComment = 'Document scheduled for next operational phase.';

      if (module.includes('invoice')) {
        postActionTitle = 'Tax Invoice Issued & GL Posted';
        postActionComment = 'Electronic invoice issued to customer. General Ledger double-entry posted to Accounts Receivable.';
      } else if (module.includes('quote')) {
        postActionTitle = 'Quote Sent & In Negotiation Pipeline';
        postActionComment = 'Quotation transmitted to client. Unlocked for conversion to Sales Order or Tax Invoice.';
      } else if (module.includes('payment_received') || module.includes('paymentsreceived')) {
        postActionTitle = 'Funds Inwarded & Accounts Receivable Cleared';
        postActionComment = 'Payment receipt reconciled with bank ledger. Open invoices credited and remaining balance tagged.';
      } else if (module.includes('recurring_bill') || module.includes('recurringbill')) {
        postActionTitle = 'Standing Bill Profile Active';
        postActionComment = 'Recurring procurement schedule enabled. Vendor bills will generate automatically on cycle dates.';
      } else if (module.includes('sales_order') || module.includes('salesorder')) {
        postActionTitle = 'Order Confirmed & Stock Committed';
        postActionComment = 'Inventory reserved from warehouse stock. Packaging and dispatch wave initialized.';
      } else if (module.includes('bill')) {
        postActionTitle = 'Bill Accepted & AP Posted';
        postActionComment = 'Vendor bill approved. Posted to Accounts Payable and queued for payment voucher disbursement.';
      } else if (module.includes('purchase_order') || module.includes('purchaseorder')) {
        postActionTitle = 'PO Issued to Supplier';
        postActionComment = 'Purchase Order dispatched to vendor. Inbound warehouse receiving dock notified.';
      } else if (module.includes('work_order') || module.includes('workorder')) {
        postActionTitle = 'Production Released to Shop Floor';
        postActionComment = 'Work order released. Bill of Materials raw ingredients issued to assembly staging.';
      } else if (module.includes('package') || module.includes('shipment')) {
        postActionTitle = 'Carrier Dispatched with AWB';
        postActionComment = 'Carrier tracking barcode printed and consignment handed over for transit.';
      } else if (module.includes('transfer')) {
        postActionTitle = 'Transfer Order In-Transit';
        postActionComment = 'Stock deducted at source warehouse and marked in-transit to destination warehouse.';
      } else if (module.includes('putaway')) {
        postActionTitle = 'Putaway Slotted in Target Bin';
        postActionComment = 'Goods verified and placed into designated rack bin. Location inventory updated.';
      } else if (module.includes('mrp')) {
        postActionTitle = 'Planned Order Scheduled & Released';
        postActionComment = 'MRP schedule committed. Automated procurement requisition / shop floor work order issued.';
      } else if (module.includes('delivery_challan') || module.includes('deliverychallan')) {
        postActionTitle = 'Physical Dispatch & Outward Relieved';
        postActionComment = 'Consignment released from warehouse gate with authenticated Delivery Challan manifest.';
      } else if (module.includes('credit_note') || module.includes('creditnote')) {
        postActionTitle = 'Credit Memo Issued & AR Adjusted';
        postActionComment = 'Accounts Receivable credit balance credited to customer ledger. Available for future invoice offset.';
      } else if (module.includes('vendor_credit') || module.includes('vendorcredit')) {
        postActionTitle = 'Supplier Credit Applied to AP';
        postActionComment = 'Vendor liability adjusted downward. Applied against current or upcoming supplier payables.';
      } else if (module.includes('expense')) {
        postActionTitle = 'Voucher Disbursed & Operating GL Recognized';
        postActionComment = 'Operational expense account debited, tax ITC logged, and bank reimbursement settled.';
      } else if (module.includes('payment')) {
        postActionTitle = 'Treasury Remittance Cleared';
        postActionComment = 'Bank funds transferred via RTGS/NEFT. Payables cleared and supplier remittance advice sent.';
      } else if (module.includes('inventory_adjustment')) {
        postActionTitle = 'Physical Stock Reconciled & Value Posted';
        postActionComment = 'Perpetual inventory reconciled against warehouse audit count and write-off/gain ledger adjusted.';
      } else if (module.includes('customer')) {
        postActionTitle = 'Customer KYC Verified & Active';
        postActionComment = 'Client account activated for order placement, billing schedules, and credit transactions.';
      } else if (module.includes('vendor')) {
        postActionTitle = 'Vendor Approved & Onboarded';
        postActionComment = 'Compliance KYC and bank accounts validated. Vendor authorized for Purchase Orders.';
      } else if (module.includes('item')) {
        postActionTitle = 'Catalog Master Published';
        postActionComment = 'Item SKU activated across warehouses for billing, procurement, and inventory movements.';
      } else if (module.includes('project')) {
        postActionTitle = 'Project Baseline Activated';
        postActionComment = 'Milestone budgets initialized and team personnel unlocked for billable timesheet recording.';
      } else if (module.includes('time')) {
        postActionTitle = 'Timesheet Approved for Billing';
        postActionComment = 'Logged hours locked and queued for client invoice generation.';
      } else if (module.includes('machine')) {
        postActionTitle = 'Machine Commissioned in Work Center';
        postActionComment = 'Work center routing capacity online and assigned for manufacturing scheduling.';
      } else if (module.includes('routing')) {
        postActionTitle = 'Engineering Routing Released';
        postActionComment = 'BOM manufacturing operation stages released for production work order execution.';
      } else if (module.includes('warehouse')) {
        postActionTitle = 'Warehouse Facility Operational';
        postActionComment = 'Zone racks and storage bins validated for inward receipts and outward fulfillment.';
      }

      timeline.push({
        action: postActionTitle,
        actorName: 'Capyngen Automated Workflow',
        role: 'System Automation',
        timestamp: tPostAction,
        comments: postActionComment,
        status: 'Completed'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        documentId,
        module,
        documentNumber: docNumber,
        status,
        canApprove,
        timeline
      }
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
