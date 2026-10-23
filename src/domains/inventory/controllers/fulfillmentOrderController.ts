import { Request, Response } from 'express';
import mongoose from 'mongoose';
import FulfillmentOrder from '../models/FulfillmentOrder';
import SalesOrder from '../../billing/models/SalesOrder';
import { buildTenantFilter } from '../../../core/utils/tenantFilter';

export const getFulfillments = async (req: Request, res: Response) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const { stage, priority, search, page = 1, limit = 50 } = req.query;

    const filter: any = { ...tenantFilter };
    if (stage && stage !== 'All') {
      filter.stage = stage;
    }
    if (priority) {
      filter.priority = priority;
    }
    if (search) {
      filter.$or = [
        { waveNumber: { $regex: String(search), $options: 'i' } },
        { salesOrderNumber: { $regex: String(search), $options: 'i' } },
        { customerName: { $regex: String(search), $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      FulfillmentOrder.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      FulfillmentOrder.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: orders.length,
      total,
      data: orders
    });
  } catch (error: any) {
    console.error('Error fetching fulfillments:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getFulfillmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantFilter = buildTenantFilter(req);
    const order = await FulfillmentOrder.findOne({ _id: id, ...tenantFilter }).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: 'Fulfillment order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const createFulfillment = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id || (req as any).user?.companyId || (req as any).headers?.['x-organization-id'] || (req as any).headers?.['x-company-id'];
    const orgIdStr = orgId ? orgId.toString() : '';
    const orgIdObj = (orgIdStr && mongoose.Types.ObjectId.isValid(orgIdStr)) ? new mongoose.Types.ObjectId(orgIdStr) : null;

    const data = req.body;
    if (!data.waveNumber) {
      const year = new Date().getFullYear();
      const count = await FulfillmentOrder.countDocuments({ $or: [{ orgId: orgIdStr }, { companyId: orgIdObj }] });
      data.waveNumber = `WAVE-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    data.companyId = orgIdObj || orgIdStr;
    data.orgId = orgIdStr;

    const newOrder = new FulfillmentOrder(data);
    await newOrder.save();

    // Optionally update linked sales order
    if (data.salesOrderNumber || data.salesOrderId) {
      try {
        const query = data.salesOrderId ? { _id: data.salesOrderId } : { salesOrderNumber: data.salesOrderNumber };
        await SalesOrder.updateOne(query, { $set: { fulfillmentStatus: 'Partially Fulfilled' } });
      } catch (e) {
        console.warn('Could not update sales order status from fulfillment:', e);
      }
    }

    res.status(201).json({ success: true, data: newOrder });
  } catch (error: any) {
    console.error('Error creating fulfillment order:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const updateFulfillment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantFilter = buildTenantFilter(req);
    const updated = await FulfillmentOrder.findOneAndUpdate(
      { _id: id, ...tenantFilter },
      { $set: req.body },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Fulfillment order not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const advanceStage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantFilter = buildTenantFilter(req);

    const order = await FulfillmentOrder.findOne({ _id: id, ...tenantFilter });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Fulfillment order not found' });
    }

    const nextStageMap: Record<string, 'To Pick' | 'Picked' | 'Packed' | 'Shipped'> = {
      'To Pick': 'Picked',
      'Picked': 'Packed',
      'Packed': 'Shipped',
      'Shipped': 'Shipped'
    };

    const nextStage = nextStageMap[order.stage] || 'Picked';
    order.stage = nextStage;
    await order.save();

    // If Shipped, update sales order to Fulfilled
    if (nextStage === 'Shipped' && order.salesOrderNumber) {
      try {
        await SalesOrder.updateOne(
          { salesOrderNumber: order.salesOrderNumber },
          { $set: { fulfillmentStatus: 'Fulfilled', status: 'Fulfilled' } }
        );
      } catch (e) {
        console.warn('Could not mark sales order as Fulfilled:', e);
      }
    }

    res.json({
      success: true,
      message: `Fulfillment advanced to stage ${nextStage}`,
      data: order
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const deleteFulfillment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantFilter = buildTenantFilter(req);
    const deleted = await FulfillmentOrder.findOneAndDelete({ _id: id, ...tenantFilter });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Fulfillment order not found' });
    }
    res.json({ success: true, message: 'Fulfillment order deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
