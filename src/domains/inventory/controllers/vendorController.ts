import { requestContext } from '../../../context';
import { LedgerService } from '../../books/services/ledgerService';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Vendor from '../models/Vendor';
import Bill from '../models/Bill';
import PurchaseOrder from '../models/PurchaseOrder';
import PaymentMade from '../../books/models/PaymentMade';
import VendorCredit from '../models/VendorCredit';

// @desc    Create new Vendor
// @route   POST /api/v1/books/sales/Vendors
export const createVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId2 = (req as any).org?._id || requestContext.getStore()?.orgId;
    const doc = await Vendor.create({ ...req.body, orgId: orgId2 || req.body.orgId, companyId: orgId2 || req.body.companyId, createdBy: (req as any).user?._id });
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

import { buildTenantFilter } from '../../../core/utils/tenantFilter';

// @desc    Get all Vendors
// @route   GET /api/v1/books/sales/Vendors
export const getVendors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const docs = await Vendor.find(tenantFilter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Vendor
// @route   GET /api/v1/books/sales/Vendors/:id
export const getVendorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0 
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };
    const doc = await Vendor.findOne(filter);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Vendor
// @route   PUT /api/v1/books/sales/Vendors/:id
export const updateVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0 
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };
    const doc = await Vendor.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

import { VendorOnboardingService } from '../services/VendorOnboardingService';

export const updateVendorOnboarding = async (req: Request, res: Response) => {
    try {
        const { status, notes } = req.body;
        const vendor = await VendorOnboardingService.updateOnboardingStatus(req.params.id, status, 'system-user', notes);
        res.status(200).json({ success: true, data: vendor });
    } catch (e: any) { res.status(400).json({ success: false, message: e.message }); }
};

