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
import mongoose from 'mongoose';
import RecurringInvoice from '../models/RecurringInvoice';

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

export const findCustomerById = async (customerId: string, extraFilter: any = {}) => {
  let customer: any = await Customer.findOne({ _id: customerId, ...extraFilter }).lean().catch(() => null);
  if (!customer && mongoose.isValidObjectId(customerId)) {
    const objId = new mongoose.Types.ObjectId(customerId);
    customer = (await mongoose.connection.collection('customers').findOne({ _id: objId, ...extraFilter })) ||
               (await mongoose.connection.collection('clientaccounts').findOne({ _id: objId, ...extraFilter }));
  } else if (!customer) {
    customer = (await mongoose.connection.collection('customers').findOne({ _id: customerId as any, ...extraFilter })) ||
               (await mongoose.connection.collection('clientaccounts').findOne({ _id: customerId as any, ...extraFilter }));
  }
  return customer;
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantFilter = buildTenantFilter(req);
    const customer = await findCustomerById(req.params.id, tenantFilter);

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

    const customerFilter = {
      $or: [
        { customer: customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ customer: new mongoose.Types.ObjectId(customerId) }] : []),
        { 'customer._id': customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ 'customer._id': new mongoose.Types.ObjectId(customerId) }] : []),
        { customerId: customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ customerId: new mongoose.Types.ObjectId(customerId) }] : [])
      ]
    };

    const [invoices, quotes, salesOrders, paymentsReceived, creditNotes, subscriptions] = await Promise.all([
      Invoice.find(customerFilter).sort({ invoiceDate: -1, createdAt: -1 }).lean(),
      Quote.find(customerFilter).sort({ quoteDate: -1, createdAt: -1 }).lean(),
      SalesOrder.find(customerFilter).sort({ salesOrderDate: -1, createdAt: -1 }).lean(),
      PaymentReceived.find(customerFilter).sort({ paymentDate: -1, createdAt: -1 }).lean(),
      CreditNote.find(customerFilter).sort({ creditNoteDate: -1, createdAt: -1 }).lean(),
      RecurringInvoice.find(customerFilter).sort({ createdAt: -1 }).lean().catch(() => [])
    ]);

    res.status(200).json({
      success: true,
      data: {
        invoices,
        quotes,
        salesOrders,
        paymentsReceived,
        creditNotes,
        subscriptions
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerStatement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.id;
    const customer = await findCustomerById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(0);
    const end = endDate ? new Date(endDate as string) : new Date();

    const customerFilter = {
      $or: [
        { customer: customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ customer: new mongoose.Types.ObjectId(customerId) }] : []),
        { 'customer._id': customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ 'customer._id': new mongoose.Types.ObjectId(customerId) }] : []),
        { customerId: customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ customerId: new mongoose.Types.ObjectId(customerId) }] : [])
      ]
    };

    const [invoices, payments, creditNotes] = await Promise.all([
      Invoice.find({ ...customerFilter, invoiceDate: { $gte: start, $lte: end }, status: { $ne: 'Draft' } }).lean(),
      PaymentReceived.find({ ...customerFilter, paymentDate: { $gte: start, $lte: end } }).lean(),
      CreditNote.find({ ...customerFilter, creditNoteDate: { $gte: start, $lte: end }, status: { $ne: 'Draft' } }).lean()
    ]);

    const openingBalance = Number(customer.openingBalance || 0);
    const statementLines: any[] = [];

    // Invoices are Debits (increase customer balance)
    invoices.forEach(inv => {
      statementLines.push({
        date: inv.invoiceDate || inv.createdAt,
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
        date: pmt.paymentDate || pmt.createdAt,
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
        date: cn.creditNoteDate || cn.createdAt,
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

export const getCustomerActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.id;
    const customer = await findCustomerById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const customerFilter = {
      $or: [
        { customer: customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ customer: new mongoose.Types.ObjectId(customerId) }] : []),
        { 'customer._id': customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ 'customer._id': new mongoose.Types.ObjectId(customerId) }] : []),
        { customerId: customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ customerId: new mongoose.Types.ObjectId(customerId) }] : [])
      ]
    };

    const [invoices, quotes, salesOrders, payments, creditNotes] = await Promise.all([
      Invoice.find(customerFilter).sort({ createdAt: -1, invoiceDate: -1 }).limit(20).lean(),
      Quote.find(customerFilter).sort({ createdAt: -1, quoteDate: -1 }).limit(10).lean(),
      SalesOrder.find(customerFilter).sort({ createdAt: -1, salesOrderDate: -1 }).limit(10).lean(),
      PaymentReceived.find(customerFilter).sort({ createdAt: -1, paymentDate: -1 }).limit(20).lean(),
      CreditNote.find(customerFilter).sort({ createdAt: -1, creditNoteDate: -1 }).limit(10).lean()
    ]);

    const activityList: any[] = [];

    // 1. Initial Creation Event
    activityList.push({
      id: `act-create-${customer._id}`,
      action: 'Created',
      type: 'create',
      title: 'Customer Profile Created',
      description: `Customer "${customer.displayName || customer.name}" was registered in the ERP.`,
      actorName: (customer as any).createdByName || 'System / Staff',
      role: 'Staff',
      timestamp: customer.createdAt || new Date(),
      date: customer.createdAt || new Date(),
      status: customer.status || 'Active'
    });

    // 2. Invoices
    invoices.forEach(inv => {
      activityList.push({
        id: `act-inv-${inv._id}`,
        action: 'Invoice Generated',
        type: 'invoice',
        title: `Invoice #${inv.invoiceNumber} Generated`,
        description: `Billed total: ₹${(inv.total || 0).toLocaleString('en-IN')} (Status: ${inv.status || 'Sent'})`,
        referenceId: inv._id,
        referenceNumber: inv.invoiceNumber,
        actorName: 'Billing Engine',
        timestamp: inv.createdAt || inv.invoiceDate,
        date: inv.invoiceDate || inv.createdAt,
        status: inv.status
      });
    });

    // 3. Payments
    payments.forEach(pmt => {
      activityList.push({
        id: `act-pmt-${pmt._id}`,
        action: 'Payment Received',
        type: 'payment',
        title: `Payment Received #${pmt.paymentNumber}`,
        description: `Received ₹${(pmt.amount || 0).toLocaleString('en-IN')} via ${pmt.paymentMode || 'Bank Transfer'}`,
        referenceId: pmt._id,
        referenceNumber: pmt.paymentNumber,
        actorName: 'Accounts Team',
        timestamp: pmt.createdAt || pmt.paymentDate,
        date: pmt.paymentDate || pmt.createdAt,
        status: 'Processed'
      });
    });

    // 4. Sales Orders
    salesOrders.forEach(so => {
      activityList.push({
        id: `act-so-${so._id}`,
        action: 'Sales Order Placed',
        type: 'sales_order',
        title: `Order #${so.salesOrderNumber} Placed`,
        description: `Order amount: ₹${(so.total || 0).toLocaleString('en-IN')} (Fulfillment: ${so.fulfillmentStatus || 'Pending'})`,
        referenceId: so._id,
        referenceNumber: so.salesOrderNumber,
        actorName: 'Sales Department',
        timestamp: so.createdAt || so.salesOrderDate,
        date: so.salesOrderDate || so.createdAt,
        status: so.status
      });
    });

    // 5. Quotes
    quotes.forEach(qt => {
      activityList.push({
        id: `act-qt-${qt._id}`,
        action: 'Quote Issued',
        type: 'quote',
        title: `Quote #${qt.quoteNumber} Issued`,
        description: `Estimate amount: ₹${(qt.total || 0).toLocaleString('en-IN')}`,
        referenceId: qt._id,
        referenceNumber: qt.quoteNumber,
        actorName: 'Sales Department',
        timestamp: qt.createdAt || qt.quoteDate,
        date: qt.quoteDate || qt.createdAt,
        status: qt.status
      });
    });

    // 6. Credit Notes
    creditNotes.forEach(cn => {
      activityList.push({
        id: `act-cn-${cn._id}`,
        action: 'Credit Note Issued',
        type: 'credit_note',
        title: `Credit Note #${cn.creditNoteNumber}`,
        description: `Credit allowance of ₹${(cn.total || 0).toLocaleString('en-IN')}`,
        referenceId: cn._id,
        referenceNumber: cn.creditNoteNumber,
        actorName: 'Accounts Team',
        timestamp: cn.createdAt || cn.creditNoteDate,
        date: cn.creditNoteDate || cn.createdAt,
        status: cn.status
      });
    });

    // Sort chronologically descending
    activityList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.status(200).json({
      success: true,
      data: activityList,
      timeline: activityList,
      count: activityList.length
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.id;
    const customerFilter = {
      $or: [
        { customer: customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ customer: new mongoose.Types.ObjectId(customerId) }] : []),
        { 'customer._id': customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ 'customer._id': new mongoose.Types.ObjectId(customerId) }] : []),
        { customerId: customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ customerId: new mongoose.Types.ObjectId(customerId) }] : [])
      ]
    };

    const subs = await RecurringInvoice.find(customerFilter).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: subs.length, data: subs });
  } catch (error) { next(error); }
};

