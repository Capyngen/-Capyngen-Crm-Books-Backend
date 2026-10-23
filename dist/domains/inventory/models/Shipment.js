"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ShipmentSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.Mixed, index: true },
    orgId: { type: mongoose_1.Schema.Types.Mixed, index: true },
    shipmentNumber: { type: String, required: true },
    packageNumber: { type: String, default: '' },
    salesOrderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'SalesOrder' },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksCustomer' },
    customerName: { type: String, default: '' },
    date: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ['Draft', 'Picked', 'Packed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Draft' },
    carrier: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    trackingUrl: { type: String, default: '' },
    shippingMethod: { type: String, default: 'Standard Express' },
    shippingCost: { type: Number, default: 0 },
    weight: {
        value: { type: Number, default: 1 },
        unit: { type: String, default: 'kg' }
    },
    dimensions: {
        length: { type: Number, default: 10 },
        width: { type: Number, default: 10 },
        height: { type: Number, default: 10 },
        unit: { type: String, default: 'cm' }
    },
    deliveryAddress: { type: String, default: '' },
    shippingLabelUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
    items: [{
            item: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            unit: { type: String, default: 'pcs' },
            serialNumbers: [{ type: String }],
            batchNo: { type: String, default: '' }
        }]
}, { timestamps: true });
ShipmentSchema.index({ companyId: 1, shipmentNumber: 1 });
ShipmentSchema.index({ orgId: 1, shipmentNumber: 1 });
const ShipmentModel = mongoose_1.default.models.Shipment || mongoose_1.default.model('Shipment', ShipmentSchema, 'shipments');
if (!mongoose_1.default.models.BooksShipment) {
    try {
        mongoose_1.default.model('BooksShipment', ShipmentSchema, 'shipments');
    }
    catch (e) { }
}
exports.default = ShipmentModel;
