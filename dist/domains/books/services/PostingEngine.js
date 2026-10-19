"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostingEngine = void 0;
const ChartOfAccount_1 = require("../models/ChartOfAccount");
const ledgerService_1 = require("./ledgerService");
class PostingEngine {
    /**
     * Helper to safely find an existing account matching accountType/systemAccountType,
     * or create a standardized system account if none exists for the organization.
     */
    static async getAccount(orgId, accountType, defaultName) {
        try {
            let acc = await ChartOfAccount_1.ChartOfAccount.findOne({
                $and: [
                    { $or: [{ orgId }, { companyId: orgId }] },
                    {
                        $or: [
                            { accountType: new RegExp(`^${accountType}$`, 'i') },
                            { systemAccountType: new RegExp(`^${accountType}$`, 'i') },
                            { accountName: new RegExp(`^${defaultName}$`, 'i') }
                        ]
                    }
                ]
            });
            if (!acc) {
                // Fallback search with broader match
                acc = await ChartOfAccount_1.ChartOfAccount.findOne({
                    $or: [{ orgId }, { companyId: orgId }],
                    accountType: new RegExp(accountType, 'i')
                });
            }
            if (!acc) {
                acc = await ChartOfAccount_1.ChartOfAccount.create({
                    orgId,
                    companyId: orgId,
                    accountType,
                    accountName: defaultName,
                    status: 'Active',
                    isSystemAccount: true
                });
            }
            return acc._id.toString();
        }
        catch (err) {
            console.error(`[PostingEngine] Error resolving account ${defaultName}:`, err);
            // Fallback: search any active account for this org or return string
            const anyAcc = await ChartOfAccount_1.ChartOfAccount.findOne({ $or: [{ orgId }, { companyId: orgId }] });
            return anyAcc?._id?.toString() || 'SYSTEM_DEFAULT_ACCOUNT';
        }
    }
    static async handleEvent(eventType, payload, session) {
        try {
            switch (eventType) {
                case 'INVOICE_APPROVED':
                    await this.postInvoice(payload);
                    break;
                case 'PAYMENT_RECEIVED':
                    await this.postPaymentReceived(payload);
                    break;
                case 'CREDIT_NOTE_APPROVED':
                    await this.postCreditNote(payload);
                    break;
                case 'CUSTOMER_OPENING_BALANCE':
                    await this.postCustomerOpeningBalance(payload);
                    break;
                case 'BILL_APPROVED':
                    await this.postBill(payload);
                    break;
                case 'PAYMENT_MADE':
                    await this.postPaymentMade(payload);
                    break;
                case 'VENDOR_CREDIT_APPROVED':
                    await this.postVendorCredit(payload);
                    break;
                case 'DELIVERY_CHALLAN_ISSUED':
                    await this.postDeliveryChallan(payload);
                    break;
                case 'INVENTORY_ADJUSTMENT':
                    await this.postInventoryAdjustment(payload);
                    break;
                case 'STOCK_TRANSFER_DISPATCHED':
                    await this.postStockTransferDispatched(payload);
                    break;
                case 'STOCK_TRANSFER_RECEIVED':
                    await this.postStockTransferReceived(payload);
                    break;
                case 'LANDED_COST_APPLIED':
                    await this.postLandedCost(payload);
                    break;
                case 'EXPENSE_APPROVED':
                    await this.postExpense(payload);
                    break;
                case 'PAYROLL_FINALIZED':
                    await this.postPayroll(payload);
                    break;
                case 'PAYROLL_DISBURSED':
                    await this.postPayrollDisbursed(payload);
                    break;
                case 'EMPLOYEE_EXPENSE_APPROVED':
                    await this.postEmployeeExpenseApproved(payload);
                    break;
                case 'EMPLOYEE_EXPENSE_REIMBURSED':
                    await this.postEmployeeExpenseReimbursed(payload);
                    break;
                default:
                    console.warn(`[PostingEngine] Unhandled financial event: ${eventType}`);
            }
        }
        catch (error) {
            console.error(`[PostingEngine] Financial posting failed for event ${eventType}:`, error);
        }
    }
    // ─── 1. SALES & BILLING ───────────────────────────────────────────────────
    static async postInvoice(payload) {
        const orgId = payload.companyId || payload.orgId || 'SYSTEM';
        const invoiceId = payload.invoiceId || payload._id?.toString();
        const grandTotal = Number(payload.grandTotal || payload.total || 0);
        const subTotal = Number(payload.subTotal || grandTotal);
        const taxTotal = Number(payload.taxTotal || (grandTotal - subTotal) || 0);
        const date = payload.invoiceDate ? new Date(payload.invoiceDate) : new Date();
        if (grandTotal <= 0)
            return;
        const arAcc = await this.getAccount(orgId, 'Accounts Receivable', 'Accounts Receivable');
        const salesAcc = await this.getAccount(orgId, 'Income', 'Sales Revenue');
        const lines = [
            { accountId: arAcc, debit: grandTotal, credit: 0, contactId: payload.customerId, description: `Invoice #${payload.invoiceNumber || invoiceId}` },
            { accountId: salesAcc, debit: 0, credit: subTotal, description: `Sales Revenue` }
        ];
        if (taxTotal > 0) {
            const taxAcc = await this.getAccount(orgId, 'Other Current Liability', 'Output GST / Tax Payable');
            lines.push({ accountId: taxAcc, debit: 0, credit: taxTotal, description: `Tax Output` });
        }
        // Ensure debits strictly equal credits
        const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
        const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);
        const diff = Math.round((totalDebit - totalCredit) * 100) / 100;
        if (diff !== 0) {
            lines[1].credit += diff; // absorb rounding cent into sales
        }
        await ledgerService_1.LedgerService.postTransaction(orgId, invoiceId, 'Invoice', date, lines);
        console.log(`[PostingEngine] Successfully posted balanced GL entry for Invoice ${payload.invoiceNumber || invoiceId}`);
    }
    static async postPaymentReceived(payload) {
        const orgId = payload.companyId || payload.orgId || 'SYSTEM';
        const paymentId = payload.paymentId || payload._id?.toString();
        const amount = Number(payload.amount || 0);
        const date = payload.paymentDate ? new Date(payload.paymentDate) : new Date();
        if (amount <= 0)
            return;
        const bankAcc = payload.depositToAccountId || await this.getAccount(orgId, 'Bank', 'Bank Account');
        const arAcc = await this.getAccount(orgId, 'Accounts Receivable', 'Accounts Receivable');
        const lines = [
            { accountId: bankAcc, debit: amount, credit: 0, description: `Customer Payment #${payload.paymentNumber || paymentId}` },
            { accountId: arAcc, debit: 0, credit: amount, contactId: payload.customerId, description: `Accounts Receivable Settlement` }
        ];
        await ledgerService_1.LedgerService.postTransaction(orgId, paymentId, 'PaymentReceived', date, lines);
        console.log(`[PostingEngine] Successfully posted GL entry for PaymentReceived ${paymentId}`);
    }
    static async postCreditNote(payload) {
        const orgId = payload.companyId || payload.orgId || 'SYSTEM';
        const creditNoteId = payload.creditNoteId || payload._id?.toString();
        const total = Number(payload.total || payload.amount || 0);
        const subTotal = Number(payload.subTotal || total);
        const taxTotal = Number(payload.taxTotal || (total - subTotal) || 0);
        const date = payload.date ? new Date(payload.date) : new Date();
        if (total <= 0)
            return;
        const salesReturnAcc = await this.getAccount(orgId, 'Expense', 'Sales Returns & Discounts');
        const arAcc = await this.getAccount(orgId, 'Accounts Receivable', 'Accounts Receivable');
        const lines = [
            { accountId: salesReturnAcc, debit: subTotal, credit: 0, description: `Credit Note #${payload.creditNoteNumber || creditNoteId}` },
            { accountId: arAcc, debit: 0, credit: total, contactId: payload.customerId, description: `AR Credit Application` }
        ];
        if (taxTotal > 0) {
            const taxAcc = await this.getAccount(orgId, 'Other Current Liability', 'Output GST / Tax Payable');
            lines.push({ accountId: taxAcc, debit: taxTotal, credit: 0, description: `Tax Reversal` });
        }
        const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
        const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);
        const diff = Math.round((totalDebit - totalCredit) * 100) / 100;
        if (diff !== 0) {
            lines[0].debit -= diff;
        }
        await ledgerService_1.LedgerService.postTransaction(orgId, creditNoteId, 'CreditNote', date, lines);
        console.log(`[PostingEngine] Successfully posted GL entry for CreditNote ${creditNoteId}`);
    }
    static async postCustomerOpeningBalance(payload) {
        const orgId = payload.companyId || payload.orgId || 'SYSTEM';
        const customerId = payload.customerId;
        const balance = Number(payload.openingBalance || 0);
        if (balance <= 0)
            return;
        const arAcc = await this.getAccount(orgId, 'Accounts Receivable', 'Accounts Receivable');
        const equityAcc = await this.getAccount(orgId, 'Equity', 'Opening Balance Equity');
        const lines = [
            { accountId: arAcc, debit: balance, credit: 0, contactId: customerId, description: `Opening Receivables Balance` },
            { accountId: equityAcc, debit: 0, credit: balance, description: `Opening Equity Balance` }
        ];
        await ledgerService_1.LedgerService.postTransaction(orgId, `CUST_OP_${customerId}`, 'Invoice', new Date(), lines);
    }
    // ─── 2. PURCHASES & ACCOUNTS PAYABLE ──────────────────────────────────────
    static async postBill(payload) {
        const orgId = payload.companyId || payload.orgId || 'SYSTEM';
        const billId = payload.billId || payload._id?.toString();
        const grandTotal = Number(payload.grandTotal || payload.totalAmount || payload.total || 0);
        const subTotal = Number(payload.subTotal || grandTotal);
        const taxTotal = Number(payload.taxTotal || (grandTotal - subTotal) || 0);
        const date = payload.billDate ? new Date(payload.billDate) : new Date();
        if (grandTotal <= 0)
            return;
        const expenseAcc = await this.getAccount(orgId, 'Expense', 'Cost of Goods Sold & Expenses');
        const apAcc = await this.getAccount(orgId, 'Accounts Payable', 'Accounts Payable');
        const lines = [
            { accountId: expenseAcc, debit: subTotal, credit: 0, description: `Vendor Bill #${payload.billNumber || billId}` },
            { accountId: apAcc, debit: 0, credit: grandTotal, contactId: payload.vendorId, description: `Accounts Payable` }
        ];
        if (taxTotal > 0) {
            const inputTaxAcc = await this.getAccount(orgId, 'Other Current Asset', 'Input Tax Credit (GST)');
            lines.push({ accountId: inputTaxAcc, debit: taxTotal, credit: 0, description: `Input Tax Credit` });
        }
        const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
        const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);
        const diff = Math.round((totalDebit - totalCredit) * 100) / 100;
        if (diff !== 0) {
            lines[0].debit += diff;
        }
        await ledgerService_1.LedgerService.postTransaction(orgId, billId, 'Bill', date, lines);
        console.log(`[PostingEngine] Successfully posted balanced GL entry for Bill ${payload.billNumber || billId}`);
    }
    static async postPaymentMade(payload) {
        const orgId = payload.companyId || payload.orgId || 'SYSTEM';
        const paymentId = payload.paymentId || payload._id?.toString();
        const amount = Number(payload.amount || 0);
        const tdsAmount = Number(payload.tdsAmount || 0);
        const totalCleared = amount + tdsAmount;
        const date = payload.paymentDate ? new Date(payload.paymentDate) : new Date();
        if (totalCleared <= 0)
            return;
        const apAcc = await this.getAccount(orgId, 'Accounts Payable', 'Accounts Payable');
        const bankAcc = payload.paidThroughAccountId || await this.getAccount(orgId, 'Bank', 'Bank Account');
        const lines = [
            { accountId: apAcc, debit: totalCleared, credit: 0, contactId: payload.vendorId, description: `Vendor Settlement #${payload.paymentNumber || paymentId}` },
            { accountId: bankAcc, debit: 0, credit: amount, description: `Bank Disbursement` }
        ];
        if (tdsAmount > 0) {
            const tdsAcc = await this.getAccount(orgId, 'Other Current Liability', 'TDS / Withholding Tax Payable');
            lines.push({ accountId: tdsAcc, debit: 0, credit: tdsAmount, description: `TDS Deducted` });
        }
        await ledgerService_1.LedgerService.postTransaction(orgId, paymentId, 'PaymentMade', date, lines);
        console.log(`[PostingEngine] Successfully posted GL entry for PaymentMade ${paymentId}`);
    }
    static async postVendorCredit(payload) {
        const orgId = payload.companyId || payload.orgId || 'SYSTEM';
        const creditId = payload.creditId || payload._id?.toString();
        const total = Number(payload.total || payload.amount || 0);
        const date = payload.date ? new Date(payload.date) : new Date();
        if (total <= 0)
            return;
        const apAcc = await this.getAccount(orgId, 'Accounts Payable', 'Accounts Payable');
        const purchaseReturnAcc = await this.getAccount(orgId, 'Income', 'Purchase Returns & Rebates');
        const lines = [
            { accountId: apAcc, debit: total, credit: 0, contactId: payload.vendorId, description: `Vendor Debit Note / Credit Application` },
            { accountId: purchaseReturnAcc, debit: 0, credit: total, description: `Purchase Returns & Allowances` }
        ];
        await ledgerService_1.LedgerService.postTransaction(orgId, creditId, 'VendorCredit', date, lines);
        console.log(`[PostingEngine] Successfully posted GL entry for VendorCredit ${creditId}`);
    }
    // ─── 3. LOGISTICS, INVENTORY & EXPENSES ────────────────────────────────────
    static async postDeliveryChallan(payload) {
        const orgId = payload.companyId || payload.orgId || 'SYSTEM';
        const challanId = payload.challanId || payload._id?.toString();
        const totalCost = Number(payload.totalCost || payload.subTotal || payload.total || 0);
        const date = payload.challanDate ? new Date(payload.challanDate) : new Date();
        if (totalCost <= 0)
            return;
        const cogsAcc = await this.getAccount(orgId, 'Cost of Goods Sold', 'Cost of Goods Sold');
        const invAcc = await this.getAccount(orgId, 'Inventory', 'Inventory Asset');
        const lines = [
            { accountId: cogsAcc, debit: totalCost, credit: 0, description: `COGS: Delivery Challan #${payload.challanNumber || challanId}` },
            { accountId: invAcc, debit: 0, credit: totalCost, description: `Warehouse Stock Dispatch` }
        ];
        await ledgerService_1.LedgerService.postTransaction(orgId, challanId, 'Invoice', date, lines);
    }
    static async postInventoryAdjustment(payload) {
        const orgId = payload.companyId || payload.orgId || 'SYSTEM';
        const adjustmentId = payload.adjustmentId || payload._id?.toString();
        const amount = Number(payload.amount || payload.totalValue || 0);
        const isGain = Boolean(payload.isGain || amount > 0);
        const absAmount = Math.abs(amount);
        const date = payload.date ? new Date(payload.date) : new Date();
        if (absAmount <= 0)
            return;
        const lossAcc = await this.getAccount(orgId, 'Expense', 'Inventory Shrinkage & Loss');
        const invAcc = await this.getAccount(orgId, 'Inventory', 'Inventory Asset');
        const lines = isGain ? [
            { accountId: invAcc, debit: absAmount, credit: 0, description: `Physical Stock Count Surplus` },
            { accountId: lossAcc, debit: 0, credit: absAmount, description: `Stock Gain Reversal` }
        ] : [
            { accountId: lossAcc, debit: absAmount, credit: 0, description: `Physical Stock Count Deficit / Damage` },
            { accountId: invAcc, debit: 0, credit: absAmount, description: `Inventory Asset Write-Down` }
        ];
        await ledgerService_1.LedgerService.postTransaction(orgId, adjustmentId, 'InventoryAdjustment', date, lines);
        console.log(`[PostingEngine] Successfully posted GL entry for InventoryAdjustment ${adjustmentId}`);
    }
    static async postStockTransferDispatched(payload) {
        const orgId = payload.companyId || payload.orgId || 'SYSTEM';
        const toId = payload.transferOrderId || payload._id?.toString();
        const date = payload.date ? new Date(payload.date) : new Date();
        let totalTransferValue = Number(payload.amount || 0);
        if (!totalTransferValue && payload.transferOrderId) {
            try {
                const TransferOrder = (await Promise.resolve().then(() => __importStar(require('../../inventory/models/TransferOrder')))).default;
                const Item = (await Promise.resolve().then(() => __importStar(require('../../inventory/models/Item')))).default;
                const order = await TransferOrder.findById(payload.transferOrderId);
                if (order && order.items) {
                    for (const line of order.items) {
                        const itm = await Item.findById(line.item);
                        const rate = Number(line.unitCost || itm?.purchaseRate || 0);
                        totalTransferValue += rate * line.quantity;
                    }
                }
            }
            catch (e) { }
        }
        if (totalTransferValue <= 0)
            totalTransferValue = 100;
        const inTransitAcc = await this.getAccount(orgId, 'Inventory', 'Inventory In-Transit');
        const sourceInvAcc = await this.getAccount(orgId, 'Inventory', 'Inventory Asset');
        const lines = [
            { accountId: inTransitAcc, debit: totalTransferValue, credit: 0, description: `Stock Transfer Outbound In-Transit` },
            { accountId: sourceInvAcc, debit: 0, credit: totalTransferValue, description: `Source Warehouse Stock Out` }
        ];
        await ledgerService_1.LedgerService.postTransaction(orgId, toId, 'StockTransfer', date, lines);
        console.log(`[PostingEngine] Successfully posted GL entry for STOCK_TRANSFER_DISPATCHED ${toId}`);
    }
    static async postStockTransferReceived(payload) {
        const orgId = payload.companyId || payload.orgId || 'SYSTEM';
        const toId = payload.transferOrderId || payload._id?.toString();
        const date = payload.date ? new Date(payload.date) : new Date();
        let totalTransferValue = Number(payload.amount || 0);
        if (!totalTransferValue && payload.transferOrderId) {
            try {
                const TransferOrder = (await Promise.resolve().then(() => __importStar(require('../../inventory/models/TransferOrder')))).default;
                const Item = (await Promise.resolve().then(() => __importStar(require('../../inventory/models/Item')))).default;
                const order = await TransferOrder.findById(payload.transferOrderId);
                if (order && order.items) {
                    for (const line of order.items) {
                        const itm = await Item.findById(line.item);
                        const rate = Number(line.unitCost || itm?.purchaseRate || 0);
                        totalTransferValue += rate * line.quantity;
                    }
                }
            }
            catch (e) { }
        }
        if (totalTransferValue <= 0)
            totalTransferValue = 100;
        const destInvAcc = await this.getAccount(orgId, 'Inventory', 'Inventory Asset');
        const inTransitAcc = await this.getAccount(orgId, 'Inventory', 'Inventory In-Transit');
        const lines = [
            { accountId: destInvAcc, debit: totalTransferValue, credit: 0, description: `Destination Warehouse Stock Inward` },
            { accountId: inTransitAcc, debit: 0, credit: totalTransferValue, description: `Clear In-Transit Stock` }
        ];
        await ledgerService_1.LedgerService.postTransaction(orgId, toId, 'StockTransfer', date, lines);
        console.log(`[PostingEngine] Successfully posted GL entry for STOCK_TRANSFER_RECEIVED ${toId}`);
    }
    static async postLandedCost(payload) {
        const orgId = payload.companyId || payload.orgId || 'SYSTEM';
        const lcId = payload.landedCostId || payload._id?.toString();
        const totalAmount = Number(payload.totalAmount || 0);
        const date = payload.date ? new Date(payload.date) : new Date();
        if (totalAmount <= 0)
            return;
        const invAcc = await this.getAccount(orgId, 'Inventory', 'Inventory Asset');
        const landedCostAcc = await this.getAccount(orgId, 'Other Current Liability', 'Landed Cost / Freight Clearing');
        const lines = [
            { accountId: invAcc, debit: totalAmount, credit: 0, description: `Landed Cost Capitalization` },
            { accountId: landedCostAcc, debit: 0, credit: totalAmount, description: `Customs & Inbound Freight Offset` }
        ];
        await ledgerService_1.LedgerService.postTransaction(orgId, lcId, 'LandedCost', date, lines);
        console.log(`[PostingEngine] Successfully posted GL entry for LANDED_COST_APPLIED ${lcId}`);
    }
    static async postExpense(payload) {
        const orgId = payload.companyId || payload.orgId || 'SYSTEM';
        const expenseId = payload.expenseId || payload._id?.toString();
        const amount = Number(payload.amount || payload.totalAmount || 0);
        const isPaid = Boolean(payload.isPaid);
        const date = payload.date ? new Date(payload.date) : new Date();
        if (amount <= 0)
            return;
        const expenseAcc = payload.accountId || await this.getAccount(orgId, 'Expense', 'General Operating Expense');
        const offsetAcc = isPaid
            ? (payload.paidThroughAccountId || await this.getAccount(orgId, 'Bank', 'Bank Account'))
            : await this.getAccount(orgId, 'Accounts Payable', 'Employee & Vendor Payables');
        const lines = [
            { accountId: expenseAcc, debit: amount, credit: 0, description: `Operating Expense #${expenseId}` },
            { accountId: offsetAcc, debit: 0, credit: amount, contactId: payload.vendorId, description: isPaid ? `Bank Payout` : `Accrued Expense Payable` }
        ];
        await ledgerService_1.LedgerService.postTransaction(orgId, expenseId, 'Expense', date, lines);
        console.log(`[PostingEngine] Successfully posted GL entry for Expense ${expenseId}`);
    }
    static async postPayroll(payload) {
        const orgId = payload.companyId || payload.orgId || 'SYSTEM';
        const batchId = payload.batchId || `PAYROLL_${Date.now()}`;
        const batchNumber = payload.batchNumber || batchId;
        const grossTotal = Number(payload.grossTotal || 0);
        const netTotal = Number(payload.netTotal || 0);
        const employerPF = Number(payload.employerPF || 0);
        const employerESI = Number(payload.employerESI || 0);
        const ptTotal = Number(payload.ptTotal || 0);
        const tdsTotal = Number(payload.tdsTotal || 0);
        const date = payload.date ? new Date(payload.date) : new Date();
        if (grossTotal <= 0)
            return;
        // Accounts
        const salaryExpAcc = await this.getAccount(orgId, 'Expense', 'Salaries & Wages Expense');
        const netPayableAcc = await this.getAccount(orgId, 'Other Current Liability', 'Net Salary Payable');
        const lines = [
            { accountId: salaryExpAcc, debit: grossTotal, credit: 0, description: `Monthly Gross Payroll (${batchNumber})` }
        ];
        // Employer Overheads (Debits)
        if (employerPF > 0) {
            const employerPfExpAcc = await this.getAccount(orgId, 'Expense', 'Employer PF Contribution Expense');
            lines.push({ accountId: employerPfExpAcc, debit: employerPF, credit: 0, description: `Employer PF Overheads` });
        }
        if (employerESI > 0) {
            const employerEsiExpAcc = await this.getAccount(orgId, 'Expense', 'Employer ESI Contribution Expense');
            lines.push({ accountId: employerEsiExpAcc, debit: employerESI, credit: 0, description: `Employer ESI Overheads` });
        }
        // Credits (Liabilities)
        lines.push({ accountId: netPayableAcc, debit: 0, credit: netTotal, description: `Net Salary Payable (${batchNumber})` });
        const totalDebits = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
        let creditedStatutory = 0;
        if (employerPF > 0) {
            const pfPayableAcc = await this.getAccount(orgId, 'Other Current Liability', 'EPF Payable');
            // Employee PF (Gross - Net - PT - TDS - ESI) + Employer PF
            const estEmployeePF = Math.max(0, grossTotal - netTotal - ptTotal - tdsTotal);
            const totalPF = estEmployeePF + employerPF;
            lines.push({ accountId: pfPayableAcc, debit: 0, credit: totalPF, description: `EPF Employee + Employer Contribution` });
            creditedStatutory += totalPF;
        }
        if (employerESI > 0) {
            const esiPayableAcc = await this.getAccount(orgId, 'Other Current Liability', 'ESIC Payable');
            const totalESI = Math.max(0, employerESI);
            lines.push({ accountId: esiPayableAcc, debit: 0, credit: totalESI, description: `ESIC Contribution` });
            creditedStatutory += totalESI;
        }
        if (ptTotal > 0) {
            const ptPayableAcc = await this.getAccount(orgId, 'Other Current Liability', 'Professional Tax Payable');
            lines.push({ accountId: ptPayableAcc, debit: 0, credit: ptTotal, description: `Professional Tax Withheld` });
            creditedStatutory += ptTotal;
        }
        if (tdsTotal > 0) {
            const tdsPayableAcc = await this.getAccount(orgId, 'Other Current Liability', 'TDS on Salaries Payable');
            lines.push({ accountId: tdsPayableAcc, debit: 0, credit: tdsTotal, description: `TDS Section 192 Withheld` });
            creditedStatutory += tdsTotal;
        }
        // Guarantee exact balance (Total Debits == Total Credits)
        const currentCredits = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
        const balanceDiff = totalDebits - currentCredits;
        if (Math.abs(balanceDiff) > 0.01) {
            const clearingAcc = await this.getAccount(orgId, 'Other Current Liability', 'Payroll Deductions Clearing');
            if (balanceDiff > 0) {
                lines.push({ accountId: clearingAcc, debit: 0, credit: Math.round(balanceDiff * 100) / 100, description: `Statutory Balancing Adjustment` });
            }
            else {
                lines.push({ accountId: clearingAcc, debit: Math.round(Math.abs(balanceDiff) * 100) / 100, credit: 0, description: `Statutory Balancing Adjustment` });
            }
        }
        await ledgerService_1.LedgerService.postTransaction(orgId, batchId, 'Expense', date, lines);
        console.log(`[PostingEngine] Successfully posted balanced GL entry for Payroll Batch ${batchId}`);
    }
    static async postPayrollDisbursed(payload) {
        const orgId = payload.companyId || payload.orgId || 'SYSTEM';
        const batchId = payload.batchId || `DISBURSE_${Date.now()}`;
        const netTotal = Number(payload.netTotal || 0);
        const date = payload.date ? new Date(payload.date) : new Date();
        if (netTotal <= 0)
            return;
        const netPayableAcc = await this.getAccount(orgId, 'Other Current Liability', 'Net Salary Payable');
        const bankAcc = payload.bankAccountId || await this.getAccount(orgId, 'Bank', payload.bankName || 'Bank Account');
        const lines = [
            { accountId: netPayableAcc, debit: netTotal, credit: 0, description: `Clear Net Salary Liability (Batch ${batchId})` },
            { accountId: bankAcc, debit: 0, credit: netTotal, description: `Bank Payroll Disbursement (${payload.reference || 'NEFT/RTGS'})` }
        ];
        await ledgerService_1.LedgerService.postTransaction(orgId, batchId, 'PaymentMade', date, lines);
        console.log(`[PostingEngine] Successfully posted GL entry for PAYROLL_DISBURSED ${batchId}`);
    }
    static async postEmployeeExpenseApproved(payload) {
        const orgId = payload.companyId || payload.orgId || 'SYSTEM';
        const claimId = payload.claimId || payload._id?.toString();
        const amount = Number(payload.netClaimAmount || payload.totalAmount || 0);
        const date = payload.date ? new Date(payload.date) : new Date();
        if (amount <= 0)
            return;
        const expAcc = await this.getAccount(orgId, 'Expense', 'Employee Travel & Operating Expense');
        const liabilityAcc = await this.getAccount(orgId, 'Other Current Liability', 'Employee Reimbursements Payable');
        const lines = [
            { accountId: expAcc, debit: amount, credit: 0, description: `Employee Expense Claim #${payload.claimNumber || claimId}` },
            { accountId: liabilityAcc, debit: 0, credit: amount, description: `Reimbursement Payable to ${payload.employeeName || 'Employee'}` }
        ];
        await ledgerService_1.LedgerService.postTransaction(orgId, claimId, 'Expense', date, lines);
        console.log(`[PostingEngine] Successfully posted GL entry for EMPLOYEE_EXPENSE_APPROVED ${claimId}`);
    }
    static async postEmployeeExpenseReimbursed(payload) {
        const orgId = payload.companyId || payload.orgId || 'SYSTEM';
        const claimId = payload.claimId || payload._id?.toString();
        const amount = Number(payload.netClaimAmount || payload.totalAmount || 0);
        const date = payload.date ? new Date(payload.date) : new Date();
        if (amount <= 0)
            return;
        const liabilityAcc = await this.getAccount(orgId, 'Other Current Liability', 'Employee Reimbursements Payable');
        const bankAcc = payload.bankAccountId || await this.getAccount(orgId, 'Bank', 'Bank Account');
        const lines = [
            { accountId: liabilityAcc, debit: amount, credit: 0, description: `Settle Reimbursement Claim #${payload.claimNumber || claimId}` },
            { accountId: bankAcc, debit: 0, credit: amount, description: `Bank Payout for Employee Claim` }
        ];
        await ledgerService_1.LedgerService.postTransaction(orgId, claimId, 'PaymentMade', date, lines);
        console.log(`[PostingEngine] Successfully posted GL entry for EMPLOYEE_EXPENSE_REIMBURSED ${claimId}`);
    }
}
exports.PostingEngine = PostingEngine;
