"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackingSlip = exports.integrateCarrier = exports.deleteShipment = exports.updateShipment = exports.createShipment = exports.getShipmentById = exports.getShipments = void 0;
const Shipment_1 = __importDefault(require("../models/Shipment"));
const context_1 = require("../../../context");
const tenantFilter_1 = require("../../../core/utils/tenantFilter");
const getShipments = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const docs = await Shipment_1.default.find(tenantFilter)
            .populate('items.item', 'name sku unit salesRate')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        next(error);
    }
};
exports.getShipments = getShipments;
const getShipmentById = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = { _id: req.params.id, ...tenantFilter };
        const doc = await Shipment_1.default.findOne(filter).populate('items.item', 'name sku unit salesRate');
        if (!doc)
            return res.status(404).json({ success: false, message: 'Shipment not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.getShipmentById = getShipmentById;
const createShipment = async (req, res, next) => {
    try {
        const orgId = req.org?._id?.toString() || context_1.requestContext.getStore()?.orgId || req.body.orgId;
        let shipmentNumber = req.body.shipmentNumber;
        if (!shipmentNumber) {
            const count = await Shipment_1.default.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
            shipmentNumber = `SHP-${String(count + 1).padStart(5, '0')}`;
        }
        let packageNumber = req.body.packageNumber;
        if (!packageNumber) {
            const count = await Shipment_1.default.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
            packageNumber = `PKG-${String(count + 1).padStart(5, '0')}`;
        }
        const payload = {
            ...req.body,
            shipmentNumber,
            packageNumber,
            companyId: orgId,
            orgId
        };
        const doc = await Shipment_1.default.create(payload);
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.createShipment = createShipment;
const updateShipment = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = { _id: req.params.id, ...tenantFilter };
        const doc = await Shipment_1.default.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
        if (!doc)
            return res.status(404).json({ success: false, message: 'Shipment not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.updateShipment = updateShipment;
const deleteShipment = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = { _id: req.params.id, ...tenantFilter };
        const doc = await Shipment_1.default.findOneAndDelete(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Shipment not found' });
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteShipment = deleteShipment;
const integrateCarrier = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = { _id: req.params.id, ...tenantFilter };
        const doc = await Shipment_1.default.findOne(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Shipment not found' });
        const carrier = req.body.carrier || 'BlueDart Express';
        const trackingNo = req.body.trackingNumber || ('BD' + Math.floor(100000000 + Math.random() * 900000000));
        const trackingUrl = carrier.toLowerCase().includes('fedex')
            ? `https://www.fedex.com/fedextrack/?trknbr=${trackingNo}`
            : carrier.toLowerCase().includes('delhivery')
                ? `https://www.delhivery.com/track/package/${trackingNo}`
                : `https://www.bluedart.com/tracking?track=${trackingNo}`;
        doc.carrier = carrier;
        doc.trackingNumber = trackingNo;
        doc.trackingUrl = trackingUrl;
        doc.shippingCost = Number(req.body.shippingCost || 250);
        doc.shippingMethod = req.body.shippingMethod || doc.shippingMethod || 'Air Express';
        doc.status = 'Shipped';
        doc.shippingLabelUrl = `/api/v1/books/inventory/shipments/${doc._id}/label`;
        await doc.save();
        res.status(200).json({
            success: true,
            data: doc,
            message: `Carrier ${carrier} booked successfully. Tracking: ${trackingNo}`
        });
    }
    catch (error) {
        next(error);
    }
};
exports.integrateCarrier = integrateCarrier;
const getPackingSlip = async (req, res, next) => {
    try {
        const tenantFilter = (0, tenantFilter_1.buildTenantFilter)(req);
        const filter = { _id: req.params.id, ...tenantFilter };
        const doc = await Shipment_1.default.findOne(filter).populate('items.item', 'name sku unit');
        if (!doc)
            return res.status(404).json({ success: false, message: 'Shipment not found' });
        const packingSlip = {
            shipmentNumber: doc.shipmentNumber,
            packageNumber: doc.packageNumber,
            date: doc.date,
            customerName: doc.customerName,
            deliveryAddress: doc.deliveryAddress,
            carrier: doc.carrier,
            trackingNumber: doc.trackingNumber,
            weight: doc.weight,
            dimensions: doc.dimensions,
            items: doc.items.map((li) => ({
                itemName: li.item?.name || 'Item',
                sku: li.item?.sku || '',
                quantity: li.quantity,
                unit: li.unit || 'pcs',
                serialNumbers: li.serialNumbers || [],
                batchNo: li.batchNo || ''
            })),
            printedAt: new Date(),
            status: doc.status
        };
        res.status(200).json({ success: true, data: packingSlip });
    }
    catch (error) {
        next(error);
    }
};
exports.getPackingSlip = getPackingSlip;
