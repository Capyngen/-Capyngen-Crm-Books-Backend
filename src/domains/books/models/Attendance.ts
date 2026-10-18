import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  orgId: string;
  companyId?: string;
  employeeId: mongoose.Types.ObjectId | string;
  employeeCode?: string;
  employeeName?: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  totalHours: number;
  overtimeHours: number;
  shift: 'General' | 'Morning' | 'Evening' | 'Night';
  status: 'Present' | 'Absent' | 'Half-Day' | 'On Leave' | 'Holiday' | 'Weekend';
  lateArrivalMinutes: number;
  earlyExitMinutes: number;
  punchSource: 'Web' | 'Mobile' | 'Biometric' | 'Manual Override';
  biometricDeviceId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema({
  orgId: { type: String, required: true, index: true },
  companyId: { type: String, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  employeeCode: { type: String },
  employeeName: { type: String },
  date: { type: Date, required: true, index: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  totalHours: { type: Number, default: 0 },
  overtimeHours: { type: Number, default: 0 },
  shift: { 
    type: String, 
    enum: ['General', 'Morning', 'Evening', 'Night'], 
    default: 'General' 
  },
  status: { 
    type: String, 
    enum: ['Present', 'Absent', 'Half-Day', 'On Leave', 'Holiday', 'Weekend'], 
    default: 'Present' 
  },
  lateArrivalMinutes: { type: Number, default: 0 },
  earlyExitMinutes: { type: Number, default: 0 },
  punchSource: { 
    type: String, 
    enum: ['Web', 'Mobile', 'Biometric', 'Manual Override'], 
    default: 'Web' 
  },
  biometricDeviceId: { type: String },
  notes: { type: String }
}, { timestamps: true });

AttendanceSchema.index({ orgId: 1, employeeId: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
