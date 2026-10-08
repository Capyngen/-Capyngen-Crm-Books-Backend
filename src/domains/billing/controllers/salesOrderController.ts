import { requestContext } from '../../../context';
import { Request, Response, NextFunction } from 'express';
import SalesOrder from '../models/SalesOrder';
import { CustomerBalanceService } from '../services/CustomerBalanceService';
import { SalesOrderFulfillmentService } from '../services/SalesOrderFulfillmentService';

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
    
    
    // ERP Credit Limit Validation
    if (req.body.customer) {
        const total = req.body.total || 0;
        const creditCheck = await CustomerBalanceService.validateCreditLimit(req.body.customer, total);
        if (!creditCheck.allowed) {
            return res.status(400).json({ 
                success: false, 
                message: `Credit Limit Exceeded! Transaction ${total}, Limit ${creditCheck.limit}, Available ${creditCheck.remaining}.` 
            });
        }
    }

    const salesOrder = await SalesOrder.create({ ...req.body, salesOrderNumber , companyId: (req as any).org?._id || requestContext.getStore()?.orgId || req.body.companyId, createdBy: (req as any).user?._id });
    const populated = await SalesOrder.findById(salesOrder._id).populate('customer').populate('items.item');
    
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const getSalesOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const salesOrders = await SalesOrder.find({ companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })
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
    const salesOrder = await SalesOrder.findOne({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } })
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
    const salesOrder = await SalesOrder.findOneAndUpdate({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
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
    const salesOrder = await SalesOrder.findOneAndDelete({ _id: req.params.id, companyId: (req as any).org?._id || requestContext.getStore()?.orgId || { $exists: true } });
    if (!salesOrder) {
      return res.status(404).json({ success: false, message: 'Sales Order not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const fulfillSalesOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { items } = req.body;
        const userId = (req as any).user?._id || 'system';

        const result = await SalesOrderFulfillmentService.fulfill(id, items, userId);
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};
