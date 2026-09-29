import mongoose from 'mongoose';
import Invoice from '../../billing/models/Invoice';
import { LedgerService } from './ledgerService';

export class SalesService {
  static async voidInvoice(orgId: string, invoiceId: string, testErrorInjection: boolean = false) {
    const inv = await Invoice.findOne({ _id: invoiceId, orgId });
    if (!inv) throw new Error('Invoice not found');
    
    if (inv.status === 'Void') throw new Error('Invoice already voided');

    const originalStatus = inv.status;
    inv.status = 'Void';
    
    // We must use Mongoose optimistic concurrency (`save()`) to ensure no race conditions
    // during the status update.
    await inv.save();

    try {
      if (testErrorInjection) {
        throw new Error('Injected Error During Ledger Reversal');
      }
      
      await LedgerService.voidTransaction(orgId, invoiceId, new Date());
      return inv;
    } catch (error) {
      // Rollback status because ledger reversal failed!
      const rollbackInv = await Invoice.findById(invoiceId);
      if (rollbackInv) {
        rollbackInv.status = originalStatus;
        await rollbackInv.save();
      }
      throw error; // Re-throw
    }
  }
}
