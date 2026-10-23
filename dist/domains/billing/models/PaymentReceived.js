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
const PaymentReceivedSchema = new mongoose_1.Schema({
    branchId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksBranch' },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksProject' },
    reportingTagIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'ReportingTag' }],
    currency: { type: String },
    exchangeRate: { type: Number },
    baseTotal: { type: Number },
    orgId: { type: mongoose_1.Schema.Types.Mixed, index: true },
    companyId: { type: mongoose_1.Schema.Types.Mixed, index: true },
    customer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ClientAccount', required: true },
    amount: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v) => Math.round(v * 100) / 100, required: true },
    unusedAmount: { type: Number, default: 0, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v) => Math.round(v * 100) / 100 },
    bankCharges: { type: Number, default: 0 },
    paymentDate: { type: Date, required: true, default: Date.now },
    paymentNumber: { type: String, required: true, /* unique removed for compound */ },
    paymentMode: { type: String, required: true },
    depositTo: { type: String },
    referenceNumber: { type: String },
    taxDeducted: { type: Boolean, default: false },
    taxType: { type: String },
    taxAmount: { type: Number, default: 0 },
    invoices: [{
            invoice: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Invoice' },
            amountApplied: { type: Number, required: true }
        }],
    amountUsed: { type: Number, default: 0 },
    amountRefunded: { type: Number, default: 0 },
    amountInExcess: { type: Number, default: 0 },
    notes: { type: String },
    attachments: [{ type: String }],
    sendThankYouNote: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['Unused', 'Partially Used', 'Closed'],
        default: 'Unused'
    },
    createdBy: { type: String, default: 'system' }
}, { timestamps: true, optimisticConcurrency: true });
exports.default = mongoose_1.default.models.PaymentReceived || mongoose_1.default.model('PaymentReceived', PaymentReceivedSchema, 'paymentsreceived');
