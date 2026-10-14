"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVendorCredit = void 0;
const context_1 = require("../../../context");
const ledgerService_1 = require("../services/ledgerService");
// Assuming it exists
// If VendorCredit model doesn't exist, we will mock it for now.
const createVendorCredit = async (req, res, next) => {
    try {
        const vc = req.body;
        // ... DB save ...
        // Ledger Entry
        if (vc.status !== 'Draft') {
            const orgId = context_1.requestContext.getStore()?.orgId || 'SYSTEM';
            const cogsEstimate = (vc.subTotal || 0); // entire subTotal is inventory
            await ledgerService_1.LedgerService.postTransaction(orgId, vc._id?.toString() || 'vc_tmp', 'Vendor Credit', vc.vendorCreditDate || new Date(), [
                { accountId: 'Accounts Payable', debit: vc.total, contactId: vc.vendorId?.toString() },
                { accountId: 'Inventory Asset', credit: cogsEstimate },
                { accountId: 'Tax Paid', credit: vc.taxTotal || 0 }
            ]);
        }
        res.status(201).json({ success: true, data: vc });
    }
    catch (error) {
        next(error);
    }
};
exports.createVendorCredit = createVendorCredit;
