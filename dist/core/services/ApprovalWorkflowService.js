"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalWorkflowService = exports.SUPPORTED_APPROVAL_MODULES = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const context_1 = require("../../context");
const ApprovalRule_1 = require("../models/ApprovalRule");
const ApprovalRequest_1 = require("../models/ApprovalRequest");
const Role_1 = require("../../domains/core/models/Role");
const UserOrganization_1 = require("../../domains/core/models/UserOrganization");
const Item_1 = __importDefault(require("../../domains/inventory/models/Item"));
const PostingEngine_1 = require("../../domains/books/services/PostingEngine");
const Invoice_1 = __importDefault(require("../../domains/billing/models/Invoice"));
const Bill_1 = __importDefault(require("../../domains/inventory/models/Bill"));
const SalesOrder_1 = __importDefault(require("../../domains/billing/models/SalesOrder"));
const PurchaseOrder_1 = __importDefault(require("../../domains/inventory/models/PurchaseOrder"));
const Expense_1 = __importDefault(require("../../domains/books/models/Expense"));
const CreditNote_1 = __importDefault(require("../../domains/billing/models/CreditNote"));
const VendorCredit_1 = __importDefault(require("../../domains/inventory/models/VendorCredit"));
const InventoryAdjustment_1 = __importDefault(require("../../domains/inventory/models/InventoryAdjustment"));
const Quote_1 = __importDefault(require("../../domains/billing/models/Quote"));
const DeliveryChallan_1 = __importDefault(require("../../domains/inventory/models/DeliveryChallan"));
const TransferOrder_1 = __importDefault(require("../../domains/inventory/models/TransferOrder"));
const PaymentMade_1 = __importDefault(require("../../domains/books/models/PaymentMade"));
const Journal_1 = require("../../domains/books/models/Journal");
const ledgerService_1 = require("../../domains/books/services/ledgerService");
exports.SUPPORTED_APPROVAL_MODULES = [
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
class ApprovalWorkflowService {
    /**
     * Universal helper to extract multi-tenant orgId, user, role, and role hierarchy from any Express request.
     */
    static async resolveUserContext(req) {
        const orgId = req.org?._id?.toString() || req.headers?.['x-org-id'] || context_1.requestContext.getStore()?.orgId || req.body?.companyId || req.body?.orgId;
        const user = req.user;
        const userId = user?._id?.toString() || user?.id || req.userId;
        let userRole = req.role;
        let roleId = userRole?._id?.toString() || userRole?.toString();
        if (!userRole && userId && orgId) {
            const conditions = [];
            if (mongoose_1.default.isValidObjectId(userId))
                conditions.push({ userId: new mongoose_1.default.Types.ObjectId(userId) });
            conditions.push({ userId: userId.toString() });
            if (user?.email) {
                conditions.push({ email: user.email.toLowerCase() });
            }
            const userOrg = await UserOrganization_1.UserOrganization.findOne({ orgId, $or: conditions }).populate('roleId').lean();
            if (userOrg?.roleId) {
                userRole = userOrg.roleId;
                roleId = userOrg.roleId._id?.toString();
            }
        }
        return { orgId, user, userId, userRole, roleId };
    }
    /**
     * Get active approval rule for a specific module in an org.
     */
    static async getModuleRule(orgId, module) {
        return ApprovalRule_1.ApprovalRule.findOne({ orgId, module });
    }
    /**
     * Set/update approval rule for a module in an org.
     */
    static async setModuleRule(orgId, module, data) {
        const updated = await ApprovalRule_1.ApprovalRule.findOneAndUpdate({ orgId, module }, {
            $set: {
                orgId,
                module,
                thresholdAmount: Number(data.thresholdAmount || 0),
                autoApproveBelowThreshold: data.autoApproveBelowThreshold !== false,
                requireParentRoleApproval: data.requireParentRoleApproval !== false,
                approverRoles: data.approverRoles || [],
                isActive: data.isActive !== false,
            }
        }, { upsert: true, new: true });
        return updated;
    }
    /**
     * Get all approval rules configured for this organization.
     */
    static async getAllModuleRules(orgId) {
        const existingRules = await ApprovalRule_1.ApprovalRule.find({ orgId }).lean();
        const rulesMap = new Map(existingRules.map(r => [r.module, r]));
        return exports.SUPPORTED_APPROVAL_MODULES.map(m => {
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
    static async evaluateApprovalNeed(orgId, module, amount, user, userRole) {
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
    static async submitForApproval(params) {
        const { orgId, module, documentId, documentNumber, amount, customerOrVendorName, requestedBy, requestedByName, creatorRoleId } = params;
        let parentRoleId;
        if (creatorRoleId) {
            const role = await Role_1.Role.findById(creatorRoleId).lean();
            if (role?.parentRoleId) {
                parentRoleId = role.parentRoleId.toString();
            }
        }
        const rule = await this.getModuleRule(orgId, module);
        const request = await ApprovalRequest_1.ApprovalRequest.findOneAndUpdate({ orgId, module, entityId: documentId }, {
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
            }
        }, { upsert: true, new: true });
        return request;
    }
    /**
     * Verify if the given user is authorized to approve this request.
     * Security Guarantee: A parent role (manager) can ONLY approve/reject subordinate requests;
     * they do NOT gain admin rights or access to settings.
     */
    static canUserApprove(request, user, userRole) {
        if (!request || request.status !== 'Pending')
            return false;
        // 1. Admin or Owner has override approval authority
        if (user?.role === 'Admin' || user?.role === 'Owner' || user?.isWorkspaceOwner || user?.isAdmin || userRole?.name === 'Admin') {
            return true;
        }
        const userRoleId = userRole?._id?.toString() || userRole?.toString();
        if (!userRoleId)
            return false;
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
    static async approveTransaction(params) {
        const { orgId, module, documentId, approverUser, approverRole, comments } = params;
        const request = await ApprovalRequest_1.ApprovalRequest.findOne({ orgId, module, entityId: documentId });
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
        await request.save();
        // Execute Module-Specific Operations
        switch (module) {
            case 'invoices': {
                const invoice = await Invoice_1.default.findById(documentId);
                if (!invoice)
                    throw new Error('Invoice not found');
                invoice.status = 'Open';
                invoice.approvalStatus = 'Approved';
                invoice.postingStatus = 'Posted';
                if (!invoice.dispatchStatus) {
                    invoice.dispatchStatus = 'Not Sent';
                }
                await invoice.save();
                // 1. Stock Deduction for physical Goods
                if (invoice.items && Array.isArray(invoice.items)) {
                    for (const line of invoice.items) {
                        if (line.item) {
                            const itemDoc = await Item_1.default.findById(line.item);
                            if (itemDoc && itemDoc.type !== 'service') {
                                const qty = Number(line.quantity || 0);
                                await Item_1.default.findByIdAndUpdate(line.item, {
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
                await PostingEngine_1.PostingEngine.handleEvent('INVOICE_APPROVED', payload);
                break;
            }
            case 'bills': {
                const bill = await Bill_1.default.findById(documentId);
                if (!bill)
                    throw new Error('Bill not found');
                bill.status = 'Open';
                bill.approvalStatus = 'Approved';
                await bill.save();
                // 1. Stock Addition for physical Goods
                const lineItems = bill.items || bill.lineItems || [];
                for (const line of lineItems) {
                    const itemId = line.item || line.itemId;
                    if (itemId) {
                        const itemDoc = await Item_1.default.findById(itemId);
                        if (itemDoc && itemDoc.type !== 'service') {
                            const qty = Number(line.quantity || 0);
                            await Item_1.default.findByIdAndUpdate(itemId, {
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
                await PostingEngine_1.PostingEngine.handleEvent('BILL_APPROVED', payload);
                break;
            }
            case 'sales_orders': {
                const so = await SalesOrder_1.default.findById(documentId);
                if (!so)
                    throw new Error('Sales Order not found');
                so.status = 'Confirmed';
                so.approvalStatus = 'Approved';
                await so.save();
                // Increment committedStock for items in the confirmed order
                if (so.items && Array.isArray(so.items)) {
                    for (const line of so.items) {
                        if (line.item) {
                            const qty = Number(line.quantity || 0);
                            await Item_1.default.findByIdAndUpdate(line.item, {
                                $inc: { committedStock: qty }
                            });
                        }
                    }
                }
                break;
            }
            case 'purchase_orders': {
                const po = await PurchaseOrder_1.default.findById(documentId);
                if (!po)
                    throw new Error('Purchase Order not found');
                po.status = 'Issued';
                po.approvalStatus = 'Approved';
                await po.save();
                break;
            }
            case 'quotes': {
                const quote = await Quote_1.default.findById(documentId);
                if (!quote)
                    throw new Error('Quote not found');
                quote.approvalStatus = 'Approved';
                await quote.save();
                break;
            }
            case 'delivery_challans': {
                const dc = await DeliveryChallan_1.default.findById(documentId);
                if (!dc)
                    throw new Error('Delivery Challan not found');
                dc.status = 'Delivered';
                dc.approvalStatus = 'Approved';
                await dc.save();
                // Deduct physical inventory
                if (dc.items && Array.isArray(dc.items)) {
                    for (const line of dc.items) {
                        if (line.item) {
                            const itemDoc = await Item_1.default.findById(line.item);
                            if (itemDoc && itemDoc.type !== 'service') {
                                const qty = Number(line.quantity || 0);
                                await Item_1.default.findByIdAndUpdate(line.item, {
                                    $inc: { stock: -qty, currentStock: -qty, stockQuantity: -qty }
                                });
                            }
                        }
                    }
                }
                // Post COGS & Inventory Asset
                await PostingEngine_1.PostingEngine.handleEvent('DELIVERY_CHALLAN_ISSUED', {
                    challanId: dc._id.toString(),
                    companyId: orgId,
                    total: dc.total || 0
                });
                break;
            }
            case 'transfer_orders': {
                const to = await TransferOrder_1.default.findById(documentId);
                if (!to)
                    throw new Error('Transfer Order not found');
                to.status = 'In Transit';
                to.approvalStatus = 'Approved';
                await to.save();
                break;
            }
            case 'payments_made': {
                const pm = await PaymentMade_1.default.findById(documentId);
                if (!pm)
                    throw new Error('Payment Made not found');
                pm.status = 'Closed';
                pm.approvalStatus = 'Approved';
                await pm.save();
                await PostingEngine_1.PostingEngine.handleEvent('PAYMENT_MADE', {
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
                const cn = await CreditNote_1.default.findById(documentId);
                if (!cn)
                    throw new Error('Credit Note not found');
                cn.status = 'Open';
                cn.approvalStatus = 'Approved';
                await cn.save();
                // Re-stock returned items
                if (cn.items && Array.isArray(cn.items)) {
                    for (const line of cn.items) {
                        if (line.item) {
                            const itemDoc = await Item_1.default.findById(line.item);
                            if (itemDoc && itemDoc.type !== 'service') {
                                const qty = Number(line.quantity || 0);
                                await Item_1.default.findByIdAndUpdate(line.item, {
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
                    taxTotal: cn.taxTotal || 0,
                    total: cn.total || 0,
                    creditNoteNumber: cn.creditNoteNumber
                };
                await PostingEngine_1.PostingEngine.handleEvent('CREDIT_NOTE_APPROVED', payload);
                break;
            }
            case 'vendor_credits': {
                const vc = await VendorCredit_1.default.findById(documentId);
                if (!vc)
                    throw new Error('Vendor Credit not found');
                vc.status = 'Open';
                vc.approvalStatus = 'Approved';
                await vc.save();
                // Deduct returned items to vendor
                if (vc.items && Array.isArray(vc.items)) {
                    for (const line of vc.items) {
                        if (line.item) {
                            const qty = Number(line.quantity || 0);
                            await Item_1.default.findByIdAndUpdate(line.item, {
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
                await PostingEngine_1.PostingEngine.handleEvent('VENDOR_CREDIT_APPROVED', payload);
                break;
            }
            case 'expenses': {
                const exp = await Expense_1.default.findById(documentId);
                if (!exp)
                    throw new Error('Expense not found');
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
                await PostingEngine_1.PostingEngine.handleEvent('EXPENSE_APPROVED', payload);
                break;
            }
            case 'inventory_adjustments': {
                const adj = await InventoryAdjustment_1.default.findById(documentId);
                if (!adj)
                    throw new Error('Inventory adjustment not found');
                adj.status = 'Adjusted';
                adj.approvalStatus = 'Approved';
                await adj.save();
                // Apply physical stock adjustment
                if (adj.items && Array.isArray(adj.items)) {
                    for (const line of adj.items) {
                        const qty = Number(line.quantityAdjusted || 0);
                        await Item_1.default.findByIdAndUpdate(line.item, {
                            $inc: { stock: qty, currentStock: qty, stockQuantity: qty }
                        });
                    }
                }
                await PostingEngine_1.PostingEngine.handleEvent('INVENTORY_ADJUSTMENT', { adjustmentId: adj._id.toString(), companyId: orgId });
                break;
            }
            case 'manual_journals': {
                const journal = await Journal_1.Journal.findById(documentId);
                if (!journal)
                    throw new Error('Journal not found');
                journal.status = 'Published';
                journal.approvalStatus = 'Approved';
                await journal.save();
                const ledgerLines = journal.lineItems.map(l => ({
                    accountId: l.account,
                    debit: l.debits || 0,
                    credit: l.credits || 0,
                    contactId: l.contact || undefined
                }));
                await ledgerService_1.LedgerService.postTransaction(orgId, journal._id.toString(), 'Manual Journal', journal.date || new Date(), ledgerLines);
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
    static async rejectTransaction(params) {
        const { orgId, module, documentId, approverUser, approverRole, reason } = params;
        const request = await ApprovalRequest_1.ApprovalRequest.findOne({ orgId, module, entityId: documentId });
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
        await request.save();
        // Revert document status to Draft/Rejected
        switch (module) {
            case 'invoices':
                await Invoice_1.default.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
                break;
            case 'bills':
                await Bill_1.default.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
                break;
            case 'sales_orders':
                await SalesOrder_1.default.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
                break;
            case 'purchase_orders':
                await PurchaseOrder_1.default.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
                break;
            case 'quotes':
                await Quote_1.default.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
                break;
            case 'credit_notes':
                await CreditNote_1.default.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
                break;
            case 'vendor_credits':
                await VendorCredit_1.default.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
                break;
            case 'delivery_challans':
                await DeliveryChallan_1.default.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
                break;
            case 'transfer_orders':
                await TransferOrder_1.default.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
                break;
            case 'payments_made':
                await PaymentMade_1.default.findByIdAndUpdate(documentId, { status: 'Void', approvalStatus: 'Rejected', rejectionReason: reason });
                break;
            case 'expenses':
                await Expense_1.default.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
                break;
            case 'inventory_adjustments':
                await InventoryAdjustment_1.default.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
                break;
            case 'manual_journals':
                await Journal_1.Journal.findByIdAndUpdate(documentId, { status: 'Draft', approvalStatus: 'Rejected', rejectionReason: reason });
                break;
        }
        return request;
    }
    /**
     * Get pending approvals for the current user.
     */
    static async getPendingApprovals(orgId, user, userRole) {
        const allPending = await ApprovalRequest_1.ApprovalRequest.find({ orgId, status: 'Pending' })
            .sort({ createdAt: -1 })
            .lean();
        return allPending.filter((req) => this.canUserApprove(req, user, userRole));
    }
}
exports.ApprovalWorkflowService = ApprovalWorkflowService;
