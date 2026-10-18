import { requestContext } from '../../../context';
import { Request, Response, NextFunction } from 'express';
import SalesOrder from '../models/SalesOrder';
import Invoice from '../models/Invoice';
import DeliveryChallan from '../../inventory/models/DeliveryChallan';
import { CustomerBalanceService } from '../services/CustomerBalanceService';
import { SalesOrderFulfillmentService } from '../services/SalesOrderFulfillmentService';
import { ApprovalWorkflowService } from '../../../core/services/ApprovalWorkflowService';
import { PostingEngine } from '../../books/services/PostingEngine';
import Item from '../../inventory/models/Item';

export const createSalesOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService.resolveUserContext(req);

    let salesOrderNumber = req.body.salesOrderNumber;
    
    if (!salesOrderNumber) {
      let nextNum = (await SalesOrder.countDocuments()) + 1;
      let isUnique = false;
      while (!isUnique) {
        salesOrderNumber = `SO-${String(nextNum).padStart(5, '0')}`;
        const exists = await SalesOrder.findOne({ salesOrderNumber, $or: [{ orgId }, { companyId: orgId }] });
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

    const requestedStatus = req.body.status || 'Confirmed';
    let finalStatus = requestedStatus;
    let finalApprovalStatus = 'Approved';

    if (requestedStatus === 'Draft') {
      finalStatus = 'Draft';
      finalApprovalStatus = 'Draft';
    } else {
      const evalResult = await ApprovalWorkflowService.evaluateApprovalNeed(
        orgId,
        'sales_orders',
        Number(req.body.total || 0),
        user,
        userRole
      );

      if (evalResult.requiresApproval) {
        finalStatus = 'Draft';
        finalApprovalStatus = 'Pending';
      } else {
        finalStatus = 'Confirmed';
        finalApprovalStatus = 'Approved';
      }
    }

    const salesOrder = await SalesOrder.create({
      ...req.body,
      salesOrderNumber,
      status: finalStatus,
      approvalStatus: finalApprovalStatus,
      companyId: orgId,
      orgId,
      createdBy: userId
    });

    if (finalApprovalStatus === 'Pending') {
      await ApprovalWorkflowService.submitForApproval({
        orgId,
        module: 'sales_orders',
        documentId: salesOrder._id.toString(),
        documentNumber: salesOrderNumber,
        amount: Number(req.body.total || 0),
        customerOrVendorName: req.body.customerName || 'Customer',
        requestedBy: userId || 'system',
        requestedByName: user?.displayName || user?.name || user?.email,
        creatorRoleId: roleId
      });
    } else if (finalStatus === 'Confirmed') {
      // Increment committed stock
      if (salesOrder.items && Array.isArray(salesOrder.items)) {
        for (const line of salesOrder.items) {
          if (line.item) {
            const qty = Number(line.quantity || 0);
            await Item.findByIdAndUpdate(line.item, {
              $inc: { committedStock: qty }
            });
          }
        }
      }
    }

    const populated = await SalesOrder.findById(salesOrder._id).populate('customer').populate('items.item');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const getSalesOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const salesOrders = await SalesOrder.find(filter)
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
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) {
      filter.$or = [{ companyId: orgId }, { orgId }];
    }
    const salesOrder = await SalesOrder.findOne(filter)
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

        const result = await SalesOrderFulfillmentService.fulfill(id as string, items, userId);
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const convertToDeliveryChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userId } = await ApprovalWorkflowService.resolveUserContext(req);
    const so = await SalesOrder.findById(req.params.id);
    if (!so) return res.status(404).json({ success: false, message: 'Sales Order not found' });

    let nextNum = (await DeliveryChallan.countDocuments({ $or: [{ orgId }, { companyId: orgId }] })) + 1;
    let challanNumber = `DC-${String(nextNum).padStart(5, '0')}`;
    while (await DeliveryChallan.findOne({ challanNumber, $or: [{ orgId }, { companyId: orgId }] })) {
      nextNum++;
      challanNumber = `DC-${String(nextNum).padStart(5, '0')}`;
    }

    const dcItems = (so.items || []).map(item => ({
      item: item.item,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount
    }));

    const dc = await DeliveryChallan.create({
      orgId,
      companyId: orgId,
      challanNumber,
      customer: so.customer,
      salesOrderId: so._id,
      referenceNumber: so.salesOrderNumber,
      challanDate: new Date(),
      items: dcItems,
      subTotal: so.subTotal,
      discountType: so.discountType,
      discountValue: so.discountValue,
      discount: so.discount,
      total: so.total,
      notes: so.notes,
      terms: so.terms,
      status: 'Delivered',
      approvalStatus: 'Approved',
      createdBy: userId
    });

    // Physical stock deduction & release committed stock
    for (const line of dcItems) {
      if (line.item) {
        const qty = Number(line.quantity || 0);
        await Item.findByIdAndUpdate(line.item, {
          $inc: { stock: -qty, currentStock: -qty, stockQuantity: -qty, committedStock: -qty }
        });
      }
    }

    // Post COGS GL entry
    await PostingEngine.handleEvent('DELIVERY_CHALLAN_ISSUED', {
      challanId: dc._id.toString(),
      companyId: orgId,
      total: dc.total || 0,
      challanDate: dc.challanDate
    });

    const populated = await DeliveryChallan.findById(dc._id).populate('customer').populate('items.item');
    res.status(201).json({ success: true, data: populated || dc });
  } catch (error) {
    next(error);
  }
};

export const convertToInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userId } = await ApprovalWorkflowService.resolveUserContext(req);
    const so = await SalesOrder.findById(req.params.id);
    if (!so) return res.status(404).json({ success: false, message: 'Sales Order not found' });

    let nextNum = (await Invoice.countDocuments({ $or: [{ orgId }, { companyId: orgId }] })) + 1;
    let invoiceNumber = `INV-${String(nextNum).padStart(5, '0')}`;
    while (await Invoice.findOne({ invoiceNumber, $or: [{ orgId }, { companyId: orgId }] })) {
      nextNum++;
      invoiceNumber = `INV-${String(nextNum).padStart(5, '0')}`;
    }

    const invItems = (so.items || []).map(item => ({
      item: item.item,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount
    }));

    const invoice = await Invoice.create({
      orgId,
      companyId: orgId,
      invoiceNumber,
      customer: so.customer,
      salesOrderId: so._id,
      referenceNumber: so.salesOrderNumber,
      invoiceDate: new Date(),
      items: invItems,
      subTotal: so.subTotal,
      discountType: so.discountType,
      discountValue: so.discountValue,
      discount: so.discount,
      taxTotal: so.taxTotal,
      total: so.total,
      balanceDue: so.total,
      notes: so.notes,
      terms: so.terms,
      status: 'Open',
      approvalStatus: 'Approved',
      postingStatus: 'Posted',
      createdBy: userId
    });

    so.status = 'Invoiced';
    await so.save();

    // GL Posting
    await PostingEngine.handleEvent('INVOICE_APPROVED', {
      invoiceId: invoice._id.toString(),
      companyId: orgId,
      customerId: invoice.customer?.toString(),
      subTotal: invoice.subTotal || 0,
      taxTotal: invoice.taxTotal || 0,
      grandTotal: invoice.total || 0,
      invoiceDate: invoice.invoiceDate,
      invoiceNumber: invoice.invoiceNumber
    });

    const populated = await Invoice.findById(invoice._id).populate('customer').populate('items.item');
    res.status(201).json({ success: true, data: populated || invoice });
  } catch (error) {
    next(error);
  }
};
