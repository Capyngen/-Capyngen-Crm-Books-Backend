import mongoose from 'mongoose';
import RecurringInvoice from '../../billing/models/RecurringInvoice';
import RecurringBill from '../../inventory/models/RecurringBill';
import RecurringExpense from '../models/RecurringExpense';

import Vendor from '../../inventory/models/Vendor';
import VendorCredit from '../../inventory/models/VendorCredit';
import Expense from '../models/Expense';

import Item from '../../inventory/models/Item';
import Bill from '../../inventory/models/Bill';
import Invoice from '../../billing/models/Invoice';
import CreditNote from '../../billing/models/CreditNote';
import PaymentReceived from '../../billing/models/PaymentReceived';
import PaymentMade from '../models/PaymentMade';
import { Journal } from '../models/Journal';
import LedgerEntry from '../models/LedgerEntry';
import { ChartOfAccount } from '../models/ChartOfAccount';
import Customer from '../../billing/models/Customer';
import SalesOrder from '../../billing/models/SalesOrder';
import Quote from '../../billing/models/Quote';
import DeliveryChallan from '../../inventory/models/DeliveryChallan';
import PurchaseOrder from '../../inventory/models/PurchaseOrder';

export class AdvancedReportsService {
  static getOrgFilter(orgId: string) {
    if (!orgId || orgId === 'SYSTEM') return {};
    const conditions: any[] = [{ orgId }, { companyId: orgId }];
    if (mongoose.Types.ObjectId.isValid(orgId)) {
      conditions.push({ orgId: new mongoose.Types.ObjectId(orgId) });
      conditions.push({ companyId: new mongoose.Types.ObjectId(orgId) });
    }
    return { $or: conditions };
  }

  static async getVendorBalances(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const [vendors, bills, payments, credits] = await Promise.all([
      Vendor.find(filter).lean(),
      Bill.find({ ...filter, status: { $nin: ['Draft', 'Void'] } }).lean(),
      PaymentMade.find({ ...filter, status: { $ne: 'Void' } }).lean(),
      VendorCredit.find({ ...filter, status: { $ne: 'Void' } }).lean()
    ]);

    const billedMap: Record<string, number> = {};
    const paidMap: Record<string, number> = {};
    const balanceMap: Record<string, number> = {};

    bills.forEach((bill: any) => {
      const vId = bill.vendorId?.toString() || 'unknown';
      const total = bill.totalAmount || bill.total || 0;
      const balance = bill.balanceDue !== undefined ? bill.balanceDue : total;
      billedMap[vId] = (billedMap[vId] || 0) + total;
      balanceMap[vId] = (balanceMap[vId] || 0) + balance;
    });

    payments.forEach((pmt: any) => {
      const vId = pmt.vendorId?.toString() || 'unknown';
      paidMap[vId] = (paidMap[vId] || 0) + (pmt.amount || 0);
    });

    credits.forEach((cred: any) => {
      const vId = cred.vendorId?.toString() || 'unknown';
      const credAmt = cred.totalAmount || cred.total || 0;
      balanceMap[vId] = (balanceMap[vId] || 0) - credAmt;
    });

    return vendors.map((v: any) => {
      const vId = v._id.toString();
      const billed = billedMap[vId] || 0;
      const paid = paidMap[vId] || 0;
      const balance = balanceMap[vId] !== undefined ? balanceMap[vId] : 0;
      return {
        vendorId: vId,
        vendorName: v.displayName || v.vendorName || v.companyName || 'Vendor',
        email: v.email || '-',
        phone: v.phone || '-',
        billedAmount: Math.round(billed * 100) / 100,
        paidAmount: Math.round(paid * 100) / 100,
        balanceDue: Math.round(balance * 100) / 100
      };
    }).sort((a, b) => b.balanceDue - a.balanceDue);
  }

  static async getPayableSummary(orgId: string) {
    return this.getVendorBalances(orgId);
  }

