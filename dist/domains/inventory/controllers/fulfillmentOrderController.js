"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFulfillment = exports.advanceStage = exports.updateFulfillment = exports.createFulfillment = exports.getFulfillmentById = exports.getFulfillments = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const FulfillmentOrder_1 = __importDefault(require("../models/FulfillmentOrder"));
const SalesOrder_1 = __importDefault(require("../../billing/models/SalesOrder"));
const tenantFilter_1 = require("../../../core/utils/tenantFilter");
const getFulfillments = async (req, res) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const { stage, priority, search, page = 1, limit = 50 } = req.query;
        const filter = { ...tenantFilter };
        if (stage && stage !== 'All') {
            filter.stage = stage;
        }
        if (priority) {
            filter.priority = priority;
        }
        if (search) {
            filter.$or = [
                { waveNumber: { $regex: String(search), $options: 'i' } },
                { salesOrderNumber: { $regex: String(search), $options: 'i' } },
                { customerName: { $regex: String(search), $options: 'i' } }
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [orders, total] = await Promise.all([
            FulfillmentOrder_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
            FulfillmentOrder_1.default.countDocuments(filter)
        ]);
        res.json({
            success: true,
            count: orders.length,
            total,
            data: orders
        });
    }
    catch (error) {
        console.error('Error fetching fulfillments:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.getFulfillments = getFulfillments;
const getFulfillmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const order = await FulfillmentOrder_1.default.findOne({ _id: id, ...tenantFilter }).lean();
        if (!order) {
            return res.status(404).json({ success: false, message: 'Fulfillment order not found' });
        }
        res.json({ success: true, data: order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.getFulfillmentById = getFulfillmentById;
const createFulfillment = async (req, res) => {
    try {
        const orgId = req.org?._id || req.user?.companyId || req.headers?.['x-organization-id'] || req.headers?.['x-company-id'];
        const orgIdStr = orgId ? orgId.toString() : '';
        const orgIdObj = (orgIdStr && mongoose_1.default.Types.ObjectId.isValid(orgIdStr)) ? new mongoose_1.default.Types.ObjectId(orgIdStr) : null;
        const data = req.body;
        if (!data.waveNumber) {
            const year = new Date().getFullYear();
            const count = await FulfillmentOrder_1.default.countDocuments({ $or: [{ orgId: orgIdStr }, { companyId: orgIdObj }] });
            data.waveNumber = `WAVE-${year}-${String(count + 1).padStart(4, '0')}`;
        }
        data.companyId = orgIdObj || orgIdStr;
        data.orgId = orgIdStr;
        const newOrder = new FulfillmentOrder_1.default(data);
        await newOrder.save();
        // Optionally update linked sales order
        if (data.salesOrderNumber || data.salesOrderId) {
            try {
                const query = data.salesOrderId ? { _id: data.salesOrderId } : { salesOrderNumber: data.salesOrderNumber };
                await SalesOrder_1.default.updateOne(query, { $set: { fulfillmentStatus: 'Partially Fulfilled' } });
            }
            catch (e) {
                console.warn('Could not update sales order status from fulfillment:', e);
            }
        }
        res.status(201).json({ success: true, data: newOrder });
    }
    catch (error) {
        console.error('Error creating fulfillment order:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.createFulfillment = createFulfillment;
const updateFulfillment = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const updated = await FulfillmentOrder_1.default.findOneAndUpdate({ _id: id, ...tenantFilter }, { $set: req.body }, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Fulfillment order not found' });
        }
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.updateFulfillment = updateFulfillment;
const advanceStage = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const order = await FulfillmentOrder_1.default.findOne({ _id: id, ...tenantFilter });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Fulfillment order not found' });
        }
        const nextStageMap = {
            'To Pick': 'Picked',
            'Picked': 'Packed',
            'Packed': 'Shipped',
            'Shipped': 'Shipped'
        };
        const nextStage = nextStageMap[order.stage] || 'Picked';
        order.stage = nextStage;
        await order.save();
        // If Shipped, update sales order to Fulfilled
        if (nextStage === 'Shipped' && order.salesOrderNumber) {
            try {
                await SalesOrder_1.default.updateOne({ salesOrderNumber: order.salesOrderNumber }, { $set: { fulfillmentStatus: 'Fulfilled', status: 'Fulfilled' } });
            }
            catch (e) {
                console.warn('Could not mark sales order as Fulfilled:', e);
            }
        }
        res.json({
            success: true,
            message: `Fulfillment advanced to stage ${nextStage}`,
            data: order
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.advanceStage = advanceStage;
const deleteFulfillment = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const deleted = await FulfillmentOrder_1.default.findOneAndDelete({ _id: id, ...tenantFilter });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Fulfillment order not found' });
        }
        res.json({ success: true, message: 'Fulfillment order deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.deleteFulfillment = deleteFulfillment;
