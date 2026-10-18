import { requestContext } from '../../../context';
import { Request, Response, NextFunction } from 'express';
import DeliveryChallan from '../models/DeliveryChallan';
import Invoice from '../../billing/models/Invoice';
import { ApprovalWorkflowService } from '../../../core/services/ApprovalWorkflowService';
import { PostingEngine } from '../../books/services/PostingEngine';
import Item from '../models/Item';

export const createDeliveryChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService.resolveUserContext(req);

    let challanNumber = req.body.challanNumber;
    if (!challanNumber) {
      let nextNum = (await DeliveryChallan.countDocuments({ $or: [{ orgId }, { companyId: orgId }] })) + 1;
      let isUnique = false;
      while (!isUnique) {
        challanNumber = `DC-${String(nextNum).padStart(5, '0')}`;
        const exists = await DeliveryChallan.findOne({ challanNumber, $or: [{ orgId }, { companyId: orgId }] });
        if (exists) {
          nextNum++;
        } else {
          isUnique = true;
        }
      }
    }

    const requestedStatus = req.body.status || 'Delivered';
    let finalStatus = requestedStatus;
    let finalApprovalStatus = 'Approved';

    if (requestedStatus === 'Draft') {
      finalStatus = 'Draft';
      finalApprovalStatus = 'Draft';
    } else {
      const evalResult = await ApprovalWorkflowService.evaluateApprovalNeed(
        orgId,
        'delivery_challans',
        Number(req.body.total || 0),
        user,
        userRole
      );

      if (evalResult.requiresApproval) {
        finalStatus = 'Draft';
        finalApprovalStatus = 'Pending';
      } else {
        finalStatus = 'Delivered';
        finalApprovalStatus = 'Approved';
      }
    }

    const deliveryChallan = await DeliveryChallan.create({
      ...req.body,
      challanNumber,
      status: finalStatus,
      approvalStatus: finalApprovalStatus,
      companyId: orgId,
      orgId,
      createdBy: userId
    });

    if (finalApprovalStatus === 'Pending') {
      await ApprovalWorkflowService.submitForApproval({
        orgId,
        module: 'delivery_challans',
        documentId: deliveryChallan._id.toString(),
        documentNumber: challanNumber,
        amount: Number(req.body.total || 0),
        customerOrVendorName: req.body.customerName || 'Customer',
        requestedBy: userId || 'system',
        requestedByName: user?.displayName || user?.name || user?.email,
        creatorRoleId: roleId
      });
    } else if (finalStatus === 'Delivered') {
      // Deduct stock
      if (deliveryChallan.items && Array.isArray(deliveryChallan.items)) {
        for (const line of deliveryChallan.items) {
          if (line.item) {
            const itemDoc = await Item.findById(line.item);
            if (itemDoc && itemDoc.type !== 'service') {
              const qty = Number(line.quantity || 0);
              await Item.findByIdAndUpdate(line.item, {
                $inc: { stock: -qty, currentStock: -qty, stockQuantity: -qty }
              });
            }
          }
        }
      }

      await PostingEngine.handleEvent('DELIVERY_CHALLAN_ISSUED', {
        challanId: deliveryChallan._id.toString(),
        companyId: orgId,
        total: deliveryChallan.total || 0
      });
    }

    const populated = await DeliveryChallan.findById(deliveryChallan._id).populate('customer').populate('items.item');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryChallans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const challans = await DeliveryChallan.find(filter)
      .populate('customer')
      .populate('items.item')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: challans });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryChallanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) {
      filter.$or = [{ companyId: orgId }, { orgId }];
    }
    const challan = await DeliveryChallan.findOne(filter)
      .populate('customer')
      .populate('items.item');
      
    if (!challan) {
      return res.status(404).json({ success: false, message: 'Delivery Challan not found' });
    }
    res.status(200).json({ success: true, data: challan });
  } catch (error) {
    next(error);
  }
};

export const updateDeliveryChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) {
      filter.$or = [{ companyId: orgId }, { orgId }];
    }
    const challan = await DeliveryChallan.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true
    }).populate('customer').populate('items.item');

    if (!challan) {
      return res.status(404).json({ success: false, message: 'Delivery Challan not found' });
    }

    res.status(200).json({ success: true, data: challan });
  } catch (error) {
    next(error);
  }
};

export const deleteDeliveryChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) {
      filter.$or = [{ companyId: orgId }, { orgId }];
    }
    const challan = await DeliveryChallan.findOneAndDelete(filter);
    if (!challan) {
      return res.status(404).json({ success: false, message: 'Delivery Challan not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const convertToInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userId } = await ApprovalWorkflowService.resolveUserContext(req);
    const dc = await DeliveryChallan.findById(req.params.id);
    if (!dc) return res.status(404).json({ success: false, message: 'Delivery Challan not found' });

    let nextNum = (await Invoice.countDocuments({ $or: [{ orgId }, { companyId: orgId }] })) + 1;
    let invoiceNumber = `INV-${String(nextNum).padStart(5, '0')}`;
    while (await Invoice.findOne({ invoiceNumber, $or: [{ orgId }, { companyId: orgId }] })) {
      nextNum++;
      invoiceNumber = `INV-${String(nextNum).padStart(5, '0')}`;
    }

    const invItems = (dc.items || []).map((item: any) => ({
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
      customer: dc.customer,
      referenceNumber: dc.challanNumber,
      salesOrderId: dc.salesOrderId,
      invoiceDate: new Date(),
      items: invItems,
      subTotal: dc.subTotal,
      discountType: dc.discountType,
      discountValue: dc.discountValue,
      discount: dc.discount,
      total: dc.total,
      balanceDue: dc.total,
      notes: dc.notes,
      terms: dc.terms,
      status: 'Open',
      approvalStatus: 'Approved',
      postingStatus: 'Posted',
      createdBy: userId
    });

    dc.invoiceId = invoice._id;
    dc.status = 'Closed';
    await dc.save();

    // GL Posting for Invoice
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
