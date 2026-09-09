import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  orgId: string;
  employeeName: string;
  costRate: number; // Stored natively for time entries
  defaultBillingRate?: number;
}

const EmployeeSchema = new Schema({
  orgId: { type: String, required: true },
  employeeName: { type: String, required: true },
  costRate: { type: Number, required: true },
  defaultBillingRate: { type: Number }
}, { timestamps: true });

export default mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);
