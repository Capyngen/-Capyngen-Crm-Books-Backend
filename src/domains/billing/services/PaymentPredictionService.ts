import mongoose from 'mongoose';
import Invoice from '../models/Invoice';
import PaymentReceived from '../models/PaymentReceived';
import Customer from '../models/Customer';

export class PaymentPredictionService {
    /**
     * AI Analytics Heuristic Engine (Phase 4)
     * Analyzes historical payment behaviors and invoice properties to predict the probability of default.
     * In a full Python-ML setup, this would be an API call to a TensorFlow/scikit-learn microservice.
     */
    static async analyzeInvoiceRisk(invoiceId: string | mongoose.Types.ObjectId): Promise<{ riskScore: number, riskFlags: string[] }> {
        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) throw new Error('Invoice not found');

        const customer = await Customer.findById(invoice.customer);
        if (!customer) throw new Error('Customer not found');

        let riskScore = 10; // Base baseline risk
        const riskFlags: string[] = [];

        // 1. Credit Limit vs Invoice Size
        if (customer.creditLimit && customer.creditLimit > 0) {
            const utilization = invoice.total / customer.creditLimit;
            if (utilization > 0.8) {
                riskScore += 25;
                riskFlags.push('High Credit Utilization');
            }
        }

        // 2. Historical Payment Behavior (Average Days Late)
        const pastPayments = await PaymentReceived.find({ customer: invoice.customer }).sort({ paymentDate: -1 }).limit(10);
        if (pastPayments.length > 0) {
            // Check if they frequently pay late or have bounces (simulated heuristic)
            let latePayments = 0;
            // In a real scenario, we'd compare PaymentReceived.paymentDate with Invoice.dueDate
            // For now, we simulate a heuristic based on available credit and past trends
            if (customer.availableCredit !== undefined && customer.availableCredit < 0) {
                riskScore += 30;
                riskFlags.push('Negative Available Credit');
            }
        } else {
            // New customer
            riskScore += 20;
            riskFlags.push('New Customer (No Payment History)');
        }

        // 3. High-Value Anomaly Detection
        // If this invoice is 3x larger than their average invoice
        const pastInvoices = await Invoice.find({ customer: invoice.customer, _id: { $ne: invoice._id } });
        if (pastInvoices.length > 0) {
            const avgInvoiceValue = pastInvoices.reduce((acc, inv) => acc + inv.total, 0) / pastInvoices.length;
            if (invoice.total > avgInvoiceValue * 3) {
                riskScore += 35;
                riskFlags.push('High-Value Anomaly (3x Avg Invoice Size)');
            }
        }

        // Cap risk score at 100
        riskScore = Math.min(riskScore, 100);

        // Save the prediction back to the invoice
        invoice.riskScore = riskScore;
        invoice.riskFlags = riskFlags;
        await invoice.save();

        return { riskScore, riskFlags };
    }

    /**
     * Batch job to run every night via Cron
     */
    static async runNightlyRiskAnalysis() {
        // Find open invoices without a recent risk score or where dueDate is approaching
        const openInvoices = await Invoice.find({
            status: { $in: ['Sent', 'Viewed', 'PartiallyPaid'] },
            balanceDue: { $gt: 0 },
            riskScore: { $exists: false }
        }).limit(100);

        for (const inv of openInvoices) {
            await this.analyzeInvoiceRisk(inv._id as mongoose.Types.ObjectId);
        }
    }
}
