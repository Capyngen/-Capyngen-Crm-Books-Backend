import { requestContext } from '../../../context';
import { LedgerService } from '../../books/services/ledgerService';
import { Request, Response, NextFunction } from 'express';
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

// @desc    Get all Vendors
// @route   GET /api/v1/books/sales/Vendors
export const getVendors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || requestContext.getStore()?.orgId;
      const filter = orgId ? { $or: [{ companyId: orgId }, { orgId: orgId }] } : {};
      const docs = await Vendor.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Vendor
// @route   GET /api/v1/books/sales/Vendors/:id
export const getVendorById = async (req: Request, res: Response, next: NextFunction) => {
  console.log('HIT getVendorById', req.params.id);
  try {
    const orgId = (req as any).org?._id || requestContext.getStore()?.orgId;
      const filter: any = { _id: req.params.id };
      if (orgId) filter.companyId = orgId;
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
    const doc = await Vendor.findOneAndUpdate({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
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
    const orgId = (req as any).org?._id || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];
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

    const [bills, purchaseOrders, paymentsMade, vendorCredits] = await Promise.all([
      Bill.find({ vendorId }).sort({ billDate: -1 }).lean(),
      PurchaseOrder.find({ vendorId }).sort({ orderDate: -1 }).lean(),
      PaymentMade.find({ vendorId }).sort({ paymentDate: -1 }).lean(),
      VendorCredit.find({ vendorId }).sort({ creditDate: -1 }).lean()
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

    const [bills, payments, vendorCredits] = await Promise.all([
      Bill.find({ vendorId, billDate: { $gte: start, $lte: end }, status: { $ne: 'Draft' } }).lean(),
      PaymentMade.find({ vendorId, paymentDate: { $gte: start, $lte: end } }).lean(),
      VendorCredit.find({ vendorId, creditDate: { $gte: start, $lte: end }, status: { $ne: 'Draft' } }).lean()
    ]);

    const openingBalance = Number(vendor.openingBalance || 0);
    const statementLines: any[] = [];

    // Bills are Credits to Vendor (increase company payable liability)
    bills.forEach(b => {
      statementLines.push({
        date: b.billDate,
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
        date: pmt.paymentDate,
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
        date: vc.creditDate,
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

