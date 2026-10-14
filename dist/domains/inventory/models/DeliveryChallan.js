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
const DeliveryChallanItemSchema = new mongoose_1.Schema({
    item: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
    description: { type: String },
    quantity: { type: Number, required: true, default: 1 },
    rate: { type: Number, required: true, default: 0 },
    amount: { type: Number, required: true, default: 0 }
});
const DeliveryChallanSchema = new mongoose_1.Schema({
    orgId: { type: String },
    challanNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ClientAccount', required: true },
    referenceNumber: { type: String },
    salesOrderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'SalesOrder' },
    invoiceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Invoice' },
    challanDate: { type: Date, required: true, default: Date.now },
    challanType: { type: String, enum: ['Supply of Liquid Gas', 'Job Work', 'Supply on Approval', 'Others'] },
    status: {
        type: String,
        enum: ['Draft', 'Open', 'Delivered', 'Returned', 'Closed'],
        default: 'Draft'
    },
    items: [DeliveryChallanItemSchema],
    subTotal: { type: Number, required: true, default: 0 },
    discountType: { type: String, enum: ['amount', 'percent'], default: 'amount' },
    discountValue: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    adjustment: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
    notes: { type: String },
    terms: { type: String },
    attachments: [{ type: String }],
    createdBy: { type: String, default: 'system' }
}, { timestamps: true });
exports.default = mongoose_1.default.model('DeliveryChallan', DeliveryChallanSchema);