export const deleteVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0 
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };
    const doc = await Vendor.findOneAndDelete(filter);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const getVendorTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.params.id;
    const vendor = await Vendor.findById(vendorId).lean();
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const vendorFilter = {
      $or: [
        { vendorId: vendorId },
        ...(mongoose.isValidObjectId(vendorId) ? [{ vendorId: new mongoose.Types.ObjectId(vendorId) }] : []),
        { vendor: vendorId },
        ...(mongoose.isValidObjectId(vendorId) ? [{ vendor: new mongoose.Types.ObjectId(vendorId) }] : []),
        { 'vendor._id': vendorId },
        ...(mongoose.isValidObjectId(vendorId) ? [{ 'vendor._id': new mongoose.Types.ObjectId(vendorId) }] : [])
      ]
    };

    const [bills, purchaseOrders, paymentsMade, vendorCredits] = await Promise.all([
      Bill.find(vendorFilter).sort({ billDate: -1, createdAt: -1 }).lean(),
      PurchaseOrder.find(vendorFilter).sort({ orderDate: -1, createdAt: -1 }).lean(),
      PaymentMade.find(vendorFilter).sort({ paymentDate: -1, createdAt: -1 }).lean(),
      VendorCredit.find(vendorFilter).sort({ creditDate: -1, createdAt: -1 }).lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        bills,
        purchaseOrders,
        paymentsMade,
        vendorCredits
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorStatement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.params.id;
    const vendor = await Vendor.findById(vendorId).lean();
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(0);
    const end = endDate ? new Date(endDate as string) : new Date();

    const vendorFilter = {
      $or: [
        { vendorId: vendorId },
        ...(mongoose.isValidObjectId(vendorId) ? [{ vendorId: new mongoose.Types.ObjectId(vendorId) }] : []),
        { vendor: vendorId },
        ...(mongoose.isValidObjectId(vendorId) ? [{ vendor: new mongoose.Types.ObjectId(vendorId) }] : []),
        { 'vendor._id': vendorId },
        ...(mongoose.isValidObjectId(vendorId) ? [{ 'vendor._id': new mongoose.Types.ObjectId(vendorId) }] : [])
      ]
    };

    const [bills, payments, vendorCredits] = await Promise.all([
      Bill.find({ ...vendorFilter, billDate: { $gte: start, $lte: end }, status: { $ne: 'Draft' } }).lean(),
      PaymentMade.find({ ...vendorFilter, paymentDate: { $gte: start, $lte: end } }).lean(),
      VendorCredit.find({ ...vendorFilter, creditDate: { $gte: start, $lte: end }, status: { $ne: 'Draft' } }).lean()
    ]);

    const openingBalance = Number(vendor.openingBalance || 0);
    const statementLines: any[] = [];

    // Bills are Credits to Vendor (increase company payable liability)
    bills.forEach(b => {
      statementLines.push({
        date: b.billDate || b.createdAt,
        type: 'Bill',
        reference: b.billNumber,
        details: `Vendor Bill #${b.billNumber}`,
        debit: 0,
        credit: Number(b.totalAmount || (b as any).total || 0)
      });
    });

    // Payments Made are Debits to Vendor (reduce company liability)
    payments.forEach(pmt => {
      statementLines.push({
        date: pmt.paymentDate || pmt.createdAt,
        type: 'Payment Made',
        reference: pmt.paymentNumber,
        details: `Disbursement #${pmt.paymentNumber} via ${pmt.paidThrough || pmt.paymentMode || 'Bank'}`,
        debit: Number(pmt.amount || 0),
        credit: 0
      });
    });

    // Vendor Credits are Debits to Vendor (reduce company liability)
    vendorCredits.forEach(vc => {
      statementLines.push({
        date: vc.creditDate || vc.createdAt,
        type: 'Vendor Credit',
        reference: vc.vendorCreditNumber,
        details: `Vendor Debit Note #${vc.vendorCreditNumber}`,
        debit: Number(vc.totalAmount || (vc as any).total || 0),
        credit: 0
      });
    });

    // Sort chronologically
    statementLines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = openingBalance;
    let totalDebit = 0;
    let totalCredit = 0;

    const transactions = statementLines.map(line => {
      runningBalance = runningBalance + line.credit - line.debit;
      totalDebit += line.debit;
      totalCredit += line.credit;
      return {
        ...line,
        balance: Math.round(runningBalance * 100) / 100
      };
    });

    res.status(200).json({
      success: true,
      data: {
        vendor: {
          id: vendor._id,
          name: vendor.displayName || vendor.companyName,
          companyName: vendor.companyName,
          email: vendor.email,
          phone: vendor.phone,
          currency: vendor.currency || 'INR',
          billingAddress: vendor.billingAddress
        },
        period: {
          startDate: start,
          endDate: end
        },
        openingBalance,
        totalDebit: Math.round(totalDebit * 100) / 100,
        totalCredit: Math.round(totalCredit * 100) / 100,
        closingBalance: Math.round(runningBalance * 100) / 100,
        transactions
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.params.id;
    const vendor = await Vendor.findById(vendorId).lean();
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const vendorFilter = {
      $or: [
        { vendorId: vendorId },
        ...(mongoose.isValidObjectId(vendorId) ? [{ vendorId: new mongoose.Types.ObjectId(vendorId) }] : []),
        { vendor: vendorId },
        ...(mongoose.isValidObjectId(vendorId) ? [{ vendor: new mongoose.Types.ObjectId(vendorId) }] : []),
        { 'vendor._id': vendorId },
        ...(mongoose.isValidObjectId(vendorId) ? [{ 'vendor._id': new mongoose.Types.ObjectId(vendorId) }] : [])
      ]
    };

    const [bills, purchaseOrders, payments, credits] = await Promise.all([
      Bill.find(vendorFilter).sort({ createdAt: -1, billDate: -1 }).limit(20).lean(),
      PurchaseOrder.find(vendorFilter).sort({ createdAt: -1, orderDate: -1 }).limit(10).lean(),
      PaymentMade.find(vendorFilter).sort({ createdAt: -1, paymentDate: -1 }).limit(20).lean(),
      VendorCredit.find(vendorFilter).sort({ createdAt: -1, creditDate: -1 }).limit(10).lean()
    ]);

    const activityList: any[] = [];

    // 1. Initial Onboarding Event
    activityList.push({
      id: `act-vnd-create-${vendor._id}`,
      action: 'Vendor Onboarded',
      type: 'create',
      title: 'Vendor Profile Registered',
      description: `Vendor "${vendor.displayName || vendor.companyName}" was onboarded into Supply Chain master.`,
      actorName: (vendor as any).createdByName || 'Procurement Team',
      role: 'Procurement',
      timestamp: vendor.createdAt || new Date(),
      date: vendor.createdAt || new Date(),
      status: vendor.status || 'Active'
    });

    // 2. Bills
    bills.forEach(b => {
      activityList.push({
        id: `act-bill-${b._id}`,
        action: 'Bill Received',
        type: 'bill',
        title: `Bill #${b.billNumber} Logged`,
        description: `Payable: ₹${Number(b.totalAmount || (b as any).total || 0).toLocaleString('en-IN')}`,
        referenceId: b._id,
        referenceNumber: b.billNumber,
        actorName: 'Accounts Payable',
        timestamp: b.createdAt || b.billDate,
        date: b.billDate || b.createdAt,
        status: b.status
      });
    });

    // 3. Purchase Orders
    purchaseOrders.forEach(po => {
      activityList.push({
        id: `act-po-${po._id}`,
        action: 'Purchase Order Issued',
        type: 'purchase_order',
        title: `PO #${po.purchaseOrderNumber || (po as any).poNumber} Issued`,
        description: `Committed value: ₹${Number(po.totalAmount || (po as any).total || 0).toLocaleString('en-IN')}`,
        referenceId: po._id,
        referenceNumber: po.purchaseOrderNumber || (po as any).poNumber,
        actorName: 'Procurement Officer',
        timestamp: po.createdAt || po.orderDate,
        date: po.orderDate || po.createdAt,
        status: po.status
      });
    });

    // 4. Payments Made
    payments.forEach(pmt => {
      activityList.push({
        id: `act-pmt-${pmt._id}`,
        action: 'Payment Disbursed',
        type: 'payment',
        title: `Disbursement #${pmt.paymentNumber}`,
        description: `Paid ₹${(pmt.amount || 0).toLocaleString('en-IN')} via ${pmt.paidThrough || pmt.paymentMode || 'Bank'}`,
        referenceId: pmt._id,
        referenceNumber: pmt.paymentNumber,
        actorName: 'Treasury / Accounts',
        timestamp: pmt.createdAt || pmt.paymentDate,
        date: pmt.paymentDate || pmt.createdAt,
        status: 'Paid'
      });
    });

    activityList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.status(200).json({
      success: true,
      data: activityList,
      timeline: activityList,
      count: activityList.length
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorBills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.params.id;
    const vendorFilter = {
      $or: [
        { vendorId: vendorId },
        ...(mongoose.isValidObjectId(vendorId) ? [{ vendorId: new mongoose.Types.ObjectId(vendorId) }] : []),
        { vendor: vendorId },
        ...(mongoose.isValidObjectId(vendorId) ? [{ vendor: new mongoose.Types.ObjectId(vendorId) }] : [])
      ]
    };
    const bills = await Bill.find(vendorFilter).sort({ billDate: -1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: bills.length, data: bills });
  } catch (error) { next(error); }
};

export const getVendorPurchaseOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.params.id;
    const vendorFilter = {
      $or: [
        { vendorId: vendorId },
        ...(mongoose.isValidObjectId(vendorId) ? [{ vendorId: new mongoose.Types.ObjectId(vendorId) }] : []),
        { vendor: vendorId },
        ...(mongoose.isValidObjectId(vendorId) ? [{ vendor: new mongoose.Types.ObjectId(vendorId) }] : [])
      ]
    };
    const pos = await PurchaseOrder.find(vendorFilter).sort({ orderDate: -1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: pos.length, data: pos });
  } catch (error) { next(error); }
};

export const getVendorPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.params.id;
    const vendorFilter = {
      $or: [
        { vendorId: vendorId },
        ...(mongoose.isValidObjectId(vendorId) ? [{ vendorId: new mongoose.Types.ObjectId(vendorId) }] : []),
        { vendor: vendorId },
        ...(mongoose.isValidObjectId(vendorId) ? [{ vendor: new mongoose.Types.ObjectId(vendorId) }] : [])
      ]
    };
    const pmts = await PaymentMade.find(vendorFilter).sort({ paymentDate: -1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: pmts.length, data: pmts });
  } catch (error) { next(error); }
};

export const getVendorCredits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.params.id;
    const vendorFilter = {
      $or: [
        { vendorId: vendorId },
        ...(mongoose.isValidObjectId(vendorId) ? [{ vendorId: new mongoose.Types.ObjectId(vendorId) }] : []),
        { vendor: vendorId },
        ...(mongoose.isValidObjectId(vendorId) ? [{ vendor: new mongoose.Types.ObjectId(vendorId) }] : [])
      ]
    };
    const credits = await VendorCredit.find(vendorFilter).sort({ creditDate: -1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: credits.length, data: credits });
  } catch (error) { next(error); }
};

