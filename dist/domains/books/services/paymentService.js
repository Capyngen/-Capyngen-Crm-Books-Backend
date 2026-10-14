"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const Invoice_1 = __importDefault(require("../../billing/models/Invoice"));
const PaymentReceived_1 = __importDefault(require("../../billing/models/PaymentReceived"));
const ledgerService_1 = require("./ledgerService");
const ChartOfAccount_1 = require("../models/ChartOfAccount");
class PaymentService {
    static async applyPayment(orgId, customerId, amount, date, invoiceAllocations) {
        // 1. Validate dates
        for (const alloc of invoiceAllocations) {
            const inv = await Invoice_1.default.findById(alloc.invoiceId);
            if (!inv)
                throw new Error('Invoice not found');
            if (date < inv.invoiceDate) {
                throw new Error('Payment date cannot be before invoice date');
            }
        }
        let totalApplied = 0;
        // 2. Atomic Application to Invoices
        for (const alloc of invoiceAllocations) {
            const updatedInv = await Invoice_1.default.findOneAndUpdate({ _id: alloc.invoiceId, balanceDue: { $gte: alloc.amountApplied } }, { $inc: { balanceDue: -alloc.amountApplied } }, { new: true });
            if (!updatedInv) {
                throw new Error(`Concurrency Error: Invoice ${alloc.invoiceId} does not have enough balance due or was modified simultaneously.`);
            }
            totalApplied += alloc.amountApplied;
        }
        // 3. Calculate advance/unused
        const unusedAmount = amount > totalApplied ? amount - totalApplied : 0;
        if (unusedAmount < 0)
            throw new Error('Applied amount exceeds total payment amount');
        // 4. Save PaymentReceived record
        const pay = new PaymentReceived_1.default({
            orgId, customer: customerId, paymentDate: date, amount, unusedAmount, paymentMode: 'Bank Transfer',
            invoices: invoiceAllocations,
            paymentNumber: `PAY-${Date.now()}`
        });
        await pay.save();
        // 5. Post to Ledger
        const bank = await ChartOfAccount_1.ChartOfAccount.findOne({ orgId, accountName: 'Bank' });
        const ar = await ChartOfAccount_1.ChartOfAccount.findOne({ orgId, accountName: 'Accounts Receivable' });
        const lines = [
            { accountId: bank ? bank._id.toString() : 'Bank', debit: amount },
            { accountId: ar ? ar._id.toString() : 'Accounts Receivable', credit: totalApplied, contactId: customerId }
        ];
        if (unusedAmount > 0) {
            // Find or create Customer Advance account
            let adv = await ChartOfAccount_1.ChartOfAccount.findOne({ orgId, accountName: 'Customer Advance' });
            if (!adv) {
                adv = await ChartOfAccount_1.ChartOfAccount.create({ orgId, accountName: 'Customer Advance', accountType: 'Liability' });
            }
            lines.push({ accountId: adv._id.toString(), credit: unusedAmount, contactId: customerId });
        }
        await ledgerService_1.LedgerService.postTransaction(orgId, pay._id.toString(), 'PaymentReceived', date, lines);
        return pay;
    }
}
exports.PaymentService = PaymentService;
