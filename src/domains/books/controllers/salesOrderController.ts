import { Request, Response, NextFunction } from 'express';
import SalesOrder from '../models/SalesOrder';

export const createSalesOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let salesOrderNumber = req.body.salesOrderNumber;
    
    if (!salesOrderNumber) {
      let nextNum = (await SalesOrder.countDocuments()) + 1;
      let isUnique = false;
      while (!isUnique) {
        salesOrderNumber = `SO-${String(nextNum).padStart(5, '0')}`;
        const exists = await SalesOrder.findOne({ salesOrderNumber });
        if (exists) {
          nextNum++;
        } else {
          isUnique = true;
        }
      }
    }
    
    const salesOrder = await SalesOrder.create({ ...req.body, salesOrderNumber });
    const populated = await SalesOrder.findById(salesOrder._id).populate('customer').populate('items.item');
    
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const getSalesOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const salesOrders = await SalesOrder.find()
      .populate('customer')
      .populate('items.item')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: salesOrders });
  } catch (error) {
    next(error);
  }
};

export const getSalesOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const salesOrder = await SalesOrder.findById(req.params.id)
      .populate('customer')
      .populate('items.item');
      
    if (!salesOrder) {
      return res.status(404).json({ success: false, message: 'Sales Order not found' });
    }
    res.status(200).json({ success: true, data: salesOrder });
  } catch (error) {
    next(error);
  }
};

export const updateSalesOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const salesOrder = await SalesOrder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('customer').populate('items.item');

    if (!salesOrder) {
      return res.status(404).json({ success: false, message: 'Sales Order not found' });
    }

    res.status(200).json({ success: true, data: salesOrder });
  } catch (error) {
    next(error);
  }
};

export const deleteSalesOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const salesOrder = await SalesOrder.findByIdAndDelete(req.params.id);
    if (!salesOrder) {
      return res.status(404).json({ success: false, message: 'Sales Order not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
