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
const PaymentMadeSchema = new mongoose_1.Schema({
    branchId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksBranch' },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksProject' },
    reportingTagIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'ReportingTag' }],
    currency: { type: String },
    exchangeRate: { type: Number },
    baseTotal: { type: Number },
    orgId: { type: String },
    companyId: { type: String },
    vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    paymentType: { type: String, enum: ['Bill Payment', 'Vendor Advance'], required: true },
    paymentNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    paymentMode: { type: String, required: true },
    paidThrough: { type: String, required: true },
    referenceNumber: { type: String },
    disbursementStatus: { type: String, enum: ['Pending', 'Processed', 'Failed'], default: 'Pending' },
    remittanceAdviceSent: { type: Boolean, default: false },
    notes: { type: String },
    depositTo: { type: String },
    tds: {
        taxName: { type: String },
        rate: { type: Number },
        act: { type: String },
        section: { type: String },
        isHigherRate: { type: Boolean },
        startDate: { type: Date },
        endDate: { type: Date }
    },
    bills: [{
            billId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksBill' },
            amountApplied: { type: Number }
        }],
    status: { type: String, enum: ['Open', 'Closed', 'Void'], default: 'Closed' }
}, { timestamps: true });
exports.default = mongoose_1.default.models.BooksPaymentMade || mongoose_1.default.model('BooksPaymentMade', PaymentMadeSchema);
