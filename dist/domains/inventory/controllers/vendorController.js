"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorStatement = exports.getVendorTransactions = exports.deleteVendor = exports.updateVendorOnboarding = exports.updateVendor = exports.getVendorById = exports.getVendors = exports.createVendor = void 0;
const context_1 = require("../../../context");
const Vendor_1 = __importDefault(require("../models/Vendor"));
const Bill_1 = __importDefault(require("../models/Bill"));
const PurchaseOrder_1 = __importDefault(require("../models/PurchaseOrder"));
const PaymentMade_1 = __importDefault(require("../../books/models/PaymentMade"));
const VendorCredit_1 = __importDefault(require("../models/VendorCredit"));
// @desc    Create new Vendor
// @route   POST /api/v1/books/sales/Vendors
const createVendor = async (req, res, next) => {
    try {
        const orgId2 = req.org?._id || context_1.requestContext.getStore()?.orgId;
        const doc = await Vendor_1.default.create({ ...req.body, orgId: orgId2 || req.body.orgId, companyId: orgId2 || req.body.companyId, createdBy: req.user?._id });
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.createVendor = createVendor;
const tenantFilter_1 = require("../../../core/utils/tenantFilter");
// @desc    Get all Vendors
// @route   GET /api/v1/books/sales/Vendors
const getVendors = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const docs = await Vendor_1.default.find(tenantFilter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        next(error);
    }
};
exports.getVendors = getVendors;
// @desc    Get single Vendor
// @route   GET /api/v1/books/sales/Vendors/:id
const getVendorById = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = Object.keys(tenantFilter).length > 0
            ? { _id: req.params.id, ...tenantFilter }
            : { _id: req.params.id };
        const doc = await Vendor_1.default.findOne(filter);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.getVendorById = getVendorById;
// @desc    Update Vendor
// @route   PUT /api/v1/books/sales/Vendors/:id
const updateVendor = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = Object.keys(tenantFilter).length > 0
            ? { _id: req.params.id, ...tenantFilter }
            : { _id: req.params.id };
        const doc = await Vendor_1.default.findOneAndUpdate(filter, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.updateVendor = updateVendor;
const VendorOnboardingService_1 = require("../services/VendorOnboardingService");
const updateVendorOnboarding = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const vendor = await VendorOnboardingService_1.VendorOnboardingService.updateOnboardingStatus(req.params.id, status, 'system-user', notes);
        res.status(200).json({ success: true, data: vendor });
    }
    catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};
exports.updateVendorOnboarding = updateVendorOnboarding;
const deleteVendor = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = Object.keys(tenantFilter).length > 0
            ? { _id: req.params.id, ...tenantFilter }
            : { _id: req.params.id };
        const doc = await Vendor_1.default.findOneAndDelete(filter);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteVendor = deleteVendor;
const getVendorTransactions = async (req, res, next) => {
    try {
        const vendorId = req.params.id;
        const vendor = await Vendor_1.default.findById(vendorId).lean();
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }
        const [bills, purchaseOrders, paymentsMade, vendorCredits] = await Promise.all([
            Bill_1.default.find({ vendorId }).sort({ billDate: -1 }).lean(),
            PurchaseOrder_1.default.find({ vendorId }).sort({ orderDate: -1 }).lean(),
            PaymentMade_1.default.find({ vendorId }).sort({ paymentDate: -1 }).lean(),
            VendorCredit_1.default.find({ vendorId }).sort({ creditDate: -1 }).lean()
        ]);
        res.status(200).json({
            success: true,
            data: {
                bills,
                purchaseOrders,
                paymentsMade,
                vendorCredits
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getVendorTransactions = getVendorTransactions;
const getVendorStatement = async (req, res, next) => {
    try {
        const vendorId = req.params.id;
        const vendor = await Vendor_1.default.findById(vendorId).lean();
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        const [bills, payments, vendorCredits] = await Promise.all([
            Bill_1.default.find({ vendorId, billDate: { $gte: start, $lte: end }, status: { $ne: 'Draft' } }).lean(),
            PaymentMade_1.default.find({ vendorId, paymentDate: { $gte: start, $lte: end } }).lean(),
            VendorCredit_1.default.find({ vendorId, creditDate: { $gte: start, $lte: end }, status: { $ne: 'Draft' } }).lean()
        ]);
        const openingBalance = Number(vendor.openingBalance || 0);
        const statementLines = [];
        // Bills are Credits to Vendor (increase company payable liability)
        bills.forEach(b => {
            statementLines.push({
                date: b.billDate,
                type: 'Bill',
                reference: b.billNumber,
                details: `Vendor Bill #${b.billNumber}`,
                debit: 0,
                credit: Number(b.totalAmount || b.total || 0)
            });
        });
        // Payments Made are Debits to Vendor (reduce company liability)
        payments.forEach(pmt => {
            statementLines.push({
                date: pmt.paymentDate,
                type: 'Payment Made',
                reference: pmt.paymentNumber,
                details: `Disbursement #${pmt.paymentNumber} via ${pmt.paidThrough || pmt.paymentMode || 'Bank'}`,
                debit: Number(pmt.amount || 0),
                credit: 0
            });
        });
        // Vendor Credits are Debits to Vendor (reduce company liability)
        vendorCredits.forEach(vc => {
            statementLines.push({
                date: vc.creditDate,
                type: 'Vendor Credit',
                reference: vc.vendorCreditNumber,
                details: `Vendor Debit Note #${vc.vendorCreditNumber}`,
                debit: Number(vc.totalAmount || vc.total || 0),
                credit: 0
            });
        });
        // Sort chronologically
        statementLines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let runningBalance = openingBalance;
        let totalDebit = 0;
        let totalCredit = 0;
        const transactions = statementLines.map(line => {
            runningBalance = runningBalance + line.credit - line.debit;
            totalDebit += line.debit;
            totalCredit += line.credit;
            return {
                ...line,
                balance: Math.round(runningBalance * 100) / 100
            };
        });
        res.status(200).json({
            success: true,
            data: {
                vendor: {
                    id: vendor._id,
                    name: vendor.displayName || vendor.companyName,
                    companyName: vendor.companyName,
                    email: vendor.email,
                    phone: vendor.phone,
                    currency: vendor.currency || 'INR',
                    billingAddress: vendor.billingAddress
                },
                period: {
                    startDate: start,
                    endDate: end
                },
                openingBalance,
                totalDebit: Math.round(totalDebit * 100) / 100,
                totalCredit: Math.round(totalCredit * 100) / 100,
                closingBalance: Math.round(runningBalance * 100) / 100,
                transactions
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getVendorStatement = getVendorStatement;
