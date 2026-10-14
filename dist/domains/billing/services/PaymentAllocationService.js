"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentAllocationService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Invoice_1 = __importDefault(require("../models/Invoice"));
const CreditNote_1 = __importDefault(require("../models/CreditNote"));
const PaymentReceived_1 = __importDefault(require("../models/PaymentReceived"));
class PaymentAllocationService {
    /**
     * Auto-allocates an open Credit Note to the oldest open/unpaid Invoices for the customer.
     */
    static async autoAllocateCreditNote(creditNoteId) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const creditNote = await CreditNote_1.default.findById(creditNoteId).session(session);
            if (!creditNote || creditNote.status === 'Closed' || creditNote.status === 'Void') {
                throw new Error('Credit Note not available for allocation');
            }
            const totalAppliedSoFar = (creditNote.appliedToInvoices || []).reduce((acc, curr) => acc + curr.amountApplied, 0);
            const totalRefunded = (creditNote.refunds || []).reduce((acc, curr) => acc + curr.amount, 0);
            let availableCredit = creditNote.total - totalAppliedSoFar - totalRefunded;
            if (availableCredit <= 0) {
                creditNote.status = 'Closed';
                await creditNote.save({ session });
                await session.commitTransaction();
                return creditNote;
            }
            // Find oldest open invoices
            const openInvoices = await Invoice_1.default.find({
                customer: creditNote.customer,
                status: { $in: ['Sent', 'Viewed', 'PartiallyPaid', 'Overdue'] },
                balanceDue: { $gt: 0 }
            }).sort({ invoiceDate: 1 }).session(session);
            for (const invoice of openInvoices) {
                if (availableCredit <= 0)
                    break;
                const amountToApply = Math.min(availableCredit, invoice.balanceDue);
                // Update Invoice
                invoice.balanceDue -= amountToApply;
                invoice.status = invoice.balanceDue === 0 ? 'Paid' : 'PartiallyPaid';
                await invoice.save({ session });
                // Update Credit Note
                if (!creditNote.appliedToInvoices)
                    creditNote.appliedToInvoices = [];
                creditNote.appliedToInvoices.push({
                    invoiceId: invoice._id,
                    amountApplied: amountToApply
                });
                availableCredit -= amountToApply;
            }
            if (availableCredit <= 0) {
                creditNote.status = 'Closed';
            }
            await creditNote.save({ session });
            await session.commitTransaction();
            return creditNote;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    /**
     * Splits a single bulk payment across multiple invoices (from Stripe/Razorpay)
     */
    static async processGatewayPayment(customerId, amount, paymentMode, referenceNumber) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            let remainingAmount = amount;
            // Find oldest open invoices
            const openInvoices = await Invoice_1.default.find({
                customer: customerId,
                status: { $in: ['Sent', 'Viewed', 'PartiallyPaid', 'Overdue'] },
                balanceDue: { $gt: 0 }
            }).sort({ invoiceDate: 1 }).session(session);
            const allocatedInvoices = [];
            for (const invoice of openInvoices) {
                if (remainingAmount <= 0)
                    break;
                const amountToApply = Math.min(remainingAmount, invoice.balanceDue);
                invoice.balanceDue -= amountToApply;
                invoice.status = invoice.balanceDue === 0 ? 'Paid' : 'PartiallyPaid';
                await invoice.save({ session });
                allocatedInvoices.push({
                    invoice: invoice._id,
                    amountApplied: amountToApply
                });
                remainingAmount -= amountToApply;
            }
            const paymentReceived = new PaymentReceived_1.default({
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
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
}
exports.PaymentAllocationService = PaymentAllocationService;
