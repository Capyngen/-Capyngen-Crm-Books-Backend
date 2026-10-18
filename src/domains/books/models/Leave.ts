import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveApplication extends Document {
  orgId: string;
  companyId?: string;
  employeeId: mongoose.Types.ObjectId | string;
  employeeName?: string;
  employeeCode?: string;
  leaveType: 'Paid Leave' | 'Casual Leave' | 'Sick Leave' | 'Maternity Leave' | 'Paternity Leave' | 'Compensatory Off' | 'Loss of Pay';
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  approvedBy?: string;
  approvalDate?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILeaveBalance extends Document {
  orgId: string;
  companyId?: string;
  employeeId: mongoose.Types.ObjectId | string;
  year: number;
  paidLeave: { allocated: number; used: number; balance: number };
  casualLeave: { allocated: number; used: number; balance: number };
  sickLeave: { allocated: number; used: number; balance: number };
  lossOfPay: { used: number };
  createdAt: Date;
  updatedAt: Date;
}

const LeaveApplicationSchema = new Schema({
  orgId: { type: String, required: true, index: true },
  companyId: { type: String, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  employeeName: { type: String },
  employeeCode: { type: String },
  leaveType: { 
    type: String, 
    enum: ['Paid Leave', 'Casual Leave', 'Sick Leave', 'Maternity Leave', 'Paternity Leave', 'Compensatory Off', 'Loss of Pay'], 
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], 
    default: 'Pending' 
  },
  approvedBy: { type: String },
  approvalDate: { type: Date },
  rejectionReason: { type: String }
}, { timestamps: true });

const LeaveBalanceSchema = new Schema({
  orgId: { type: String, required: true, index: true },
  companyId: { type: String, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  year: { type: Number, required: true },
  paidLeave: {
    allocated: { type: Number, default: 18 },
    used: { type: Number, default: 0 },
    balance: { type: Number, default: 18 }
  },
  casualLeave: {
    allocated: { type: Number, default: 12 },
    used: { type: Number, default: 0 },
    balance: { type: Number, default: 12 }
  },
  sickLeave: {
    allocated: { type: Number, default: 12 },
    used: { type: Number, default: 0 },
    balance: { type: Number, default: 12 }
  },
  lossOfPay: {
    used: { type: Number, default: 0 }
  }
}, { timestamps: true });

LeaveBalanceSchema.index({ orgId: 1, employeeId: 1, year: 1 }, { unique: true });

export const LeaveApplication = mongoose.models.LeaveApplication || mongoose.model<ILeaveApplication>('LeaveApplication', LeaveApplicationSchema);
export const LeaveBalance = mongoose.models.LeaveBalance || mongoose.model<ILeaveBalance>('LeaveBalance', LeaveBalanceSchema);
