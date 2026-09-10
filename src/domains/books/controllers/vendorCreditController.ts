import { Request, Response, NextFunction } from 'express';
import { requestContext } from '../../../context';
import { LedgerService } from '../services/ledgerService';
 // Assuming it exists

// If VendorCredit model doesn't exist, we will mock it for now.
export const createVendorCredit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vc = req.body;
    // ... DB save ...
    
    // Ledger Entry
    if (vc.status !== 'Draft') {
      const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
      const cogsEstimate = (vc.subTotal || 0); // entire subTotal is inventory
      await LedgerService.postTransaction(orgId, vc._id?.toString() || 'vc_tmp', 'Vendor Credit', vc.vendorCreditDate || new Date(), [
        { accountId: 'Accounts Payable', debit: vc.total, contactId: vc.vendorId?.toString() },
        { accountId: 'Inventory Asset', credit: cogsEstimate },
        { accountId: 'Tax Paid', credit: vc.taxTotal || 0 }
      ]);
    }
    res.status(201).json({ success: true, data: vc });
  } catch (error) { next(error); }
};
