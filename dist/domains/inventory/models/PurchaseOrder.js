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
const PurchaseOrderSchema = new mongoose_1.Schema({
    // Enterprise PO Features
    poType: { type: String, enum: ['Standard', 'Blanket'], default: 'Standard' },
    approvalStatus: { type: String, enum: ['Draft', 'Pending', 'ManagerApproved', 'DirectorApproved', 'Approved', 'Rejected'], default: 'Draft' },
    blanketDetails: {
        maxAmount: { type: Number },
        validUntil: { type: Date },
        amountUtilized: { type: Number, default: 0 }
    },
    orgId: { type: mongoose_1.Schema.Types.Mixed, index: true },
    companyId: { type: mongoose_1.Schema.Types.Mixed, index: true },
    vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    deliveryDestination: { type: String, enum: ['organization', 'customer'], default: 'organization' },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ClientAccount' },
    poNumber: { type: String, required: true },
    referenceNumber: { type: String },
    orderDate: { type: Date, required: true },
    deliveryDate: { type: Date },
    shipmentPreference: { type: String },
    paymentTerms: { type: String },
    lineItems: [{
            itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product' },
            itemDetails: { type: String },
            account: { type: String, required: true },
            quantity: { type: Number, required: true },
            rate: { type: Number, required: true },
            amount: { type: Number, required: true }
        }],
    subTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    discountType: { type: String, enum: ['amount', 'percent'], default: 'amount' },
    taxWithheldType: { type: String, enum: ['none', 'TDS', 'TCS'], default: 'none' },
    taxWithheldAmount: { type: Number, default: 0 },
    adjustment: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    notes: { type: String },
    terms: { type: String },
    status: {
        type: String,
        enum: ['Draft', 'Issued', 'Billed', 'Cancelled'],
        default: 'Issued'
    },
    currency: { type: String, default: 'INR' },
    createdBy: { type: String }
}, { timestamps: true });
const PurchaseOrderModel = mongoose_1.default.models.PurchaseOrder || mongoose_1.default.model('PurchaseOrder', PurchaseOrderSchema, 'purchaseorders');
if (!mongoose_1.default.models.BooksPurchaseOrder) {
    try {
        mongoose_1.default.model('BooksPurchaseOrder', PurchaseOrderSchema, 'purchaseorders');
    }
    catch (e) { }
}
exports.default = PurchaseOrderModel;
