import mongoose, { Schema, Document } from 'mongoose';

export interface IRecurringExpense extends Document {
  orgId?: string;
  profileName: string;
  repeatEvery: string; // '1 Month', '1 Week', '1 Year' etc.
  startsOn: Date;
  endsOn?: Date;
  expenseAccount: string;
  amount: number;
  paidThrough: string;
  vendorId?: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  billable: boolean;
  notes?: string;
  status: 'Active' | 'Paused' | 'Stopped' | 'Expired';
  currency: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringExpenseSchema = new Schema({
    orgId: { type: String },
  profileName: { type: String, required: true },
  repeatEvery: { type: String, required: true },
  startsOn: { type: Date, required: true },
  endsOn: { type: Date },
  expenseAccount: { type: String, required: true },
  amount: { type: Number, required: true },
  paidThrough: { type: String, required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  customerId: { type: Schema.Types.ObjectId, ref: 'ClientAccount' },
  billable: { type: Boolean, default: false },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['Active', 'Paused', 'Stopped', 'Expired'],
    default: 'Active'
  },
  currency: { type: String, default: 'INR' },
  createdBy: { type: String }
}, { timestamps: true });

export default mongoose.models.BooksRecurringExpense || mongoose.model<IRecurringExpense>('BooksRecurringExpense', RecurringExpenseSchema);
