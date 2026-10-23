import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Package from '../models/Package';
import SalesOrder from '../../billing/models/SalesOrder';
import { buildTenantFilter } from '../../../core/utils/tenantFilter';

export const getPackages = async (req: Request, res: Response) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const packages = await Package.find(tenantFilter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: packages });
  } catch (error: any) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getPackageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantFilter = buildTenantFilter(req);
    const pkg = await Package.findOne({ _id: id, ...tenantFilter }).lean();
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.json({ success: true, data: pkg });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const createPackage = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id || (req as any).user?.companyId || (req as any).headers?.['x-organization-id'] || (req as any).headers?.['x-company-id'];
    const orgIdStr = orgId ? orgId.toString() : '';
    const orgIdObj = (orgIdStr && mongoose.Types.ObjectId.isValid(orgIdStr)) ? new mongoose.Types.ObjectId(orgIdStr) : null;

    const data = req.body;
    if (!data.packageNumber) {
      data.packageNumber = `PKG-${Date.now().toString().slice(-6)}`;
    }
    data.companyId = orgIdObj || orgIdStr;
    data.orgId = orgIdStr;

    const newPackage = new Package(data);
    await newPackage.save();

    // If linked to a Sales Order, update fulfillment or packed status
    if (data.salesOrderId || data.salesOrderNumber) {
      try {
        const query = data.salesOrderId 
          ? { _id: data.salesOrderId } 
          : { salesOrderNumber: data.salesOrderNumber };
        await SalesOrder.updateOne(query, {
          $set: { fulfillmentStatus: 'Partially Fulfilled' }
        });
      } catch (e) {
        console.warn('Could not update sales order fulfillment status:', e);
      }
    }

    res.status(201).json({ success: true, data: newPackage });
  } catch (error: any) {
    console.error('Error creating package:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const updatePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantFilter = buildTenantFilter(req);
    const updated = await Package.findOneAndUpdate({ _id: id, ...tenantFilter }, { $set: req.body }, { new: true }).lean();
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const deletePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantFilter = buildTenantFilter(req);
    const deleted = await Package.findOneAndDelete({ _id: id, ...tenantFilter });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.json({ success: true, message: 'Package deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
