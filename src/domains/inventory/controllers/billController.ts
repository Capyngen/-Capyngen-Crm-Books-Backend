import { requestContext } from '../../../context';
import { LedgerService } from '../../books/services/ledgerService';
import { PostingEngine } from '../../books/services/PostingEngine';
import { validateTransactionLock } from '../../books/services/transactionLockService';
import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import Bill from '../models/Bill';
import { ApprovalWorkflowService } from '../../../core/services/ApprovalWorkflowService';
import { UserOrganization } from '../../core/models/UserOrganization';
import { buildTenantFilter } from '../../../core/utils/tenantFilter';

export const createBill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId || req.body.companyId || 'SYSTEM';
    const user = (req as any).user;
    const userId = user?._id?.toString() || user?.id || requestContext.getStore()?.userId;

    let userRole = null;
    let roleId = requestContext.getStore()?.roleId;
    if (orgId && (userId || user?.email)) {
      const conditions: any[] = [];
      if (userId) {
        if (mongoose.isValidObjectId(userId)) conditions.push({ userId: new mongoose.Types.ObjectId(userId) });
        conditions.push({ userId: userId.toString() });
      }
      if (user?.email) {
        conditions.push({ email: user.email.toLowerCase() });
      }
      const userOrg = await UserOrganization.findOne({ orgId, $or: conditions }).populate('roleId').lean();
      if (userOrg?.roleId) {
        userRole = userOrg.roleId;
        roleId = (userOrg.roleId as any)._id?.toString();
      }
    }

    const requestedStatus = req.body.status || 'Open';
    let finalStatus = requestedStatus;
    let finalApprovalStatus = 'Approved';
    const billAmount = Number(req.body.totalAmount || req.body.total || 0);

    if (requestedStatus === 'Draft') {
      finalStatus = 'Draft';
      finalApprovalStatus = 'Draft';
    } else {
      const evalResult = await ApprovalWorkflowService.evaluateApprovalNeed(
        orgId,
        'bills',
        billAmount,
        user,
        userRole
      );

      if (evalResult.requiresApproval) {
        finalStatus = 'Pending Approval';
        finalApprovalStatus = 'Pending';
      }
    }

    const subTotal = Number(req.body.subTotal ?? req.body.subtotal ?? req.body.totalAmount ?? req.body.total ?? 0);
    const totalAmount = Number(req.body.totalAmount ?? req.body.total ?? subTotal);
    const billNumber = req.body.billNumber || `BILL-${Date.now()}`;
    const vendorId = req.body.vendorId || req.body.vendor;
    const lineItems = req.body.lineItems || (req.body.items || []).map((it: any) => ({
      itemId: it.item || it.itemId,
      account: it.account || 'Cost of Goods Sold',
      quantity: Number(it.quantity || 1),
      rate: Number(it.rate || 0),
      discount: Number(it.discount || 0),
      amount: Number(it.amount || ((it.quantity || 1) * (it.rate || 0)))
    }));

    const doc = await Bill.create({
      ...req.body,
      vendorId,
      billNumber,
      subTotal,
      totalAmount,
      balanceDue: req.body.balanceDue ?? totalAmount,
      accountsPayable: req.body.accountsPayable || 'Accounts Payable',
      currency: req.body.currency || 'INR',
      lineItems,
      status: finalStatus,
      approvalStatus: finalApprovalStatus,
      companyId: orgId,
      orgId,
      createdBy: userId
    });

    if (finalApprovalStatus === 'Pending') {
      await ApprovalWorkflowService.submitForApproval({
        orgId,
        module: 'bills',
        documentId: doc._id.toString(),
        documentNumber: doc.billNumber,
        amount: billAmount,
        customerOrVendorName: req.body.vendorName,
        requestedBy: userId || 'system',
        requestedByName: user?.displayName || user?.name || user?.email,
        creatorRoleId: roleId
      });
    } else if (doc.status !== 'Draft') {
      if (doc.lineItems && doc.lineItems.length > 0) {
        await doc.populate('lineItems.itemId').catch(() => {});
      }
      try {
        await import('../../../core/events/eventBus').then(m => m.eventBus.emitAsync(m.EVENTS.BILL_CREATED, { bill: doc, companyId: doc.companyId }));
      } catch (eventErr) {
        console.warn('Bill eventBus error:', eventErr);
      }

      const payload = {
        billId: doc._id.toString(),
        companyId: orgId,
        vendorId: doc.vendorId?.toString(),
        subTotal: doc.subTotal || 0,
        taxTotal: doc.taxTotal || 0,
        grandTotal: doc.totalAmount || doc.total || 0,
        billDate: doc.billDate,
        billNumber: doc.billNumber
      };
      try {
        await PostingEngine.handleEvent('BILL_APPROVED', payload);
      } catch (postErr) {
        console.error('Failed to post bill to GL:', postErr);
      }
    }

    res.status(201).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getBills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter: any = { ...tenantFilter };
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const docs = await Bill.find(filter)
      .populate('vendorId', 'displayName companyName vendorName')
      .sort({ createdAt: -1 });

    const enriched = docs.map((b: any) => {
      const obj = b.toObject ? b.toObject() : b;
      obj.totalAmount = obj.totalAmount || obj.total || 0;
      obj.billDate = obj.billDate || obj.date || obj.createdAt;
      const v = obj.vendorId || obj.vendor;
      if (v && typeof v === 'object') {
        obj.vendorName = v.displayName || v.vendorName || v.companyName || obj.vendorName;
      }
      return obj;
    });

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getBillById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter: any = { _id: req.params.id, ...tenantFilter };
    const doc = await Bill.findOne(filter)
      .populate('vendorId', 'displayName')
      .populate('lineItems.itemId', 'name')
      .populate('lineItems.customerId', 'displayName');
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateBill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId || 'SYSTEM';
    const user = (req as any).user;
    const userId = user?._id?.toString() || user?.id || requestContext.getStore()?.userId;

    if (req.body.status === 'Pending Approval' || req.body.approvalStatus === 'Pending') {
      const originalBill = await Bill.findById(req.params.id);
      let roleId = requestContext.getStore()?.roleId;

      await ApprovalWorkflowService.submitForApproval({
        orgId,
        module: 'bills',
        documentId: req.params.id as string,
        documentNumber: req.body.billNumber || originalBill?.billNumber,
        amount: Number(req.body.totalAmount ?? originalBill?.totalAmount ?? 0),
        customerOrVendorName: req.body.vendorName,
        requestedBy: userId || 'system',
        requestedByName: user?.displayName || user?.name || user?.email,
        creatorRoleId: roleId
      });
      req.body.status = 'Pending Approval';
      req.body.approvalStatus = 'Pending';
    }

    const tenantFilter = buildTenantFilter(req);
    const doc = await Bill.findOneAndUpdate({ _id: req.params.id, ...tenantFilter }, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteBill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const doc = await Bill.findOneAndDelete({ _id: req.params.id, ...tenantFilter });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Process Bill OCR
// @route   POST /api/v1/books/purchases/bills/ocr
export const processBillOCR = async (req: any, res: any, next: any) => {
  try {
    const mockOCRData = {
      vendorName: 'Acme Corp',
      billNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
      billDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0],
      amount: 1500.00,
      lineItems: [
        { name: 'Scanned Item 1', quantity: 10, rate: 100, amount: 1000 },
        { name: 'Scanned Item 2', quantity: 5, rate: 100, amount: 500 }
      ]
    };
    res.status(200).json({ success: true, data: mockOCRData });
  } catch (error) {
    next(error);
  }
};
