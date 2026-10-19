"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventBus_1 = require("../../../core/events/eventBus");
const Journal_1 = require("../models/Journal");
function toFixed2(num) {
    return Math.round(num * 100) / 100;
}
function validateDoubleEntry(lineItems) {
    const totalDebits = lineItems.reduce((sum, item) => sum + item.debits, 0);
    const totalCredits = lineItems.reduce((sum, item) => sum + item.credits, 0);
    if (toFixed2(totalDebits) !== toFixed2(totalCredits)) {
        throw new Error(`Double-entry validation failed. Debits (${totalDebits}) do not equal Credits (${totalCredits}).`);
    }
    return toFixed2(totalDebits);
}
const generateJournalNumber = (prefix = 'JRN') => {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};
// 1. INVOICE_CREATED
eventBus_1.eventBus.on(eventBus_1.EVENTS.INVOICE_CREATED, async (payload) => {
    try {
        const { invoice, companyId } = payload;
        const totalAmount = validateDoubleEntry([
            { account: 'Accounts Receivable', description: `Invoice ${invoice.invoiceNumber}`, contact: invoice.customer?.toString(), debits: invoice.total, credits: 0 },
            { account: 'Sales Revenue', description: `Invoice ${invoice.invoiceNumber}`, contact: invoice.customer?.toString(), debits: 0, credits: invoice.total }
        ]);
        await (new Journal_1.Journal({
            orgId: companyId,
            date: new Date(),
            journalNumber: generateJournalNumber('JRN-INV'),
            notes: `System generated for Invoice ${invoice.invoiceNumber}`,
            reportingMethod: 'accrual',
            lineItems: [
                { account: 'Accounts Receivable', debits: invoice.total, credits: 0 },
                { account: 'Sales Revenue', debits: 0, credits: invoice.total }
            ],
            subTotal: totalAmount,
            total: totalAmount,
            status: 'Published'
        })).save();
    }
    catch (err) {
        console.error('[Journal Listener Error] INVOICE_CREATED:', err.message);
    }
});
// 2. BILL_CREATED
eventBus_1.eventBus.on(eventBus_1.EVENTS.BILL_CREATED, async (payload) => {
    try {
        const { bill, companyId } = payload;
        const totalAmount = validateDoubleEntry([
            { account: 'Inventory Asset / Expense', debits: bill.total, credits: 0 },
            { account: 'Accounts Payable', debits: 0, credits: bill.total }
        ]);
        await (new Journal_1.Journal({
            orgId: companyId,
            date: new Date(),
            journalNumber: generateJournalNumber('JRN-BILL'),
            notes: `System generated for Bill ${bill.billNumber}`,
            reportingMethod: 'accrual',
            lineItems: [
                { account: 'Inventory Asset / Expense', debits: bill.total, credits: 0 },
                { account: 'Accounts Payable', debits: 0, credits: bill.total }
            ],
            subTotal: totalAmount,
            total: totalAmount,
            status: 'Published'
        })).save();
    }
    catch (err) {
        console.error('[Journal Listener Error] BILL_CREATED:', err.message);
    }
});
// 3. PAYMENT_RECEIVED_CREATED
eventBus_1.eventBus.on(eventBus_1.EVENTS.PAYMENT_RECEIVED_CREATED, async (payload) => {
    try {
        const { payment, companyId } = payload;
        const totalAmount = validateDoubleEntry([
            { account: 'Cash/Bank', debits: payment.amount, credits: 0 },
            { account: 'Accounts Receivable', debits: 0, credits: payment.amount }
        ]);
        await (new Journal_1.Journal({
            orgId: companyId,
            date: new Date(),
            journalNumber: generateJournalNumber('JRN-PMT'),
            notes: `System generated for Payment ${payment.paymentNumber}`,
            reportingMethod: 'accrual',
            lineItems: [
                { account: 'Cash/Bank', debits: payment.amount, credits: 0 },
                { account: 'Accounts Receivable', debits: 0, credits: payment.amount }
            ],
            subTotal: totalAmount,
            total: totalAmount,
            status: 'Published'
        })).save();
    }
    catch (err) {
        console.error('[Journal Listener Error] PAYMENT_RECEIVED_CREATED:', err.message);
    }
});
// 4. PAYROLL_FINALIZED
eventBus_1.eventBus.on(eventBus_1.EVENTS.PAYROLL_FINALIZED, async (payload) => {
    try {
        const { payrollData, companyId } = payload;
        const { totalSalary, totalTds = 0, totalPf = 0, payrollMonth } = payrollData;
        const netPayable = totalSalary - totalTds - totalPf;
        const lineItems = [
            { account: 'Salary Expense', debits: totalSalary, credits: 0 }
        ];
        if (totalTds > 0)
            lineItems.push({ account: 'TDS Payable', debits: 0, credits: totalTds });
        if (totalPf > 0)
            lineItems.push({ account: 'PF Payable', debits: 0, credits: totalPf });
        lineItems.push({ account: 'Salaries Payable', debits: 0, credits: netPayable });
        const totalAmount = validateDoubleEntry(lineItems);
        await (new Journal_1.Journal({
            orgId: companyId,
            date: new Date(),
            journalNumber: generateJournalNumber('JRN-PAY'),
            notes: `Payroll for ${payrollMonth || 'the period'}`,
            reportingMethod: 'accrual',
            lineItems,
            subTotal: totalAmount,
            total: totalAmount,
            status: 'Published'
        })).save();
        console.log(`[Integration] Successfully created balanced Journal entry for Payroll ${payrollMonth}`);
    }
    catch (err) {
        console.error('[Journal Listener Error] PAYROLL_FINALIZED:', err.message);
        throw err;
    }
});
