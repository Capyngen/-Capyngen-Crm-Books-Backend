import mongoose from 'mongoose';
import Invoice from '../models/Invoice';
import PaymentReceived from '../models/PaymentReceived';
import Customer from '../models/Customer';

export class CustomerPortalService {
    
    /**
     * Authenticate a customer for the portal via a secure one-time link or credentials.
     * In a robust system, this returns a JWT signed specifically with "portal" scope.
     */
    static async generateSecurePortalLink(customerId: string | mongoose.Types.ObjectId): Promise<string> {
        const customer = await Customer.findById(customerId);
        if (!customer) throw new Error('Customer not found');

        // Note: For Phase 4, we simulate generating a signed secure token URL
        const mockSecureToken = Buffer.from(`${customerId}:${Date.now()}`).toString('base64');
        return `https://your-erp-domain.com/portal/pay?token=${mockSecureToken}`;
    }

    /**
     * Get Statement of Account (SOA) for a specific customer.
     * Generates a read-only ledger of invoices vs payments for a date range.
     */
    static async getStatementOfAccount(
        customerId: string | mongoose.Types.ObjectId, 
        startDate: Date, 
        endDate: Date
    ) {
        // Fetch Invoices in date range
        const invoices = await Invoice.find({
            customer: customerId,
            invoiceDate: { $gte: startDate, $lte: endDate },
            status: { $ne: 'Draft' }
        }).sort({ invoiceDate: 1 }).select('invoiceNumber invoiceDate total balanceDue status invoiceType');

        // Fetch Payments in date range
        const payments = await PaymentReceived.find({
            customer: customerId,
            paymentDate: { $gte: startDate, $lte: endDate }
        }).sort({ paymentDate: 1 }).select('paymentNumber paymentDate amount unusedAmount paymentMode');

        // Combine into a chronological ledger
        const ledger: any[] = [];
        let runningBalance = 0; // In a real SOA, we'd calculate Opening Balance before startDate

        invoices.forEach(inv => {
            runningBalance += inv.total;
            ledger.push({
                date: inv.invoiceDate,
                type: 'Invoice',
                reference: inv.invoiceNumber,
                debit: inv.total,
                credit: 0,
                balance: runningBalance,
                status: inv.status
            });
        });

        payments.forEach(pay => {
            runningBalance -= pay.amount;
            ledger.push({
                date: pay.paymentDate,
                type: 'Payment',
                reference: pay.paymentNumber,
                debit: 0,
                credit: pay.amount,
                balance: runningBalance,
                status: 'Closed'
            });
        });

        // Sort the combined ledger chronologically
        ledger.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Recalculate running balance correctly after sorting
        let finalRunningBalance = 0;
        ledger.forEach(entry => {
            finalRunningBalance += entry.debit;
            finalRunningBalance -= entry.credit;
            entry.balance = finalRunningBalance;
        });

        return {
            openingBalance: 0,
            closingBalance: finalRunningBalance,
            ledger
        };
    }

    /**
     * Get a list of open invoices for the customer portal to pay.
     */
    static async getOpenInvoices(customerId: string | mongoose.Types.ObjectId) {
        return await Invoice.find({
            customer: customerId,
            status: { $in: ['Sent', 'Viewed', 'PartiallyPaid', 'Overdue'] },
            balanceDue: { $gt: 0 }
        }).select('invoiceNumber invoiceDate dueDate total balanceDue status notes').sort({ invoiceDate: 1 });
    }
}
