import mongoose, { Schema, Document } from 'mongoose';

export interface IExpenseClaimItem {
  date: Date;
  category: 'Travel' | 'Lodging' | 'Meals' | 'Fuel/Mileage' | 'Office Supplies' | 'Client Entertainment' | 'Other';
  description: string;
  amount: number;
  receiptUrl?: string;
  isBillable: boolean;
  customerId?: mongoose.Types.ObjectId | string;
  projectId?: mongoose.Types.ObjectId | string;
}

export interface IApprovalHistory {
  role: string;
  approverId?: string;
  approverName?: string;
  status: 'Submitted' | 'Manager_Approved' | 'Finance_Approved' | 'Paid' | 'Rejected';
  comments?: string;
  timestamp: Date;
}

export interface IEmployeeExpenseClaim extends Document {
  claimNumber: string;
  orgId: string;
  companyId?: string;
  employeeId: mongoose.Types.ObjectId | string;
  employeeCode: string;
  employeeName: string;
  department: string;
  title: string;
  expenseDate: Date;
  items: IExpenseClaimItem[];
  totalAmount: number;
  advanceAdjusted: number;
  netClaimAmount: number;
  status: 'Draft' | 'Submitted' | 'Manager_Approved' | 'Finance_Approved' | 'Paid' | 'Rejected';
  approvalHistory: IApprovalHistory[];
  reimbursementMethod: 'Payroll' | 'Direct Bank Transfer' | 'Cheque';
  glJournalId?: string;
  reimbursedDate?: Date;
  reimbursementReference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseClaimItemSchema = new Schema({
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
  customerId: { type: Schema.Types.ObjectId, ref: 'ClientAccount' },
  projectId: { type: Schema.Types.ObjectId, ref: 'BooksProject' }
}, { _id: true });

const ApprovalHistorySchema = new Schema({
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

const EmployeeExpenseClaimSchema = new Schema({
  claimNumber: { type: String, required: true, unique: true },
  orgId: { type: String, required: true, index: true },
  companyId: { type: String, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
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

export default mongoose.models.EmployeeExpenseClaim || mongoose.model<IEmployeeExpenseClaim>('EmployeeExpenseClaim', EmployeeExpenseClaimSchema);
