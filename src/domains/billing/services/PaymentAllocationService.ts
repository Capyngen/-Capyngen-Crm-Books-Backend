import mongoose from 'mongoose';
import Invoice from '../models/Invoice';
import CreditNote from '../models/CreditNote';
import PaymentReceived from '../models/PaymentReceived';

export class PaymentAllocationService {
    /**
     * Auto-allocates an open Credit Note to the oldest open/unpaid Invoices for the customer.
     */
    static async autoAllocateCreditNote(creditNoteId: string | mongoose.Types.ObjectId) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const creditNote = await CreditNote.findById(creditNoteId).session(session);
            if (!creditNote || creditNote.status === 'Closed' || creditNote.status === 'Void') {
                throw new Error('Credit Note not available for allocation');
            }

            const totalAppliedSoFar = (creditNote.appliedToInvoices || []).reduce((acc, curr) => acc + curr.amountApplied, 0);
            const totalRefunded = (creditNote.refunds || []).reduce((acc, curr) => acc + curr.amount, 0);
            let availableCredit = creditNote.total - totalAppliedSoFar - totalRefunded;

            if (availableCredit <= 0) {
                creditNote.status = 'Closed' as any;
                await creditNote.save({ session });
                await session.commitTransaction();
                return creditNote;
            }

            // Find oldest open invoices
            const openInvoices = await Invoice.find({
                customer: creditNote.customer,
                status: { $in: ['Sent', 'Viewed', 'PartiallyPaid', 'Overdue'] },
                balanceDue: { $gt: 0 }
            }).sort({ invoiceDate: 1 }).session(session);

            for (const invoice of openInvoices) {
                if (availableCredit <= 0) break;

                const amountToApply = Math.min(availableCredit, invoice.balanceDue);
                
                // Update Invoice
                invoice.balanceDue -= amountToApply;
                invoice.status = invoice.balanceDue === 0 ? 'Paid' : 'PartiallyPaid';
                await invoice.save({ session });

                // Update Credit Note
                if (!creditNote.appliedToInvoices) creditNote.appliedToInvoices = [];
                creditNote.appliedToInvoices.push({
                    invoiceId: invoice._id as mongoose.Types.ObjectId,
                    amountApplied: amountToApply
                });
                
                availableCredit -= amountToApply;
            }

            if (availableCredit <= 0) {
                creditNote.status = 'Closed' as any;
            }

            await creditNote.save({ session });
            await session.commitTransaction();
            return creditNote;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Splits a single bulk payment across multiple invoices (from Stripe/Razorpay)
     */
    static async processGatewayPayment(
        customerId: string | mongoose.Types.ObjectId,
        amount: number,
        paymentMode: string,
        referenceNumber: string
    ) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            let remainingAmount = amount;
            
            // Find oldest open invoices
            const openInvoices = await Invoice.find({
                customer: customerId,
                status: { $in: ['Sent', 'Viewed', 'PartiallyPaid', 'Overdue'] },
                balanceDue: { $gt: 0 }
            }).sort({ invoiceDate: 1 }).session(session);

            const allocatedInvoices = [];

            for (const invoice of openInvoices) {
                if (remainingAmount <= 0) break;

                const amountToApply = Math.min(remainingAmount, invoice.balanceDue);
                
                invoice.balanceDue -= amountToApply;
                invoice.status = invoice.balanceDue === 0 ? 'Paid' : 'PartiallyPaid';
                await invoice.save({ session });

                allocatedInvoices.push({
                    invoice: invoice._id as mongoose.Types.ObjectId,
                    amountApplied: amountToApply
                });

                remainingAmount -= amountToApply;
            }

            const paymentReceived = new PaymentReceived({
                customer: customerId,
                amount: amount,
                unusedAmount: remainingAmount,
                paymentDate: new Date(),
                paymentNumber: `PAY-${Date.now()}`,
                paymentMode: paymentMode,
                referenceNumber: referenceNumber,
                taxDeducted: false,
                invoices: allocatedInvoices,
                amountUsed: amount - remainingAmount,
                amountRefunded: 0
            });

            await paymentReceived.save({ session });

            await session.commitTransaction();
            return paymentReceived;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
