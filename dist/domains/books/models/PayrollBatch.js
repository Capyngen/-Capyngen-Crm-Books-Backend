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
const PayrollBatchSchema = new mongoose_1.Schema({
    batchNumber: { type: String, required: true, unique: true },
    orgId: { type: String, required: true, index: true },
    companyId: { type: String, index: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    payrollPeriod: { type: String, required: true },
    totalEmployees: { type: Number, default: 0 },
    totalGrossPay: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    totalNetPay: { type: Number, default: 0 },
    totalEmployerPF: { type: Number, default: 0 },
    totalEmployerESI: { type: Number, default: 0 },
    totalPT: { type: Number, default: 0 },
    totalTDS: { type: Number, default: 0 },
    totalEmployerCost: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['Draft', 'Approved', 'Disbursed', 'Cancelled'],
        default: 'Draft'
    },
    postedToGL: { type: Boolean, default: false },
    glJournalId: { type: String },
    disbursementDate: { type: Date },
    disbursementBank: { type: String },
    disbursementReference: { type: String },
    notes: { type: String },
    processedBy: { type: String },
    approvedBy: { type: String }
}, { timestamps: true });
PayrollBatchSchema.index({ orgId: 1, month: 1, year: 1 }, { unique: true });
exports.default = mongoose_1.default.models.PayrollBatch || mongoose_1.default.model('PayrollBatch', PayrollBatchSchema);
