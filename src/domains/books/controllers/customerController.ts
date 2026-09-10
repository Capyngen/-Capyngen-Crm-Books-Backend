import { requestContext } from '../../../context';
import { LedgerService } from '../services/ledgerService';
﻿import { Request, Response, NextFunction } from 'express';
import Customer from '../models/Customer';
import BillingCustomer from '../../billing/models/BillingCustomer';

// @desc    Create new customer
// @route   POST /api/v1/books/sales/customers
export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const customer = await Customer.create(req.body);
    if (customer.openingBalance && customer.openingBalance > 0) {
      const orgId = requestContext.getStore()?.orgId || customer.orgId || 'SYSTEM';
      await LedgerService.postTransaction(orgId, customer._id.toString(), 'Customer Opening Balance', new Date(), [
        { accountId: 'Accounts Receivable', debit: customer.openingBalance, contactId: customer._id.toString() },
        { accountId: 'Opening Balance Equity', credit: customer.openingBalance }
      ]);
    }

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all customers
// @route   GET /api/v1/books/sales/customers
export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booksCustomers = await Customer.find().lean();
    const billingCustomers = await BillingCustomer.find().lean();
    
    // Sort all by createdAt descending
    const allCustomers = [
      ...booksCustomers.map(c => ({ ...c, sourceDomain: 'books' })),
      ...billingCustomers.map(c => ({ ...c, sourceDomain: 'billing' }))
    ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.status(200).json({ success: true, count: allCustomers.length, data: allCustomers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer
// @route   GET /api/v1/books/sales/customers/:id
export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let customer = await Customer.findById(req.params.id).lean();
    let sourceDomain = 'books';
    
    if (!customer) {
      customer = await BillingCustomer.findById(req.params.id).lean();
      sourceDomain = 'billing';
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({ success: true, data: { ...customer, sourceDomain } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/v1/books/sales/customers/:id
export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    if (!customer) {
      customer = await BillingCustomer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer
// @route   DELETE /api/v1/books/sales/customers/:id
export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let customer = await Customer.findByIdAndDelete(req.params.id);
    
    if (!customer) {
      customer = await BillingCustomer.findByIdAndDelete(req.params.id);
    }
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
