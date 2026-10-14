"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrateCarrier = exports.deleteShipment = exports.updateShipment = exports.createShipment = exports.getShipmentById = exports.getShipments = void 0;
const Shipment_1 = __importDefault(require("../models/Shipment"));
const getShipments = async (req, res, next) => {
    try {
        const orgId = req.org?._id || (req.org?._id || req.body.orgId);
        const filter = orgId ? { orgId } : {};
        const docs = await Shipment_1.default.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
    }
    catch (error) {
        next(error);
    }
};
exports.getShipments = getShipments;
const getShipmentById = async (req, res, next) => {
    try {
        const orgId = req.org?._id || (req.org?._id || req.body.orgId);
        const filter = { _id: req.params.id };
        if (orgId)
            filter.orgId = orgId;
        const doc = await Shipment_1.default.findOne(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.getShipmentById = getShipmentById;
const createShipment = async (req, res, next) => {
    try {
        const orgId = req.org?._id || (req.org?._id || req.body.orgId);
        if (orgId)
            req.body.orgId = orgId;
        const doc = await Shipment_1.default.create(req.body);
        res.status(201).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.createShipment = createShipment;
const updateShipment = async (req, res, next) => {
    try {
        const orgId = req.org?._id || (req.org?._id || req.body.orgId);
        const filter = { _id: req.params.id };
        if (orgId)
            filter.orgId = orgId;
        const doc = await Shipment_1.default.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.updateShipment = updateShipment;
const deleteShipment = async (req, res, next) => {
    try {
        const orgId = req.org?._id || (req.org?._id || req.body.orgId);
        const filter = { _id: req.params.id };
        if (orgId)
            filter.orgId = orgId;
        const doc = await Shipment_1.default.findOneAndDelete(filter);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteShipment = deleteShipment;
const integrateCarrier = async (req, res, next) => {
    try {
        const doc = await Shipment_1.default.findById(req.params.id);
        if (!doc)
            return res.status(404).json({ success: false, message: 'Not found' });
        doc.carrier = req.body.carrier || 'FedEx API';
        doc.trackingNumber = 'TRK-' + Math.floor(1000000 + Math.random() * 9000000);
        doc.shippingCost = req.body.shippingCost || 15.00;
        await doc.save();
        res.status(200).json({ success: true, data: doc, message: 'Carrier integrated successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.integrateCarrier = integrateCarrier;
