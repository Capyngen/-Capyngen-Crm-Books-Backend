import mongoose, { Schema, Document } from 'mongoose';

export interface IMileageExpense extends Document {
  date: Date;
  distance: number;
  rate: number;
  unit: 'km' | 'mile';
  employee?: string;
  amount: number;
  expenseAccount: string;
  paidThrough: string;
  currency: string;
  vendorId?: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  billable: boolean;
  notes?: string;
  status: 'Non-Billable' | 'Unbilled' | 'Invoiced' | 'Reimbursed';
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MileageExpenseSchema = new Schema({
  date: { type: Date, required: true },
  distance: { type: Number, required: true },
  rate: { type: Number, required: true },
  unit: { type: String, enum: ['km', 'mile'], default: 'km' },
  employee: { type: String },
  amount: { type: Number, required: true },
  expenseAccount: { type: String, required: true },
  paidThrough: { type: String, required: true },
  currency: { type: String, default: 'INR' },
  vendorId: { type: Schema.Types.ObjectId, ref: 'BooksVendor' },
  customerId: { type: Schema.Types.ObjectId, ref: 'BooksCustomer' },
  billable: { type: Boolean, default: false },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['Non-Billable', 'Unbilled', 'Invoiced', 'Reimbursed'],
    default: 'Non-Billable'
  },
  createdBy: { type: String }
}, { timestamps: true });

export default mongoose.models.BooksMileageExpense || mongoose.model<IMileageExpense>('BooksMileageExpense', MileageExpenseSchema);
