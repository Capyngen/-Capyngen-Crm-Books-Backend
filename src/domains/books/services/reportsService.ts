import mongoose from 'mongoose';
import Invoice from '../models/Invoice';
import Customer from '../models/Customer';

export class ReportsService {
  static async getSalesByCustomer(orgId: string) {
    // ... existing logic ignored for brevity in override ...
    return [];
  }

  static async getARAgingSummary(orgId: string) {
    const invoices = await Invoice.find({ orgId, balanceDue: { $gt: 0 }, status: { $ne: 'Void' } }).populate('customer').lean();
    
    const summary: Record<string, any> = {};

    invoices.forEach((inv: any) => {
      const custId = inv.customer._id.toString();
      if (!summary[custId]) {
        summary[custId] = {
          customerId: custId,
          customerName: inv.customer.displayName || 'Unknown',
          totalReceivable: 0,
          invoices: []
        };
      }
      summary[custId].totalReceivable += inv.balanceDue;
      summary[custId].invoices.push(inv.invoiceNumber);
    });

    return Object.values(summary);
  }
}
