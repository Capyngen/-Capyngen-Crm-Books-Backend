import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Invoice from '../../billing/models/Invoice';
import Bill from '../../inventory/models/Bill';
import Expense from '../models/Expense';
import PaymentReceived from '../../billing/models/PaymentReceived';
import PaymentMade from '../models/PaymentMade';
import CreditNote from '../../billing/models/CreditNote';
import VendorCredit from '../../inventory/models/VendorCredit';
import LedgerEntry from '../models/LedgerEntry';
import { extractOrgId } from './reportsController';
import { AdvancedReportsService } from '../services/advancedReportsService';

export const getDrilldown = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const { accountId, customerId, vendorId, itemId, type } = req.query;
    
    let results: any[] = [];
    const orgFilter = AdvancedReportsService.getOrgFilter(orgId);

    // 1. Customer Drilldown (Sales & Customer Balances)
    if (customerId) {
      const custObjId = mongoose.Types.ObjectId.isValid(String(customerId))
        ? new mongoose.Types.ObjectId(String(customerId))
        : customerId;

      const [invoices, payments, creditNotes] = await Promise.all([
        Invoice.find({ ...orgFilter, customer: custObjId, status: { $ne: 'Void' } }).populate('customer').lean(),
        PaymentReceived.find({ ...orgFilter, customer: custObjId, status: { $ne: 'Void' } }).populate('customer').lean(),
        CreditNote.find({ ...orgFilter, customer: custObjId, status: { $ne: 'Void' } } as any).populate('customer').lean()
      ]);

      const mappedInvoices = invoices.map((inv: any) => ({
        _id: inv._id,
        date: inv.invoiceDate || inv.date || inv.createdAt,
        transactionNumber: inv.invoiceNumber || 'INV',
        sourceType: 'Invoice',
        sourceId: inv._id,
        partyName: inv.customer?.displayName || inv.customer?.companyName || 'Customer',
        direction: 'inflow',
        amount: inv.total || inv.amount || 0
      }));

      const mappedPayments = payments.map((pmt: any) => ({
        _id: pmt._id,
        date: pmt.paymentDate || pmt.date || pmt.createdAt,
        transactionNumber: pmt.paymentNumber || 'PMT',
        sourceType: 'PaymentReceived',
        sourceId: pmt._id,
        partyName: pmt.customer?.displayName || pmt.customer?.companyName || 'Customer Payment',
        direction: 'outflow',
        amount: -(pmt.amount || 0)
      }));

      const mappedCredits = creditNotes.map((cn: any) => ({
        _id: cn._id,
        date: cn.creditNoteDate || cn.date || cn.createdAt,
        transactionNumber: cn.creditNoteNumber || 'CN',
        sourceType: 'CreditNote',
        sourceId: cn._id,
        partyName: (cn.customer as any)?.displayName || (cn.customer as any)?.companyName || 'Credit Note',
        direction: 'outflow',
        amount: -(cn.total || 0)
      }));

      results = [...mappedInvoices, ...mappedPayments, ...mappedCredits];
    } 
    // 2. Vendor Drilldown (Purchases & Vendor Payables)
    else if (vendorId) {
      const vendObjId = mongoose.Types.ObjectId.isValid(String(vendorId))
        ? new mongoose.Types.ObjectId(String(vendorId))
        : vendorId;

      const [bills, paymentsMade, vendorCredits] = await Promise.all([
        Bill.find({ ...orgFilter, vendorId: vendObjId, status: { $ne: 'Void' } }).populate('vendorId').lean(),
        PaymentMade.find({ ...orgFilter, vendorId: vendObjId, status: { $ne: 'Void' } }).populate('vendorId').lean(),
        VendorCredit.find({ ...orgFilter, vendorId: vendObjId, status: { $ne: 'Void' } } as any).populate('vendorId').lean()
      ]);

      const mappedBills = bills.map((bill: any) => ({
        _id: bill._id,
        date: bill.billDate || bill.date || bill.createdAt,
        transactionNumber: bill.billNumber || 'BILL',
        sourceType: 'Bill',
        sourceId: bill._id,
        partyName: (bill.vendorId as any)?.displayName || (bill.vendorId as any)?.vendorName || (bill.vendorId as any)?.companyName || 'Vendor',
        direction: 'outflow',
        amount: -(bill.totalAmount || bill.total || bill.amount || 0)
      }));

      const mappedPayments = paymentsMade.map((pmt: any) => ({
        _id: pmt._id,
        date: pmt.paymentDate || pmt.date || pmt.createdAt,
        transactionNumber: pmt.paymentNumber || 'PMT-OUT',
        sourceType: 'PaymentMade',
        sourceId: pmt._id,
        partyName: (pmt.vendorId as any)?.displayName || (pmt.vendorId as any)?.companyName || 'Vendor Settlement',
        direction: 'inflow',
        amount: pmt.amount || 0
      }));

      const mappedCredits = vendorCredits.map((vc: any) => ({
        _id: vc._id,
        date: vc.creditDate || vc.date || vc.createdAt,
        transactionNumber: vc.vendorCreditNumber || 'VC',
        sourceType: 'VendorCredit',
        sourceId: vc._id,
        partyName: (vc.vendorId as any)?.displayName || (vc.vendorId as any)?.companyName || 'Vendor Credit',
        direction: 'inflow',
        amount: vc.totalAmount || 0
      }));

      results = [...mappedBills, ...mappedPayments, ...mappedCredits];
    }
    // 3. Item Drilldown (Item Sales, Purchases & Profitability)
    else if (itemId) {
      const itemObjId = mongoose.Types.ObjectId.isValid(String(itemId))
        ? new mongoose.Types.ObjectId(String(itemId))
        : itemId;

      const [invoices, bills] = await Promise.all([
        Invoice.find({ ...orgFilter, 'items.item': itemObjId, status: { $ne: 'Void' } }).populate('customer').lean(),
        Bill.find({ ...orgFilter, 'lineItems.itemId': itemObjId, status: { $ne: 'Void' } }).populate('vendorId').lean()
      ]);

      const mappedInvoices = invoices.map((inv: any) => {
        const itemLine = (inv.items || []).find((it: any) => String(it.item) === String(itemId) || String(it.item?._id) === String(itemId));
        const lineTotal = itemLine ? (itemLine.amount || (itemLine.quantity * itemLine.rate)) : inv.total;
        return {
          _id: inv._id,
          date: inv.invoiceDate || inv.date || inv.createdAt,
          transactionNumber: inv.invoiceNumber || 'INV',
          sourceType: 'Invoice',
          sourceId: inv._id,
          partyName: inv.customer?.displayName || inv.customer?.companyName || 'Customer Sale',
          direction: 'inflow',
          amount: lineTotal || 0
        };
      });

      const mappedBills = bills.map((bill: any) => {
        const itemLine = (bill.lineItems || []).find((it: any) => String(it.itemId) === String(itemId) || String(it.itemId?._id) === String(itemId));
        const lineTotal = itemLine ? (itemLine.amount || (itemLine.quantity * itemLine.rate)) : (bill.totalAmount || bill.total);
        return {
          _id: bill._id,
          date: bill.billDate || bill.date || bill.createdAt,
          transactionNumber: bill.billNumber || 'BILL',
          sourceType: 'Bill',
          sourceId: bill._id,
          partyName: (bill.vendorId as any)?.displayName || (bill.vendorId as any)?.vendorName || 'Vendor Purchase',
          direction: 'outflow',
          amount: -(lineTotal || 0)
        };
      });

      results = [...mappedInvoices, ...mappedBills];
    }
    // 4. Account Drilldown (Balance Sheet, P&L, Trial Balance, Ledger)
    else if (accountId) {
      const accStr = String(accountId).toLowerCase();

      // Check if LedgerEntry has postings for this account
      const ledgerEntries: any[] = await (LedgerEntry as any).find({
        ...orgFilter,
        status: 'Posted',
        'lines.accountId': accountId
      }).lean();

      if (ledgerEntries.length > 0) {
        results = ledgerEntries.map((le: any) => {
          const line = (le.lines || []).find((l: any) => String(l.accountId) === String(accountId));
          const debit = line?.debit || 0;
          const credit = line?.credit || 0;
          const isDebit = debit > 0;
          return {
            _id: le._id,
            date: le.date,
            transactionNumber: le.transactionId || 'ENTRY',
            sourceType: le.transactionType || 'Journal',
            sourceId: le.transactionId,
            partyName: line?.description || le.transactionType || 'General Ledger',
            direction: isDebit ? 'inflow' : 'outflow',
            amount: isDebit ? debit : -credit
          };
        });
      }

      // Dynamic sub-ledger breakdown if no direct ledger lines
      if (results.length === 0) {
        // A. Cash and Cash Equivalents / Bank accounts
        if (accStr.includes('cash') || accStr.includes('bank') || accStr === 'asset-cash-bank') {
          const [paymentsIn, paymentsOut, cashExpenses] = await Promise.all([
            PaymentReceived.find({ ...orgFilter, status: { $ne: 'Void' } }).populate('customer').lean(),
            PaymentMade.find({ ...orgFilter, status: { $ne: 'Void' } }).populate('vendorId').lean(),
            Expense.find({ ...orgFilter, status: { $ne: 'Void' } } as any).populate('vendorId customerId').lean()
          ]);

          const mappedIn = paymentsIn.map((p: any) => ({
            _id: p._id,
            date: p.paymentDate || p.date || p.createdAt,
            transactionNumber: p.paymentNumber || 'PMT-IN',
            sourceType: 'PaymentReceived',
            sourceId: p._id,
            partyName: p.customer?.displayName || p.customer?.companyName || 'Customer Inflow',
            direction: 'inflow',
            amount: p.amount || 0
          }));

          const mappedOut = paymentsOut.map((p: any) => ({
            _id: p._id,
            date: p.paymentDate || p.date || p.createdAt,
            transactionNumber: p.paymentNumber || 'PMT-OUT',
            sourceType: 'PaymentMade',
            sourceId: p._id,
            partyName: (p.vendorId as any)?.displayName || (p.vendorId as any)?.vendorName || (p.vendorId as any)?.companyName || 'Vendor Payout',
            direction: 'outflow',
            amount: -(p.amount || 0)
          }));

          const mappedExp = cashExpenses.map((exp: any) => ({
            _id: exp._id,
            date: exp.date || exp.createdAt,
            transactionNumber: exp.reference || 'EXP',
            sourceType: 'Expense',
            sourceId: exp._id,
            partyName: (exp.vendorId as any)?.displayName || (exp.vendorId as any)?.vendorName || (exp.customerId as any)?.displayName || exp.notes || exp.expenseAccount || 'Operating Expense',
            direction: 'outflow',
            amount: -(exp.totalAmount || exp.amount || 0)
          }));

          results = [...mappedIn, ...mappedOut, ...mappedExp];
        }
        // B. Accounts Receivable
        else if (accStr.includes('receivable') || accStr === 'asset-accounts-receivable') {
          const invoices = await Invoice.find({ ...orgFilter, status: { $nin: ['Draft', 'Void'] } }).populate('customer').lean();
          results = invoices.map((inv: any) => ({
            _id: inv._id,
            date: inv.invoiceDate || inv.date || inv.createdAt,
            transactionNumber: inv.invoiceNumber,
            sourceType: 'Invoice',
            sourceId: inv._id,
            partyName: inv.customer?.displayName || inv.customer?.companyName || 'Customer',
            direction: 'inflow',
            amount: inv.balanceDue !== undefined ? inv.balanceDue : (inv.total || 0)
          }));
        }
        // C. Accounts Payable
        else if (accStr.includes('payable') || accStr === 'liability-accounts-payable') {
          const bills = await Bill.find({ ...orgFilter, status: { $nin: ['Draft', 'Void'] } }).populate('vendorId').lean();
          results = bills.map((bill: any) => ({
            _id: bill._id,
            date: bill.billDate || bill.date || bill.createdAt,
            transactionNumber: bill.billNumber,
            sourceType: 'Bill',
            sourceId: bill._id,
            partyName: (bill.vendorId as any)?.displayName || (bill.vendorId as any)?.vendorName || (bill.vendorId as any)?.companyName || 'Vendor',
            direction: 'outflow',
            amount: -(bill.balanceDue !== undefined ? bill.balanceDue : (bill.totalAmount || bill.total || 0))
          }));
        }
        // D. Sales / Revenue / Operating Income
        else if (accStr.includes('sales') || accStr.includes('income') || accStr.includes('revenue') || accStr === 'income-sales') {
          const [invoices, creditNotes] = await Promise.all([
            Invoice.find({ ...orgFilter, status: { $nin: ['Draft', 'Void'] } }).populate('customer').lean(),
            CreditNote.find({ ...orgFilter, status: { $nin: ['Draft', 'Void'] } } as any).populate('customer').lean()
          ]);

          const mappedInvoices = invoices.map((inv: any) => ({
            _id: inv._id,
            date: inv.invoiceDate || inv.date || inv.createdAt,
            transactionNumber: inv.invoiceNumber,
            sourceType: 'Invoice',
            sourceId: inv._id,
            partyName: inv.customer?.displayName || inv.customer?.companyName || 'Customer',
            direction: 'inflow',
            amount: inv.total || inv.amount || 0
          }));

          const mappedCredits = creditNotes.map((cn: any) => ({
            _id: cn._id,
            date: cn.creditNoteDate || cn.date || cn.createdAt,
            transactionNumber: cn.creditNoteNumber || 'CN',
            sourceType: 'CreditNote',
            sourceId: cn._id,
            partyName: (cn.customer as any)?.displayName || 'Credit Note (Return)',
            direction: 'outflow',
            amount: -(cn.total || 0)
          }));

          results = [...mappedInvoices, ...mappedCredits];
        } 
        // E. Inventory Asset / COGS / Purchases
        else if (accStr.includes('cogs') || accStr.includes('purchase') || accStr.includes('inventory') || accStr === 'cogs-inventory' || accStr === 'asset-inventory') {
          const bills = await Bill.find({ ...orgFilter, status: { $nin: ['Draft', 'Void'] } }).populate('vendorId').lean();
          results = bills.map((bill: any) => ({
            _id: bill._id,
            date: bill.billDate || bill.date || bill.createdAt,
            transactionNumber: bill.billNumber,
            sourceType: 'Bill',
            sourceId: bill._id,
            partyName: (bill.vendorId as any)?.displayName || (bill.vendorId as any)?.vendorName || (bill.vendorId as any)?.companyName || 'Vendor',
            direction: accStr === 'asset-inventory' ? 'inflow' : 'outflow',
            amount: accStr === 'asset-inventory' ? (bill.totalAmount || bill.total || 0) : -(bill.totalAmount || bill.total || 0)
          }));
        }
        // F. Operating Expenses
        else {
          const expenses = await Expense.find({ ...orgFilter, status: { $ne: 'Void' } } as any).populate('vendorId customerId').lean();
          results = expenses.map((exp: any) => ({
            _id: exp._id,
            date: exp.date || exp.createdAt,
            transactionNumber: exp.reference || 'EXP',
            sourceType: 'Expense',
            sourceId: exp._id,
            partyName: (exp.vendorId as any)?.displayName || (exp.vendorId as any)?.vendorName || (exp.customerId as any)?.displayName || exp.notes || exp.expenseAccount || 'Operating Expense',
            direction: 'outflow',
            amount: -(exp.totalAmount || exp.amount || 0)
          }));
        }
      }
    }

    results.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};
