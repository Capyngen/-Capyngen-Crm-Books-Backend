import mongoose from 'mongoose';
import { Journal } from '../models/Journal';
import LedgerEntry from '../models/LedgerEntry';
import { ChartOfAccount } from '../models/ChartOfAccount';

export class PostingEngine {
  
  static async handleEvent(eventType: string, payload: any, session?: mongoose.ClientSession) {
    switch (eventType) {
      case 'INVOICE_APPROVED':
        await this.postInvoice(payload, session);
        break;
      case 'PAYMENT_RECEIVED':
        await this.postPaymentReceived(payload, session);
        break;
      case 'CREDIT_NOTE_APPROVED':
        await this.postCreditNote(payload, session);
        break;
      case 'CUSTOMER_OPENING_BALANCE':
        await this.postCustomerOpeningBalance(payload, session);
        break;
      case 'BILL_APPROVED':
        await this.postBill(payload, session);
        break;
      case 'PAYMENT_MADE':
        await this.postPaymentMade(payload, session);
        break;
      case 'VENDOR_CREDIT_APPROVED':
        await this.postVendorCredit(payload, session);
        break;
      case 'DELIVERY_CHALLAN_ISSUED':
        await this.postDeliveryChallan(payload, session);
        break;
      case 'INVENTORY_ADJUSTMENT':
        await this.postInventoryAdjustment(payload, session);
        break;
      case 'EXPENSE_APPROVED':
        await this.postExpense(payload, session);
        break;
      case 'PAYROLL_FINALIZED':
        await this.postPayroll(payload, session);
        break;
      default:
        console.warn(`[PostingEngine] Unhandled financial event: ${eventType}`);
    }
  }

  // --- BILLING / SALES ---

  private static async postInvoice(payload: any, session?: mongoose.ClientSession) {
    console.log(`[PostingEngine] Generating Journal for Invoice: ${payload.invoiceId}`);
    const { invoiceId, companyId, customerId, subTotal, taxTotal, grandTotal, invoiceDate, invoiceNumber } = payload;
    const arAccount = await ChartOfAccount.findOne({ companyId, accountType: 'Accounts Receivable' }).session(session || null);
    const salesAccount = await ChartOfAccount.findOne({ companyId, accountType: 'Income' }).session(session || null);
    const taxAccount = await ChartOfAccount.findOne({ companyId, accountType: 'Other Current Liability', accountName: /Tax/i }).session(session || null);

    if (!arAccount || !salesAccount) throw new Error("System accounts for AR or Sales missing.");

    const journal = new Journal({ companyId, date: invoiceDate || new Date(), referenceNumber: invoiceNumber, notes: `Invoice #${invoiceNumber}`, journalType: 'System', totalDebit: grandTotal, totalCredit: grandTotal, status: 'Published' });
    await journal.save({ session });

    const entries = [];
    entries.push({ companyId, journalId: journal._id, accountId: arAccount._id, contactId: customerId, transactionId: invoiceId, transactionType: 'Invoice', debit: grandTotal, credit: 0 });
    entries.push({ companyId, journalId: journal._id, accountId: salesAccount._id, transactionId: invoiceId, transactionType: 'Invoice', debit: 0, credit: subTotal });
    if (taxTotal > 0 && taxAccount) entries.push({ companyId, journalId: journal._id, accountId: taxAccount._id, transactionId: invoiceId, transactionType: 'Invoice', debit: 0, credit: taxTotal });
    await LedgerEntry.insertMany(entries, { session });
  }

  private static async postPaymentReceived(payload: any, session?: mongoose.ClientSession) {
    console.log(`[PostingEngine] Generating Journal for Payment Received: ${payload.paymentId}`);
    // Debit Bank/Undeposited Funds, Credit AR
  }

  private static async postCreditNote(payload: any, session?: mongoose.ClientSession) {
    console.log(`[PostingEngine] Generating Journal for Credit Note: ${payload.creditNoteId}`);
    // Debit Sales Return, Credit AR
  }

  private static async postCustomerOpeningBalance(payload: any, session?: mongoose.ClientSession) {
    console.log(`[PostingEngine] Generating Journal for Customer Opening Balance: ${payload.customerId}`);
    // Debit AR, Credit Opening Balance Equity
  }

  // --- INVENTORY / PURCHASES ---

  private static async postBill(payload: any, session?: mongoose.ClientSession) {
    console.log(`[PostingEngine] Generating Journal for Bill: ${payload.billId}`);
    // Debit Expense/Inventory, Credit Accounts Payable
  }

  private static async postPaymentMade(payload: any, session?: mongoose.ClientSession) {
    console.log(`[PostingEngine] Generating Journal for Payment Made: ${payload.paymentId}`);
    // Debit Accounts Payable, Credit Bank
  }

  private static async postVendorCredit(payload: any, session?: mongoose.ClientSession) {
    console.log(`[PostingEngine] Generating Journal for Vendor Credit: ${payload.creditId}`);
    // Debit AP, Credit Expense/Inventory
  }

  private static async postDeliveryChallan(payload: any, session?: mongoose.ClientSession) {
    console.log(`[PostingEngine] Generating Journal for Delivery Challan (COGS): ${payload.challanId}`);
    // Debit COGS, Credit Inventory Asset
  }

  private static async postInventoryAdjustment(payload: any, session?: mongoose.ClientSession) {
    console.log(`[PostingEngine] Generating Journal for Inventory Adjustment`);
    // Debit/Credit Inventory Asset vs Shrinkage Expense
  }

  // --- BOOKS / EXPENSES / HRMS ---

  private static async postExpense(payload: any, session?: mongoose.ClientSession) {
    console.log(`[PostingEngine] Generating Journal for Expense: ${payload.expenseId}`);
    // Debit Expense, Credit Bank or AP
  }

  private static async postPayroll(payload: any, session?: mongoose.ClientSession) {
    console.log(`[PostingEngine] Generating Journal for HRMS Payroll`);
    // Debit Salary Expense, Credit Net Payable, Credit TDS/PF
  }
}
