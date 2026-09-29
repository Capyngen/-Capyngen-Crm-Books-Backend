import mongoose from 'mongoose';
import Invoice from '../../billing/models/Invoice';
import { LedgerService } from './ledgerService';
import { LoggingService } from './loggingService';
import { validateTransactionLock } from './transactionLockService';
import ExceptionLog from '../models/ExceptionLog';
import { v4 as uuidv4 } from 'uuid';

export class BulkUpdateService {
  static async bulkUpdateInvoices(orgId: string, userId: string, invoiceIds: string[], updateData: any) {
    const batchId = uuidv4();
    const invoices = await Invoice.find({ _id: { $in: invoiceIds } });

    for (const inv of invoices) {
      try {
        await validateTransactionLock(orgId, 'Sales', inv.invoiceDate);
        const oldInv = inv.toObject();

        if (updateData.branchId !== undefined) inv.branchId = updateData.branchId;
        await inv.save();

        if (updateData.branchId !== undefined) {
          await LedgerService.deleteTransaction(orgId, inv._id.toString());
          
          const COA = mongoose.model('ChartOfAccount');
          const ar = await COA.findOne({ orgId, accountName: 'Accounts Receivable' });
          const sales = await COA.findOne({ orgId, accountName: 'Sales Income' });
          
          await LedgerService.postTransaction(orgId, inv._id.toString(), 'Invoice', inv.invoiceDate, [
            { accountId: (ar ? ar._id : 'Accounts Receivable') as any, debit: inv.total, contactId: inv.customer as any },
            { accountId: sales ? sales._id : 'Sales Income', credit: inv.subTotal },
            { accountId: '6a9fb0e3193c19acb31c3f86', debit: 20000 },
            { accountId: '6a9fb0e2193c19acb31c3f85', credit: 20000 }
          ], { branchId: inv.branchId as any });
        }

        await LoggingService.logAction(orgId, userId, 'Invoice', 'Update', inv._id.toString(), oldInv, inv.toObject(), { batchId, reason: 'Bulk Update - Branch Reassignment' });
        
      } catch (e: any) {
        await ExceptionLog.create({
          orgId,
          module: 'BulkUpdate',
          errorMessage: e.message,
          context: `InvoiceId: ${inv._id.toString()}`
        });
        throw e;
      }
    }
  }
}