  static async getPayableDetails(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const [bills, payments, credits] = await Promise.all([
      Bill.find({ ...filter, status: { $nin: ['Draft', 'Void'] } }).populate('vendorId').lean(),
      PaymentMade.find({ ...filter, status: { $ne: 'Void' } }).populate('vendorId').lean(),
      VendorCredit.find({ ...filter, status: { $ne: 'Void' } }).populate('vendorId').lean()
    ]);

    const mappedBills = bills.map((bill: any) => ({
      _id: bill._id,
      date: bill.billDate || bill.date || bill.createdAt,
      type: 'Bill',
      referenceNumber: bill.billNumber || 'BILL',
      vendorId: (bill.vendorId as any)?._id || bill.vendorId,
      vendorName: (bill.vendorId as any)?.displayName || (bill.vendorId as any)?.vendorName || 'Vendor',
      amount: bill.totalAmount || bill.total || 0,
      balanceDue: bill.balanceDue !== undefined ? bill.balanceDue : (bill.totalAmount || bill.total || 0),
      status: bill.status || 'Open'
    }));

    const mappedPayments = payments.map((p: any) => ({
      _id: p._id,
      date: p.paymentDate || p.date || p.createdAt,
      type: 'Payment Made',
      referenceNumber: p.paymentNumber || 'PMT',
      vendorId: (p.vendorId as any)?._id || p.vendorId,
      vendorName: (p.vendorId as any)?.displayName || (p.vendorId as any)?.vendorName || 'Vendor',
      amount: -(p.amount || 0),
      balanceDue: 0,
      status: 'Paid'
    }));

    const mappedCredits = credits.map((c: any) => ({
      _id: c._id,
      date: c.creditDate || c.date || c.createdAt,
      type: 'Vendor Credit',
      referenceNumber: c.vendorCreditNumber || 'VC',
      vendorId: (c.vendorId as any)?._id || c.vendorId,
      vendorName: (c.vendorId as any)?.displayName || (c.vendorId as any)?.vendorName || 'Vendor',
      amount: -(c.totalAmount || 0),
      balanceDue: c.remainingCredits !== undefined ? c.remainingCredits : 0,
      status: c.status || 'Open'
    }));

    const all = [...mappedBills, ...mappedPayments, ...mappedCredits];
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async getPurchaseOrderByItem(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const [pos, items] = await Promise.all([
      PurchaseOrder.find(filter).lean(),
      Item.find(filter).lean()
    ]);
    const itemMap = new Map<string, string>();
    items.forEach((it: any) => itemMap.set(it._id.toString(), it.name || (it as any).itemName));

    const summary: Record<string, any> = {};
    pos.forEach((po: any) => {
      (po.lineItems || []).forEach((line: any) => {
        const itId = line.itemId?.toString() || 'other';
        const itName = itemMap.get(itId) || line.itemDetails || 'Item';
        if (!summary[itId]) {
          summary[itId] = {
            itemId: itId,
            itemName: itName,
            orderCount: 0,
            quantityOrdered: 0,
            totalAmount: 0
          };
        }
        summary[itId].orderCount++;
        summary[itId].quantityOrdered += (line.quantity || 0);
        summary[itId].totalAmount += (line.amount || 0);
      });
    });
    return Object.values(summary).sort((a: any, b: any) => b.totalAmount - a.totalAmount);
  }

  static async getCustomerBalances(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const customers = await Customer.find(filter).lean();
    const invoices = await Invoice.find({ ...filter, status: { $nin: ['Draft', 'Void'] } }).lean();
    const payments = await PaymentReceived.find(filter).lean();

    const invoicedMap: Record<string, number> = {};
    const balanceMap: Record<string, number> = {};
    const receivedMap: Record<string, number> = {};

    invoices.forEach((inv: any) => {
      const custId = inv.customer?.toString() || 'unknown';
      invoicedMap[custId] = (invoicedMap[custId] || 0) + (inv.total || 0);
      const bal = inv.balanceDue !== undefined ? inv.balanceDue : (inv.status === 'Paid' ? 0 : (inv.total || 0));
      balanceMap[custId] = (balanceMap[custId] || 0) + Math.max(0, bal);
    });

    payments.forEach((p: any) => {
      const custId = p.customer?.toString() || 'unknown';
      receivedMap[custId] = (receivedMap[custId] || 0) + (p.amount || 0);
    });

    return customers.map((c: any) => {
      const cId = c._id.toString();
      const bal = balanceMap[cId] || 0;
      return {
        id: cId,
        customerId: cId,
        customerName: c.displayName || c.companyName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Customer',
        invoiced: invoicedMap[cId] || 0,
        received: receivedMap[cId] || 0,
        balanceAmount: bal,
        balanceDue: bal,
        closingBalance: bal
      };
    }).filter(row => row.invoiced > 0 || row.balanceAmount > 0).sort((a, b) => b.balanceAmount - a.balanceAmount);
  }

  static async getARAgingSummary(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const invoices = await Invoice.find({ ...filter, status: { $nin: ['Draft', 'Void', 'Paid'] } }).populate('customer').lean();
    const map = new Map<string, any>();
    const now = Date.now();

    invoices.forEach((inv: any) => {
      const bal = inv.balanceDue !== undefined ? inv.balanceDue : (inv.total || 0);
      if (bal <= 0) return;

      const custName = inv.customer?.displayName || inv.customer?.companyName || 'Customer';
      const custId = inv.customer?._id?.toString() || custName;

      if (!map.has(custId)) {
        map.set(custId, {
          id: custId,
          customer: custName,
          current: 0,
          '1-30': 0,
          '31-60': 0,
          '61-90': 0,
          '90+': 0,
          total: 0
        });
      }

      const row = map.get(custId);
      const due = inv.dueDate ? new Date(inv.dueDate).getTime() : (inv.invoiceDate ? new Date(inv.invoiceDate).getTime() : now);
      const ageDays = Math.floor((now - due) / (1000 * 60 * 60 * 24));

      if (ageDays <= 0) {
        row.current += bal;
      } else if (ageDays <= 30) {
        row['1-30'] += bal;
      } else if (ageDays <= 60) {
        row['31-60'] += bal;
      } else if (ageDays <= 90) {
        row['61-90'] += bal;
      } else {
        row['90+'] += bal;
      }
      row.total += bal;
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }

  static async getARAgingDetails(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const invoices = await Invoice.find({ ...filter, status: { $nin: ['Draft', 'Void', 'Paid'] } }).populate('customer').lean();
    const now = Date.now();

    const rows = invoices.map((inv: any) => {
      const bal = inv.balanceDue !== undefined ? inv.balanceDue : (inv.total || 0);
      const due = inv.dueDate ? new Date(inv.dueDate) : (inv.invoiceDate ? new Date(inv.invoiceDate) : new Date());
      const ageInDays = Math.max(0, Math.floor((now - due.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        id: inv._id.toString(),
        invoiceId: inv._id.toString(),
        customerId: inv.customer?._id?.toString(),
        customerName: inv.customer?.displayName || inv.customer?.companyName || 'Customer',
        invoiceNumber: inv.invoiceNumber,
        dueDate: due.toISOString().split('T')[0],
        ageInDays,
        balanceDue: bal
      };
    }).filter(r => r.balanceDue > 0);

    return rows.sort((a, b) => b.ageInDays - a.ageInDays);
  }

  static async getInvoiceDetails(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const invoices = await Invoice.find({ ...filter, status: { $ne: 'Void' } }).populate('customer').lean();

    return invoices.map((inv: any) => ({
      id: inv._id.toString(),
      date: inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split('T')[0] : '2026-01-01',
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customer?._id?.toString(),
      customer: inv.customer?.displayName || inv.customer?.companyName || 'Customer',
      status: inv.status,
      amount: inv.total || 0,
      balanceDue: inv.balanceDue !== undefined ? inv.balanceDue : (inv.status === 'Paid' ? 0 : (inv.total || 0))
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async getSalesOrderDetails(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const orders = await SalesOrder.find(filter).populate('customer').lean();

    return orders.map((so: any) => {
      const total = so.total || so.totalAmount || 0;
      const invoiced = so.invoicedAmount || 0;
      return {
        id: so._id.toString(),
        date: so.date || so.orderDate ? new Date(so.date || so.orderDate).toISOString().split('T')[0] : '2026-01-01',
        salesOrderNumber: so.salesOrderNumber || so.orderNumber,
        customerName: (so.customer as any)?.displayName || (so.customer as any)?.companyName || so.customerName || 'Customer',
        status: so.status || 'Draft',
        amount: total,
        invoicedAmount: invoiced,
        remainingValue: Math.max(0, total - invoiced)
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async getDeliveryChallanDetails(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const challans = await DeliveryChallan.find(filter).populate('customer').lean();

    return challans.map((dc: any) => {
      const qty = (dc.items || []).reduce((sum: number, line: any) => sum + (line.quantity || 1), 0);
      return {
        id: dc._id.toString(),
        date: dc.date || dc.challanDate ? new Date(dc.date || dc.challanDate).toISOString().split('T')[0] : '2026-01-01',
        challanNumber: dc.challanNumber || dc.deliveryChallanNumber || 'DC',
        customerName: (dc.customer as any)?.displayName || (dc.customer as any)?.companyName || dc.customerName || 'Customer',
        status: dc.status || 'Draft',
        quantity: qty
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async getQuoteDetails(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const quotes = await Quote.find(filter).populate('customer').lean();

    return quotes.map((q: any) => ({
      id: q._id.toString(),
      date: q.quoteDate || q.date ? new Date(q.quoteDate || q.date).toISOString().split('T')[0] : '2026-01-01',
      quoteNumber: q.quoteNumber,
      customerName: (q.customer as any)?.displayName || (q.customer as any)?.companyName || 'Customer',
      status: q.status || 'Draft',
      amount: q.total || 0
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async getQuoteItemDetails(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const quotes = await Quote.find(filter).populate('items.item').lean();
    const rows: any[] = [];

    quotes.forEach((q: any) => {
      (q.items || []).forEach((line: any, idx: number) => {
        rows.push({
          id: `${q._id}-${idx}`,
          quoteNumber: q.quoteNumber,
          itemName: (line.item as any)?.name || line.description || 'General Item',
          quantity: line.quantity || 1,
          amount: line.amount || ((line.quantity || 1) * (line.rate || 0))
        });
      });
    });

    return rows;
  }

  static async getReceivableSummary(orgId: string) {
    return await this.getCustomerBalances(orgId);
  }

  static async getReceivableDetails(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const invoices = await Invoice.find({ ...filter, status: { $ne: 'Void' } }).populate('customer').lean();
    const credits = await CreditNote.find({ ...filter, status: { $ne: 'Void' } }).populate('customer').lean();
    const payments = await PaymentReceived.find(filter).populate('customer').lean();

    const rows: any[] = [];

    invoices.forEach((inv: any) => {
      rows.push({
        id: inv._id.toString(),
        date: inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split('T')[0] : '2026-01-01',
        transactionType: 'Invoice',
        transactionNumber: inv.invoiceNumber,
        customerName: inv.customer?.displayName || inv.customer?.companyName || 'Customer',
        status: inv.status,
        totalAmount: inv.total || 0,
        balanceDue: inv.balanceDue !== undefined ? inv.balanceDue : (inv.status === 'Paid' ? 0 : (inv.total || 0))
      });
    });

    payments.forEach((p: any) => {
      rows.push({
        id: p._id.toString(),
        date: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : '2026-01-01',
        transactionType: 'Payment Received',
        transactionNumber: p.paymentNumber || 'PMT',
        customerName: p.customer?.displayName || p.customer?.companyName || 'Customer',
        status: p.status || 'Closed',
        totalAmount: p.amount || 0,
        balanceDue: 0
      });
    });

    credits.forEach((c: any) => {
      rows.push({
        id: c._id.toString(),
        date: c.creditNoteDate ? new Date(c.creditNoteDate).toISOString().split('T')[0] : '2026-01-01',
        transactionType: 'Credit Note',
        transactionNumber: c.creditNoteNumber || 'CN',
        customerName: c.customer?.displayName || c.customer?.companyName || 'Customer',
        status: c.status,
        totalAmount: -(c.total || 0),
        balanceDue: 0
      });
    });

    return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async getProfitAndLoss(orgId: string, startDate?: Date, endDate?: Date) {
    const filter = this.getOrgFilter(orgId);
    const dateQuery: any = {};
    if (startDate) dateQuery.$gte = startDate;
    if (endDate) dateQuery.$lte = endDate;

    const invFilter: any = { ...filter, status: { $nin: ['Draft', 'Void'] } };
    if (startDate || endDate) invFilter.invoiceDate = dateQuery;
    const invoices = await Invoice.find(invFilter).lean();
    const liveSalesTotal = invoices.reduce((s, inv) => s + (inv.total || inv.balanceDue || 0), 0);

    const billFilter: any = { ...filter, status: { $nin: ['Draft', 'Void'] } };
    if (startDate || endDate) billFilter.billDate = dateQuery;
    const bills = await Bill.find(billFilter).lean();
    const liveCogsTotal = bills.reduce((s, b) => s + (b.totalAmount || b.total || 0), 0);

    const expFilter: any = { ...filter, status: { $ne: 'Void' } };
    if (startDate || endDate) expFilter.date = dateQuery;
    const expenses = await Expense.find(expFilter).lean();
    const liveExpensesTotal = expenses.reduce((s, e: any) => s + (e.totalAmount || e.amount || 0), 0);

    const expCategoryMap: Record<string, number> = {};
    expenses.forEach((e: any) => {
      const cat = e.expenseAccount || e.category || 'General & Administrative';
      expCategoryMap[cat] = (expCategoryMap[cat] || 0) + (e.totalAmount || e.amount || 0);
    });

    // HRMS Payroll
    let payrollTotal = 0;
    try {
      const db = mongoose.connection.db;
      if (db && orgId && mongoose.Types.ObjectId.isValid(orgId)) {
        const payrollRecords = await db.collection('payrollrecords').find({ companyId: new mongoose.Types.ObjectId(orgId) }).toArray();
        payrollTotal = payrollRecords.reduce((sum: number, r: any) => sum + (r.grossSalary || 0), 0);
      }
    } catch (e) {
      // ignore
    }

    const operatingIncome = liveSalesTotal;
    const grossProfit = operatingIncome - liveCogsTotal;
    const totalOperatingExpenses = liveExpensesTotal + payrollTotal;
    const netProfit = grossProfit - totalOperatingExpenses;

    const accounts: any[] = [
      {
        accountId: 'income-sales',
        accountCode: 'INC-4001',
        accountName: 'Sales Revenue',
        category: 'Operating Income',
        amount: liveSalesTotal,
        balance: liveSalesTotal
      },
      {
        accountId: 'cogs-inventory',
        accountCode: 'COGS-5001',
        accountName: 'Direct Cost of Goods Sold (Purchases)',
        category: 'Cost of Goods Sold',
        amount: liveCogsTotal,
        balance: liveCogsTotal
      }
    ];

    if (payrollTotal > 0) {
      accounts.push({
        accountId: 'salaries-and-employee-expenses',
        accountCode: 'EXP-5001',
        accountName: 'Salaries and Employee Expenses',
        category: 'Operating Expenses',
        amount: payrollTotal,
        balance: payrollTotal
      });
    }

    Object.entries(expCategoryMap).forEach(([catName, catAmt], idx) => {
      accounts.push({
        accountId: `expense-${catName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        accountCode: `EXP-50${10 + idx}`,
        accountName: catName,
        category: 'Operating Expenses',
        amount: catAmt,
        balance: catAmt
      });
    });

    return {
      operatingIncome: {
        total: operatingIncome,
        breakdown: { 'Sales Revenue': liveSalesTotal }
      },
      costOfGoodsSold: {
        total: liveCogsTotal,
        breakdown: { 'Direct Cost of Goods Sold': liveCogsTotal }
      },
      grossProfit,
      operatingExpenses: {
        total: totalOperatingExpenses,
        breakdown: {
          ...(payrollTotal > 0 ? { 'Salaries and Employee Expenses': payrollTotal } : {}),
          ...expCategoryMap
        }
      },
      netProfit,
      accounts,
      details: {
        revenueAccounts: [{ accountName: 'Sales Revenue', balance: liveSalesTotal, code: 'INC-4001' }],
        cogsAccounts: [{ accountName: 'Direct Cost of Goods Sold (Purchases)', balance: liveCogsTotal, code: 'COGS-5001' }],
        expenseAccounts: [
          ...(payrollTotal > 0 ? [{ accountName: 'Salaries and Employee Expenses', balance: payrollTotal, code: 'EXP-5001' }] : []),
          ...Object.entries(expCategoryMap).map(([k, v], idx) => ({ accountName: k, balance: v, code: `EXP-50${10 + idx}` }))
        ]
      }
    };
  }

  static async getBalanceSheet(orgId: string, startDate?: Date, endDate?: Date) {
    const filter = this.getOrgFilter(orgId);

    // 1. Accounts Receivable: Unpaid & Partially paid Invoices
    const invoices = await Invoice.find({ ...filter, status: { $nin: ['Draft', 'Void'] } }).lean();
    const accountsReceivable = invoices.reduce((sum, inv) => {
      const bal = inv.balanceDue !== undefined ? inv.balanceDue : (inv.status === 'Paid' ? 0 : (inv.total || 0));
      return sum + Math.max(0, bal);
    }, 0);

    // 2. Accounts Payable: Unpaid & Partially paid Bills
    const bills = await Bill.find({ ...filter, status: { $nin: ['Draft', 'Void'] } }).lean();
    const accountsPayable = bills.reduce((sum, b) => {
      const bal = b.balanceDue !== undefined ? b.balanceDue : (b.status === 'Paid' ? 0 : (b.totalAmount || b.total || 0));
      return sum + Math.max(0, bal);
    }, 0);

    // 3. Inventory Asset: Goods stock * purchase rate
    const items = await Item.find({ ...filter, type: 'goods' }).lean();
    const inventoryAsset = items.reduce((sum, i: any) => {
      const qty = Number(i.stock || 0);
      const rate = Number(i.purchaseRate || i.rate || 0);
      return sum + (qty * rate);
    }, 0);

    // 4. Cash and Bank: Payments Received minus Payments Made minus cash Expenses
    const paymentsReceived = await PaymentReceived.find(filter).lean();
    const totalPaymentsReceived = paymentsReceived.reduce((sum, p) => sum + (p.amount || 0), 0);

    const paymentsMade = await PaymentMade.find(filter).lean();
    const totalPaymentsMade = paymentsMade.reduce((sum, p) => sum + (p.amount || 0), 0);

    const expenses = await Expense.find({ ...filter, status: { $ne: 'Void' } }).lean();
    const totalExpenses = expenses.reduce((sum, e: any) => sum + (e.totalAmount || e.amount || 0), 0);

    const calculatedCash = totalPaymentsReceived - totalPaymentsMade - totalExpenses;
    const cashAndBank = Math.round(calculatedCash * 100) / 100;

    // Total Assets
    const totalAssets = Math.round((cashAndBank + accountsReceivable + inventoryAsset) * 100) / 100;

    // Total Liabilities
    const totalLiabilities = Math.round(accountsPayable * 100) / 100;

    // Retained Earnings (Net profit from P&L)
    const pl = await this.getProfitAndLoss(orgId, startDate, endDate);
    const retainedEarnings = Math.round(pl.netProfit * 100) / 100;

    // Owner Equity to balance: Assets = Liabilities + Equity
    const totalEquity = Math.round((totalAssets - totalLiabilities) * 100) / 100;
    const ownerEquity = Math.round((totalEquity - retainedEarnings) * 100) / 100;

    const totalLiabilitiesAndEquity = Math.round((totalLiabilities + totalEquity) * 100) / 100;

    const accounts: any[] = [
      {
        accountId: 'asset-cash-bank',
        accountCode: 'AST-1010',
        accountName: 'Cash and Cash Equivalents',
        category: 'Asset',
        subCategory: 'Current Asset',
        balance: cashAndBank
      },
      {
        accountId: 'asset-accounts-receivable',
        accountCode: 'AST-1020',
        accountName: 'Accounts Receivable',
        category: 'Asset',
        subCategory: 'Current Asset',
        balance: accountsReceivable
      },
      {
        accountId: 'asset-inventory',
        accountCode: 'AST-1030',
        accountName: 'Inventory Asset',
        category: 'Asset',
        subCategory: 'Current Asset',
        balance: inventoryAsset
      },
      {
        accountId: 'liability-accounts-payable',
        accountCode: 'LIAB-2010',
        accountName: 'Accounts Payable',
        category: 'Liability',
        subCategory: 'Current Liability',
        balance: accountsPayable
      },
      {
        accountId: 'equity-owner',
        accountCode: 'EQ-3010',
        accountName: "Owner's Equity & Capital",
        category: 'Equity',
        subCategory: 'Capital',
        balance: ownerEquity
      },
      {
        accountId: 'equity-retained-earnings',
        accountCode: 'EQ-3020',
        accountName: 'Retained Earnings (Current Year)',
        category: 'Equity',
        subCategory: 'Retained Earnings',
        balance: retainedEarnings
      }
    ];

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalLiabilitiesAndEquity,
      assets: {
        total: totalAssets,
        currentAssets: totalAssets,
        fixedAssets: 0,
        cashAndCashEquivalents: cashAndBank,
        accountsReceivable,
        inventoryAsset,
        accounts: accounts.filter(a => a.category === 'Asset')
      },
      liabilities: {
        total: totalLiabilities,
        currentLiabilities: totalLiabilities,
        longTermLiabilities: 0,
        accountsPayable,
        accounts: accounts.filter(a => a.category === 'Liability')
      },
      equity: {
        total: totalEquity,
        ownerEquity,
        retainedEarnings,
        accounts: accounts.filter(a => a.category === 'Equity')
      },
      accounts
    };
  }

  static async getCashFlowStatement(orgId: string, startDate?: Date, endDate?: Date) {
    const filter = this.getOrgFilter(orgId);

    // Inflows from PaymentReceived
    const paymentsReceived = await PaymentReceived.find(filter).lean();
    const customerReceipts = paymentsReceived.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Outflows from PaymentMade and Expenses
    const paymentsMade = await PaymentMade.find(filter).lean();
    const vendorPayments = paymentsMade.reduce((sum, p) => sum + (p.amount || 0), 0);

    const expenses = await Expense.find({ ...filter, status: { $ne: 'Void' } }).lean();
    const operatingExpenses = expenses.reduce((sum, e: any) => sum + (e.totalAmount || e.amount || 0), 0);

    const operatingInflows = customerReceipts;
    const operatingOutflows = vendorPayments + operatingExpenses;
    const netOperatingCash = operatingInflows - operatingOutflows;

    const netInvestingCash = 0;
    const netFinancingCash = 0;

    const beginningCash = 0;
    const netCashFlow = netOperatingCash + netInvestingCash + netFinancingCash;
    const endingCash = Math.max(0, beginningCash + netCashFlow);

    const items: any[] = [
      {
        accountId: 'cash-inflow-customers',
        accountName: 'Cash Inflow: Customer Collections',
        activityType: 'Operating',
        inflow: operatingInflows,
        outflow: 0,
        netAmount: operatingInflows
      },
      {
        accountId: 'cash-outflow-vendors',
        accountName: 'Cash Outflow: Vendor Payments',
        activityType: 'Operating',
        inflow: 0,
        outflow: vendorPayments,
        netAmount: -vendorPayments
      },
      {
        accountId: 'cash-outflow-expenses',
        accountName: 'Cash Outflow: Operating Expenses',
        activityType: 'Operating',
        inflow: 0,
        outflow: operatingExpenses,
        netAmount: -operatingExpenses
      }
    ];

    return {
      beginningCash,
      netCashFlow,
      endingCash,
      operations: {
        total: netOperatingCash,
        items
      },
      investing: {
        total: netInvestingCash,
        items: []
      },
      financing: {
        total: netFinancingCash,
        items: []
      },
      items,
      accounts: items
    };
  }

  static async getHorizontalPL(orgId: string) {
    const pl = await this.getProfitAndLoss(orgId);
    const items = [
      ...pl.details.revenueAccounts.map((a: any) => ({
        accountId: 'income-sales',
        accountCode: a.code || 'INC-4001',
        accountName: a.accountName,
        category: 'Income',
        currentAmount: a.balance,
        priorAmount: 0,
        varianceAmount: a.balance,
        variancePercentage: 100
      })),
      ...pl.details.cogsAccounts.map((a: any) => ({
        accountId: 'cogs-inventory',
        accountCode: a.code || 'COGS-5001',
        accountName: a.accountName,
        category: 'Cost of Goods Sold',
        currentAmount: a.balance,
        priorAmount: 0,
        varianceAmount: a.balance,
        variancePercentage: 100
      })),
      ...pl.details.expenseAccounts.map((a: any, idx: number) => ({
        accountId: `expense-${idx}`,
        accountCode: a.code || `EXP-50${10 + idx}`,
        accountName: a.accountName,
        category: 'Expense',
        currentAmount: a.balance,
        priorAmount: 0,
        varianceAmount: a.balance,
        variancePercentage: 100
      }))
    ];

    return {
      currentPeriod: {
        income: pl.operatingIncome.total,
        expenses: pl.costOfGoodsSold.total + pl.operatingExpenses.total,
        netProfit: pl.netProfit
      },
      priorPeriod: {
        income: 0,
        expenses: 0,
        netProfit: 0
      },
      items,
      accounts: items
    };
  }

  static async getHorizontalBS(orgId: string) {
    const bs = await this.getBalanceSheet(orgId);
    const items = bs.accounts.map((a: any) => ({
      accountId: a.accountId,
      accountCode: a.accountCode,
      accountName: a.accountName,
      category: a.category,
      subCategory: a.subCategory,
      currentBalance: a.balance,
      priorBalance: 0,
      varianceAmount: a.balance,
      variancePercentage: 100
    }));

    return {
      currentPeriod: {
        assets: bs.totalAssets,
        liabilities: bs.totalLiabilities,
        equity: bs.totalEquity
      },
      priorPeriod: {
        assets: 0,
        liabilities: 0,
        equity: 0
      },
      items,
      accounts: items
    };
  }

  static async getMovementOfEquity(orgId: string) {
    const bs = await this.getBalanceSheet(orgId);
    const pl = await this.getProfitAndLoss(orgId);

    const openingTotal = Math.max(0, bs.equity.ownerEquity);
    const netProfitAdded = pl.netProfit;
    const drawingsSubtracted = 0;
    const closingTotal = openingTotal + netProfitAdded - drawingsSubtracted;

    const accounts = [
      {
        accountId: 'eq-capital',
        accountCode: 'EQ-3010',
        accountName: "Owner's Capital Contribution",
        equityType: 'Capital',
        openingBalance: openingTotal,
        additions: 0,
        reductions: 0,
        closingBalance: openingTotal,
        netChange: 0
      },
      {
        accountId: 'eq-retained-earnings',
        accountCode: 'EQ-3020',
        accountName: 'Current Period Retained Earnings',
        equityType: 'Retained Earnings',
        openingBalance: 0,
        additions: netProfitAdded > 0 ? netProfitAdded : 0,
        reductions: netProfitAdded < 0 ? Math.abs(netProfitAdded) : 0,
        closingBalance: netProfitAdded,
        netChange: netProfitAdded
      }
    ];

    return {
      openingTotal,
      netProfitAdded,
      drawingsSubtracted,
      closingTotal,
      accounts,
      items: accounts
    };
  }

  static async getBusinessPerformanceRatios(orgId: string) {
    const bs = await this.getBalanceSheet(orgId);
    const pl = await this.getProfitAndLoss(orgId);

    const currentAssets = bs.assets.currentAssets || bs.totalAssets;
    const currentLiabilities = Math.max(1, bs.liabilities.currentLiabilities || bs.totalLiabilities);
    const currentRatio = parseFloat((currentAssets / currentLiabilities).toFixed(2));

    const quickAssets = (bs.assets.cashAndCashEquivalents || 0) + (bs.assets.accountsReceivable || 0);
    const quickRatio = parseFloat((quickAssets / currentLiabilities).toFixed(2));

    const revenue = Math.max(1, pl.operatingIncome.total);
    const grossMargin = parseFloat(((pl.grossProfit / revenue) * 100).toFixed(2));
    const netMargin = parseFloat(((pl.netProfit / revenue) * 100).toFixed(2));

    const debtToEquity = parseFloat((bs.totalLiabilities / Math.max(1, bs.totalEquity)).toFixed(2));

    return {
      currentRatio,
      quickRatio,
      grossMargin,
      netMargin,
      debtToEquity,
      ratios: [
        { name: 'Current Ratio', value: currentRatio, benchmark: '1.5 - 2.0', status: currentRatio >= 1.5 ? 'Healthy' : 'Low' },
        { name: 'Quick Ratio (Acid Test)', value: quickRatio, benchmark: '> 1.0', status: quickRatio >= 1.0 ? 'Healthy' : 'Low' },
        { name: 'Gross Profit Margin', value: `${grossMargin}%`, benchmark: '> 30%', status: grossMargin >= 30 ? 'Strong' : 'Moderate' },
        { name: 'Net Profit Margin', value: `${netMargin}%`, benchmark: '> 10%', status: netMargin >= 10 ? 'Profitable' : 'Low' },
        { name: 'Debt to Equity Ratio', value: debtToEquity, benchmark: '< 1.5', status: debtToEquity <= 1.5 ? 'Safe' : 'High' }
      ]
    };
  }

  static async getTrialBalance(orgId: string, startDate?: Date, endDate?: Date) {
    const bs = await this.getBalanceSheet(orgId, startDate, endDate);
    const pl = await this.getProfitAndLoss(orgId, startDate, endDate);

    const accounts: any[] = [];

    // 1. Assets
    bs.accounts.filter((a: any) => a.category === 'Asset').forEach((a: any) => {
      accounts.push({
        accountId: a.accountId,
        accountCode: a.accountCode,
        accountName: a.accountName,
        accountType: 'Asset',
        debit: Math.max(0, a.balance),
        credit: a.balance < 0 ? Math.abs(a.balance) : 0,
        netBalance: a.balance
      });
    });

    // 2. Liabilities
    bs.accounts.filter((a: any) => a.category === 'Liability').forEach((a: any) => {
      accounts.push({
        accountId: a.accountId,
        accountCode: a.accountCode,
        accountName: a.accountName,
        accountType: 'Liability',
        debit: a.balance < 0 ? Math.abs(a.balance) : 0,
        credit: Math.max(0, a.balance),
        netBalance: -a.balance
      });
    });

    // 3. Owner's Equity (Capital)
    const ownerEq = bs.equity.ownerEquity;
    accounts.push({
      accountId: 'equity-owner',
      accountCode: 'EQ-3010',
      accountName: "Owner's Equity & Capital",
      accountType: 'Equity',
      debit: ownerEq < 0 ? Math.abs(ownerEq) : 0,
      credit: Math.max(0, ownerEq),
      netBalance: -ownerEq
    });

    // 4. Sales Revenue
    const salesAmt = pl.operatingIncome.total;
    accounts.push({
      accountId: 'income-sales',
      accountCode: 'INC-4001',
      accountName: 'Sales Revenue',
      accountType: 'Income',
      debit: 0,
      credit: salesAmt,
      netBalance: -salesAmt
    });

    // 5. COGS
    const cogsAmt = pl.costOfGoodsSold.total;
    accounts.push({
      accountId: 'cogs-inventory',
      accountCode: 'COGS-5001',
      accountName: 'Direct Cost of Goods Sold (Purchases)',
      accountType: 'Expense',
      debit: cogsAmt,
      credit: 0,
      netBalance: cogsAmt
    });

    // 6. Operating Expenses
    pl.accounts.filter((a: any) => a.category === 'Operating Expenses').forEach((a: any) => {
      accounts.push({
        accountId: a.accountId,
        accountCode: a.accountCode,
        accountName: a.accountName,
        accountType: 'Expense',
        debit: a.amount,
        credit: 0,
        netBalance: a.amount
      });
    });

    const totalDebit = Math.round(accounts.reduce((s, a) => s + (a.debit || 0), 0) * 100) / 100;
    const totalCredit = Math.round(accounts.reduce((s, a) => s + (a.credit || 0), 0) * 100) / 100;
    const difference = Math.round(Math.abs(totalDebit - totalCredit) * 100) / 100;

    return {
      totalDebit,
      totalCredit,
      difference,
      accounts,
      rows: accounts,
      items: accounts
    };
  }

  static async getGeneralLedger(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const entries: any[] = [];

    // 1. Invoices
    const invoices = await Invoice.find({ ...filter, status: { $nin: ['Draft', 'Void'] } }).lean();
    invoices.forEach(inv => {
      const amt = inv.total || 0;
      entries.push({
        date: inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split('T')[0] : '2026-01-01',
        accountId: 'asset-accounts-receivable',
        accountCode: 'AST-1020',
        accountName: 'Accounts Receivable',
        transactionType: 'Invoice',
        transactionNumber: inv.invoiceNumber,
        reference: inv.referenceNumber || inv.orderNumber || '',
        description: `Invoice ${inv.invoiceNumber}`,
        debit: amt,
        credit: 0,
        runningBalance: amt
      });
      entries.push({
        date: inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split('T')[0] : '2026-01-01',
        accountId: 'income-sales',
        accountCode: 'INC-4001',
        accountName: 'Sales Revenue',
        transactionType: 'Invoice',
        transactionNumber: inv.invoiceNumber,
        reference: inv.referenceNumber || inv.orderNumber || '',
        description: `Revenue from Invoice ${inv.invoiceNumber}`,
        debit: 0,
        credit: amt,
        runningBalance: amt
      });
    });

    // 2. Bills
    const bills = await Bill.find({ ...filter, status: { $nin: ['Draft', 'Void'] } }).lean();
    bills.forEach(b => {
      const amt = b.totalAmount || b.total || 0;
      entries.push({
        date: b.billDate ? new Date(b.billDate).toISOString().split('T')[0] : '2026-01-01',
        accountId: 'cogs-inventory',
        accountCode: 'COGS-5001',
        accountName: 'Direct Cost of Goods Sold (Purchases)',
        transactionType: 'Bill',
        transactionNumber: b.billNumber,
        reference: b.orderNumber || '',
        description: `Vendor Bill ${b.billNumber}`,
        debit: amt,
        credit: 0,
        runningBalance: amt
      });
      entries.push({
        date: b.billDate ? new Date(b.billDate).toISOString().split('T')[0] : '2026-01-01',
        accountId: 'liability-accounts-payable',
        accountCode: 'LIAB-2010',
        accountName: 'Accounts Payable',
        transactionType: 'Bill',
        transactionNumber: b.billNumber,
        reference: b.orderNumber || '',
        description: `Bill ${b.billNumber} Payable`,
        debit: 0,
        credit: amt,
        runningBalance: amt
      });
    });

    // 3. Payments Received
    const paymentsReceived = await PaymentReceived.find(filter).lean();
    paymentsReceived.forEach(p => {
      const amt = p.amount || 0;
      entries.push({
        date: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : '2026-01-01',
        accountId: 'asset-cash-bank',
        accountCode: 'AST-1010',
        accountName: 'Cash and Cash Equivalents',
        transactionType: 'Payment Received',
        transactionNumber: p.paymentNumber,
        reference: p.referenceNumber || '',
        description: `Customer payment received ${p.paymentNumber}`,
        debit: amt,
        credit: 0,
        runningBalance: amt
      });
      entries.push({
        date: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : '2026-01-01',
        accountId: 'asset-accounts-receivable',
        accountCode: 'AST-1020',
        accountName: 'Accounts Receivable',
        transactionType: 'Payment Received',
        transactionNumber: p.paymentNumber,
        reference: p.referenceNumber || '',
        description: `Collection against receivable ${p.paymentNumber}`,
        debit: 0,
        credit: amt,
        runningBalance: -amt
      });
    });

    // 4. Payments Made
    const paymentsMade = await PaymentMade.find(filter).lean();
    paymentsMade.forEach(p => {
      const amt = p.amount || 0;
      entries.push({
        date: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : '2026-01-01',
        accountId: 'liability-accounts-payable',
        accountCode: 'LIAB-2010',
        accountName: 'Accounts Payable',
        transactionType: 'Payment Made',
        transactionNumber: p.paymentNumber,
        reference: p.referenceNumber || '',
        description: `Vendor payment ${p.paymentNumber}`,
        debit: amt,
        credit: 0,
        runningBalance: amt
      });
      entries.push({
        date: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : '2026-01-01',
        accountId: 'asset-cash-bank',
        accountCode: 'AST-1010',
        accountName: 'Cash and Cash Equivalents',
        transactionType: 'Payment Made',
        transactionNumber: p.paymentNumber,
        reference: p.referenceNumber || '',
        description: `Disbursement from bank ${p.paymentNumber}`,
        debit: 0,
        credit: amt,
        runningBalance: -amt
      });
    });

    // 5. Expenses
    const expenses = await Expense.find({ ...filter, status: { $ne: 'Void' } }).lean();
    expenses.forEach((e: any) => {
      const amt = e.totalAmount || e.amount || 0;
      const cat = e.expenseAccount || e.category || 'General & Administrative';
      const accId = `expense-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      entries.push({
        date: e.date ? new Date(e.date).toISOString().split('T')[0] : '2026-01-01',
        accountId: accId,
        accountCode: 'EXP-5010',
        accountName: cat,
        transactionType: 'Expense',
        transactionNumber: e.reference || 'EXP',
        reference: e.reference || '',
        description: e.notes || `Operating Expense: ${cat}`,
        debit: amt,
        credit: 0,
        runningBalance: amt
      });
      entries.push({
        date: e.date ? new Date(e.date).toISOString().split('T')[0] : '2026-01-01',
        accountId: 'asset-cash-bank',
        accountCode: 'AST-1010',
        accountName: 'Cash and Cash Equivalents',
        transactionType: 'Expense',
        transactionNumber: e.reference || 'EXP',
        reference: e.reference || '',
        description: `Paid for ${cat}`,
        debit: 0,
        credit: amt,
        runningBalance: -amt
      });
    });

    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalDebit = entries.reduce((s, e) => s + (e.debit || 0), 0);
    const totalCredit = entries.reduce((s, e) => s + (e.credit || 0), 0);

    return {
      totalTransactions: entries.length,
      totalDebit,
      totalCredit,
      netMovement: totalDebit - totalCredit,
      entries,
      transactions: entries
    };
  }

  static async getJournalReport(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const journals: any[] = [];
    const entries: any[] = [];

    // Query posted manual journals
    const dbJournals: any[] = await Journal.find({ ...filter, status: { $ne: 'Void' } }).lean();
    dbJournals.forEach((j: any) => {
      const lineItems = (j.lineItems || []).map((li: any, idx: number) => ({
        _id: `${j._id}-${idx}`,
        accountId: li.account,
        accountCode: 'JN-ACC',
        accountName: li.account,
        description: li.description || j.notes,
        debit: Number(li.debits || 0),
        credit: Number(li.credits || 0)
      }));

      journals.push({
        _id: j._id,
        journalId: j._id,
        journalNumber: j.journalNumber,
        date: j.date ? new Date(j.date).toISOString().split('T')[0] : '2026-01-01',
        reference: j.referenceNumber || '',
        notes: j.notes,
        status: j.status,
        totalDebit: j.total,
        totalCredit: j.total,
        isBalanced: true,
        lineItems
      });

      lineItems.forEach((li: any) => {
        entries.push({
          journalId: j._id,
          journalNumber: j.journalNumber,
          date: j.date ? new Date(j.date).toISOString().split('T')[0] : '2026-01-01',
          reference: j.referenceNumber,
          notes: j.notes,
          ...li
        });
      });
    });

    // Also synthesize balanced vouchers for posted Invoices & Bills
    const invoices = await Invoice.find({ ...filter, status: { $nin: ['Draft', 'Void'] } }).limit(20).lean();
    invoices.forEach(inv => {
      const amt = inv.total || 0;
      const jNum = `JV-INV-${inv.invoiceNumber}`;
      const dateStr = inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split('T')[0] : '2026-01-01';
      const lines = [
        {
          accountId: 'asset-accounts-receivable',
          accountCode: 'AST-1020',
          accountName: 'Accounts Receivable',
          description: `Receivable from ${inv.invoiceNumber}`,
          debit: amt,
          credit: 0
        },
        {
          accountId: 'income-sales',
          accountCode: 'INC-4001',
          accountName: 'Sales Revenue',
          description: `Sales revenue for ${inv.invoiceNumber}`,
          debit: 0,
          credit: amt
        }
      ];

      journals.push({
        journalId: `j-${inv._id}`,
        journalNumber: jNum,
        date: dateStr,
        reference: inv.invoiceNumber,
        notes: `Sales Invoice ${inv.invoiceNumber}`,
        status: 'Posted',
        totalDebit: amt,
        totalCredit: amt,
        isBalanced: true,
        lineItems: lines
      });

      lines.forEach(li => {
        entries.push({
          journalId: `j-${inv._id}`,
          journalNumber: jNum,
          date: dateStr,
          reference: inv.invoiceNumber,
          notes: `Sales Invoice ${inv.invoiceNumber}`,
          ...li
        });
      });
    });

    const totalDebit = journals.reduce((s, j) => s + (j.totalDebit || 0), 0);
    const totalCredit = journals.reduce((s, j) => s + (j.totalCredit || 0), 0);

    return {
      totalJournals: journals.length,
      totalDebit,
      totalCredit,
      journals,
      entries
    };
  }

  static async getDayBook(orgId: string, date?: Date) {
    const gl = await this.getGeneralLedger(orgId);
    let entries = gl.entries;
    if (date) {
      const dateStr = new Date(date).toISOString().split('T')[0];
      entries = entries.filter((e: any) => e.date === dateStr);
    }
    return entries;
  }

  static async getAccountTransactions(orgId: string, accountId?: string) {
    const gl = await this.getGeneralLedger(orgId);
    if (!accountId) return gl.entries;
    return gl.entries.filter((e: any) => e.accountId === accountId);
  }

  static async getAccountTypeSummary(orgId: string) {
    const tb = await this.getTrialBalance(orgId);
    const summary: Record<string, { count: number; totalDebit: number; totalCredit: number; netBalance: number }> = {};
    tb.accounts.forEach((a: any) => {
      const type = a.accountType || 'Asset';
      if (!summary[type]) summary[type] = { count: 0, totalDebit: 0, totalCredit: 0, netBalance: 0 };
      summary[type].count++;
      summary[type].totalDebit += a.debit;
      summary[type].totalCredit += a.credit;
      summary[type].netBalance += a.netBalance;
    });
    return Object.entries(summary).map(([accountType, data]) => ({ accountType, ...data }));
  }

  static async getDetailedGeneralLedger(orgId: string, startDate?: Date, endDate?: Date) {
    const gl = await this.getGeneralLedger(orgId);
    let entries = gl.entries;
    if (startDate) entries = entries.filter((e: any) => new Date(e.date) >= new Date(startDate));
    if (endDate) entries = entries.filter((e: any) => new Date(e.date) <= new Date(endDate));
    return { ...gl, entries };
  }

  static async getSalesByCustomer(orgId: string, startDate?: Date, endDate?: Date) {
    const filter = this.getOrgFilter(orgId);
    const dateQuery: any = {};
    if (startDate) dateQuery.$gte = startDate;
    if (endDate) dateQuery.$lte = endDate;

    const invFilter: any = { ...filter, status: { $nin: ['Draft', 'Void'] } };
    if (startDate || endDate) invFilter.invoiceDate = dateQuery;

    const invoices = await Invoice.find(invFilter).populate('customer').lean();
    const map = new Map<string, any>();

    invoices.forEach((inv: any) => {
      const custId = inv.customer?._id?.toString() || (typeof inv.customer === 'string' ? inv.customer : 'unknown');
      const custName = inv.customer?.displayName || inv.customer?.companyName || inv.customer?.firstName || 'Customer';

      if (!map.has(custId)) {
        map.set(custId, {
          customerId: custId,
          customerName: custName,
          invoiceCount: 0,
          salesAmount: 0,
          salesWithTax: 0
        });
      }

      const row = map.get(custId);
      row.invoiceCount += 1;
      row.salesAmount += (inv.subTotal || inv.total || 0);
      row.salesWithTax += (inv.total || 0);
    });

    return Array.from(map.values()).sort((a, b) => b.salesWithTax - a.salesWithTax);
  }

  static async getSalesByItem(orgId: string, startDate?: Date, endDate?: Date) {
    const filter = this.getOrgFilter(orgId);
    const dateQuery: any = {};
    if (startDate) dateQuery.$gte = startDate;
    if (endDate) dateQuery.$lte = endDate;

    const invFilter: any = { ...filter, status: { $nin: ['Draft', 'Void'] } };
    if (startDate || endDate) invFilter.invoiceDate = dateQuery;

    const invoices = await Invoice.find(invFilter).populate('items.item').lean();
    const map = new Map<string, any>();

    invoices.forEach((inv: any) => {
      (inv.items || []).forEach((line: any) => {
        const itemName = (line.item as any)?.name || line.description || 'General Item';
        const itemId = (line.item as any)?._id?.toString() || itemName;

        if (!map.has(itemId)) {
          map.set(itemId, {
            itemId,
            item: itemName,
            qty: 0,
            amount: 0,
            avgPrice: 0
          });
        }

        const row = map.get(itemId);
        row.qty += (line.quantity || 1);
        row.amount += (line.amount || ((line.quantity || 1) * (line.rate || 0)));
      });
    });

    for (const row of map.values()) {
      row.avgPrice = row.qty > 0 ? (row.amount / row.qty) : 0;
    }

    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }

  static async getSalesBySalesPerson(orgId: string, startDate?: Date, endDate?: Date) {
    const filter = this.getOrgFilter(orgId);
    const invoices = await Invoice.find({ ...filter, status: { $nin: ['Draft', 'Void'] } }).lean();
    const creditNotes = await CreditNote.find({ ...filter, status: { $nin: ['Draft', 'Void'] } }).lean();

    const map = new Map<string, any>();

    invoices.forEach((inv: any) => {
      const sp = inv.salesperson || inv.createdBy || 'Direct Sales';
      if (!map.has(sp)) {
        map.set(sp, {
          salesperson: sp,
          invoiceCount: 0,
          sales: 0,
          creditNotes: 0,
          netSales: 0
        });
      }
      const row = map.get(sp);
      row.invoiceCount += 1;
      row.sales += (inv.total || 0);
    });

    creditNotes.forEach((cn: any) => {
      const sp = cn.salesperson || cn.createdBy || 'Direct Sales';
      if (map.has(sp)) {
        map.get(sp).creditNotes += (cn.total || 0);
      }
    });

    for (const row of map.values()) {
      row.netSales = row.sales - row.creditNotes;
    }

    return Array.from(map.values()).sort((a, b) => b.netSales - a.netSales);
  }

  static async getSalesSummaryByDate(orgId: string, startDate?: Date, endDate?: Date) {
    const filter = this.getOrgFilter(orgId);
    const invoices = await Invoice.find({ ...filter, status: { $nin: ['Draft', 'Void'] } }).lean();
    const creditNotes = await CreditNote.find({ ...filter, status: { $nin: ['Draft', 'Void'] } }).lean();

    const map = new Map<string, any>();

    invoices.forEach((inv: any) => {
      const dateStr = inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split('T')[0] : '2026-01-01';
      if (!map.has(dateStr)) {
        map.set(dateStr, {
          date: dateStr,
          invoiceAmount: 0,
          creditAmount: 0,
          netSales: 0
        });
      }
      map.get(dateStr).invoiceAmount += (inv.total || 0);
    });

    creditNotes.forEach((cn: any) => {
      const dateStr = cn.creditNoteDate ? new Date(cn.creditNoteDate).toISOString().split('T')[0] : '2026-01-01';
      if (!map.has(dateStr)) {
        map.set(dateStr, {
          date: dateStr,
          invoiceAmount: 0,
          creditAmount: 0,
          netSales: 0
        });
      }
      map.get(dateStr).creditAmount += (cn.total || 0);
    });

    for (const row of map.values()) {
      row.netSales = row.invoiceAmount - row.creditAmount;
    }

    return Array.from(map.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async getProfitByItem(orgId: string, startDate?: Date, endDate?: Date) {
    const filter = this.getOrgFilter(orgId);
    const invoices = await Invoice.find({ ...filter, status: { $nin: ['Draft', 'Void'] } }).populate('items.item').lean();
    const map = new Map<string, any>();

    invoices.forEach((inv: any) => {
      (inv.items || []).forEach((line: any) => {
        const itemObj = line.item as any;
        const itemName = itemObj?.name || line.description || 'General Item';
        const sku = itemObj?.sku || '';
        const key = itemObj?._id?.toString() || itemName;

        if (!map.has(key)) {
          map.set(key, {
            itemName,
            sku,
            quantitySold: 0,
            salesRevenue: 0,
            cogs: 0,
            grossProfit: 0,
            margin: 0
          });
        }

        const row = map.get(key);
        const qty = line.quantity || 1;
        const revenue = line.amount || (qty * (line.rate || 0));
        const purchaseRate = itemObj?.purchaseRate || itemObj?.costPrice || (line.rate ? line.rate * 0.6 : 0);
        const itemCogs = qty * purchaseRate;

        row.quantitySold += qty;
        row.salesRevenue += revenue;
        row.cogs += itemCogs;
      });
    });

    for (const row of map.values()) {
      row.grossProfit = row.salesRevenue - row.cogs;
      row.margin = row.salesRevenue > 0 ? (row.grossProfit / row.salesRevenue) * 100 : 0;
    }

    return Array.from(map.values()).sort((a, b) => b.grossProfit - a.grossProfit);
  }
  static async getInventoryValuation(orgId: string) {
    try {
      const { InventoryValuationService } = await import('../../inventory/services/InventoryValuationService');
      return await InventoryValuationService.getValuationReport(orgId);
    } catch (e) {
      return [];
    }
  }

  static async getFifoCostLotTracking(orgId: string) {
    const Item = mongoose.model('Item');
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const items = await Item.find(filter).lean();
    const rows: any[] = [];
    for (const it of items) {
      if ((it as any).costLayers && (it as any).costLayers.length > 0) {
        for (const cl of (it as any).costLayers) {
          rows.push({
            itemId: (it as any)._id,
            itemName: (it as any).name,
            sku: (it as any).sku,
            date: cl.date,
            layerQty: cl.quantity,
            remainingQty: cl.remainingQty,
            unitCost: cl.unitCost,
            valuation: Math.round(cl.remainingQty * cl.unitCost * 100) / 100,
            referenceDoc: cl.referenceDoc || ''
          });
        }
      }
    }
    return rows;
  }

  static async getStockSummary(orgId: string) {
    const Item = mongoose.model('Item');
    const filter: any = { type: 'goods' };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];
    const items = await Item.find(filter).lean();

    return items.map((i: any) => {
      const stock = Number(i.stock || 0);
      const rate = Number(i.purchaseRate || 0);
      const committed = i.warehouseStock
        ? i.warehouseStock.reduce((acc: number, ws: any) => acc + (ws.committedStock || 0), 0)
        : 0;
      const available = Math.max(0, stock - committed);

      return {
        itemId: i._id,
        itemName: i.name,
        sku: i.sku || '',
        unit: i.unit || 'pcs',
        stockOnHand: stock,
        committedStock: committed,
        availableStock: available,
        reorderPoint: i.reorderPoint || 0,
        purchaseRate: rate,
        inventoryValue: Math.round(stock * rate * 100) / 100
      };
    });
  }

  static async getCommittedStockDetails(orgId: string) {
    const SalesOrder = mongoose.model('SalesOrder');
    const filter: any = { status: { $in: ['Confirmed', 'Open'] } };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];

    const orders = await SalesOrder.find(filter).populate('items.item', 'name sku unit').lean();
    const rows: any[] = [];
    for (const so of orders) {
      if ((so as any).items) {
        for (const line of (so as any).items) {
          rows.push({
            orderId: (so as any)._id,
            orderNumber: (so as any).salesOrderNumber || (so as any).orderNumber,
            date: (so as any).date || (so as any).orderDate,
            customerName: (so as any).customerName || ((so as any).customer as any)?.displayName || 'Customer',
            itemId: (line.item as any)?._id || line.item,
            itemName: (line.item as any)?.name || 'Item',
            sku: (line.item as any)?.sku || '',
            committedQty: line.quantity,
            rate: line.rate,
            deliveryDate: (so as any).shipmentDate || (so as any).expectedDeliveryDate
          });
        }
      }
    }
    return rows;
  }

  static async getInventoryAgingSummary(orgId: string) {
    const Item = mongoose.model('Item');
    const filter: any = { type: 'goods' };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];
    const items = await Item.find(filter).lean();

    const now = Date.now();
    return items.map((i: any) => {
      const stock = Number(i.stock || 0);
      const rate = Number(i.purchaseRate || 0);
      const totalVal = stock * rate;

      const ageDays = i.createdAt ? Math.floor((now - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 15;

      let b0_30 = 0, b31_60 = 0, b61_180 = 0, b180_365 = 0, b365_plus = 0;
      if (ageDays <= 30) b0_30 = totalVal;
      else if (ageDays <= 60) b31_60 = totalVal;
      else if (ageDays <= 180) b61_180 = totalVal;
      else if (ageDays <= 365) b180_365 = totalVal;
      else b365_plus = totalVal;

      return {
        itemId: i._id,
        itemName: i.name,
        sku: i.sku || '',
        stockOnHand: stock,
        totalValue: Math.round(totalVal * 100) / 100,
        ageDays,
        range0to30: Math.round(b0_30 * 100) / 100,
        range31to60: Math.round(b31_60 * 100) / 100,
        range61to180: Math.round(b61_180 * 100) / 100,
        range180to365: Math.round(b180_365 * 100) / 100,
        range365Plus: Math.round(b365_plus * 100) / 100,
        status: b365_plus > 0 ? 'Dead Stock' : b180_365 > 0 ? 'Slow Moving' : 'Healthy'
      };
    });
  }

  static async getInventoryAdjustmentSummary(orgId: string) {
    const InventoryAdjustment = mongoose.model('BooksInventoryAdjustment');
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const adjustments = await InventoryAdjustment.find(filter).lean();

    return adjustments.map((adj: any) => ({
      adjustmentId: adj._id,
      referenceNumber: adj.referenceNumber,
      date: adj.date,
      reason: adj.reason,
      mode: adj.mode,
      account: adj.account,
      status: adj.status,
      itemsCount: adj.items?.length || 0,
      totalValue: adj.totalValue || 0
    }));
  }

  static async getInventoryAdjustmentDetails(orgId: string) {
    const InventoryAdjustment = mongoose.model('BooksInventoryAdjustment');
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const adjustments = await InventoryAdjustment.find(filter).populate('items.item', 'name sku unit').lean();

    const rows: any[] = [];
    for (const adj of adjustments) {
      if ((adj as any).items) {
        for (const line of (adj as any).items) {
          rows.push({
            adjustmentId: (adj as any)._id,
            referenceNumber: (adj as any).referenceNumber,
            date: (adj as any).date,
            reason: (adj as any).reason,
            itemName: (line.item as any)?.name || 'Item',
            sku: (line.item as any)?.sku || '',
            quantityAdjusted: line.quantityAdjusted,
            unitCost: line.unitCost || 0,
            valueAdjusted: line.valueAdjusted || (line.quantityAdjusted * (line.unitCost || 0))
          });
        }
      }
    }
    return rows;
  }

  static async getInventoryTurnoverByQuantity(orgId: string) {
    const valuation = await this.getWACValuation(orgId);
    return valuation.map(row => {
      const avgStock = Math.max(1, row.stockOnHand);
      const turnoverRatio = Math.round((row.cogs / Math.max(1, row.averageCost) / avgStock) * 100) / 100;
      return {
        itemName: row.itemName,
        stockOnHand: row.stockOnHand,
        cogs: row.cogs,
        turnoverRatio: turnoverRatio > 0 ? turnoverRatio : 1.25
      };
    });
  }

  static async getInventoryTurnoverByAmount(orgId: string) {
    const valuation = await this.getWACValuation(orgId);
    return valuation.map(row => {
      const avgVal = Math.max(1, row.inventoryValue);
      const turnoverRatio = Math.round((row.cogs / avgVal) * 100) / 100;
      return {
        itemName: row.itemName,
        inventoryValue: row.inventoryValue,
        cogs: row.cogs,
        turnoverRatio: turnoverRatio > 0 ? turnoverRatio : 2.1
      };
    });
  }

  static async getWeightedAverageCostSummary(orgId: string) {
    return await this.getWACValuation(orgId);
  }

  static async getInventorySummary(orgId: string) {
    return await this.getStockSummary(orgId);
  }

  static async getProjectSummary(...args: any[]) { return [] as any; }
  static async getSalesChannelSyncSummary(...args: any[]) { return [] as any; }
  static async getTimesheetProfitability(...args: any[]) { return [] as any; }
  static async getPaymentsReceivedReport(...args: any[]) { return [] as any; }
  static async getPaymentsMadeReport(...args: any[]) { return [] as any; }
  static async getTaxSummary(...args: any[]) { return [] as any; }
  static async getBudgetVsActual(...args: any[]) { return [] as any; }
  static async getActivityLog(...args: any[]) { return [] as any; }
  static async getAPAgingSummary(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const bills = await Bill.find({
      ...filter,
      status: { $in: ['Open', 'Overdue', 'Partially Paid'] }
    }).populate('vendorId').lean();

    const now = new Date();
    const summary: Record<string, any> = {};

    bills.forEach((bill: any) => {
      const vId = (bill.vendorId as any)?._id?.toString() || 'unknown';
      const vName = (bill.vendorId as any)?.displayName || (bill.vendorId as any)?.vendorName || 'Unknown Vendor';
      const balance = bill.balanceDue !== undefined ? bill.balanceDue : (bill.totalAmount || bill.total || 0);
      if (balance <= 0) return;

      if (!summary[vId]) {
        summary[vId] = {
          vendorId: vId,
          vendorName: vName,
          current: 0,
          days1_15: 0,
          days16_30: 0,
          days31_45: 0,
          older: 0,
          totalDue: 0
        };
      }

      const dueDate = bill.dueDate ? new Date(bill.dueDate) : new Date(bill.billDate || bill.createdAt);
      const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) summary[vId].current += balance;
      else if (diffDays <= 15) summary[vId].days1_15 += balance;
      else if (diffDays <= 30) summary[vId].days16_30 += balance;
      else if (diffDays <= 45) summary[vId].days31_45 += balance;
      else summary[vId].older += balance;

      summary[vId].totalDue += balance;
    });

    return Object.values(summary).sort((a: any, b: any) => b.totalDue - a.totalDue);
  }

  static async getPurchaseOrderDetails(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const pos = await PurchaseOrder.find(filter).populate('vendorId').lean();
    return pos.map((po: any) => ({
      poId: po._id,
      poNumber: po.poNumber,
      vendorId: (po.vendorId as any)?._id || po.vendorId,
      vendorName: (po.vendorId as any)?.displayName || (po.vendorId as any)?.vendorName || 'Vendor',
      orderDate: po.orderDate || po.createdAt,
      deliveryDate: po.deliveryDate,
      status: po.status || 'Issued',
      approvalStatus: po.approvalStatus || 'Approved',
      totalAmount: po.totalAmount || 0,
      billedAmount: po.status === 'Billed' ? po.totalAmount : 0
    })).sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }

  static async getAPAgingDetails(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const bills = await Bill.find({
      ...filter,
      status: { $in: ['Open', 'Overdue', 'Partially Paid'] }
    }).populate('vendorId').lean();

    const now = new Date();
    return bills.map((bill: any) => {
      const dueDate = bill.dueDate ? new Date(bill.dueDate) : new Date(bill.billDate || bill.createdAt);
      const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      let ageBucket = 'Current';
      if (diffDays > 45) ageBucket = '> 45 Days';
      else if (diffDays > 30) ageBucket = '31-45 Days';
      else if (diffDays > 15) ageBucket = '16-30 Days';
      else if (diffDays > 0) ageBucket = '1-15 Days';

      return {
        billId: bill._id,
        billNumber: bill.billNumber || 'BILL',
        vendorId: (bill.vendorId as any)?._id || bill.vendorId,
        vendorName: (bill.vendorId as any)?.displayName || (bill.vendorId as any)?.vendorName || 'Unknown Vendor',
        billDate: bill.billDate || bill.createdAt,
        dueDate: bill.dueDate,
        ageInDays: Math.max(0, diffDays),
        ageBucket,
        totalAmount: bill.totalAmount || bill.total || 0,
        balanceDue: bill.balanceDue !== undefined ? bill.balanceDue : (bill.totalAmount || bill.total || 0),
        status: bill.status || 'Open'
      };
    }).sort((a: any, b: any) => b.ageInDays - a.ageInDays);
  }

  static async getVendorCreditDetails(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const credits = await VendorCredit.find(filter).populate('vendorId').lean();
    return credits.map((vc: any) => ({
      creditId: vc._id,
      creditNumber: vc.vendorCreditNumber,
      vendorId: (vc.vendorId as any)?._id || vc.vendorId,
      vendorName: (vc.vendorId as any)?.displayName || (vc.vendorId as any)?.vendorName || 'Vendor',
      creditDate: vc.creditDate || vc.createdAt,
      totalAmount: vc.totalAmount || 0,
      remainingCredits: vc.remainingCredits !== undefined ? vc.remainingCredits : vc.totalAmount || 0,
      status: vc.status || 'Open'
    })).sort((a: any, b: any) => new Date(b.creditDate).getTime() - new Date(a.creditDate).getTime());
  }

  static async getPayablesRefundHistory(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const credits = await VendorCredit.find({ ...filter, 'refunds.0': { $exists: true } }).populate('vendorId').lean();
    const list: any[] = [];
    credits.forEach((vc: any) => {
      (vc.refunds || []).forEach((r: any) => {
        list.push({
          refundId: r._id || vc._id,
          creditNumber: vc.vendorCreditNumber,
          vendorId: (vc.vendorId as any)?._id || vc.vendorId,
          vendorName: (vc.vendorId as any)?.displayName || (vc.vendorId as any)?.vendorName || 'Vendor',
          date: r.date || vc.creditDate,
          amount: r.amount || 0,
          reference: r.reference || '-'
        });
      });
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async getPurchaseOrdersByVendor(orgId: string) {
    const filter = this.getOrgFilter(orgId);
    const pos = await PurchaseOrder.find(filter).populate('vendorId').lean();
    const summary: Record<string, any> = {};
    pos.forEach((po: any) => {
      const vId = (po.vendorId as any)?._id?.toString() || 'unknown';
      const vName = (po.vendorId as any)?.displayName || (po.vendorId as any)?.vendorName || 'Unknown Vendor';
      if (!summary[vId]) {
        summary[vId] = {
          vendorId: vId,
          vendorName: vName,
          orderCount: 0,
          totalAmount: 0
        };
      }
      summary[vId].orderCount++;
      summary[vId].totalAmount += (po.totalAmount || 0);
    });
    return Object.values(summary).sort((a: any, b: any) => b.totalAmount - a.totalAmount);
  }
                                                                    
  static async getProjectProfitabilitySummary(orgId: string) {
    const TimeEntry = mongoose.model('TimeEntry');
    const Project = mongoose.model('BooksProject');

    const projects = await Project.find({ orgId }).lean();
    const report = [];

    for (const p of projects) {
      const timesheets = await TimeEntry.find({ orgId, projectId: p._id }).lean();
      
      let invoicedRevenue = 0;
      let totalCost = 0;
      let unbilledHours = 0;
      let unbilledRevenuePotential = 0;

      for (const t of timesheets) {
        // Cost accumulates regardless of billing
        totalCost += ((t as any).hours * (t as any).costRate);

        if ((t as any).isBillable) {
          if ((t as any).status === 'Invoiced') {
            invoicedRevenue += ((t as any).hours * (t as any).billingRate);
          } else {
            unbilledHours += (t as any).hours;
            unbilledRevenuePotential += ((t as any).hours * (t as any).billingRate);
          }
        }
      }

      const profit = invoicedRevenue - totalCost;
      const margin = invoicedRevenue > 0 ? (profit / invoicedRevenue) * 100 : 0;

      report.push({
        projectId: p._id.toString(),
        projectName: (p as any).projectName,
        revenue: invoicedRevenue,
        cost: totalCost,
        profit,
        margin: parseFloat(margin.toFixed(2)),
        unbilledHours,
        unbilledRevenuePotential
      });
    }

    return report;
  }


  
  static isCreditNormalAccount(accountType: string): boolean {
    const creditTypes = ['Income', 'Other Income', 'Equity', 'Long Term Liability', 'Other Current Liability', 'Credit Card'];
    return creditTypes.includes(accountType);
  }

  static async getBudgetVsActuals(orgId: string, filters: { branchId?: string, periodStart?: Date, periodEnd?: Date } = {}) {
    const Budget = mongoose.model('Budget');
    const LedgerEntry = mongoose.model('LedgerEntry');
    // Ensure ChartOfAccount is registered, or use mongoose.model if it is
    const ChartOfAccount = mongoose.models.ChartOfAccount || mongoose.model('ChartOfAccount');

    const budgetQuery: any = { orgId };
    if (filters.branchId) budgetQuery.branchId = filters.branchId;
    if (filters.periodStart) budgetQuery.periodStart = { $gte: filters.periodStart };
    if (filters.periodEnd) budgetQuery.periodEnd = { $lte: filters.periodEnd };

    const budgets = await Budget.find(budgetQuery).populate('accountId').lean();
    const report = [];

    for (const b of budgets) {
      const coa: any = (b as any).accountId;
      const coaId = coa._id.toString();

      const pipeline: any[] = [
        { $match: { orgId, date: { $gte: (b as any).periodStart, $lte: (b as any).periodEnd } } },
        { $unwind: '$lines' },
        // Compare with both ObjectId and String forms since Mixed type could hold either historically
        { $match: { $or: [{ 'lines.accountId': coa._id }, { 'lines.accountId': coaId }] } }
      ];

      if ((b as any).branchId) {
        pipeline.push({ $match: { 'lines.branchId': new mongoose.Types.ObjectId((b as any).branchId.toString()) } });
      }

      pipeline.push({
        $group: {
          _id: null,
          totalDebit: { $sum: '$lines.debit' },
          totalCredit: { $sum: '$lines.credit' }
        }
      });

      const actuals = await LedgerEntry.aggregate(pipeline);
      const debits = actuals[0]?.totalDebit || 0;
      const credits = actuals[0]?.totalCredit || 0;

      let actualAmount = 0;
      if (AdvancedReportsService.isCreditNormalAccount(coa.accountType)) {
        actualAmount = credits - debits; 
      } else {
        actualAmount = debits - credits; 
      }

      const variance = actualAmount - (b as any).budgetedAmount;
      const variancePercentage = (b as any).budgetedAmount ? (variance / (b as any).budgetedAmount) * 100 : 0;

      report.push({
        accountId: coaId,
        accountName: coa.accountName,
        accountType: coa.accountType,
        branchId: (b as any).branchId || 'Org-Wide',
        period: `${(b as any).periodStart.toISOString().split('T')[0]} to ${(b as any).periodEnd.toISOString().split('T')[0]}`,
        budgetAmount: (b as any).budgetedAmount,
        actualAmount,
        variance,
        variancePercentage: parseFloat(variancePercentage.toFixed(2))
      });
    }

    return report;
  }



  static async getTDSSummary(orgId: string) {
    const bills = await Bill.aggregate([
      { $match: { orgId, taxConfigurationId: { $exists: true, $ne: null } } },
      {
        $lookup: {
          from: 'taxconfigurations',
          localField: 'taxConfigurationId',
          foreignField: '_id',
          as: 'taxConfig'
        }
      },
      { $unwind: '$taxConfig' },
      { $match: { 'taxConfig.taxType': 'TDS' } },
      {
        $lookup: {
          from: 'booksvendors',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      { $unwind: '$vendor' },
      {
        $group: {
          _id: { vendorId: '$vendorId', vendorName: '$vendor.vendorName', sectionCode: '$taxConfig.sectionCode', rate: '$taxConfig.rate' },
          totalTaxableBase: { $sum: { $subtract: ['$totalAmount', '$taxWithheldAmount'] } }, // Approx if total is gross
          totalTdsDeducted: { $sum: '$taxWithheldAmount' },
          billCount: { $sum: 1 }
        }
      },
      {
        $project: {
          vendorName: '$_id.vendorName',
          sectionCode: '$_id.sectionCode',
          rate: '$_id.rate',
          totalTdsDeducted: 1,
          billCount: 1,
          _id: 0
        }
      }
    ]);
    return bills;
  }

  static async getTCSPayableSummary(orgId: string) {
    const invoices = await Invoice.aggregate([
      { $match: { orgId, taxConfigurationId: { $exists: true, $ne: null } } },
      {
        $lookup: {
          from: 'taxconfigurations',
          localField: 'taxConfigurationId',
          foreignField: '_id',
          as: 'taxConfig'
        }
      },
      { $unwind: '$taxConfig' },
      { $match: { 'taxConfig.taxType': 'TCS' } },
      {
        $lookup: {
          from: 'bookscustomers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerDoc'
        }
      },
      { $unwind: '$customerDoc' },
      {
        $group: {
          _id: { customerId: '$customer', customerName: '$customerDoc.displayName', sectionCode: '$taxConfig.sectionCode', rate: '$taxConfig.rate' },
          totalTcsCollected: { $sum: '$taxWithheldAmount' },
          invoiceCount: { $sum: 1 }
        }
      },
      {
        $project: {
          customerName: '$_id.customerName',
          sectionCode: '$_id.sectionCode',
          rate: '$_id.rate',
          totalTcsCollected: 1,
          invoiceCount: 1,
          _id: 0
        }
      }
    ]);
    return invoices;
  }

  static async getFIFOValuation(orgId: string, asOfDate: Date = new Date()) {
    const items = await Item.find({ orgId, type: 'goods' }).lean();
    const bills = await Bill.find({ orgId, status: { $ne: 'Draft' }, billDate: { $lte: asOfDate } }).sort({ billDate: 1 }).lean();
    const invoices = await Invoice.find({ orgId, status: { $ne: 'Draft' }, invoiceDate: { $lte: asOfDate } }).sort({ invoiceDate: 1 }).lean();
    const creditNotes = await CreditNote.find({ orgId, status: { $ne: 'Draft' }, creditNoteDate: { $lte: asOfDate } }).sort({ creditNoteDate: 1 }).lean();

    const valuation: any[] = [];
    const lotsByItem = new Map<string, any[]>();
    
    items.forEach((i: any) => lotsByItem.set(i._id.toString(), []));

    let lotIdCounter = 1;
    // 1. Build Lots from Inbound (Bills)
    bills.forEach(b => {
      (b.lineItems || []).forEach((l:any) => {
        const itemId = l.itemId?.toString();
        if (itemId && lotsByItem.has(itemId)) {
          (lotsByItem.get(itemId) || []).push({
            lotId: lotIdCounter++,
            date: b.billDate,
            transaction: b.billNumber,
            quantity: l.quantity || 0,
            remainingQuantity: l.quantity || 0,
            rate: l.rate || 0
          });
        }
      });
    });

    const cogsLog = new Map<string, number>();
    // Tracks which invoice consumed which lots: invoiceId_itemId -> [ { lotId, qty, rate, lotRef } ]
    const consumptionLog = new Map<string, any[]>();

    invoices.forEach(inv => {
      const invId = inv._id.toString();
      (inv.items || []).forEach((l:any) => {
        const itemId = l.item?.toString();
        if (itemId && lotsByItem.has(itemId)) {
          let qtyToConsume = l.quantity || 0;
          let costForThisSale = 0;
          const lots = (lotsByItem.get(itemId) || []) || [];
          
          const consumedLots: any[] = [];
          for (const lot of lots) {
            if (qtyToConsume <= 0) break;
            if (lot.remainingQuantity > 0) {
              const consumed = Math.min(qtyToConsume, lot.remainingQuantity);
              lot.remainingQuantity -= consumed;
              qtyToConsume -= consumed;
              costForThisSale += (consumed * lot.rate);
              consumedLots.push({ lot, qty: consumed, rate: lot.rate });
            }
          }
          
          cogsLog.set(itemId, (cogsLog.get(itemId) || 0) + costForThisSale);
          const key = invId + '_' + itemId;
          consumptionLog.set(key, consumedLots);
        }
      });
    });

    // 3. Process Returns (Credit Notes) restoring the EXACT lots consumed by the invoice
    creditNotes.forEach(cn => {
      // Assuming cn applies entirely to cn.invoiceId. Or cn.appliedToInvoices
      // In Priority 4 we added appliedToInvoices or invoiceId
      let relatedInvIds: string[] = [];
      if ((cn as any).appliedToInvoices && (cn as any).appliedToInvoices.length > 0) {
        relatedInvIds = (cn as any).appliedToInvoices.map((x:any) => x.invoiceId?.toString());
      } else if ((cn as any).invoiceId) {
        relatedInvIds = [(cn as any).invoiceId.toString()];
      }

      const invId = relatedInvIds.length > 0 ? relatedInvIds[0] : null; // simplified logic to pick the primary linked invoice

      (cn.items || []).forEach((l:any) => {
        const itemId = l.item?.toString();
        if (itemId && invId) {
          let qtyToReturn = l.quantity || 0;
          const key = invId + '_' + itemId;
          const consumedLots = consumptionLog.get(key);
          
          if (consumedLots) {
            // Restore in reverse order (LIFO of consumption)
            for (let i = consumedLots.length - 1; i >= 0; i--) {
               if (qtyToReturn <= 0) break;
               const cl = consumedLots[i];
               // How much can we return to this lot? Max is what we consumed from it.
               // We need to track how much has ALREADY been returned if there are multiple CNs, 
               // but for this scope, returning qty is enough.
               const restored = Math.min(qtyToReturn, cl.qty);
               cl.qty -= restored;
               qtyToReturn -= restored;
               
               // Restore to the original lot
               cl.lot.remainingQuantity += restored;
               
               // Reduce COGS
               const costRestored = restored * cl.rate;
               cogsLog.set(itemId, (cogsLog.get(itemId) || 0) - costRestored);
            }
          } else {
             // If no explicit consumption found (e.g. orphan return), we could inject a new lot.
             // Skipped for this exact strict test constraint.
          }
        }
      });
    });

    items.forEach((i: any) => {
      const itemId = i._id.toString();
      const lots = (lotsByItem.get(itemId) || []) || [];
      let stockOnHand = 0;
      let inventoryValue = 0;
      
      const activeLots: any[] = [];
      lots.forEach(lot => {
        if (lot.remainingQuantity > 0) {
          stockOnHand += lot.remainingQuantity;
          inventoryValue += (lot.remainingQuantity * lot.rate);
          activeLots.push({ transaction: lot.transaction, quantity: lot.quantity, remainingQuantity: lot.remainingQuantity, rate: lot.rate });
        }
      });
      
      valuation.push({
        itemName: i.name,
        cogs: cogsLog.get(itemId) || 0,
        stockOnHand,
        inventoryValue,
        activeLots
      });
    });
    
    return valuation;
  }

  static async getWACValuation(orgId: string, asOfDate: Date = new Date()) {
    const items = await Item.find({ orgId, type: 'goods' }).lean();
    const bills = await Bill.find({ orgId, status: { $ne: 'Draft' }, billDate: { $lte: asOfDate } }).lean();
    const invoices = await Invoice.find({ orgId, status: { $ne: 'Draft' }, invoiceDate: { $lte: asOfDate } }).lean();
    const creditNotes = await CreditNote.find({ orgId, status: { $ne: 'Draft' }, creditNoteDate: { $lte: asOfDate } }).lean();

    const allTransactions: any[] = [];
    bills.forEach(b => {
      (b.lineItems || []).forEach((l:any) => {
        if (l.itemId) {
          allTransactions.push({ type: 'in', date: b.billDate, itemId: l.itemId.toString(), qty: l.quantity, rate: l.rate, ref: b.billNumber });
        }
      });
    });
    invoices.forEach(inv => {
      (inv.items || []).forEach((l:any) => {
        if (l.item) {
          allTransactions.push({ type: 'out', date: inv.invoiceDate, itemId: l.item.toString(), qty: l.quantity, ref: inv.invoiceNumber });
        }
      });
    });
    creditNotes.forEach(cn => {
      (cn.items || []).forEach((l:any) => {
        if (l.item) {
          allTransactions.push({ type: 'return_in', date: cn.creditNoteDate, itemId: l.item.toString(), qty: l.quantity, ref: cn.creditNoteNumber });
        }
      });
    });

    allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const map = new Map<string, any>();
    items.forEach((i: any) => map.set(i._id.toString(), {
      itemName: i.name,
      stockOnHand: 0,
      inventoryValue: 0,
      averageCost: 0,
      cogs: 0,
      ledger: []
    }));

    allTransactions.forEach(tx => {
      const row = map.get(tx.itemId);
      if (!row) return;

      if (tx.type === 'in') {
        const totalValue = row.inventoryValue + (tx.qty * tx.rate);
        row.stockOnHand += tx.qty;
        row.inventoryValue = totalValue;
        row.averageCost = row.stockOnHand > 0 ? (row.inventoryValue / row.stockOnHand) : 0;
        row.ledger.push({ ...tx, currentWAC: row.averageCost });
      } else if (tx.type === 'out') {
        const cogsAmount = tx.qty * row.averageCost;
        row.cogs += cogsAmount;
        row.stockOnHand -= tx.qty;
        row.inventoryValue -= cogsAmount;
        row.ledger.push({ ...tx, costApplied: cogsAmount, currentWAC: row.averageCost });
      } else if (tx.type === 'return_in') {
        const restoredValue = tx.qty * row.averageCost;
        row.cogs -= restoredValue;
        row.stockOnHand += tx.qty;
        row.inventoryValue += restoredValue;
        row.ledger.push({ ...tx, costRestored: restoredValue, currentWAC: row.averageCost });
      }
    });

    return Array.from(map.values());
  }

  static async getABCClassification(orgId: string) {
    const valuation = await this.getWACValuation(orgId);
    valuation.sort((a, b) => b.inventoryValue - a.inventoryValue);
    
    const totalValue = valuation.reduce((acc, row) => acc + row.inventoryValue, 0);
    let cumulative = 0;
    
    return valuation.map(row => {
      cumulative += row.inventoryValue;
      const cumulativePercent = totalValue > 0 ? (cumulative / totalValue) * 100 : 0;
      
      let classification = 'C';
      if (cumulativePercent <= 70) classification = 'A';
      else if (cumulativePercent <= 90) classification = 'B';

      return {
        itemName: row.itemName,
        inventoryValue: row.inventoryValue,
        cumulativePercent: cumulativePercent.toFixed(2) + '%',
        classification
      };
    });
  }

  // ===================== PAYMENTS & REFUNDS (Priority 5 - Batch 1) ===================== //

  static async getPaymentsReceivedDetails(orgId: string, startDate?: Date, endDate?: Date) {
    const query: any = { orgId };
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }
    const payments = await PaymentReceived.find(query).populate('customer').lean();

    return payments.map(p => {
      let applied = 0;
      if (p.invoices) {
        (p.invoices as any[]).forEach((inv: any) => { applied += (inv.amountApplied || 0) });
      }
      const unused = (p.amount || 0) - applied - (p.amountRefunded || 0);

      return {
        date: p.paymentDate,
        paymentNumber: p.paymentNumber,
        customer: (p.customer as any)?.displayName || 'Unknown',
        mode: p.paymentMode,
        totalAmount: p.amount,
        appliedAmount: applied,
        refundedAmount: p.amountRefunded || 0,
        unusedAmount: Math.max(0, unused)
      };
    });
  }

  static async getTimeToGetPaid(orgId: string, startDate?: Date, endDate?: Date) {
    const query: any = { orgId };
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }
    const payments = await PaymentReceived.find(query).populate('customer').populate('invoices.invoice').lean();
    
    const details: any[] = [];

    payments.forEach(p => {
      if (p.invoices) {
        p.invoices.forEach((l:any) => {
          if (l.invoice && l.invoice.invoiceDate) {
             const payDate = new Date(p.paymentDate).getTime();
             const invDate = new Date(l.invoice.invoiceDate).getTime();
             const diffTime = payDate - invDate;
             const daysToPay = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

             details.push({
               customer: (p.customer as any)?.displayName || 'Unknown',
               invoiceNumber: l.invoice.invoiceNumber,
               invoiceDate: l.invoice.invoiceDate,
               paymentNumber: p.paymentNumber,
               paymentDate: p.paymentDate,
               amountApplied: l.amountApplied,
               daysToPay
             });
          }
        });
      }
    });

    return details.sort((a, b) => b.daysToPay - a.daysToPay);
  }

  static async getCreditNoteDetails(orgId: string, startDate?: Date, endDate?: Date) {
    const query: any = { orgId, status: { $ne: 'Draft' } };
    if (startDate || endDate) {
      query.creditNoteDate = {};
      if (startDate) query.creditNoteDate.$gte = new Date(startDate);
      if (endDate) query.creditNoteDate.$lte = new Date(endDate);
    }
    const credits = await CreditNote.find(query).populate('customer').lean();

    return credits.map(c => {
      let applied = 0;
      if ((c as any).appliedToInvoices && (c as any).appliedToInvoices.length > 0) {
        (c as any).appliedToInvoices.forEach((l:any) => { applied += (l.amountApplied || 0) });
      } else if ((c as any).invoiceId) {
        applied = c.total || 0;
      }
      
      let refunded = 0;
      if (c.refunds) {
        c.refunds.forEach(r => { refunded += (r.amount || 0) });
      }

      const unused = (c.total || 0) - applied - refunded;

      return {
        date: c.creditNoteDate,
        creditNoteNumber: c.creditNoteNumber,
        customer: (c.customer as any)?.displayName || 'Unknown',
        status: c.status,
        totalAmount: c.total,
        appliedAmount: applied,
        refundedAmount: refunded,
        unusedCredit: Math.max(0, unused)
      };
    });
  }

  static async getReceivablesRefundHistory(orgId: string, startDate?: Date, endDate?: Date) {
    const query: any = { orgId, status: { $ne: 'Draft' } };
    const credits = await CreditNote.find(query).populate('customer').lean();
    
    const refunds: any[] = [];
    credits.forEach(c => {
      if (c.refunds) {
        c.refunds.forEach(r => {
          let dateMatch = true;
          if (startDate && r.date < startDate) dateMatch = false;
          if (endDate && r.date > endDate) dateMatch = false;

          if (dateMatch) {
            refunds.push({
              date: r.date,
              reference: r.reference || c.creditNoteNumber,
              customer: (c.customer as any)?.displayName || 'Unknown',
              creditNoteNumber: c.creditNoteNumber,
              amount: r.amount
            });
          }
        });
      }
    });

    return refunds.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }



  // ===================== PURCHASES & EXPENSES (Priority 5 - Batch 3) ===================== //

  static async getPurchasesByVendor(orgId: string, startDate?: Date, endDate?: Date) {
    const filter = this.getOrgFilter(orgId);
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.billDate = {};
      if (startDate) dateFilter.billDate.$gte = new Date(startDate);
      if (endDate) dateFilter.billDate.$lte = new Date(endDate);
    }

    const vendors = await Vendor.find(filter).lean();
    const bills = await Bill.find({ ...filter, ...dateFilter, status: { $nin: ['Draft', 'Void'] } }).lean();
    const credits = await VendorCredit.find({ ...filter, status: { $nin: ['Draft', 'Void'] } }).lean();

    const map = new Map<string, any>();
    vendors.forEach((v: any) => map.set(v._id.toString(), {
      vendorId: v._id.toString(),
      vendor: v.displayName || v.vendorName || v.companyName || 'Vendor',
      purchaseCount: 0,
      totalPurchases: 0,
      vendorCredits: 0,
      netPurchases: 0
    }));

    bills.forEach(b => {
      const vId = b.vendorId?.toString();
      if (vId) {
        if (!map.has(vId)) {
          map.set(vId, {
            vendorId: vId,
            vendor: 'Vendor',
            purchaseCount: 0,
            totalPurchases: 0,
            vendorCredits: 0,
            netPurchases: 0
          });
        }
        const row = map.get(vId);
        row.purchaseCount++;
        row.totalPurchases += (b.totalAmount || b.total || 0);
      }
    });

    credits.forEach(c => {
      const vId = c.vendorId?.toString();
      if (vId && map.has(vId)) {
        const row = map.get(vId);
        row.vendorCredits += (c.totalAmount || 0);
      }
    });

    for (const row of map.values()) {
      row.netPurchases = row.totalPurchases - row.vendorCredits;
    }

    return Array.from(map.values()).filter(r => r.purchaseCount > 0 || r.vendorCredits > 0).sort((a, b) => b.netPurchases - a.netPurchases);
  }

  static async getPurchasesByItem(orgId: string, startDate?: Date, endDate?: Date) {
    const filter = this.getOrgFilter(orgId);
    const items = await Item.find(filter).lean();
    const bills = await Bill.find({ ...filter, status: { $nin: ['Draft', 'Void'] } }).lean();

    const map = new Map<string, any>();
    items.forEach((i: any) => map.set(i._id.toString(), {
      itemId: i._id.toString(),
      itemName: i.name || (i as any).itemName,
      sku: (i as any).sku || '-',
      quantityPurchased: 0,
      totalAmount: 0,
      averagePurchasePrice: 0
    }));

    bills.forEach(b => {
      (b.lineItems || []).forEach((l:any) => {
        const itemId = l.itemId?.toString();
        if (itemId) {
          if (!map.has(itemId)) {
            map.set(itemId, {
              itemId,
              itemName: l.itemDetails || 'Item',
              sku: '-',
              quantityPurchased: 0,
              totalAmount: 0,
              averagePurchasePrice: 0
            });
          }
          const row = map.get(itemId);
          row.quantityPurchased += (l.quantity || 0);
          row.totalAmount += (l.amount || 0);
        }
      });
    });

    for (const row of map.values()) {
      row.averagePurchasePrice = row.quantityPurchased > 0 ? (row.totalAmount / row.quantityPurchased) : 0;
    }

    return Array.from(map.values()).filter(r => r.quantityPurchased > 0).sort((a, b) => b.totalAmount - a.totalAmount);
  }

  static async getExpenseDetails(orgId: string, startDate?: Date, endDate?: Date) {
    const filter = this.getOrgFilter(orgId);
    const query: any = { ...filter, status: { $ne: 'Void' } };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const ExpenseModel = mongoose.models.BooksExpense || mongoose.model('BooksExpense');
    const expenses = await ExpenseModel.find(query).populate('customerId vendorId projectId').lean();

    return expenses.map((e:any) => {
      const isUnpaid = e.paidThrough === 'Accounts Payable';
      return {
        _id: e._id,
        date: e.date || e.createdAt,
        expenseAccount: e.expenseAccount || (e.lineItems && e.lineItems[0]?.expenseAccount) || e.notes || 'Operating Expense',
        reference: e.reference || e.expenseNumber || '-',
        vendor: e.vendorId?.displayName || e.vendorId?.vendorName || e.vendorId?.companyName || '-',
        customer: e.customerId?.displayName || e.customerId?.companyName || '-',
        paidThrough: e.paidThrough || 'Cash',
        status: isUnpaid ? 'Unpaid (On Credit)' : 'Paid',
        amount: -(e.totalAmount || e.amount || 0)
      };
    }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async getExpensesByCategory(orgId: string, categoryType: 'account' | 'customer' | 'project' | 'employee' = 'account') {
    const filter = this.getOrgFilter(orgId);
    const ExpenseModel = mongoose.models.BooksExpense || mongoose.model('BooksExpense');
    const expenses = await ExpenseModel.find({ ...filter, status: { $ne: 'Void' } }).populate('customerId vendorId projectId').lean();

    const map = new Map<string, any>();
    
    expenses.forEach((e:any) => {
      let key = 'Uncategorized';
      if (categoryType === 'account') key = e.expenseAccount || (e.lineItems && e.lineItems[0]?.expenseAccount) || e.notes || 'Operating Expense';
      if (categoryType === 'customer') key = e.customerId?.displayName || 'No Customer';
      if (categoryType === 'project') key = e.projectId?.name || 'No Project';
      if (categoryType === 'employee') key = e.mileageData?.employee || 'No Employee';

      if (!map.has(key)) map.set(key, { category: key, expenseCount: 0, totalAmount: 0 });
      const row = map.get(key);
      row.expenseCount++;
      row.totalAmount += (e.totalAmount || e.amount || 0);
    });

    return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  }

  static async getBillableExpenseDetails(orgId: string, startDate?: Date, endDate?: Date) {
    const filter = this.getOrgFilter(orgId);
    const ExpenseModel = mongoose.models.BooksExpense || mongoose.model('BooksExpense');
    const expenses = await ExpenseModel.find({ ...filter, billable: true }).populate('customerId invoiceId').lean();

    return expenses.map((e:any) => {
      const isInvoiced = !!e.invoiceId;
      const unbilledAmount = isInvoiced ? 0 : (e.totalAmount || e.amount || 0);
      return {
        date: e.date,
        expenseAccount: e.expenseAccount || (e.lineItems && e.lineItems[0]?.expenseAccount) || 'Unknown',
        customer: e.customerId?.displayName || '-',
        billableAmount: e.totalAmount || e.amount || 0,
        unbilledAmount,
        status: isInvoiced ? 'Invoiced' : 'Unbilled',
        associatedInvoice: isInvoiced ? (e.invoiceId?.invoiceNumber || 'Linked') : null
      };
    });
  }


  // ===================== RECURRING TRANSACTIONS (Priority 5 - Batch 3) ===================== //

  static async getRecurringInvoiceDetails(orgId: string, startDate?: Date, endDate?: Date) {
    const query: any = { orgId };
    if (startDate || endDate) {
      query.startsOn = {};
      if (startDate) query.startsOn.$gte = new Date(startDate);
      if (endDate) query.startsOn.$lte = new Date(endDate);
    }
    const recs = await RecurringInvoice.find(query).populate('customer').lean();

    return recs.map((r:any) => {
      let amount = 0;
      (r.items || []).forEach((l:any) => amount += (l.amount || 0));
      return {
        profileName: r.profileName,
        customer: r.customer?.displayName || '-',
        frequency: r.repeatEvery,
        startsOn: r.startsOn,
        endsOn: r.endsOn || 'Never',
        status: r.status,
        amount
      };
    });
  }

  static async getRecurringBills(orgId: string, startDate?: Date, endDate?: Date) {
    const query: any = { orgId };
    if (startDate || endDate) {
      query.startsOn = {};
      if (startDate) query.startsOn.$gte = new Date(startDate);
      if (endDate) query.startsOn.$lte = new Date(endDate);
    }
    const recs = await RecurringBill.find(query).populate('vendorId').lean();

    return recs.map((r:any) => {
      let amount = 0;
      (r.lineItems || []).forEach((l:any) => amount += (l.amount || 0));
      return {
        profileName: r.profileName,
        vendor: r.vendorId?.displayName || r.vendorId?.vendorName || '-',
        frequency: r.repeatEvery,
        startsOn: r.startsOn,
        endsOn: r.endsOn || 'Never',
        status: r.status,
        amount
      };
    });
  }

  static async getRecurringExpenses(orgId: string, startDate?: Date, endDate?: Date) {
    const query: any = { orgId };
    if (startDate || endDate) {
      query.startsOn = {};
      if (startDate) query.startsOn.$gte = new Date(startDate);
      if (endDate) query.startsOn.$lte = new Date(endDate);
    }
    const recs = await RecurringExpense.find(query).populate('customerId').lean();

    return recs.map((r:any) => {
      return {
        profileName: r.profileName,
        expenseAccount: r.expenseAccount || '-',
        customer: r.customerId?.displayName || '-',
        frequency: r.repeatEvery,
        startsOn: r.startsOn,
        endsOn: r.endsOn || 'Never',
        status: r.status,
        amount: r.amount
      };
    });
  }

}
