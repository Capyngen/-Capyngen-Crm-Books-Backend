import { requestContext } from '../../../context';
import { LedgerService } from '../services/ledgerService';
import { PostingEngine } from '../services/PostingEngine';
import { validateTransactionLock } from '../services/transactionLockService';
import { Request, Response, NextFunction } from 'express';
import Expense from '../models/Expense';
import MileageExpense from '../models/MileageExpense';
import { ApprovalWorkflowService } from '../../../core/services/ApprovalWorkflowService';
import { v4 as uuidv4 } from 'uuid';
import { buildTenantFilter } from '../../../core/utils/tenantFilter';

export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService.resolveUserContext(req);
    const requestedStatus = req.body.status || (req.body.paidThroughAccount ? 'Paid' : 'Approved');
    let finalStatus = requestedStatus;
    let finalApprovalStatus = 'Approved';

    if (requestedStatus === 'Draft') {
      finalStatus = 'Draft';
      finalApprovalStatus = 'Draft';
    } else {
      const evalResult = await ApprovalWorkflowService.evaluateApprovalNeed(
        orgId,
        'expenses',
        Number(req.body.amount || 0),
        user,
        userRole
      );

      if (evalResult.requiresApproval) {
        finalStatus = 'Pending Approval';
        finalApprovalStatus = 'Pending';
      }
    }

    const doc = await Expense.create({
      ...req.body,
      status: finalStatus,
      approvalStatus: finalApprovalStatus,
      companyId: orgId,
      orgId,
      createdBy: userId
    });

    if (finalApprovalStatus === 'Pending') {
      await ApprovalWorkflowService.submitForApproval({
        orgId,
        module: 'expenses',
        documentId: doc._id.toString(),
        documentNumber: (doc as any).expenseNumber || `EXP-${doc._id.toString().slice(-5).toUpperCase()}`,
        amount: Number(req.body.amount || 0),
        customerOrVendorName: req.body.vendorName || 'Expense',
        requestedBy: userId || 'system',
        requestedByName: user?.displayName || user?.name || user?.email,
        creatorRoleId: roleId
      });
    } else if (finalStatus !== 'Draft') {
      const isPaid = doc.status === 'Paid' || !!doc.paidThroughAccount;
      const payload = {
        expenseId: doc._id.toString(),
        companyId: orgId,
        amount: doc.amount,
        vendorId: doc.vendorId?.toString(),
        isPaid,
        accountId: doc.accountId?.toString(),
        paidThroughAccountId: doc.paidThroughAccount?.toString()
      };
      await PostingEngine.handleEvent('EXPENSE_APPROVED', payload);
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
    const tenantFilter = buildTenantFilter(req);

    const regularDocs = await Expense.find(tenantFilter).populate('vendorId', 'displayName companyName').populate('customerId', 'displayName').lean();
    const mileageDocs = await MileageExpense.find(tenantFilter).populate('vendorId', 'displayName companyName').populate('customerId', 'displayName').lean();
    
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
    const tenantFilter = buildTenantFilter(req);
    const filter: any = { _id: req.params.id, ...tenantFilter };

    let doc = await Expense.findOne(filter).populate('vendorId', 'displayName').populate('customerId', 'displayName').lean();
    if (doc) {
      return res.status(200).json({ success: true, data: doc });
    }
    
    // Fallback to MileageExpense
    let mileageDoc = await MileageExpense.findOne(filter).populate('vendorId', 'displayName').populate('customerId', 'displayName').lean();
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
    const tenantFilter = buildTenantFilter(req);
    const filter: any = { _id: req.params.id, ...tenantFilter };
    const doc = await Expense.findOneAndUpdate(filter, req.body, {
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
    const tenantFilter = buildTenantFilter(req);
    const filter: any = { _id: req.params.id, ...tenantFilter };
    let doc = await Expense.findOneAndDelete(filter);
    if (!doc) {
      doc = await MileageExpense.findOneAndDelete(filter) as any;
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
