"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVendorCredit = void 0;
const context_1 = require("../../../context");
const PostingEngine_1 = require("../../books/services/PostingEngine");
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
            const payload = { creditId: vc._id?.toString(), companyId: orgId, vendorId: vc.vendorId?.toString(), total: vc.total };
            await PostingEngine_1.PostingEngine.handleEvent('VENDOR_CREDIT_APPROVED', payload);
        }
        res.status(201).json({ success: true, data: vc });
    }
    catch (error) {
        next(error);
    }
};
exports.createVendorCredit = createVendorCredit;
