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
const ExpenseClaimItemSchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    category: {
        type: String,
        enum: ['Travel', 'Lodging', 'Meals', 'Fuel/Mileage', 'Office Supplies', 'Client Entertainment', 'Other'],
        required: true
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    receiptUrl: { type: String },
    isBillable: { type: Boolean, default: false },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ClientAccount' },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksProject' }
}, { _id: true });
const ApprovalHistorySchema = new mongoose_1.Schema({
    role: { type: String, required: true },
    approverId: { type: String },
    approverName: { type: String },
    status: {
        type: String,
        enum: ['Submitted', 'Manager_Approved', 'Finance_Approved', 'Paid', 'Rejected'],
        required: true
    },
    comments: { type: String },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });
const EmployeeExpenseClaimSchema = new mongoose_1.Schema({
    claimNumber: { type: String, required: true, unique: true },
    orgId: { type: String, required: true, index: true },
    companyId: { type: String, index: true },
    employeeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    employeeCode: { type: String, required: true },
    employeeName: { type: String, required: true },
    department: { type: String, default: 'General' },
    title: { type: String, required: true },
    expenseDate: { type: Date, default: Date.now },
    items: { type: [ExpenseClaimItemSchema], default: [] },
    totalAmount: { type: Number, required: true },
    advanceAdjusted: { type: Number, default: 0 },
    netClaimAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Draft', 'Submitted', 'Manager_Approved', 'Finance_Approved', 'Paid', 'Rejected'],
        default: 'Draft',
        index: true
    },
    approvalHistory: { type: [ApprovalHistorySchema], default: [] },
    reimbursementMethod: {
        type: String,
        enum: ['Payroll', 'Direct Bank Transfer', 'Cheque'],
        default: 'Direct Bank Transfer'
    },
    glJournalId: { type: String },
    reimbursedDate: { type: Date },
    reimbursementReference: { type: String },
    notes: { type: String }
}, { timestamps: true });
exports.default = mongoose_1.default.models.EmployeeExpenseClaim || mongoose_1.default.model('EmployeeExpenseClaim', EmployeeExpenseClaimSchema);
