import mongoose from 'mongoose';
import { requestContext } from '../../context';
import { ApprovalRule, IApprovalRule } from '../models/ApprovalRule';
import { ApprovalRequest, IApprovalRequest } from '../models/ApprovalRequest';
import { Role } from '../../domains/core/models/Role';
import { UserOrganization } from '../../domains/core/models/UserOrganization';
import Item from '../../domains/inventory/models/Item';
import { PostingEngine } from '../../domains/books/services/PostingEngine';
import Invoice from '../../domains/billing/models/Invoice';
import Bill from '../../domains/inventory/models/Bill';
import SalesOrder from '../../domains/billing/models/SalesOrder';
import PurchaseOrder from '../../domains/inventory/models/PurchaseOrder';
import Expense from '../../domains/books/models/Expense';
import CreditNote from '../../domains/billing/models/CreditNote';
import VendorCredit from '../../domains/inventory/models/VendorCredit';
import InventoryAdjustment from '../../domains/inventory/models/InventoryAdjustment';
import Quote from '../../domains/billing/models/Quote';
import DeliveryChallan from '../../domains/inventory/models/DeliveryChallan';
import TransferOrder from '../../domains/inventory/models/TransferOrder';
import PaymentMade from '../../domains/books/models/PaymentMade';
import { Journal } from '../../domains/books/models/Journal';
import { LedgerService } from '../../domains/books/services/ledgerService';

export const SUPPORTED_APPROVAL_MODULES = [
  { id: 'invoices', label: 'Invoices', model: 'Invoice' },
  { id: 'sales_orders', label: 'Sales Orders', model: 'SalesOrder' },
  { id: 'quotes', label: 'Quotes & Estimates', model: 'Quote' },
  { id: 'delivery_challans', label: 'Delivery Challans', model: 'DeliveryChallan' },
  { id: 'credit_notes', label: 'Credit Notes', model: 'CreditNote' },
  { id: 'bills', label: 'Bills & Vendor Invoices', model: 'Bill' },
  { id: 'purchase_orders', label: 'Purchase Orders', model: 'PurchaseOrder' },
  { id: 'vendor_credits', label: 'Vendor Credits / Debit Notes', model: 'VendorCredit' },
  { id: 'payments_made', label: 'Payments Made', model: 'BooksPaymentMade' },
  { id: 'expenses', label: 'Expenses & Reimbursements', model: 'Expense' },
  { id: 'transfer_orders', label: 'Inter-Warehouse Transfers', model: 'BooksTransferOrder' },
  { id: 'inventory_adjustments', label: 'Inventory Adjustments', model: 'InventoryAdjustment' },
  { id: 'manual_journals', label: 'Manual Journals (General Ledger)', model: 'Journal' },
];

export class ApprovalWorkflowService {

  /**
   * Universal helper to extract multi-tenant orgId, user, role, and role hierarchy from any Express request.
   */
  static async resolveUserContext(req: any): Promise<{
    orgId: string;
    user: any;
    userId: string;
    userRole: any;
    roleId?: string;
  }> {
    const orgId = req.org?._id?.toString() || req.headers?.['x-org-id'] || requestContext.getStore()?.orgId || req.body?.companyId || req.body?.orgId;
    const user = req.user;
    const userId = user?._id?.toString() || user?.id || req.userId;
    let userRole = req.role;
    let roleId = userRole?._id?.toString() || userRole?.toString();

    if (!userRole && userId && orgId) {
      const conditions: any[] = [];
      if (mongoose.isValidObjectId(userId)) conditions.push({ userId: new mongoose.Types.ObjectId(userId) });
      conditions.push({ userId: userId.toString() });
      if (user?.email) {
        conditions.push({ email: user.email.toLowerCase() });
      }
      const userOrg = await UserOrganization.findOne({ orgId, $or: conditions }).populate('roleId').lean();
      if (userOrg?.roleId) {
        userRole = userOrg.roleId;
        roleId = (userOrg.roleId as any)._id?.toString();
      }
    }

    return { orgId, user, userId, userRole, roleId };
  }

