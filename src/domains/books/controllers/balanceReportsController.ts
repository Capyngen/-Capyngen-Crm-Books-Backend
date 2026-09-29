import { Request, Response, NextFunction } from 'express';
import Invoice from '../../billing/models/Invoice';
import Bill from '../../inventory/models/Bill';
import Customer from '../../billing/models/Customer';
import Vendor from '../../inventory/models/Vendor';
import { requestContext } from '../../../context';

export const getCustomerBalances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId;
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing orgId' });

    // Find non-draft unpaid or partially paid invoices
    const invoices = await Invoice.find({ status: { $in: ['Sent', 'Overdue', 'PartiallyPaid'] } }).lean();
    const customers = await Customer.find({}).lean();

    const balances: Record<string, { totalInvoiced: number, balanceAmount: number }> = {};

    invoices.forEach(inv => {
      const custId = inv.customer ? inv.customer.toString() : 'Unknown';
      if (!balances[custId]) balances[custId] = { totalInvoiced: 0, balanceAmount: 0 };
      
      balances[custId].totalInvoiced += (inv.total || 0);
      balances[custId].balanceAmount += (inv.balanceDue || inv.total || 0);
    });

    const reportLines = Object.keys(balances).map(custId => {
      const cust = customers.find(c => c._id.toString() === custId);
      return {
        customerId: custId,
        customerName: cust ? cust.displayName : 'Unknown Customer',
        balanceAmount: balances[custId].balanceAmount
      };
    }).filter(row => row.balanceAmount > 0);

    reportLines.sort((a, b) => b.balanceAmount - a.balanceAmount);
    res.status(200).json({ success: true, data: reportLines });
  } catch (error) {
    next(error);
  }
};

export const getVendorBalances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId;
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing orgId' });

    // Find non-draft unpaid or partially paid bills
    const bills = await Bill.find({ status: { $in: ['Open', 'Overdue', 'Partially Paid'] } }).lean();
    const vendors = await Vendor.find({}).lean();

    const balances: Record<string, { balanceAmount: number }> = {};

    bills.forEach(bill => {
      const vendorId = bill.vendorId ? bill.vendorId.toString() : 'Unknown';
      if (!balances[vendorId]) balances[vendorId] = { balanceAmount: 0 };
      balances[vendorId].balanceAmount += (bill.balanceDue || bill.total || 0);
    });

    const reportLines = Object.keys(balances).map(vendorId => {
      const vendor = vendors.find(v => v._id.toString() === vendorId);
      return {
        vendorId: vendorId,
        vendorName: vendor ? vendor.displayName : 'Unknown Vendor',
        balanceAmount: balances[vendorId].balanceAmount
      };
    }).filter(row => row.balanceAmount > 0);

    reportLines.sort((a, b) => b.balanceAmount - a.balanceAmount);
    res.status(200).json({ success: true, data: reportLines });
  } catch (error) {
    next(error);
  }
};