export const getCustomerInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.id;
    const customerFilter = {
      $or: [
        { customer: customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ customer: new mongoose.Types.ObjectId(customerId) }] : []),
        { 'customer._id': customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ 'customer._id': new mongoose.Types.ObjectId(customerId) }] : []),
        { customerId: customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ customerId: new mongoose.Types.ObjectId(customerId) }] : [])
      ]
    };
    const invoices = await Invoice.find(customerFilter).sort({ invoiceDate: -1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: invoices.length, data: invoices });
  } catch (error) { next(error); }
};

export const getCustomerQuotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.id;
    const customerFilter = {
      $or: [
        { customer: customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ customer: new mongoose.Types.ObjectId(customerId) }] : []),
        { 'customer._id': customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ 'customer._id': new mongoose.Types.ObjectId(customerId) }] : []),
        { customerId: customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ customerId: new mongoose.Types.ObjectId(customerId) }] : [])
      ]
    };
    const quotes = await Quote.find(customerFilter).sort({ quoteDate: -1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: quotes.length, data: quotes });
  } catch (error) { next(error); }
};

export const getCustomerSalesOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.id;
    const customerFilter = {
      $or: [
        { customer: customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ customer: new mongoose.Types.ObjectId(customerId) }] : []),
        { 'customer._id': customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ 'customer._id': new mongoose.Types.ObjectId(customerId) }] : []),
        { customerId: customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ customerId: new mongoose.Types.ObjectId(customerId) }] : [])
      ]
    };
    const orders = await SalesOrder.find(customerFilter).sort({ salesOrderDate: -1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) { next(error); }
};