  /**
   * Get active approval rule for a specific module in an org.
   */
  static async getModuleRule(orgId: string, module: string): Promise<IApprovalRule | null> {
    return ApprovalRule.findOne({ orgId, module });
  }

  /**
   * Set/update approval rule for a module in an org.
   */
  static async setModuleRule(
    orgId: string,
    module: string,
    data: {
      thresholdAmount?: number;
      autoApproveBelowThreshold?: boolean;
      requireParentRoleApproval?: boolean;
      approverRoles?: string[];
      isActive?: boolean;
    }
  ): Promise<IApprovalRule> {
    const updated = await ApprovalRule.findOneAndUpdate(
      { orgId, module },
      {
        $set: {
          orgId,
          module,
          thresholdAmount: Number(data.thresholdAmount || 0),
          autoApproveBelowThreshold: data.autoApproveBelowThreshold !== false,
          requireParentRoleApproval: data.requireParentRoleApproval !== false,
          approverRoles: data.approverRoles || [],
          isActive: data.isActive !== false,
        }
      },
      { upsert: true, new: true }
    );
    return updated;
  }

  /**
   * Get all approval rules configured for this organization.
   */
  static async getAllModuleRules(orgId: string) {
    const existingRules = await ApprovalRule.find({ orgId }).lean();
    const rulesMap = new Map(existingRules.map(r => [r.module, r]));

    return SUPPORTED_APPROVAL_MODULES.map(m => {
      const existing = rulesMap.get(m.id);
      return {
        module: m.id,
        label: m.label,
        thresholdAmount: existing?.thresholdAmount ?? 0,
        autoApproveBelowThreshold: existing?.autoApproveBelowThreshold ?? true,
        requireParentRoleApproval: existing?.requireParentRoleApproval ?? true,
        approverRoles: existing?.approverRoles ?? [],
        isActive: existing?.isActive ?? false,
      };
    });
  }

  /**
   * Evaluate whether a transaction needs approval.
   */
  static async evaluateApprovalNeed(
    orgId: string,
    module: string,
    amount: number,
    user: any,
    userRole: any
  ): Promise<{ requiresApproval: boolean; reason?: string; parentRoleId?: string; approverRoles?: string[] }> {
    // Admin, Owner, or Workspace Owner always bypass approval (they self-approve)
    const isAdmin = user?.role === 'Admin' || user?.role === 'Owner' || user?.isWorkspaceOwner || user?.isAdmin || userRole?.name === 'Admin';
    if (isAdmin) {
      return { requiresApproval: false, reason: 'Administrator auto-approved' };
    }

    const rule = await this.getModuleRule(orgId, module);
    // If approval workflow is disabled for this module
    if (!rule || !rule.isActive) {
      return { requiresApproval: false, reason: 'Approval workflow disabled for this module' };
    }

    // Dynamic threshold evaluation (set by Admin/Manager)
    const threshold = Number(rule.thresholdAmount || 0);
    if (threshold > 0 && amount < threshold && rule.autoApproveBelowThreshold) {
      return { requiresApproval: false, reason: `Amount (${amount}) is below auto-approval threshold (${threshold})` };
    }

    // Determine parent role from creator's role
    const parentRoleId = userRole?.parentRoleId?.toString() || null;

    return {
      requiresApproval: true,
      parentRoleId: parentRoleId || undefined,
      approverRoles: rule.approverRoles || [],
      reason: `Amount (${amount}) exceeds threshold (${threshold}) or requires manager approval`,
    };
  }

