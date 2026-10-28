"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPurchaseReceive = exports.getPurchaseReceiveById = exports.getPurchaseReceives = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tenantFilter_1 = require("../../../core/utils/tenantFilter");
const getPurchaseReceives = async (req, res, next) => {
    try {
        const db = mongoose_1.default.connection.db;
        if (!db)
            return res.status(500).json({ success: false, message: 'DB connection unavailable' });
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const docs = await db.collection('purchasereceives').find(tenantFilter).sort({ createdAt: -1 }).toArray();
        // Map fields for frontend consumption
        const mapped = docs.map(d => ({
            _id: d._id.toString(),
            id: d._id.toString(),
            grnNumber: d.grnNumber || d.receiveNumber || `GRN-${d._id.toString().slice(-4).toUpperCase()}`,
            receiveNumber: d.receiveNumber || d.grnNumber,
            poNumber: d.poNumber || 'PO-SPINNY-001',
            vendor: d.vendorName || d.vendor || 'Supplier',
            vendorName: d.vendorName || d.vendor,
            warehouse: d.warehouseName || d.warehouse || 'Spinny Central Fulfillment Hub',
            warehouseName: d.warehouseName || d.warehouse,
            receivedQty: Number(d.receivedQty || d.items?.[0]?.quantityReceived || 50),
            qcStatus: d.qcStatus || 'QC Passed',
            status: d.status || 'Received',
            date: d.date || (d.receiveDate ? new Date(d.receiveDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
            items: d.items || [],
            createdAt: d.createdAt
        }));
        res.status(200).json({ success: true, count: mapped.length, data: mapped });
    }
    catch (error) {
        next(error);
    }
};
exports.getPurchaseReceives = getPurchaseReceives;
const getPurchaseReceiveById = async (req, res, next) => {
    try {
        const db = mongoose_1.default.connection.db;
        if (!db)
            return res.status(500).json({ success: false, message: 'DB connection unavailable' });
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const idStr = String(req.params.id);
        const query = {
            $or: [
                mongoose_1.default.isValidObjectId(idStr) ? { _id: new mongoose_1.default.Types.ObjectId(idStr) } : null,
                { _id: idStr },
                { id: idStr },
                { grnNumber: idStr }
            ].filter(Boolean),
            ...tenantFilter
        };
        const doc = await db.collection('purchasereceives').findOne(query);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Purchase receive not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.getPurchaseReceiveById = getPurchaseReceiveById;
const createPurchaseReceive = async (req, res, next) => {
    try {
        const db = mongoose_1.default.connection.db;
        if (!db)
            return res.status(500).json({ success: false, message: 'DB connection unavailable' });
        const orgId = req.org?._id?.toString() || req.headers['x-org-id'] || '6aa797278d301b4735f1d322';
        const newDoc = {
            ...req.body,
            _id: new mongoose_1.default.Types.ObjectId(),
            orgId,
            companyId: new mongoose_1.default.Types.ObjectId(orgId),
            grnNumber: req.body.grnNumber || req.body.receiveNumber || `GRN-${Date.now().toString().slice(-4)}`,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await db.collection('purchasereceives').insertOne(newDoc);
        res.status(201).json({ success: true, data: newDoc });
    }
    catch (error) {
        next(error);
    }
};
exports.createPurchaseReceive = createPurchaseReceive;
