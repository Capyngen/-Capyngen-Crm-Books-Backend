import { requestContext } from '../../../context';
import { LedgerService } from '../services/ledgerService';
import { validateTransactionLock } from '../services/transactionLockService';
import { Request, Response, NextFunction } from 'express';
import Expense from '../models/Expense';
import MileageExpense from '../models/MileageExpense';
import { v4 as uuidv4 } from 'uuid';

export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const doc = await Expense.create(req.body);
    if (doc.status !== 'Draft') {
      const orgId = requestContext.getStore()?.orgId || doc.orgId || 'SYSTEM';
      
      const isPaid = doc.status === 'Paid' || doc.paidThroughAccount;
      
      if (isPaid) {
        await LedgerService.postTransaction(orgId, doc._id.toString(), 'Expense', doc.date || new Date(), [
          { accountId: doc.expenseAccountId || 'Expense Account', debit: doc.amount, contactId: doc.vendorId?.toString() },
          { accountId: doc.paidThroughAccount || 'Bank', credit: doc.amount, contactId: doc.vendorId?.toString() }
        ]);
      } else {
        await LedgerService.postTransaction(orgId, doc._id.toString(), 'Expense', doc.date || new Date(), [
          { accountId: doc.expenseAccountId || 'Expense Account', debit: doc.amount, contactId: doc.vendorId?.toString() },
          { accountId: 'Accounts Payable', credit: doc.amount, contactId: doc.vendorId?.toString() }
        ]);
      }
    }

    res.status(201).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const createBulkExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expenses = req.body.expenses;
    if (!expenses || !Array.isArray(expenses)) {
      return res.status(400).json({ success: false, message: 'Invalid data format. Expected an array of expenses.' });
    }
    const bulkBatchId = uuidv4();
    const expensesWithBatch = expenses.map(e => ({ ...e, bulkBatchId }));
    const docs = await Expense.insertMany(expensesWithBatch);
    res.status(201).json({ success: true, count: docs.length, data: docs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const regularDocs = await Expense.find().populate('vendorId', 'displayName companyName').populate('customerId', 'displayName').lean();
    const mileageDocs = await MileageExpense.find().populate('vendorId', 'displayName companyName').populate('customerId', 'displayName').lean();
    
    const mileageWithFlag = mileageDocs.map(m => ({ ...m, expenseType: 'Mileage' }));
    
    // Combine and sort descending by date, then createdAt
    const combined = [...regularDocs, ...mileageWithFlag].sort((a: any, b: any) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.status(200).json({ success: true, count: combined.length, data: combined });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getExpenseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let doc = await Expense.findById(req.params.id).populate('vendorId', 'displayName').populate('customerId', 'displayName').lean();
    if (doc) {
      return res.status(200).json({ success: true, data: doc });
    }
    
    // Fallback to MileageExpense
    let mileageDoc = await MileageExpense.findById(req.params.id).populate('vendorId', 'displayName').populate('customerId', 'displayName').lean();
    if (mileageDoc) {
      const combinedDoc = { ...mileageDoc, expenseType: 'Mileage' };
      return res.status(200).json({ success: true, data: combinedDoc });
    }

    return res.status(404).json({ success: false, message: 'Expense not found' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This endpoint should only update regular expenses (mileage uses its own API)
    const doc = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateBulkExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bulkBatchId = req.params.batchId;
    const expenses = req.body.expenses;
    
    if (!expenses || !Array.isArray(expenses)) {
      return res.status(400).json({ success: false, message: 'Invalid data.' });
    }

    await Expense.deleteMany({ bulkBatchId });
    const expensesWithBatch = expenses.map(e => ({ ...e, bulkBatchId }));
    const docs = await Expense.insertMany(expensesWithBatch);

    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let doc = await Expense.findByIdAndDelete(req.params.id);
    if (!doc) {
      doc = await MileageExpense.findByIdAndDelete(req.params.id) as any;
    }
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getBulkExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await Expense.find({ bulkBatchId: req.params.batchId }).populate('vendorId', 'displayName').populate('customerId', 'displayName');
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}
