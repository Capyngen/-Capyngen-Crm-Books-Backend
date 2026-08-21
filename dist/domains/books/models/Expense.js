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
const ExpenseLineItemSchema = new mongoose_1.Schema({
    expenseAccount: { type: String, required: true },
    notes: { type: String },
    amount: { type: Number, required: true }
}, { _id: false });
const MileageDataSchema = new mongoose_1.Schema({
    distance: { type: Number, required: true },
    rate: { type: Number, required: true },
    unit: { type: String, enum: ['km', 'mile'], default: 'km' },
    employee: { type: String }
}, { _id: false });
const ExpenseSchema = new mongoose_1.Schema({
    expenseType: { type: String, enum: ['Goods', 'Mileage'], default: 'Goods' },
    date: { type: Date, required: true },
    expenseAccount: { type: String },
    amount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksVendor' },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksCustomer' },
    billable: { type: Boolean, default: false },
    reference: { type: String },
    notes: { type: String },
    status: {
        type: String,
        enum: ['Non-Billable', 'Unbilled', 'Invoiced', 'Reimbursed'],
        default: 'Non-Billable'
    },
    receiptUrl: { type: String },
    isItemized: { type: Boolean, default: false },
    lineItems: { type: [ExpenseLineItemSchema], default: [] },
    mileageData: { type: MileageDataSchema },
    bulkBatchId: { type: String },
    paidThrough: { type: String },
    currency: { type: String, default: 'INR' },
    createdBy: { type: String }
}, { timestamps: true });
exports.default = mongoose_1.default.models.BooksExpense || mongoose_1.default.model('BooksExpense', ExpenseSchema);
