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
const BankDetailsSchema = new mongoose_1.Schema({
    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    accountHolderName: { type: String },
    branchName: { type: String }
}, { _id: false });
const StatutoryDetailsSchema = new mongoose_1.Schema({
    panNumber: { type: String },
    uanNumber: { type: String },
    pfNumber: { type: String },
    esiNumber: { type: String }
}, { _id: false });
const EmployeeSchema = new mongoose_1.Schema({
    orgId: { type: String, required: true, index: true },
    companyId: { type: String, index: true },
    employeeCode: { type: String, required: true, trim: true },
    firstName: { type: String, required: true },
    lastName: { type: String, default: '' },
    employeeName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
    department: { type: String, default: 'Engineering' },
    designation: { type: String, default: 'Software Engineer' },
    role: {
        type: String,
        enum: ['Employee', 'Manager', 'HR', 'Finance', 'Admin'],
        default: 'Employee'
    },
    employmentType: {
        type: String,
        enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern'],
        default: 'Full-Time'
    },
    dateOfJoining: { type: Date, default: Date.now },
    dateOfLeaving: { type: Date },
    status: {
        type: String,
        enum: ['Active', 'On Leave', 'Notice Period', 'Terminated', 'Resigned'],
        default: 'Active'
    },
    managerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employee' },
    costCenter: { type: String, default: 'General Operations' },
    branchId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksBranch' },
    bankDetails: { type: BankDetailsSchema, default: () => ({}) },
    statutoryDetails: { type: StatutoryDetailsSchema, default: () => ({}) },
    costRate: { type: Number, default: 0 },
    defaultBillingRate: { type: Number, default: 0 },
    salaryStructureId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'SalaryStructure' }
}, { timestamps: true });
EmployeeSchema.index({ orgId: 1, employeeCode: 1 }, { unique: true });
exports.default = mongoose_1.default.models.Employee || mongoose_1.default.model('Employee', EmployeeSchema);
