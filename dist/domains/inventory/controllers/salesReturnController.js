"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveAndRestock = exports.deleteSalesReturn = exports.updateSalesReturn = exports.createSalesReturn = exports.getSalesReturnById = exports.getSalesReturns = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const SalesReturn_1 = __importDefault(require("../models/SalesReturn"));
const tenantFilter_1 = require("../../../core/utils/tenantFilter");
const getSalesReturns = async (req, res) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const { status, search, page = 1, limit = 50 } = req.query;
        const filter = { ...tenantFilter };
        if (status && status !== 'All') {
            filter.status = status;
        }
        if (search) {
            filter.$or = [
                { rmaNumber: { $regex: String(search), $options: 'i' } },
                { customerName: { $regex: String(search), $options: 'i' } },
                { salesOrderNumber: { $regex: String(search), $options: 'i' } }
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [returns, total] = await Promise.all([
            SalesReturn_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
            SalesReturn_1.default.countDocuments(filter)
        ]);
        res.json({
            success: true,
            count: returns.length,
            total,
            data: returns
        });
    }
    catch (error) {
        console.error('Error fetching sales returns:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.getSalesReturns = getSalesReturns;
const getSalesReturnById = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const sReturn = await SalesReturn_1.default.findOne({ _id: id, ...tenantFilter }).lean();
        if (!sReturn) {
            return res.status(404).json({ success: false, message: 'Sales return not found' });
        }
        res.json({ success: true, data: sReturn });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.getSalesReturnById = getSalesReturnById;
const createSalesReturn = async (req, res) => {
    try {
        const orgId = req.org?._id || req.user?.companyId || req.headers?.['x-organization-id'] || req.headers?.['x-company-id'];
        const orgIdStr = orgId ? orgId.toString() : '';
        const orgIdObj = (orgIdStr && mongoose_1.default.Types.ObjectId.isValid(orgIdStr)) ? new mongoose_1.default.Types.ObjectId(orgIdStr) : null;
        const data = req.body;
        if (!data.rmaNumber) {
            const year = new Date().getFullYear();
            const count = await SalesReturn_1.default.countDocuments({ $or: [{ orgId: orgIdStr }, { companyId: orgIdObj }] });
            data.rmaNumber = `RMA-${year}-${String(count + 1).padStart(4, '0')}`;
        }
        data.companyId = orgIdObj || orgIdStr;
        data.orgId = orgIdStr;
        // Default item if none provided
        if (!data.items || !data.items.length) {
            data.items = [{
                    name: data.item || 'Returned Item',
                    quantity: data.returnQty || 1,
                    condition: data.condition || 'Restockable (Good)'
                }];
        }
        const newReturn = new SalesReturn_1.default(data);
        await newReturn.save();
        res.status(201).json({ success: true, data: newReturn });
    }
    catch (error) {
        console.error('Error creating sales return:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.createSalesReturn = createSalesReturn;
const updateSalesReturn = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const updated = await SalesReturn_1.default.findOneAndUpdate({ _id: id, ...tenantFilter }, { $set: req.body }, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Sales return not found' });
        }
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.updateSalesReturn = updateSalesReturn;
const deleteSalesReturn = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const deleted = await SalesReturn_1.default.findOneAndDelete({ _id: id, ...tenantFilter });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Sales return not found' });
        }
        res.json({ success: true, message: 'Sales return removed' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.deleteSalesReturn = deleteSalesReturn;
const receiveAndRestock = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const userEmail = req.user?.email || 'System';
        const sReturn = await SalesReturn_1.default.findOne({ _id: id, ...tenantFilter });
        if (!sReturn) {
            return res.status(404).json({ success: false, message: 'Sales return not found' });
        }
        sReturn.status = 'Received & Restocked';
        sReturn.receivedBy = userEmail;
        sReturn.receivedAt = new Date();
        await sReturn.save();
        res.json({
            success: true,
            message: 'Items received, inspected, and restocked into inventory',
            data: sReturn
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.receiveAndRestock = receiveAndRestock;
