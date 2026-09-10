import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeEntry extends Document {
  orgId: string;
  projectId: mongoose.Types.ObjectId | string;
  employeeId: mongoose.Types.ObjectId | string;
  taskId?: mongoose.Types.ObjectId | string;
  date: Date;
  hours: number;
  isBillable: boolean;
  costRate: number;
  billingRate: number;
  status: 'Unbilled' | 'Invoiced';
  invoiceId?: mongoose.Types.ObjectId | string;
}

const TimeEntrySchema = new Schema({
  orgId: { type: String, required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  taskId: { type: Schema.Types.ObjectId },
  date: { type: Date, required: true },
  hours: { type: Number, required: true },
  isBillable: { type: Boolean, default: true },
  costRate: { type: Number, required: true },
  billingRate: { type: Number, required: true },
  status: { type: String, enum: ['Unbilled', 'Invoiced'], default: 'Unbilled' },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' }
}, { timestamps: true });

export default mongoose.models.TimeEntry || mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);