  /**
   * Submit a document for approval.
   */
  static async submitForApproval(params: {
    orgId: string;
    module: string;
    documentId: string;
    documentNumber?: string;
    amount?: number;
    customerOrVendorName?: string;
    requestedBy: string;
    requestedByName?: string;
    creatorRoleId?: string;
  }) {
    const { orgId, module, documentId, documentNumber, amount, customerOrVendorName, requestedBy, requestedByName, creatorRoleId } = params;

    let parentRoleId: string | undefined;
    if (creatorRoleId) {
      const role = await Role.findById(creatorRoleId).lean();
      if (role?.parentRoleId) {
        parentRoleId = role.parentRoleId.toString();
      }
    }

    const rule = await this.getModuleRule(orgId, module);

    const existingRequest = await ApprovalRequest.findOne({ orgId, module, entityId: documentId });
    const isResubmission = existingRequest && existingRequest.status === 'Rejected';

    const request = await ApprovalRequest.findOneAndUpdate(
      { orgId, module, entityId: documentId },
      {
        $set: {
          orgId,
          module,
          entityId: documentId,
          documentNumber,
          amount: Number(amount || 0),
          customerOrVendorName,
          status: 'Pending',
          requestedBy,
          requestedByName,
          parentRoleId,
          approverRoles: rule?.approverRoles || [],
          comments: '',
          rejectionReason: '',
        },
        $push: {
          timeline: {
            action: isResubmission ? 'Re-submitted for Approval' : 'Submitted for Approval',
            actorId: requestedBy,
            actorName: requestedByName || 'User',
            role: 'Creator / Subordinate',
            timestamp: new Date(),
            comments: isResubmission ? 'Revised document parameters and re-submitted for manager review.' : 'Submitted for Manager approval & verification.',
            status: 'Pending'
          }
        }
      },
      { upsert: true, new: true }
    );

    return request;
  }

  /**
   * Verify if the given user is authorized to approve this request.
   * Security Guarantee: A parent role (manager) can ONLY approve/reject subordinate requests;
   * they do NOT gain admin rights or access to settings.
   */
  static canUserApprove(request: IApprovalRequest, user: any, userRole: any): boolean {
    if (!request || request.status !== 'Pending') return false;

    // 1. Admin or Owner has override approval authority
    if (user?.role === 'Admin' || user?.role === 'Owner' || user?.isWorkspaceOwner || user?.isAdmin || userRole?.name === 'Admin') {
      return true;
    }

    const userRoleId = userRole?._id?.toString() || userRole?.toString();
    if (!userRoleId) return false;

    // 2. Direct Parent Role of the creator (e.g. Accounts Manager approving Junior Accountant)
    if (request.parentRoleId && request.parentRoleId === userRoleId) {
      return true;
    }

    // 3. Role explicitly in approverRoles list
    if (request.approverRoles && request.approverRoles.includes(userRoleId)) {
      return true;
    }

    return false;
  }

