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
const ItemSchema = new mongoose_1.Schema({
    // Enterprise Inventory Features
    itemClass: { type: String, enum: ['Standard', 'Variant', 'Kit', 'Assembly'], default: 'Standard' },
    trackingType: { type: String, enum: ['None', 'Serial', 'Batch'], default: 'None' },
    valuationMethod: { type: String, enum: ['FIFO', 'FEFO', 'WAC'], default: 'FIFO' },
    barcode: { type: String, default: '' },
    dimensions: {
        length: { type: Number, default: 0 },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
        unit: { type: String, default: 'cm' }
    },
    weight: {
        value: { type: Number, default: 0 },
        unit: { type: String, default: 'kg' }
    },
    reorderPoint: { type: Number, default: 0 },
    safetyStock: { type: Number, default: 0 },
    leadTimeDays: { type: Number, default: 0 },
    defaultWarehouseId: { type: String, default: '' },
    defaultBin: { type: String, default: '' },
    salesAccount: { type: String, default: 'Sales' },
    purchaseAccount: { type: String, default: 'Cost of Goods Sold' },
    inventoryAccount: { type: String, default: 'Inventory Asset' },
    purchaseDescription: { type: String, default: '' },
    preferredVendorId: { type: String, default: '' },
    variants: [{
            attributeName: String,
            attributeValue: String,
            sku: String,
            priceOverride: Number,
            purchaseRateOverride: Number,
            stock: { type: Number, default: 0 },
            reorderPoint: { type: Number, default: 0 },
            barcode: String
        }],
    bom: [{
            itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product' },
            itemName: String,
            quantity: { type: Number, required: true },
            wastagePercent: { type: Number, default: 0 },
            unitCost: { type: Number, default: 0 },
            notes: String
        }],
    serialNumbers: [{
            serialNo: String,
            status: { type: String, enum: ['Available', 'Committed', 'Sold', 'Damaged'], default: 'Available' },
            warehouse: String,
            bin: String,
            addedDate: String,
            warrantyExpiry: String
        }],
    batches: [{
            batchNo: String,
            mfgDate: String,
            expiryDate: String,
            quantity: { type: Number, default: 0 },
            warehouse: String,
            bin: String,
            status: { type: String, enum: ['Active', 'Quarantine', 'Expired'], default: 'Active' }
        }],
    warehouseStock: [{
            warehouse: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksWarehouse' },
            warehouseName: { type: String, default: '' },
            bin: { type: String, default: '' },
            stockOnHand: { type: Number, default: 0 },
            committedStock: { type: Number, default: 0 },
            availableStock: { type: Number, default: 0 }
        }],
    costLayers: [{
            date: { type: Date, default: Date.now },
            quantity: { type: Number, required: true },
            unitCost: { type: Number, required: true },
            remainingQty: { type: Number, required: true },
            referenceDoc: { type: String, default: '' }
        }],
    // CRM Base Fields
    companyId: { type: String },
    category: { type: String },
    hsnCode: { type: String },
    gstRate: { type: String },
    price: { type: Number },
    stockQuantity: { type: Number },
    minimumStock: { type: Number },
    tags: [String],
    images: [String],
    status: { type: String },
    currency: { type: String },
    features: [String],
    // Books / Inventory Fields
    orgId: { type: String },
    name: { type: String, required: true },
    sku: { type: String, default: '' },
    type: { type: String, enum: ['goods', 'service'], default: 'goods' },
    unit: { type: String, default: 'pcs' },
    salesRate: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v) => Math.round(v * 100) / 100, required: true, default: 0 },
    purchaseRate: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v) => Math.round(v * 100) / 100, required: true, default: 0 },
    description: { type: String, default: '' },
    stock: { type: Number, default: 0 },
    createdBy: { type: String, default: 'piyushsharma12452' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true, strict: false });
const ProductModel = mongoose_1.default.models.Product || mongoose_1.default.model('Product', ItemSchema, 'products');
if (!mongoose_1.default.models.BooksItem) {
    try {
        mongoose_1.default.model('BooksItem', ItemSchema, 'products');
    }
    catch (e) { }
}
if (!mongoose_1.default.models.Item) {
    try {
        mongoose_1.default.model('Item', ItemSchema, 'products');
    }
    catch (e) { }
}
exports.default = ProductModel;
