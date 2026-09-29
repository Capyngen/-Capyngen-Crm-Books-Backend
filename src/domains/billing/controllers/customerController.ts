import { requestContext } from '../../../context';
import { LedgerService } from '../../books/services/ledgerService';
import { PostingEngine } from '../../books/services/PostingEngine';
import { Request, Response, NextFunction } from 'express';
import Customer from '../models/Customer';

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || requestContext.getStore()?.orgId;
    const payload = {
      ...req.body,
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

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || requestContext.getStore()?.orgId;
    const filter = orgId ? { companyId: orgId } : {};

    const customers = await Customer.find(filter).sort({ createdAt: -1 }).lean();
    
    res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id || requestContext.getStore()?.orgId;
    const filter = orgId ? { _id: req.params.id, companyId: orgId } : { _id: req.params.id };

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
    const orgId = (req as any).org?._id || requestContext.getStore()?.orgId;
    const filter = orgId ? { _id: req.params.id, companyId: orgId } : { _id: req.params.id };

    const customer = await Customer.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });

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
    const orgId = (req as any).org?._id || requestContext.getStore()?.orgId;
    const filter = orgId ? { _id: req.params.id, companyId: orgId } : { _id: req.params.id };

    const customer = await Customer.findOneAndDelete(filter);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
