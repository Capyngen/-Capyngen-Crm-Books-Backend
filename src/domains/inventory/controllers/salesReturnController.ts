import { Request, Response } from 'express';
import mongoose from 'mongoose';
import SalesReturn from '../models/SalesReturn';
import { buildTenantFilter } from '../../../core/utils/tenantFilter';

export const getSalesReturns = async (req: Request, res: Response) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const { status, search, page = 1, limit = 50 } = req.query;

    const filter: any = { ...tenantFilter };
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { rmaNumber: { $regex: String(search), $options: 'i' } },
        { customerName: { $regex: String(search), $options: 'i' } },
        { salesOrderNumber: { $regex: String(search), $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [returns, total] = await Promise.all([
      SalesReturn.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      SalesReturn.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: returns.length,
      total,
      data: returns
    });
  } catch (error: any) {
    console.error('Error fetching sales returns:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getSalesReturnById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantFilter = buildTenantFilter(req);
    const sReturn = await SalesReturn.findOne({ _id: id, ...tenantFilter }).lean();
    if (!sReturn) {
      return res.status(404).json({ success: false, message: 'Sales return not found' });
    }
    res.json({ success: true, data: sReturn });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const createSalesReturn = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id || (req as any).user?.companyId || (req as any).headers?.['x-organization-id'] || (req as any).headers?.['x-company-id'];
    const orgIdStr = orgId ? orgId.toString() : '';
    const orgIdObj = (orgIdStr && mongoose.Types.ObjectId.isValid(orgIdStr)) ? new mongoose.Types.ObjectId(orgIdStr) : null;

    const data = req.body;
    if (!data.rmaNumber) {
      const year = new Date().getFullYear();
      const count = await SalesReturn.countDocuments({ $or: [{ orgId: orgIdStr }, { companyId: orgIdObj }] });
      data.rmaNumber = `RMA-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    data.companyId = orgIdObj || orgIdStr;
    data.orgId = orgIdStr;

    // Default item if none provided
    if (!data.items || !data.items.length) {
      data.items = [{
        name: data.item || 'Returned Item',
        quantity: data.returnQty || 1,
        condition: data.condition || 'Restockable (Good)'
      }];
    }

    const newReturn = new SalesReturn(data);
    await newReturn.save();

    res.status(201).json({ success: true, data: newReturn });
  } catch (error: any) {
    console.error('Error creating sales return:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const updateSalesReturn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantFilter = buildTenantFilter(req);
    const updated = await SalesReturn.findOneAndUpdate(
      { _id: id, ...tenantFilter },
      { $set: req.body },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Sales return not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const deleteSalesReturn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantFilter = buildTenantFilter(req);
    const deleted = await SalesReturn.findOneAndDelete({ _id: id, ...tenantFilter });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Sales return not found' });
    }
    res.json({ success: true, message: 'Sales return removed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const receiveAndRestock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantFilter = buildTenantFilter(req);
    const userEmail = (req as any).user?.email || 'System';

    const sReturn = await SalesReturn.findOne({ _id: id, ...tenantFilter });
    if (!sReturn) {
      return res.status(404).json({ success: false, message: 'Sales return not found' });
    }

    sReturn.status = 'Received & Restocked';
    sReturn.receivedBy = userEmail;
    sReturn.receivedAt = new Date();
    await sReturn.save();

    res.json({
      success: true,
      message: 'Items received, inspected, and restocked into inventory',
      data: sReturn
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
