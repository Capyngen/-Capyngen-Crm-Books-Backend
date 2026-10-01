import { eventBus, EVENTS } from '../../../core/events/eventBus';
import { Journal, IJournalLineItem } from '../models/Journal';

function toFixed2(num: number): number {
  return Math.round(num * 100) / 100;
}

function validateDoubleEntry(lineItems: IJournalLineItem[]) {
  const totalDebits = lineItems.reduce((sum, item) => sum + item.debits, 0);
  const totalCredits = lineItems.reduce((sum, item) => sum + item.credits, 0);
  
  if (toFixed2(totalDebits) !== toFixed2(totalCredits)) {
    throw new Error(`Double-entry validation failed. Debits (${totalDebits}) do not equal Credits (${totalCredits}).`);
  }
  return toFixed2(totalDebits);
}

// 1. INVOICE_CREATED
eventBus.on(EVENTS.INVOICE_CREATED, async (payload: { invoice: any, companyId: string }) => {
  const { invoice, companyId } = payload;
  const totalAmount = validateDoubleEntry([
    { account: 'Accounts Receivable', description: `Invoice ${invoice.invoiceNumber}`, contact: invoice.customer?.toString(), debits: invoice.total, credits: 0 },
    { account: 'Sales Revenue', description: `Invoice ${invoice.invoiceNumber}`, contact: invoice.customer?.toString(), debits: 0, credits: invoice.total }
  ]);
  await (new Journal({ orgId: companyId, date: new Date(), journalNumber: `JRN-${Date.now()}`, notes: `System generated for Invoice ${invoice.invoiceNumber}`, reportingMethod: 'accrual', lineItems: [
    { account: 'Accounts Receivable', debits: invoice.total, credits: 0 }, { account: 'Sales Revenue', debits: 0, credits: invoice.total }
  ], subTotal: totalAmount, total: totalAmount, status: 'Published' })).save();
});

// 2. BILL_CREATED
eventBus.on(EVENTS.BILL_CREATED, async (payload: { bill: any, companyId: string }) => {
  const { bill, companyId } = payload;
  const totalAmount = validateDoubleEntry([
    { account: 'Inventory Asset / Expense', debits: bill.total, credits: 0 },
    { account: 'Accounts Payable', debits: 0, credits: bill.total }
  ]);
  await (new Journal({ orgId: companyId, date: new Date(), journalNumber: `JRN-${Date.now()}`, notes: `System generated for Bill ${bill.billNumber}`, reportingMethod: 'accrual', lineItems: [
    { account: 'Inventory Asset / Expense', debits: bill.total, credits: 0 }, { account: 'Accounts Payable', debits: 0, credits: bill.total }
  ], subTotal: totalAmount, total: totalAmount, status: 'Published' })).save();
});

// 3. PAYMENT_RECEIVED_CREATED
eventBus.on(EVENTS.PAYMENT_RECEIVED_CREATED, async (payload: { payment: any, companyId: string }) => {
  const { payment, companyId } = payload;
  const totalAmount = validateDoubleEntry([
    { account: 'Cash/Bank', debits: payment.amount, credits: 0 },
    { account: 'Accounts Receivable', debits: 0, credits: payment.amount }
  ]);
  await (new Journal({ orgId: companyId, date: new Date(), journalNumber: `JRN-${Date.now()}`, notes: `System generated for Payment ${payment.paymentNumber}`, reportingMethod: 'accrual', lineItems: [
    { account: 'Cash/Bank', debits: payment.amount, credits: 0 }, { account: 'Accounts Receivable', debits: 0, credits: payment.amount }
  ], subTotal: totalAmount, total: totalAmount, status: 'Published' })).save();
});

// 4. PAYROLL_FINALIZED
eventBus.on(EVENTS.PAYROLL_FINALIZED, async (payload: { payrollData: any, companyId: string }) => {
  const { payrollData, companyId } = payload;
  const { totalSalary, totalTds = 0, totalPf = 0, payrollMonth } = payrollData;
  const netPayable = totalSalary - totalTds - totalPf;

  const lineItems: IJournalLineItem[] = [
    { account: 'Salary Expense', debits: totalSalary, credits: 0 }
  ];
  if (totalTds > 0) lineItems.push({ account: 'TDS Payable', debits: 0, credits: totalTds });
  if (totalPf > 0) lineItems.push({ account: 'PF Payable', debits: 0, credits: totalPf });
  lineItems.push({ account: 'Salaries Payable', debits: 0, credits: netPayable });

  const totalAmount = validateDoubleEntry(lineItems);
  await (new Journal({ orgId: companyId, date: new Date(), journalNumber: `JRN-${Date.now()}`, notes: `Payroll for ${payrollMonth}`, reportingMethod: 'accrual', lineItems, subTotal: totalAmount, total: totalAmount, status: 'Published' })).save();
});
