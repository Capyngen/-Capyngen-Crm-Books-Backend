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
const InvoiceItemSchema = new mongoose_1.Schema({
    item: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksItem', required: true },
    description: { type: String },
    quantity: { type: Number, required: true, default: 1 },
    rate: { type: Number, required: true, default: 0 },
    amount: { type: Number, required: true, default: 0 }
});
const InvoiceSchema = new mongoose_1.Schema({
    taxConfigurationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'TaxConfiguration' },
    branchId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksBranch' },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksProject' },
    reportingTagIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'ReportingTag' }],
    currency: { type: String },
    exchangeRate: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v) => Math.round(v * 100) / 100 },
    baseTotal: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v) => Math.round(v * 100) / 100 },
    orgId: { type: String },
    invoiceNumber: { type: String, required: true, /* unique removed for compound */ },
    customer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksCustomer', required: true },
    invoiceDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date },
    paymentTerms: { type: String },
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Viewed', 'Paid', 'PartiallyPaid', 'Void', 'Overdue'],
        default: 'Sent'
    },
    referenceNumber: { type: String },
    orderNumber: { type: String },
    salesOrderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'SalesOrder' },
    accountsReceivable: { type: String, default: 'Accounts Receivable' },
    items: [InvoiceItemSchema],
    subTotal: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v) => Math.round(v * 100) / 100, required: true, default: 0 },
    discountType: { type: String, enum: ['amount', 'percent'], default: 'amount' },
    discountValue: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    taxWithheldType: { type: String, enum: ['TDS', 'TCS', 'none'], default: 'none' },
    taxWithheldAmount: { type: Number, default: 0 },
    adjustment: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    total: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v) => Math.round(v * 100) / 100, required: true, default: 0 },
    balanceDue: { type: Number, required: true, default: 0 },
    salesperson: { type: String },
    projectName: { type: String },
    projectDetails: { type: mongoose_1.Schema.Types.Mixed },
    subject: { type: String },
    attachments: [{ type: String }],
    notes: { type: String },
    terms: { type: String },
    createdBy: { type: String, default: 'system' }
}, { timestamps: true, optimisticConcurrency: true });
InvoiceSchema.index({ orgId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.pre('save', async function () {
    if (this.isNew) {
        const Master = mongoose_1.default.model('BooksCustomer');
        const record = await Master.findById(this.customer);
        if (record && record.isActive === false) {
            throw new Error('Cannot create invoice for a deactivated customer');
        }
    }
});
exports.default = mongoose_1.default.model('Invoice', InvoiceSchema);
