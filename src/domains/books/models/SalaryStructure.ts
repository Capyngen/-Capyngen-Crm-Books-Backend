import mongoose, { Schema, Document } from 'mongoose';

export interface ISalaryStructure extends Document {
  orgId: string;
  companyId?: string;
  employeeId: mongoose.Types.ObjectId | string;
  employeeName?: string;
  employeeCode?: string;
  annualCTC: number;
  monthlyCTC: number;
  basic: number;
  hra: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  otherAllowances: number;
  grossSalary: number;
  epfApplicable: boolean;
  epfStatutoryCeiling: boolean;
  epfEmployee: number;
  esiApplicable: boolean;
  esiEmployee: number;
  professionalTaxState: string;
  professionalTax: number;
  tdsMonthly: number;
  totalDeductions: number;
  employerPF: number;
  employerEPS: number;
  employerPFAdmin: number;
  employerEDLI: number;
  employerESI: number;
  gratuityProvision: number;
  totalEmployerContribution: number;
  netMonthlyPay: number;
  effectiveFrom: Date;
  status: 'Active' | 'Archived';
  createdAt: Date;
  updatedAt: Date;
}

const SalaryStructureSchema = new Schema({
  orgId: { type: String, required: true, index: true },
  companyId: { type: String, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
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

export default mongoose.models.BooksSalaryStructure || mongoose.model<ISalaryStructure>('BooksSalaryStructure', SalaryStructureSchema, 'books_salarystructures');
