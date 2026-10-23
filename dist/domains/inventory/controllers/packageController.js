"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePackage = exports.updatePackage = exports.createPackage = exports.getPackageById = exports.getPackages = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Package_1 = __importDefault(require("../models/Package"));
const SalesOrder_1 = __importDefault(require("../../billing/models/SalesOrder"));
const tenantFilter_1 = require("../../../core/utils/tenantFilter");
const getPackages = async (req, res) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const packages = await Package_1.default.find(tenantFilter).sort({ createdAt: -1 }).lean();
        res.json({ success: true, data: packages });
    }
    catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.getPackages = getPackages;
const getPackageById = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const pkg = await Package_1.default.findOne({ _id: id, ...tenantFilter }).lean();
        if (!pkg) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }
        res.json({ success: true, data: pkg });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.getPackageById = getPackageById;
const createPackage = async (req, res) => {
    try {
        const orgId = req.org?._id || req.user?.companyId || req.headers?.['x-organization-id'] || req.headers?.['x-company-id'];
        const orgIdStr = orgId ? orgId.toString() : '';
        const orgIdObj = (orgIdStr && mongoose_1.default.Types.ObjectId.isValid(orgIdStr)) ? new mongoose_1.default.Types.ObjectId(orgIdStr) : null;
        const data = req.body;
        if (!data.packageNumber) {
            data.packageNumber = `PKG-${Date.now().toString().slice(-6)}`;
        }
        data.companyId = orgIdObj || orgIdStr;
        data.orgId = orgIdStr;
        const newPackage = new Package_1.default(data);
        await newPackage.save();
        // If linked to a Sales Order, update fulfillment or packed status
        if (data.salesOrderId || data.salesOrderNumber) {
            try {
                const query = data.salesOrderId
                    ? { _id: data.salesOrderId }
                    : { salesOrderNumber: data.salesOrderNumber };
                await SalesOrder_1.default.updateOne(query, {
                    $set: { fulfillmentStatus: 'Partially Fulfilled' }
                });
            }
            catch (e) {
                console.warn('Could not update sales order fulfillment status:', e);
            }
        }
        res.status(201).json({ success: true, data: newPackage });
    }
    catch (error) {
        console.error('Error creating package:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.createPackage = createPackage;
const updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const updated = await Package_1.default.findOneAndUpdate({ _id: id, ...tenantFilter }, { $set: req.body }, { new: true }).lean();
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.updatePackage = updatePackage;
const deletePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const deleted = await Package_1.default.findOneAndDelete({ _id: id, ...tenantFilter });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }
        res.json({ success: true, message: 'Package deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.deletePackage = deletePackage;
