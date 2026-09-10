import { Request, Response } from 'express';
import BillingCustomer from '../models/BillingCustomer';
import BooksCustomer from '../../books/models/Customer';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const billingCustomers = await BillingCustomer.find().lean();
    const booksCustomers = await BooksCustomer.find().lean();
    
    // Add domain flag to help UI identify source if needed
    const allCustomers = [
      ...billingCustomers.map(c => ({ ...c, sourceDomain: 'billing' })),
      ...booksCustomers.map(c => ({ ...c, sourceDomain: 'books' }))
    ];

    res.json({ success: true, data: allCustomers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    let customer = await BillingCustomer.findById(req.params.id).lean();
    let sourceDomain = 'billing';
    
    if (!customer) {
      customer = await BooksCustomer.findById(req.params.id).lean();
      sourceDomain = 'books';
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, data: { ...customer, sourceDomain } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    // ALWAYS create new customers in BillingCustomer table when requested from Billing domain
    const customer = new BillingCustomer(req.body);
    await customer.save();
    res.status(201).json({ success: true, data: customer });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    // Try to update in BillingCustomer first
    let customer = await BillingCustomer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    // If not found in Billing, update in BooksCustomer
    if (!customer) {
      customer = await BooksCustomer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    let customer = await BillingCustomer.findByIdAndDelete(req.params.id);
    
    if (!customer) {
      customer = await BooksCustomer.findByIdAndDelete(req.params.id);
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
