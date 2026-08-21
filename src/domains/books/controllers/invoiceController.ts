import { Request, Response, NextFunction } from 'express';
import Invoice from '../models/Invoice';

export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let invoiceNumber = req.body.invoiceNumber;
    
    if (!invoiceNumber) {
      let nextNum = (await Invoice.countDocuments()) + 1;
      let isUnique = false;
      while (!isUnique) {
        invoiceNumber = `INV-${String(nextNum).padStart(5, '0')}`;
        const exists = await Invoice.findOne({ invoiceNumber });
        if (exists) {
          nextNum++;
        } else {
          isUnique = true;
        }
      }
    }
    
    // Balance due is initially the total amount
    const balanceDue = req.body.total || 0;
    
    const invoice = await Invoice.create({ ...req.body, invoiceNumber, balanceDue });
    const populated = await Invoice.findById(invoice._id).populate('customer').populate('items.item');
    
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const getInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoices = await Invoice.find()
      .populate('customer')
      .populate('items.item')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer')
      .populate('items.item');
      
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

export const updateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Note: In a real ERP, changing the total of an invoice should recalculate balanceDue 
    // by subtracting any applied payments. For now, we'll assume editing only happens when unpaid.
    if (req.body.total !== undefined) {
       req.body.balanceDue = req.body.total; // Simple assumption for now
    }

    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('customer').populate('items.item');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

export const deleteInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
