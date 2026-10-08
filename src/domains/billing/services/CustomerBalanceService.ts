import mongoose from 'mongoose';
import Customer from '../models/Customer';
import Invoice from '../models/Invoice';
import SalesOrder from '../models/SalesOrder';

export class CustomerBalanceService {
    /**
     * Dynamically calculates the total credit exposure for a customer.
     * Exposure = (Total Unpaid Invoices) + (Total Unfulfilled Sales Orders)
     */
    static async calculateExposure(customerId: string | mongoose.Types.ObjectId): Promise<number> {
        // 1. Unpaid Invoices
        const invoices = await Invoice.aggregate([
            { $match: { customer: new mongoose.Types.ObjectId(customerId), status: { $in: ['Sent', 'Viewed', 'PartiallyPaid', 'Overdue'] } } },
            { $group: { _id: null, totalBalance: { $sum: "$balanceDue" } } }
        ]);
        const invoiceExposure = invoices.length > 0 ? invoices[0].totalBalance : 0;

        // 2. Open Sales Orders (Not yet invoiced/fulfilled)
        const salesOrders = await SalesOrder.aggregate([
            { $match: { customer: new mongoose.Types.ObjectId(customerId), status: { $in: ['Confirmed', 'Sent'] } } },
            { $group: { _id: null, totalAmount: { $sum: "$total" } } }
        ]);
        const soExposure = salesOrders.length > 0 ? salesOrders[0].totalAmount : 0;

        return invoiceExposure + soExposure;
    }

    /**
     * Validates if a new transaction exceeds the customer's credit limit.
     */
    static async validateCreditLimit(customerId: string | mongoose.Types.ObjectId, transactionAmount: number): Promise<{ allowed: boolean; exposure: number; limit: number; remaining: number }> {
        const customer = await Customer.findById(customerId).lean();
        if (!customer) throw new Error('Customer not found');

        const creditLimit = customer.creditLimit || 0;
        // If creditLimit is 0, we assume unlimited or strictly prepaid (business rule). 
        // For this ERP, 0 means no credit limit enforced.
        if (creditLimit === 0) return { allowed: true, exposure: 0, limit: 0, remaining: Infinity };

        const currentExposure = await this.calculateExposure(customerId);
        const projectedExposure = currentExposure + transactionAmount;
        
        return {
            allowed: projectedExposure <= creditLimit,
            exposure: currentExposure,
            limit: creditLimit,
            remaining: creditLimit - currentExposure
        };
    }

    /**
     * Updates the denormalized availableCredit field on the Customer record for fast querying.
     */
    static async updateAvailableCredit(customerId: string | mongoose.Types.ObjectId): Promise<void> {
        const customer = await Customer.findById(customerId);
        if (!customer || !customer.creditLimit) return;

        const exposure = await this.calculateExposure(customerId);
        const availableCredit = customer.creditLimit - exposure;
        
        await Customer.updateOne({ _id: customerId }, { $set: { availableCredit, receivables: exposure } });
    }
}
