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
const QuoteItemSchema = new mongoose_1.Schema({
    item: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: false },
    description: { type: String },
    quantity: { type: Number, required: true, default: 1 },
    rate: { type: Number, required: true, default: 0 },
    amount: { type: Number, required: true, default: 0 }
});
const QuoteSchema = new mongoose_1.Schema({
    orgId: { type: String },
    companyId: { type: String },
    quoteNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ClientAccount', required: true },
    quoteDate: { type: Date, required: true, default: Date.now },
    expiryDate: { type: Date },
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Accepted', 'Declined', 'Expired', 'Invoiced'],
        default: 'Sent'
    },
    approvalStatus: {
        type: String,
        enum: ['Draft', 'Pending', 'Approved', 'Rejected'],
        default: 'Draft'
    },
    dispatchStatus: {
        type: String,
        enum: ['Not Sent', 'Sent', 'Viewed'],
        default: 'Not Sent'
    },
    rejectionReason: { type: String },
    referenceNumber: { type: String },
    salesOrderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'SalesOrder' },
    invoiceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Invoice' },
    items: [QuoteItemSchema],
    subTotal: { type: Number, required: true, default: 0 },
    discountType: { type: String, enum: ['amount', 'percent'], default: 'amount' },
    discountValue: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    taxWithheldType: { type: String, enum: ['TDS', 'TCS', 'none'], default: 'none' },
    taxWithheldAmount: { type: Number, default: 0 },
    adjustment: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
    salesperson: { type: String },
    projectName: { type: String },
    projectDetails: {
        projectName: String,
        projectCode: String,
        customer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ClientAccount' },
        billingMethod: String,
        totalProjectCost: Number,
        description: String,
        budget: {
            costBudget: Number,
            revenueBudget: Number
        },
        users: [{ name: String, email: String }],
        tasks: [{ taskName: String, description: String }],
        addToWatchlist: Boolean
    },
    subject: { type: String },
    attachments: [{ type: String }],
    notes: { type: String },
    terms: { type: String },
    createdBy: { type: String, default: 'system' },
    version: { type: Number, default: 1 },
    parentQuoteId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Quote' },
    eSignature: {
        signedBy: String,
        signedAt: Date,
        ipAddress: String,
        documentHash: String
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model('Quote', QuoteSchema);
