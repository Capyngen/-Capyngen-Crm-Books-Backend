"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVendorOnboarding = exports.updateVendor = exports.getVendorById = exports.getVendors = exports.createVendor = void 0;
const context_1 = require("../../../context");
const Vendor_1 = __importDefault(require("../models/Vendor"));
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
// @desc    Get all Vendors
// @route   GET /api/v1/books/sales/Vendors
const getVendors = async (req, res, next) => {
    try {
        const orgId = req.org?._id || context_1.requestContext.getStore()?.orgId;
        const filter = orgId ? { $or: [{ companyId: orgId }, { orgId: orgId }] } : {};
        const docs = await Vendor_1.default.find(filter).sort({ createdAt: -1 });
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
    console.log('HIT getVendorById', req.params.id);
    try {
        const orgId = req.org?._id || context_1.requestContext.getStore()?.orgId;
        const filter = { _id: req.params.id };
        if (orgId)
            filter.companyId = orgId;
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
        const doc = await Vendor_1.default.findOneAndUpdate({ _id: req.params.id, companyId: req.org?._id || context_1.requestContext.getStore()?.orgId || { $exists: true } }, req.body, {
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
