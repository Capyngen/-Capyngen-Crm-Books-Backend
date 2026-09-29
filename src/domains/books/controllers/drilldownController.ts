import { Request, Response, NextFunction } from 'express';
import { requestContext } from '../../../context';
import Invoice from '../../billing/models/Invoice';
import Bill from '../../inventory/models/Bill';
import Expense from '../models/Expense';

export const getDrilldown = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId;
    const { accountId, customerId, vendorId, type } = req.query;
    
    let results: any[] = [];

    if (customerId) {
      const invoices = await Invoice.find({ orgId, customer: customerId } as any).populate('customer');
      results = invoices.map((inv: any) => ({
        _id: inv._id,
        date: inv.invoiceDate,
        transactionNumber: inv.invoiceNumber,
        sourceType: 'Invoice',
        sourceId: inv._id,
        partyName: (inv.customer as any)?.displayName || (inv.customer as any)?.companyName,
        amount: inv.total
      }));
    } 
    else if (vendorId) {
      const bills = await Bill.find({ orgId, vendor: vendorId } as any).populate('vendor');
      results = bills.map((bill: any) => ({
        _id: bill._id,
        date: bill.billDate,
        transactionNumber: bill.billNumber,
        sourceType: 'Bill',
        sourceId: bill._id,
        partyName: (bill.vendor as any)?.displayName || (bill.vendor as any)?.companyName,
        amount: bill.total
      }));
    }
    else if (accountId) {
      const expenses = await Expense.find({ orgId, expenseAccount: accountId } as any).populate('vendor customer');
      results = expenses.map((exp: any) => ({
        _id: exp._id,
        date: exp.date,
        transactionNumber: exp.expenseNumber,
        sourceType: 'Expense',
        sourceId: exp._id,
        partyName: (exp.vendor as any)?.displayName || (exp.vendor as any)?.companyName || (exp.customer as any)?.name || '-',
        amount: exp.amount
      }));
    }

    results.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};
