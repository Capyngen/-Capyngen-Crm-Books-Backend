import mongoose, { Schema, Document } from 'mongoose';

export interface IPayrollBatch extends Document {
  batchNumber: string;
  orgId: string;
  companyId?: string;
  month: number;
  year: number;
  payrollPeriod: string;
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  totalEmployerPF: number;
  totalEmployerESI: number;
  totalPT: number;
  totalTDS: number;
  totalEmployerCost: number;
  status: 'Draft' | 'Approved' | 'Disbursed' | 'Cancelled';
  postedToGL: boolean;
  glJournalId?: string;
  disbursementDate?: Date;
  disbursementBank?: string;
  disbursementReference?: string;
  notes?: string;
  processedBy?: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayrollBatchSchema = new Schema({
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

export default mongoose.models.PayrollBatch || mongoose.model<IPayrollBatch>('PayrollBatch', PayrollBatchSchema);
