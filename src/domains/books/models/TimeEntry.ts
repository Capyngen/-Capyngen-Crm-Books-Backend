import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeEntry extends Document {
  orgId: string;
  projectId?: mongoose.Types.ObjectId | string;
  project?: mongoose.Types.ObjectId | string;
  employeeId?: mongoose.Types.ObjectId | string;
  employee?: mongoose.Types.ObjectId | string;
  taskId?: mongoose.Types.ObjectId | string;
  date: Date;
  hours: number;
  timeSpent?: string;
  isBillable: boolean;
  costRate?: number;
  billingRate?: number;
  status: 'Unbilled' | 'Invoiced' | 'Billed';
  invoiceId?: mongoose.Types.ObjectId | string;
}

const TimeEntrySchema = new Schema({
  orgId: { type: String, required: false },
  companyId: { type: Schema.Types.Mixed },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: false },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: false },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: false },
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: false },
  taskId: { type: Schema.Types.ObjectId },
  task: { type: String },
  date: { type: Date, required: true },
  hours: { type: Number, required: true },
  timeSpent: { type: String },
  isBillable: { type: Boolean, default: true },
  costRate: { type: Number, default: 0 },
  billingRate: { type: Number, default: 0 },
  status: { type: String, default: 'Unbilled' },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' }
}, { timestamps: true, strict: false });

const TimeEntryModel = mongoose.models.TimeEntry || mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema, 'timeentries');
export default TimeEntryModel;