  /**
   * Approve a transaction and execute all cross-domain operations:
   * 1. Status -> 'Approved' / 'Sent' / 'Open'
   * 2. Double-Entry Accounting (PostingEngine)
   * 3. Inventory Stock Deduction / Addition (Item.stock & currentStock)
   */
  static async approveTransaction(params: {
    orgId: string;
    module: string;
    documentId: string;
    approverUser: any;
    approverRole: any;
    comments?: string;
  }) {
    const { orgId, module, documentId, approverUser, approverRole, comments } = params;

    const request = await ApprovalRequest.findOne({ orgId, module, entityId: documentId });
    if (!request) {
      throw new Error('Approval request not found');
    }

    if (!this.canUserApprove(request, approverUser, approverRole)) {
      throw new Error('You do not have permission to approve this transaction');
    }

    request.status = 'Approved';
    request.approvedBy = approverUser._id?.toString() || approverUser.id;
    request.approvedByName = approverUser.displayName || approverUser.name || approverUser.email;
    request.comments = comments || 'Approved';
    request.timeline = request.timeline || [];
    request.timeline.push({
      action: 'Approved',
      actorId: approverUser._id?.toString() || approverUser.id,
      actorName: approverUser.displayName || approverUser.name || approverUser.email || 'Priya Verma (Finance Manager)',
      role: 'Manager / Approver',
      timestamp: new Date(),
      comments: comments || 'Verified line items, pricing, and commercial terms. Approved for execution.',
      status: 'Approved'
    });
    await request.save();

    // Execute Module-Specific Operations
    switch (module) {
      case 'invoices': {
        const invoice = await Invoice.findById(documentId);
        if (!invoice) throw new Error('Invoice not found');
        invoice.status = 'Open';
        (invoice as any).approvalStatus = 'Approved';
        (invoice as any).postingStatus = 'Posted';
        if (!(invoice as any).dispatchStatus) {
          (invoice as any).dispatchStatus = 'Not Sent';
        }
        await invoice.save();

        // 1. Stock Deduction for physical Goods
        if (invoice.items && Array.isArray(invoice.items)) {
          for (const line of invoice.items) {
            if (line.item) {
              const itemDoc = await Item.findById(line.item);
              if (itemDoc && itemDoc.type !== 'service') {
                const qty = Number(line.quantity || 0);
                await Item.findByIdAndUpdate(line.item, {
                  $inc: { stock: -qty, currentStock: -qty, stockQuantity: -qty }
                });
              }
            }
          }
        }

        // 2. Double-Entry General Ledger Posting
        const payload = {
          invoiceId: invoice._id.toString(),
          companyId: orgId,
          customerId: invoice.customer?._id?.toString() || invoice.customer?.toString(),
          subTotal: invoice.subTotal || 0,
          taxTotal: invoice.taxTotal || 0,
          grandTotal: invoice.total || 0,
          invoiceDate: invoice.invoiceDate,
          invoiceNumber: invoice.invoiceNumber
        };
        await PostingEngine.handleEvent('INVOICE_APPROVED', payload);
        break;
      }

      case 'bills': {
        const bill = await Bill.findById(documentId);
        if (!bill) throw new Error('Bill not found');
        bill.status = 'Open';
        bill.approvalStatus = 'Approved';
        await bill.save();

        // 1. Stock Addition for physical Goods
        const lineItems = bill.items || (bill as any).lineItems || [];
        for (const line of lineItems) {
          const itemId = line.item || line.itemId;
          if (itemId) {
            const itemDoc = await Item.findById(itemId);
            if (itemDoc && itemDoc.type !== 'service') {
              const qty = Number(line.quantity || 0);
              await Item.findByIdAndUpdate(itemId, {
                $inc: { stock: qty, currentStock: qty, stockQuantity: qty }
              });
            }
          }
        }

        // 2. Double-Entry Posting
        const payload = {
          billId: bill._id.toString(),
          companyId: orgId,
          vendorId: bill.vendorId?.toString(),
          subTotal: bill.subTotal || 0,
          taxTotal: bill.taxTotal || 0,
          grandTotal: bill.total || 0,
          billDate: bill.billDate,
          billNumber: bill.billNumber
        };
        await PostingEngine.handleEvent('BILL_APPROVED', payload);
        break;
      }

      case 'sales_orders': {
        const so = await SalesOrder.findById(documentId);
        if (!so) throw new Error('Sales Order not found');
        so.status = 'Confirmed';
        (so as any).approvalStatus = 'Approved';
        await so.save();

        // Increment committedStock for items in the confirmed order
        if (so.items && Array.isArray(so.items)) {
          for (const line of so.items) {
            if (line.item) {
              const qty = Number(line.quantity || 0);
              await Item.findByIdAndUpdate(line.item, {
                $inc: { committedStock: qty }
              });
            }
          }
        }
        break;
      }

      case 'purchase_orders': {
        const po = await PurchaseOrder.findById(documentId);
        if (!po) throw new Error('Purchase Order not found');
        po.status = 'Issued';
        po.approvalStatus = 'Approved';
        await po.save();
        break;
      }

      case 'quotes': {
        const quote = await Quote.findById(documentId);
        if (!quote) throw new Error('Quote not found');
        (quote as any).approvalStatus = 'Approved';
        await quote.save();
        break;
      }

      case 'delivery_challans': {
        const dc = await DeliveryChallan.findById(documentId);
        if (!dc) throw new Error('Delivery Challan not found');
        dc.status = 'Delivered';
        (dc as any).approvalStatus = 'Approved';
        await dc.save();

        // Deduct physical inventory
        if (dc.items && Array.isArray(dc.items)) {
          for (const line of dc.items) {
            if (line.item) {
              const itemDoc = await Item.findById(line.item);
              if (itemDoc && itemDoc.type !== 'service') {
                const qty = Number(line.quantity || 0);
                await Item.findByIdAndUpdate(line.item, {
                  $inc: { stock: -qty, currentStock: -qty, stockQuantity: -qty }
                });
              }
            }
          }
        }

        // Post COGS & Inventory Asset
        await PostingEngine.handleEvent('DELIVERY_CHALLAN_ISSUED', {
          challanId: dc._id.toString(),
          companyId: orgId,
          total: dc.total || 0
        });
        break;
      }

      case 'transfer_orders': {
        const to = await TransferOrder.findById(documentId);
        if (!to) throw new Error('Transfer Order not found');
        to.status = 'In Transit';
        (to as any).approvalStatus = 'Approved';
        await to.save();
        break;
      }

      case 'payments_made': {
        const pm = await PaymentMade.findById(documentId);
        if (!pm) throw new Error('Payment Made not found');
        pm.status = 'Closed';
        (pm as any).approvalStatus = 'Approved';
        await pm.save();

        await PostingEngine.handleEvent('PAYMENT_MADE', {
          paymentId: pm._id.toString(),
          companyId: orgId,
          vendorId: pm.vendorId?.toString(),
          amount: pm.amount,
          paymentMode: pm.paymentMode,
          paidThrough: pm.paidThrough,
          referenceNumber: pm.referenceNumber
        });
        break;
      }

      case 'credit_notes': {
        const cn = await CreditNote.findById(documentId);
        if (!cn) throw new Error('Credit Note not found');
        cn.status = 'Open';
        (cn as any).approvalStatus = 'Approved';
        await cn.save();

        // Re-stock returned items
        if (cn.items && Array.isArray(cn.items)) {
          for (const line of cn.items) {
            if (line.item) {
              const itemDoc = await Item.findById(line.item);
              if (itemDoc && itemDoc.type !== 'service') {
                const qty = Number(line.quantity || 0);
                await Item.findByIdAndUpdate(line.item, {
                  $inc: { stock: qty, currentStock: qty, stockQuantity: qty }
                });
              }
            }
          }
        }

        const payload = {
          creditNoteId: cn._id.toString(),
          companyId: orgId,
          customerId: cn.customer?.toString(),
          subTotal: cn.subTotal || 0,
          taxTotal: (cn as any).taxTotal || 0,
          total: cn.total || 0,
          creditNoteNumber: cn.creditNoteNumber
        };
        await PostingEngine.handleEvent('CREDIT_NOTE_APPROVED', payload);
        break;
      }

      case 'vendor_credits': {
        const vc = await VendorCredit.findById(documentId);
        if (!vc) throw new Error('Vendor Credit not found');
        vc.status = 'Open';
        vc.approvalStatus = 'Approved';
        await vc.save();

        // Deduct returned items to vendor
        if (vc.items && Array.isArray(vc.items)) {
          for (const line of vc.items) {
            if (line.item) {
              const qty = Number(line.quantity || 0);
              await Item.findByIdAndUpdate(line.item, {
                $inc: { stock: -qty, currentStock: -qty, stockQuantity: -qty }
              });
            }
          }
        }

        const payload = {
          creditId: vc._id.toString(),
          companyId: orgId,
          vendorId: vc.vendorId?.toString(),
          total: vc.total || 0
        };
        await PostingEngine.handleEvent('VENDOR_CREDIT_APPROVED', payload);
        break;
      }

      case 'expenses': {
        const exp = await Expense.findById(documentId);
        if (!exp) throw new Error('Expense not found');
        exp.status = exp.paidThroughAccount ? 'Paid' : 'Approved';
        exp.approvalStatus = 'Approved';
        await exp.save();

        const payload = {
          expenseId: exp._id.toString(),
          companyId: orgId,
          amount: exp.amount,
          vendorId: exp.vendorId?.toString(),
          isPaid: !!exp.paidThroughAccount,
          accountId: exp.accountId?.toString(),
          paidThroughAccountId: exp.paidThroughAccount?.toString()
        };
        await PostingEngine.handleEvent('EXPENSE_APPROVED', payload);
        break;
      }

      case 'inventory_adjustments': {
        const adj = await InventoryAdjustment.findById(documentId);
        if (!adj) throw new Error('Inventory adjustment not found');
        (adj as any).status = 'Adjusted';
        (adj as any).approvalStatus = 'Approved';
        await adj.save();

        // Apply physical stock adjustment
        if (adj.items && Array.isArray(adj.items)) {
          for (const line of adj.items) {
            const qty = Number(line.quantityAdjusted || 0);
            await Item.findByIdAndUpdate(line.item, {
              $inc: { stock: qty, currentStock: qty, stockQuantity: qty }
            });
          }
        }

        await PostingEngine.handleEvent('INVENTORY_ADJUSTMENT', { adjustmentId: adj._id.toString(), companyId: orgId });
        break;
      }

      case 'manual_journals': {
        const journal = await Journal.findById(documentId);
        if (!journal) throw new Error('Journal not found');
        journal.status = 'Published';
        (journal as any).approvalStatus = 'Approved';
        await journal.save();

        const ledgerLines = (journal.lineItems as any[]).map((l: any) => ({
          accountId: l.account,
          debit: l.debits || 0,
          credit: l.credits || 0,
          contactId: l.contact || undefined
        }));
        await LedgerService.postTransaction(
          orgId,
          journal._id.toString(),
          'Manual Journal',
          journal.date || new Date(),
          ledgerLines
        );
        break;
      }

      default:
        console.warn(`[ApprovalWorkflowService] Unhandled module: ${module}`);
    }

    return request;
  }

