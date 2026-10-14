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
const CreditNoteSchema = new mongoose_1.Schema({
    currency: { type: String },
    exchangeRate: { type: Number },
    baseTotal: { type: Number },
    orgId: { type: String },
    customer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ClientAccount', required: true },
    creditNoteNumber: { type: String, required: true, /* unique removed for compound */ },
    referenceNumber: { type: String },
    invoiceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksInvoice' },
    salesperson: { type: String },
    creditNoteDate: { type: Date, required: true, default: Date.now },
    status: {
        type: String,
        enum: ['Draft', 'Open', 'Closed', 'Void'],
        default: 'Draft'
    },
    refunds: [{ date: { type: Date, required: true }, amount: { type: Number, required: true }, reference: { type: String } }],
    appliedToInvoices: [{ invoiceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Invoice' }, amountApplied: { type: Number, required: true } }],
    items: [{
            item: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
            account: { type: String },
            description: { type: String },
            quantity: { type: Number, required: true, min: 1 },
            rate: { type: Number, required: true },
            amount: { type: Number, required: true }
        }],
    subTotal: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v) => Math.round(v * 100) / 100, required: true },
    discountType: { type: String, enum: ['percent', 'amount'], default: 'percent' },
    discountValue: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    adjustment: { type: Number, default: 0 },
    total: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v) => Math.round(v * 100) / 100, required: true },
    notes: { type: String },
    terms: { type: String },
    attachments: [{ type: String }],
    createdBy: { type: String, default: 'system' }
}, { timestamps: true, optimisticConcurrency: true });
CreditNoteSchema.index({ orgId: 1, creditNoteNumber: 1 }, { unique: true });
exports.default = mongoose_1.default.model('CreditNote', CreditNoteSchema);
