import { requestContext } from '../../../context';
import { Request, Response, NextFunction } from 'express';
import InventoryAdjustment from '../models/InventoryAdjustment';
import Item from '../models/Item';
import { PostingEngine } from '../../books/services/PostingEngine';
import { ApprovalWorkflowService } from '../../../core/services/ApprovalWorkflowService';

// @desc    Create new inventory adjustment
// @route   POST /api/v1/books/inventory-adjustments
export const createAdjustment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService.resolveUserContext(req);

    let referenceNumber = req.body.referenceNumber;
    if (!referenceNumber) {
      const count = await InventoryAdjustment.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
      referenceNumber = `ADJ-${String(count + 1).padStart(5, '0')}`;
    }

    const requestedStatus = req.body.status || 'Adjusted';
    let finalStatus = requestedStatus;
    let finalApprovalStatus = 'Approved';

    // Calculate estimated total value
    let totalValue = 0;
    if (req.body.items && Array.isArray(req.body.items)) {
      for (const itm of req.body.items) {
        totalValue += Math.abs(Number(itm.valueAdjusted || (itm.quantityAdjusted || 0) * (itm.costPrice || 0)));
      }
    }

    if (requestedStatus === 'Draft') {
      finalStatus = 'Draft';
      finalApprovalStatus = 'Draft';
    } else {
      const evalResult = await ApprovalWorkflowService.evaluateApprovalNeed(
        orgId,
        'inventory_adjustments',
        totalValue,
        user,
        userRole
      );

      if (evalResult.requiresApproval) {
        finalStatus = 'Draft';
        finalApprovalStatus = 'Pending';
      } else {
        finalStatus = 'Adjusted';
        finalApprovalStatus = 'Approved';
      }
    }

    const adjustment = await InventoryAdjustment.create({
      ...req.body,
      referenceNumber,
      status: finalStatus,
      approvalStatus: finalApprovalStatus,
      companyId: orgId,
      orgId,
      createdBy: userId
    });

    if (finalApprovalStatus === 'Pending') {
      await ApprovalWorkflowService.submitForApproval({
        orgId,
        module: 'inventory_adjustments',
        documentId: adjustment._id.toString(),
        documentNumber: referenceNumber,
        amount: totalValue,
        customerOrVendorName: 'Stock Adjustment',
        requestedBy: userId || 'system',
        requestedByName: user?.displayName || user?.name || user?.email,
        creatorRoleId: roleId
      });
    } else if (finalStatus === 'Adjusted') {
      // 1. Update stock and warehouse-specific stock
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const adjItem of req.body.items) {
          const qty = Number(adjItem.quantityAdjusted || 0);
          if (qty !== 0) {
            const item = await Item.findById(adjItem.item);
            if (item) {
              item.stock = Math.max(0, (item.stock || 0) + qty);
              item.stockQuantity = item.stock;

              const targetWh = adjItem.warehouse || adjustment.warehouseId || item.defaultWarehouseId;
              if (targetWh) {
                if (!item.warehouseStock) item.warehouseStock = [];
                let ws = item.warehouseStock.find((w: any) => w.warehouse?.toString() === targetWh.toString());
                if (ws) {
                  ws.stockOnHand = Math.max(0, (ws.stockOnHand || 0) + qty);
                  ws.availableStock = Math.max(0, ws.stockOnHand - (ws.committedStock || 0));
                } else {
                  item.warehouseStock.push({
                    warehouse: targetWh,
                    bin: '',
                    stockOnHand: Math.max(0, qty),
                    committedStock: 0,
                    availableStock: Math.max(0, qty)
                  } as any);
                }
              }
              await item.save();
            }
          }
        }
      }

      // 2. Post to General Ledger
      try {
        await PostingEngine.handleEvent('INVENTORY_ADJUSTMENT', {
          adjustmentId: adjustment._id.toString(),
          companyId: orgId
        });
      } catch (postErr) {
        console.error('Failed to post inventory adjustment to GL:', postErr);
      }
    }

    const populated = await InventoryAdjustment.findById(adjustment._id).populate('items.item');
    res.status(201).json({ success: true, data: populated || adjustment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all adjustments
// @route   GET /api/v1/books/inventory-adjustments
export const getAdjustments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const adjustments = await InventoryAdjustment.find(filter)
      .populate('items.item')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: adjustments.length, data: adjustments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single adjustment
// @route   GET /api/v1/books/inventory-adjustments/:id
export const getAdjustmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) {
      filter.$or = [{ companyId: orgId }, { orgId }];
    }
    const adjustment = await InventoryAdjustment.findOne(filter)
      .populate('items.item');
    if (!adjustment) {
      return res.status(404).json({ success: false, message: 'Adjustment not found' });
    }
    res.status(200).json({ success: true, data: adjustment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update adjustment
// @route   PUT /api/v1/books/inventory-adjustments/:id
export const updateAdjustment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) {
      filter.$or = [{ companyId: orgId }, { orgId }];
    }
    const adjustment = await InventoryAdjustment.findOneAndUpdate(filter, req.body, { new: true });
    if (!adjustment) return res.status(404).json({ success: false, message: 'Adjustment not found' });
    res.status(200).json({ success: true, data: adjustment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete adjustment
// @route   DELETE /api/v1/books/inventory-adjustments/:id
export const deleteAdjustment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];
    const doc = await InventoryAdjustment.findOneAndDelete(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Adjustment not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
