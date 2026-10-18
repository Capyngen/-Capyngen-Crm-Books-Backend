import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployeeBankDetails {
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  branchName?: string;
}

export interface IEmployeeStatutoryDetails {
  panNumber?: string;
  uanNumber?: string;
  pfNumber?: string;
  esiNumber?: string;
}

export interface IEmployee extends Document {
  orgId: string;
  companyId?: string;
  employeeCode: string;
  firstName: string;
  lastName?: string;
  employeeName: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  role: 'Employee' | 'Manager' | 'HR' | 'Finance' | 'Admin';
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  dateOfJoining: Date;
  dateOfLeaving?: Date;
  status: 'Active' | 'On Leave' | 'Notice Period' | 'Terminated' | 'Resigned';
  managerId?: mongoose.Types.ObjectId | string;
  costCenter?: string;
  branchId?: mongoose.Types.ObjectId | string;
  bankDetails?: IEmployeeBankDetails;
  statutoryDetails?: IEmployeeStatutoryDetails;
  costRate: number; // Stored natively for time entries and profitability
  defaultBillingRate?: number;
  salaryStructureId?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const BankDetailsSchema = new Schema({
  bankName: { type: String },
  accountNumber: { type: String },
  ifscCode: { type: String },
  accountHolderName: { type: String },
  branchName: { type: String }
}, { _id: false });

const StatutoryDetailsSchema = new Schema({
  panNumber: { type: String },
  uanNumber: { type: String },
  pfNumber: { type: String },
  esiNumber: { type: String }
}, { _id: false });

const EmployeeSchema = new Schema({
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
  managerId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  costCenter: { type: String, default: 'General Operations' },
  branchId: { type: Schema.Types.ObjectId, ref: 'BooksBranch' },
  bankDetails: { type: BankDetailsSchema, default: () => ({}) },
  statutoryDetails: { type: StatutoryDetailsSchema, default: () => ({}) },
  costRate: { type: Number, default: 0 },
  defaultBillingRate: { type: Number, default: 0 },
  salaryStructureId: { type: Schema.Types.ObjectId, ref: 'SalaryStructure' }
}, { timestamps: true });

EmployeeSchema.index({ orgId: 1, employeeCode: 1 }, { unique: true });

export default mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);