export const getCustomerPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.id;
    const customerFilter = {
      $or: [
        { customer: customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ customer: new mongoose.Types.ObjectId(customerId) }] : []),
        { 'customer._id': customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ 'customer._id': new mongoose.Types.ObjectId(customerId) }] : []),
        { customerId: customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ customerId: new mongoose.Types.ObjectId(customerId) }] : [])
      ]
    };
    const payments = await PaymentReceived.find(customerFilter).sort({ paymentDate: -1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) { next(error); }
};

export const getCustomerCreditNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.id;
    const customerFilter = {
      $or: [
        { customer: customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ customer: new mongoose.Types.ObjectId(customerId) }] : []),
        { 'customer._id': customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ 'customer._id': new mongoose.Types.ObjectId(customerId) }] : []),
        { customerId: customerId },
        ...(mongoose.isValidObjectId(customerId) ? [{ customerId: new mongoose.Types.ObjectId(customerId) }] : [])
      ]
    };
    const notes = await CreditNote.find(customerFilter).sort({ creditNoteDate: -1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) { next(error); }
};

export const getCustomerPortalLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await findCustomerById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    const host = req.get('host') || 'localhost:5173';
    const link = `http://${host}/portal/auth?token=cust_${customer._id}`;
    res.status(200).json({ success: true, link, url: link });
  } catch (error) { next(error); }
};
