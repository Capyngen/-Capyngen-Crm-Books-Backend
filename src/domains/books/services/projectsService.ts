import mongoose from 'mongoose';
import TimeEntry from '../models/TimeEntry';
import Invoice from '../models/Invoice';
import { LedgerService } from './ledgerService';

export class ProjectsService {
  static async generateInvoiceFromTimesheets(orgId: string, projectId: string, customerId: string, timesheetIds: string[]) {
    // Check for contamination explicitly
    const timesheets = await TimeEntry.find({ _id: { $in: timesheetIds } });
    if (!timesheets.length) throw new Error('No timesheets found');
    
    for (const t of timesheets) {
      if (t.projectId.toString() !== projectId) {
        throw new Error('Cross-Project Contamination detected: Timesheet does not belong to this project');
      }
      if (t.status === 'Invoiced') {
        throw new Error('Timesheet is already invoiced');
      }
      if (!t.isBillable) {
        throw new Error('Cannot invoice non-billable timesheet');
      }
    }

    // Calculate revenue
    const revenue = timesheets.reduce((sum, t) => sum + (t.hours * t.billingRate), 0);

    // Create Invoice
    const invId = new mongoose.Types.ObjectId();
    const invoice = new Invoice({
      _id: invId,
      orgId,
      customer: customerId,
      invoiceNumber: 'INV-TS-' + Date.now(),
      invoiceDate: new Date(),
      subTotal: revenue,
      total: revenue,
      status: 'Sent'
    });
    
    await invoice.save();

    // Ledger posting
    await LedgerService.postTransaction(orgId, invId.toString(), 'Invoice', invoice.invoiceDate, [
      { accountId: 'Accounts Receivable', debit: revenue, contactId: customerId },
      { accountId: 'Service Income', credit: revenue }
    ], { projectId });

    // Update Timesheets
    await TimeEntry.updateMany({ _id: { $in: timesheetIds } }, { $set: { status: 'Invoiced', invoiceId: invId } });

    return invoice;
  }
}