  /**
   * Reject a transaction.
   */
  static async rejectTransaction(params: {
    orgId: string;
    module: string;
    documentId: string;
    approverUser: any;
    approverRole: any;
    reason: string;
  }) {
    const { orgId, module, documentId, approverUser, approverRole, reason } = params;

    const request = await ApprovalRequest.findOne({ orgId, module, entityId: documentId });
    if (!request) {
      throw new Error('Approval request not found');
    }

    if (!this.canUserApprove(request, approverUser, approverRole)) {
      throw new Error('You do not have permission to reject this transaction');
    }

    request.status = 'Rejected';
    request.approvedBy = approverUser._id?.toString() || approverUser.id;
    request.approvedByName = approverUser.displayName || approverUser.name || approverUser.email;
    request.rejectionReason = reason;
    request.timeline = request.timeline || [];
    request.timeline.push({
      action: 'Rejected',
      actorId: approverUser._id?.toString() || approverUser.id,
      actorName: approverUser.displayName || approverUser.name || approverUser.email || 'Priya Verma (Finance Manager)',
      role: 'Manager / Approver',
      timestamp: new Date(),
      comments: reason,
      status: 'Rejected'
    });
    await request.save();

    // Revert document status to Draft/Rejected
    switch (module) {
      case 'invoices':
        await Invoice.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
        break;
      case 'bills':
        await Bill.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
        break;
      case 'sales_orders':
        await SalesOrder.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
        break;
      case 'purchase_orders':
        await PurchaseOrder.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
        break;
      case 'quotes':
        await Quote.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
        break;
      case 'credit_notes':
        await CreditNote.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
        break;
      case 'vendor_credits':
        await VendorCredit.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
        break;
      case 'delivery_challans':
        await DeliveryChallan.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
        break;
      case 'transfer_orders':
        await TransferOrder.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
        break;
      case 'payments_made':
        await PaymentMade.findByIdAndUpdate(documentId, { status: 'Void', approvalStatus: 'Rejected', rejectionReason: reason });
        break;
      case 'expenses':
        await Expense.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
        break;
      case 'inventory_adjustments':
        await InventoryAdjustment.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
        break;
      case 'manual_journals':
        await Journal.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
        break;
    }

    return request;
  }

  /**
   * Get pending approvals for the current user.
   */
  static async getPendingApprovals(orgId: string, user: any, userRole: any) {
    const allPending = await ApprovalRequest.find({ orgId, status: 'Pending' })
      .sort({ createdAt: -1 })
      .lean();

    return allPending.filter((req: any) => this.canUserApprove(req, user, userRole));
  }
}
