import mongoose, { Schema, Document } from 'mongoose';

export interface IPayslip extends Document {
  payslipNumber: string;
  batchId: mongoose.Types.ObjectId | string;
  orgId: string;
  companyId?: string;
  employeeId: mongoose.Types.ObjectId | string;
  employeeCode: string;
  employeeName: string;
  email: string;
  department: string;
  designation: string;
  panNumber?: string;
  uanNumber?: string;
  pfNumber?: string;
  esiNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  month: number;
  year: number;
  payrollPeriod: string;
  totalWorkingDays: number;
  presentDays: number;
  paidLeaveDays: number;
  lopDays: number;
  lopDeductionAmount: number;
  basic: number;
  hra: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  otherAllowances: number;
  grossSalary: number;
  epfEmployee: number;
  esiEmployee: number;
  professionalTax: number;
  tds: number;
  otherDeductions: number;
  totalDeductions: number;
  netPayable: number;
  epfEmployer: number;
  esiEmployer: number;
  gratuityProvision: number;
  totalEmployerContribution: number;
  status: 'Draft' | 'Approved' | 'Paid';
  paymentDate?: Date;
  paymentMode?: string;
  transactionReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayslipSchema = new Schema({
  payslipNumber: { type: String, required: true, unique: true },
  batchId: { type: Schema.Types.ObjectId, ref: 'PayrollBatch', required: true, index: true },
  orgId: { type: String, required: true, index: true },
  companyId: { type: String, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  employeeCode: { type: String, required: true },
  employeeName: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, default: 'General' },
  designation: { type: String, default: 'Staff' },
  panNumber: { type: String },
  uanNumber: { type: String },
  pfNumber: { type: String },
  esiNumber: { type: String },
  bankName: { type: String },
  bankAccountNumber: { type: String },
  ifscCode: { type: String },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  payrollPeriod: { type: String, required: true },
  totalWorkingDays: { type: Number, default: 30 },
  presentDays: { type: Number, default: 30 },
  paidLeaveDays: { type: Number, default: 0 },
  lopDays: { type: Number, default: 0 },
  lopDeductionAmount: { type: Number, default: 0 },
  basic: { type: Number, required: true },
  hra: { type: Number, default: 0 },
  conveyanceAllowance: { type: Number, default: 0 },
  medicalAllowance: { type: Number, default: 0 },
  specialAllowance: { type: Number, default: 0 },
  otherAllowances: { type: Number, default: 0 },
  grossSalary: { type: Number, required: true },
  epfEmployee: { type: Number, default: 0 },
  esiEmployee: { type: Number, default: 0 },
  professionalTax: { type: Number, default: 0 },
  tds: { type: Number, default: 0 },
  otherDeductions: { type: Number, default: 0 },
  totalDeductions: { type: Number, required: true },
  netPayable: { type: Number, required: true },
  epfEmployer: { type: Number, default: 0 },
  esiEmployer: { type: Number, default: 0 },
  gratuityProvision: { type: Number, default: 0 },
  totalEmployerContribution: { type: Number, default: 0 },
  status: { type: String, enum: ['Draft', 'Approved', 'Paid'], default: 'Draft' },
  paymentDate: { type: Date },
  paymentMode: { type: String, default: 'Direct Bank Transfer' },
  transactionReference: { type: String }
}, { timestamps: true });

PayslipSchema.index({ orgId: 1, employeeId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.models.Payslip || mongoose.model<IPayslip>('Payslip', PayslipSchema);
