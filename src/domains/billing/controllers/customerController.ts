import { requestContext } from '../../../context';
import { LedgerService } from '../../books/services/ledgerService';
import { PostingEngine } from '../../books/services/PostingEngine';
import { Request, Response, NextFunction } from 'express';
import Customer from '../models/Customer';
import Invoice from '../models/Invoice';
import Quote from '../models/Quote';
import SalesOrder from '../models/SalesOrder';
import PaymentReceived from '../models/PaymentReceived';
import CreditNote from '../models/CreditNote';

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || requestContext.getStore()?.orgId;
    const payload = {
      ...req.body, name: req.body.name || req.body.displayName || req.body.companyName || 'Unnamed Customer',
      companyId: orgId || req.body.companyId,
      orgId: orgId || req.body.orgId,
      createdBy: (req as any).user?._id
    };
    
    const customer = await Customer.create(payload);
    
    if (customer.openingBalance && customer.openingBalance > 0) {
      const payloadEvent = { customerId: customer._id.toString(), companyId: orgId || 'SYSTEM', openingBalance: customer.openingBalance };
      await PostingEngine.handleEvent('CUSTOMER_OPENING_BALANCE', payloadEvent);
    }

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

import { buildTenantFilter } from '../../../core/utils/tenantFilter';

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);

    const customers = await Customer.find(tenantFilter).sort({ createdAt: -1 }).lean();
    
    res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0 
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };

    const customer = await Customer.findOne(filter).lean();

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0 
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };

    if (!req.body.name && req.body.displayName) req.body.name = req.body.displayName; const customer = await Customer.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const filter = Object.keys(tenantFilter).length > 0 
      ? { _id: req.params.id, ...tenantFilter }
      : { _id: req.params.id };

    const customer = await Customer.findOneAndDelete(filter);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const getCustomerTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || requestContext.getStore()?.orgId;
    const customerId = req.params.id;

    const [invoices, quotes, salesOrders, paymentsReceived, creditNotes] = await Promise.all([
      Invoice.find({ customer: customerId }).sort({ invoiceDate: -1 }).lean(),
      Quote.find({ customer: customerId }).sort({ quoteDate: -1 }).lean(),
      SalesOrder.find({ customer: customerId }).sort({ salesOrderDate: -1 }).lean(),
      PaymentReceived.find({ customer: customerId }).sort({ paymentDate: -1 }).lean(),
      CreditNote.find({ customer: customerId }).sort({ creditNoteDate: -1 }).lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        invoices,
        quotes,
        salesOrders,
        paymentsReceived,
        creditNotes
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerStatement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findById(customerId).lean();
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(0);
    const end = endDate ? new Date(endDate as string) : new Date();

    const [invoices, payments, creditNotes] = await Promise.all([
      Invoice.find({ customer: customerId, invoiceDate: { $gte: start, $lte: end }, status: { $ne: 'Draft' } }).lean(),
      PaymentReceived.find({ customer: customerId, paymentDate: { $gte: start, $lte: end } }).lean(),
      CreditNote.find({ customer: customerId, creditNoteDate: { $gte: start, $lte: end }, status: { $ne: 'Draft' } }).lean()
    ]);

    const openingBalance = Number(customer.openingBalance || 0);
    const statementLines: any[] = [];

    // Invoices are Debits (increase customer balance)
    invoices.forEach(inv => {
      statementLines.push({
        date: inv.invoiceDate,
        type: 'Invoice',
        reference: inv.invoiceNumber,
        details: `Invoice #${inv.invoiceNumber}`,
        debit: Number(inv.total || 0),
        credit: 0
      });
    });

    // Payments are Credits (decrease customer balance)
    payments.forEach(pmt => {
      statementLines.push({
        date: pmt.paymentDate,
        type: 'Payment',
        reference: pmt.paymentNumber,
        details: `Payment Received #${pmt.paymentNumber} (${pmt.paymentMode || 'Cash'})`,
        debit: 0,
        credit: Number(pmt.amount || 0)
      });
    });

    // Credit notes are Credits (decrease customer balance)
    creditNotes.forEach(cn => {
      statementLines.push({
        date: cn.creditNoteDate,
        type: 'Credit Note',
        reference: cn.creditNoteNumber,
        details: `Credit Note #${cn.creditNoteNumber}`,
        debit: 0,
        credit: Number(cn.total || 0)
      });
    });

    // Sort chronologically
    statementLines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = openingBalance;
    let totalDebit = 0;
    let totalCredit = 0;

    const transactions = statementLines.map(line => {
      runningBalance = runningBalance + line.debit - line.credit;
      totalDebit += line.debit;
      totalCredit += line.credit;
      return {
        ...line,
        balance: Math.round(runningBalance * 100) / 100
      };
    });

    res.status(200).json({
      success: true,
      data: {
        customer: {
          id: customer._id,
          name: customer.displayName || customer.name,
          companyName: customer.companyName,
          email: customer.email,
          phone: customer.phone,
          currency: customer.currency || 'USD',
          billingAddress: customer.billingAddress
        },
        period: {
          startDate: start,
          endDate: end
        },
        openingBalance,
        totalDebit: Math.round(totalDebit * 100) / 100,
        totalCredit: Math.round(totalCredit * 100) / 100,
        closingBalance: Math.round(runningBalance * 100) / 100,
        transactions
      }
    });
  } catch (error) {
    next(error);
  }
};
