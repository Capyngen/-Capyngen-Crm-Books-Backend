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
const BillSchema = new mongoose_1.Schema({
    taxConfigurationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'TaxConfiguration' },
    branchId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksBranch' },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksProject' },
    reportingTagIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'ReportingTag' }],
    currency: { type: String },
    exchangeRate: { type: Number },
    baseTotal: { type: Number },
    orgId: { type: String },
    vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksVendor', required: true },
    billNumber: { type: String, required: true },
    orderNumber: { type: String },
    purchaseOrderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksPurchaseOrder' },
    billDate: { type: Date, required: true },
    dueDate: { type: Date },
    accountsPayable: { type: String, default: 'Accounts Payable' },
    subject: { type: String },
    lineItems: [{
            itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksItem' },
            account: { type: String, required: true },
            quantity: { type: Number, required: true },
            rate: { type: Number, required: true },
            discount: { type: Number, default: 0 },
            customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksCustomer' },
            amount: { type: Number, required: true }
        }],
    subTotal: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v) => Math.round(v * 100) / 100, required: true },
    discount: { type: Number, default: 0 },
    discountType: { type: String, enum: ['amount', 'percent'], default: 'amount' },
    taxWithheldType: { type: String, enum: ['none', 'TDS', 'TCS'], default: 'none' },
    taxWithheldAmount: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v) => Math.round(v * 100) / 100, default: 0 },
    adjustment: { type: Number, default: 0 },
    totalAmount: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v) => Math.round(v * 100) / 100, required: true },
    notes: { type: String },
    status: {
        type: String,
        enum: ['Draft', 'Open', 'Partially Paid', 'Paid', 'Void'],
        default: 'Open'
    },
    createdBy: { type: String }
}, { timestamps: true, optimisticConcurrency: true });
BillSchema.index({ orgId: 1, billNumber: 1 }, { unique: true });
BillSchema.pre('save', async function () {
    if (this.isNew) {
        const Master = mongoose_1.default.model('BooksVendor');
        const record = await Master.findById(this.vendorId);
        if (record && record.isActive === false) {
            throw new Error('Cannot create bill for a deactivated vendor');
        }
    }
});
exports.default = mongoose_1.default.models.BooksBill || mongoose_1.default.model('BooksBill', BillSchema);
