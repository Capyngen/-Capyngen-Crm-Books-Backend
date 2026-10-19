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
const SalaryStructureSchema = new mongoose_1.Schema({
    orgId: { type: String, required: true, index: true },
    companyId: { type: String, index: true },
    employeeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    employeeName: { type: String },
    employeeCode: { type: String },
    annualCTC: { type: Number, required: true },
    monthlyCTC: { type: Number, required: true },
    basic: { type: Number, required: true },
    hra: { type: Number, default: 0 },
    conveyanceAllowance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    otherAllowances: { type: Number, default: 0 },
    grossSalary: { type: Number, required: true },
    epfApplicable: { type: Boolean, default: true },
    epfStatutoryCeiling: { type: Boolean, default: true },
    epfEmployee: { type: Number, default: 0 },
    esiApplicable: { type: Boolean, default: false },
    esiEmployee: { type: Number, default: 0 },
    professionalTaxState: { type: String, default: 'Maharashtra' },
    professionalTax: { type: Number, default: 200 },
    tdsMonthly: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    employerPF: { type: Number, default: 0 },
    employerEPS: { type: Number, default: 0 },
    employerPFAdmin: { type: Number, default: 0 },
    employerEDLI: { type: Number, default: 0 },
    employerESI: { type: Number, default: 0 },
    gratuityProvision: { type: Number, default: 0 },
    totalEmployerContribution: { type: Number, default: 0 },
    netMonthlyPay: { type: Number, required: true },
    effectiveFrom: { type: Date, default: Date.now },
    status: { type: String, enum: ['Active', 'Archived'], default: 'Active' }
}, { timestamps: true });
SalaryStructureSchema.index({ orgId: 1, employeeId: 1, status: 1 });
exports.default = mongoose_1.default.models.SalaryStructure || mongoose_1.default.model('SalaryStructure', SalaryStructureSchema);
