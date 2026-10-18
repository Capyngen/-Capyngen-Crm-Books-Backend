import { Request, Response, NextFunction } from 'express';
import { requestContext } from '../../../context';
import { PostingEngine } from '../../books/services/PostingEngine';
import VendorCredit from '../models/VendorCredit';
import { ApprovalWorkflowService } from '../../../core/services/ApprovalWorkflowService';

export const createVendorCredit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, user, userId, userRole, roleId } = await ApprovalWorkflowService.resolveUserContext(req);

    let vendorCreditNumber = req.body.vendorCreditNumber;
    if (!vendorCreditNumber) {
      const count = await VendorCredit.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
      vendorCreditNumber = `DN-${String(count + 1).padStart(5, '0')}`;
    }

    const requestedStatus = req.body.status || 'Open';
    let finalStatus = requestedStatus;
    let finalApprovalStatus = 'Approved';

    const total = Number(req.body.totalAmount || req.body.total || 0);

    if (requestedStatus === 'Draft') {
      finalStatus = 'Draft';
      finalApprovalStatus = 'Draft';
    } else {
      const evalResult = await ApprovalWorkflowService.evaluateApprovalNeed(
        orgId,
        'vendor_credits',
        total,
        user,
        userRole
      );

      if (evalResult.requiresApproval) {
        finalStatus = 'Draft';
        finalApprovalStatus = 'Pending';
      } else {
        finalStatus = 'Open';
        finalApprovalStatus = 'Approved';
      }
    }

    const vc = await VendorCredit.create({
      ...req.body,
      vendorCreditNumber,
      totalAmount: total,
      status: finalStatus,
      approvalStatus: finalApprovalStatus,
      companyId: orgId,
      orgId,
      createdBy: userId
    });

    if (finalApprovalStatus === 'Pending') {
      await ApprovalWorkflowService.submitForApproval({
        orgId,
        module: 'vendor_credits',
        documentId: vc._id.toString(),
        documentNumber: vendorCreditNumber,
        amount: total,
        customerOrVendorName: req.body.vendorName || 'Vendor',
        requestedBy: userId || 'system',
        requestedByName: user?.displayName || user?.name || user?.email,
        creatorRoleId: roleId
      });
    } else if (finalStatus !== 'Draft') {
      const payload = {
        creditId: vc._id.toString(),
        companyId: orgId,
        vendorId: vc.vendorId?.toString(),
        total
      };
      await PostingEngine.handleEvent('VENDOR_CREDIT_APPROVED', payload);
    }

    const populated = await VendorCredit.findById(vc._id).populate('vendorId', 'displayName companyName');
    res.status(201).json({ success: true, data: populated || vc });
  } catch (error) {
    next(error);
  }
};

export const getVendorCredits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter = orgId ? { $or: [{ companyId: orgId }, { orgId }] } : {};
    const docs = await VendorCredit.find(filter)
      .populate('vendorId', 'displayName companyName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    next(error);
  }
};

export const getVendorCreditById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) {
      filter.$or = [{ companyId: orgId }, { orgId }];
    }
    const doc = await VendorCredit.findOne(filter)
      .populate('vendorId', 'displayName companyName');
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Vendor Credit not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

export const updateVendorCredit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) {
      filter.$or = [{ companyId: orgId }, { orgId }];
    }
    const doc = await VendorCredit.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Vendor Credit not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

export const deleteVendorCredit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const filter: any = { _id: req.params.id };
    if (orgId) {
      filter.$or = [{ companyId: orgId }, { orgId }];
    }
    const doc = await VendorCredit.findOneAndDelete(filter);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Vendor Credit not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
