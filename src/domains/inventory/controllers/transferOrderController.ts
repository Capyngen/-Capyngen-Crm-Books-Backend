import { Request, Response, NextFunction } from 'express';
import TransferOrder from '../models/TransferOrder';
import Item from '../models/Item';
import { PostingEngine } from '../../books/services/PostingEngine';
import { requestContext } from '../../../context';
import { ApprovalWorkflowService } from '../../../core/services/ApprovalWorkflowService';

export const getTransferOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const docs = await TransferOrder.find(filter)
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) { next(error); }
};

export const getTransferOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];
    const doc = await TransferOrder.findOne(filter)
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code');
    if (!doc) return res.status(404).json({ success: false, message: 'Transfer Order not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const createTransferOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService.resolveUserContext(req);

    let transferNumber = req.body.transferNumber;
    if (!transferNumber) {
      const count = await TransferOrder.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
      transferNumber = `TO-${String(count + 1).padStart(5, '0')}`;
    }

    const requestedStatus = req.body.status || 'In Transit';
    let finalStatus = requestedStatus;
    let finalApprovalStatus = 'Approved';

    if (requestedStatus === 'Draft') {
      finalStatus = 'Draft';
      finalApprovalStatus = 'Draft';
    } else {
      const evalResult = await ApprovalWorkflowService.evaluateApprovalNeed(
        orgId,
        'transfer_orders',
        0,
        user,
        userRole
      );

      if (evalResult.requiresApproval) {
        finalStatus = 'Draft';
        finalApprovalStatus = 'Pending';
      } else {
        finalStatus = 'In Transit';
        finalApprovalStatus = 'Approved';
      }
    }

    const doc = await TransferOrder.create({
      ...req.body,
      transferNumber,
      status: finalStatus,
      approvalStatus: finalApprovalStatus,
      companyId: orgId,
      orgId,
      createdBy: userId
    });

    if (finalApprovalStatus === 'Pending') {
      await ApprovalWorkflowService.submitForApproval({
        orgId,
        module: 'transfer_orders',
        documentId: doc._id.toString(),
        documentNumber: transferNumber,
        amount: 0,
        customerOrVendorName: 'Inter-Warehouse Transfer',
        requestedBy: userId || 'system',
        requestedByName: user?.displayName || user?.name || user?.email,
        creatorRoleId: roleId
      });
    }

    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const updateTransferOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];
    const doc = await TransferOrder.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Transfer Order not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const deleteTransferOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];
    const doc = await TransferOrder.findOneAndDelete(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Transfer Order not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};

