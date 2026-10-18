import { requestContext } from '../../../context';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import PurchaseOrder from '../models/PurchaseOrder';
import Bill from '../models/Bill';
import { ApprovalWorkflowService } from '../../../core/services/ApprovalWorkflowService';

export const createPurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService.resolveUserContext(req);

    const requestedStatus = req.body.status || 'Issued';
    let finalStatus = requestedStatus;
    let finalApprovalStatus = 'Approved';

    if (requestedStatus === 'Draft') {
      finalStatus = 'Draft';
      finalApprovalStatus = 'Draft';
    } else {
      const evalResult = await ApprovalWorkflowService.evaluateApprovalNeed(
        orgId,
        'purchase_orders',
        Number(req.body.total || 0),
        user,
        userRole
      );

      if (evalResult.requiresApproval) {
        finalStatus = 'Draft';
        finalApprovalStatus = 'Pending';
      } else {
        finalStatus = 'Issued';
        finalApprovalStatus = 'Approved';
      }
    }

    const doc = await PurchaseOrder.create({
      ...req.body,
      status: finalStatus,
      approvalStatus: finalApprovalStatus,
      companyId: orgId,
      orgId,
      createdBy: userId
    });

    if (finalApprovalStatus === 'Pending') {
      await ApprovalWorkflowService.submitForApproval({
        orgId,
        module: 'purchase_orders',
        documentId: doc._id.toString(),
        documentNumber: doc.purchaseOrderNumber,
        amount: Number(req.body.total || 0),
        customerOrVendorName: req.body.vendorName || 'Vendor',
        requestedBy: userId || 'system',
        requestedByName: user?.displayName || user?.name || user?.email,
        creatorRoleId: roleId
      });
    }

    res.status(201).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPurchaseOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const docs = await PurchaseOrder.find(filter)
      .populate('vendorId', 'displayName companyName')
      .populate('customerId', 'displayName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPurchaseOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) {
      filter.$or = [{ companyId: orgId }, { orgId }];
    }
    const doc = await PurchaseOrder.findOne(filter)
      .populate('vendorId', 'displayName')
      .populate('customerId', 'displayName');
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await PurchaseOrder.findOneAndUpdate({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await PurchaseOrder.findOneAndDelete({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

import { PurchaseOrderApprovalService } from '../services/PurchaseOrderApprovalService';

export const requestPOApproval = async (req: Request, res: Response) => {
    try {
        const po = await PurchaseOrderApprovalService.requestApproval(req.params.id, 'system-user');
        res.status(200).json({ success: true, data: po });
    } catch (e: any) { res.status(400).json({ success: false, message: e.message }); }
};

export const approvePOManager = async (req: Request, res: Response) => {
    try {
        const po = await PurchaseOrderApprovalService.approveByManager(req.params.id, 'manager-user');
        res.status(200).json({ success: true, data: po });
    } catch (e: any) { res.status(400).json({ success: false, message: e.message }); }
};

export const convertToBill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    const orgId = po.companyId || po.orgId || (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;

    const count = await Bill.countDocuments({ $or: [{ companyId: orgId }, { orgId }] });
    const billNumber = `BILL-${String(count + 1).padStart(5, '0')}`;

    const newBill = await Bill.create({
      orgId,
      companyId: orgId,
      vendorId: po.vendorId,
      billNumber,
      orderNumber: po.poNumber,
      purchaseOrderId: po._id,
      billDate: new Date(),
      dueDate: po.deliveryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      accountsPayable: 'Accounts Payable',
      lineItems: po.lineItems.map((item: any) => ({
        itemId: item.itemId,
        account: item.account || 'Cost of Goods Sold',
        quantity: item.quantity,
        rate: item.rate,
        discount: 0,
        amount: item.amount
      })),
      subTotal: po.subTotal,
      discount: po.discount || 0,
      discountType: po.discountType || 'amount',
      taxWithheldType: po.taxWithheldType || 'none',
      taxWithheldAmount: po.taxWithheldAmount || 0,
      adjustment: po.adjustment || 0,
      totalAmount: po.totalAmount,
      balanceDue: po.totalAmount,
      status: 'Open',
      approvalStatus: 'Approved',
      createdBy: (req as any).user?._id || 'system'
    });

    po.status = 'Billed';
    await po.save();

    res.status(201).json({
      success: true,
      message: 'Purchase Order successfully converted to Bill',
      data: newBill
    });
  } catch (error) {
    next(error);
  }
};

export const convertToReceive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    // Increment physical warehouse stock for line items
    const Item = mongoose.models.BooksItem || mongoose.models.Item;
    if (Item) {
      for (const line of po.lineItems) {
        if (line.itemId) {
          await Item.findByIdAndUpdate(line.itemId, {
            $inc: { stockOnHand: line.quantity }
          });
        }
      }
    }

    po.status = 'Billed'; // Or mark as Issued/Received
    await po.save();

    res.status(200).json({
      success: true,
      message: 'Items received into inventory warehouse stock successfully',
      data: po
    });
  } catch (error) {
    next(error);
  }
};

