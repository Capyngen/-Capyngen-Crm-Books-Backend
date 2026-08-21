"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVendor = exports.getVendorById = exports.getVendors = exports.createVendor = void 0;
const Vendor_1 = __importDefault(require("../models/Vendor"));
// @desc    Create new Vendor
// @route   POST /api/v1/books/sales/Vendors
const createVendor = async (req, res, next) => {
    try {
        const doc = await Vendor_1.default.create(req.body);
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
        const docs = await Vendor_1.default.find().sort({ createdAt: -1 });
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
        const doc = await Vendor_1.default.findById(req.params.id);
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
        const doc = await Vendor_1.default.findByIdAndUpdate(req.params.id, req.body, {
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
