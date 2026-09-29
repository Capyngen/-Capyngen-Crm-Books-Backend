import { Request, Response, NextFunction } from 'express';
import { requestContext } from '../../../context';
import { LedgerService } from '../../books/services/ledgerService';
import { PostingEngine } from '../../books/services/PostingEngine';
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
      const payload = { creditId: vc._id?.toString(), companyId: orgId, vendorId: vc.vendorId?.toString(), total: vc.total };
      await PostingEngine.handleEvent('VENDOR_CREDIT_APPROVED', payload);
    }
    res.status(201).json({ success: true, data: vc });
  } catch (error) { next(error); }
};
