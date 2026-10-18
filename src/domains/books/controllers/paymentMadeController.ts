import { Request, Response, NextFunction } from 'express';
import { requestContext } from '../../../context';
import PaymentMade from '../models/PaymentMade';
import Bill from '../../inventory/models/Bill';
import { PostingEngine } from '../services/PostingEngine';
import { ApprovalWorkflowService } from '../../../core/services/ApprovalWorkflowService';

export const createPaymentMade = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService.resolveUserContext(req);

    let paymentNumber = req.body.paymentNumber;
    if (!paymentNumber) {
      const count = await PaymentMade.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
      paymentNumber = `PMT-${String(count + 1).padStart(5, '0')}`;
    }

    const requestedStatus = req.body.status || 'Closed';
    let finalStatus = requestedStatus;
    let finalApprovalStatus = 'Approved';
    const amount = Number(req.body.amount || 0);

    const evalResult = await ApprovalWorkflowService.evaluateApprovalNeed(
      orgId,
      'payments_made',
      amount,
      user,
      userRole
    );

    if (evalResult.requiresApproval) {
      finalStatus = 'Open';
      finalApprovalStatus = 'Pending';
    } else {
      finalStatus = 'Closed';
      finalApprovalStatus = 'Approved';
    }

    const doc = await PaymentMade.create({
      ...req.body,
      paymentNumber,
      status: finalStatus,
      approvalStatus: finalApprovalStatus,
      companyId: orgId,
      orgId,
      createdBy: userId
    });

    if (finalApprovalStatus === 'Pending') {
      await ApprovalWorkflowService.submitForApproval({
        orgId,
        module: 'payments_made',
        documentId: doc._id.toString(),
        documentNumber: paymentNumber,
        amount,
        customerOrVendorName: req.body.vendorName || 'Vendor',
        requestedBy: userId || 'system',
        requestedByName: user?.displayName || user?.name || user?.email,
        creatorRoleId: roleId
      });
    } else if (finalStatus === 'Closed') {
      // 1. Post to General Ledger
      await PostingEngine.handleEvent('PAYMENT_MADE', {
        paymentId: doc._id.toString(),
        companyId: orgId,
        vendorId: doc.vendorId?.toString(),
        amount: doc.amount,
        paymentMode: doc.paymentMode,
        paidThrough: doc.paidThrough,
        referenceNumber: doc.referenceNumber
      });

      // 2. Reduce bill balances if linked
      if (doc.bills && Array.isArray(doc.bills)) {
        for (const b of doc.bills) {
          if (b.billId && b.amountApplied) {
            const billDoc = await Bill.findById(b.billId);
            if (billDoc) {
              const currentBalance = billDoc.balanceDue ?? billDoc.total;
              const newBalance = Math.max(0, currentBalance - b.amountApplied);
              billDoc.balanceDue = newBalance;
              if (newBalance === 0) {
                billDoc.status = 'Paid';
              }
              await billDoc.save();
            }
          }
        }
      }
    }

    const populated = await PaymentMade.findById(doc._id)
      .populate('vendorId', 'displayName companyName')
      .populate('bills.billId', 'billNumber billDate total balanceDue');

    res.status(201).json({ success: true, data: populated || doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPaymentsMade = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const docs = await PaymentMade.find(filter)
      .populate('vendorId', 'displayName companyName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPaymentMadeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) {
      filter.$or = [{ companyId: orgId }, { orgId }];
    }
    const doc = await PaymentMade.findOne(filter)
      .populate('vendorId', 'displayName email phone')
      .populate('bills.billId', 'billNumber billDate total balanceDue');
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePaymentMade = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) {
      filter.$or = [{ companyId: orgId }, { orgId }];
    }
    const doc = await PaymentMade.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePaymentMade = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) {
      filter.$or = [{ companyId: orgId }, { orgId }];
    }
    const doc = await PaymentMade.findOneAndDelete(filter);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Process Disbursement
export const processDisbursement = async (req: any, res: any, next: any) => {
  try {
    const orgId = req.org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];
    const doc = await PaymentMade.findOne(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    doc.disbursementStatus = 'Processed';
    await doc.save();
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

// @desc    Send Remittance Advice
export const sendRemittanceAdvice = async (req: any, res: any, next: any) => {
  try {
    const orgId = req.org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) filter.$or = [{ companyId: orgId }, { orgId }];
    const doc = await PaymentMade.findOne(filter);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    doc.remittanceAdviceSent = true;
    await doc.save();
    res.status(200).json({ success: true, data: doc, message: 'Remittance advice sent to vendor' });
  } catch (error) { next(error); }
};