export const dispatchTransferOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];

    const order = await TransferOrder.findOne(filter);
    if (!order) return res.status(404).json({ success: false, message: 'Transfer Order not found' });

    if (order.status === 'In Transit' || order.status === 'Received') {
      return res.status(400).json({ success: false, message: `Transfer Order is already ${order.status}` });
    }

    const fromWhId = order.fromWarehouse.toString();

    // 1. Verify and deduct stock from source warehouse
    for (const line of order.items) {
      const item = await Item.findById(line.item);
      if (!item) continue;

      if (!item.warehouseStock) item.warehouseStock = [];
      let whStock = item.warehouseStock.find((ws: any) => ws.warehouse?.toString() === fromWhId);

      if (!whStock) {
        whStock = {
          warehouse: order.fromWarehouse as any,
          bin: line.fromBin || '',
          stockOnHand: item.stock || 0,
          committedStock: 0,
          availableStock: item.stock || 0
        };
        item.warehouseStock.push(whStock as any);
      }

      if (whStock.stockOnHand < line.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock at source warehouse for "${item.name}". Available: ${whStock.stockOnHand}, Requested: ${line.quantity}`
        });
      }

      whStock.stockOnHand -= line.quantity;
      whStock.availableStock = Math.max(0, whStock.stockOnHand - whStock.committedStock);

      // Handle Serial Numbers if any
      if (line.serialNumbers && line.serialNumbers.length > 0 && item.serialNumbers) {
        for (const sn of line.serialNumbers) {
          const match = item.serialNumbers.find((s: any) => s.serialNo === sn);
          if (match) {
            match.status = 'Committed';
            match.warehouse = 'In-Transit';
          }
        }
      }

      // Handle Batches if any
      if (line.batchNo && item.batches) {
        const batch = item.batches.find((b: any) => b.batchNo === line.batchNo && b.warehouse === fromWhId);
        if (batch) {
          batch.quantity = Math.max(0, batch.quantity - line.quantity);
        }
      }

      await item.save();
    }

    order.status = 'In Transit';
    order.dispatchDate = new Date();
    order.dispatchedBy = (req as any).user?._id?.toString() || (req as any).user?.displayName || 'User';
    if (req.body.carrier) order.carrier = req.body.carrier;
    if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
    await order.save();

    // Trigger GL Posting
    try {
      await PostingEngine.handleEvent('STOCK_TRANSFER_DISPATCHED', {
        transferOrderId: order._id.toString(),
        companyId: orgId
      });
    } catch (e) {
      console.error('Failed to post stock transfer dispatch to GL:', e);
    }

    res.status(200).json({ success: true, data: order, message: 'Transfer Order dispatched successfully' });
  } catch (error) { next(error); }
};

export const receiveTransferOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];

    const order = await TransferOrder.findOne(filter);
    if (!order) return res.status(404).json({ success: false, message: 'Transfer Order not found' });

    if (order.status !== 'In Transit') {
      return res.status(400).json({ success: false, message: 'Only In-Transit transfer orders can be received' });
    }

    const toWhId = order.toWarehouse.toString();

    // Increment stock at destination warehouse
    for (const line of order.items) {
      const item = await Item.findById(line.item);
      if (!item) continue;

      if (!item.warehouseStock) item.warehouseStock = [];
      let whStock = item.warehouseStock.find((ws: any) => ws.warehouse?.toString() === toWhId);

      if (!whStock) {
        whStock = {
          warehouse: order.toWarehouse as any,
          bin: line.toBin || '',
          stockOnHand: 0,
          committedStock: 0,
          availableStock: 0
        };
        item.warehouseStock.push(whStock as any);
      }

      whStock.stockOnHand += line.quantity;
      whStock.availableStock = Math.max(0, whStock.stockOnHand - whStock.committedStock);
      if (line.toBin) whStock.bin = line.toBin;

      // Handle Serial Numbers
      if (line.serialNumbers && line.serialNumbers.length > 0 && item.serialNumbers) {
        for (const sn of line.serialNumbers) {
          const match = item.serialNumbers.find((s: any) => s.serialNo === sn);
          if (match) {
            match.status = 'Available';
            match.warehouse = toWhId;
            if (line.toBin) match.bin = line.toBin;
          }
        }
      }

      // Handle Batches
      if (line.batchNo && item.batches) {
        const destBatch = item.batches.find((b: any) => b.batchNo === line.batchNo && b.warehouse === toWhId);
        if (destBatch) {
          destBatch.quantity += line.quantity;
          if (line.toBin) destBatch.bin = line.toBin;
        } else {
          item.batches.push({
            batchNo: line.batchNo,
            quantity: line.quantity,
            warehouse: toWhId,
            bin: line.toBin || '',
            status: 'Active'
          });
        }
      }

      await item.save();
    }

    order.status = 'Received';
    order.receivedDate = new Date();
    order.receivedBy = (req as any).user?._id?.toString() || (req as any).user?.displayName || 'User';
    await order.save();

    // Trigger GL Posting
    try {
      await PostingEngine.handleEvent('STOCK_TRANSFER_RECEIVED', {
        transferOrderId: order._id.toString(),
        companyId: orgId
      });
    } catch (e) {
      console.error('Failed to post stock transfer receipt to GL:', e);
    }

    res.status(200).json({ success: true, data: order, message: 'Transfer Order received successfully' });
  } catch (error) { next(error); }
};
