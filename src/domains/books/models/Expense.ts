import mongoose, { Schema, Document } from 'mongoose';

export interface IExpenseLineItem {
  expenseAccount: string;
  notes?: string;
  amount: number;
}

export interface IMileageData {
  distance: number;
  rate: number;
  unit: 'km' | 'mile';
  employee?: string;
}

export interface IExpense extends Document {
  expenseType: 'Goods' | 'Mileage';
  date: Date;
  expenseAccount?: string; 
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  vendorId?: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  billable: boolean;
  reference?: string;
  notes?: string;
  status: 'Non-Billable' | 'Unbilled' | 'Invoiced' | 'Reimbursed';
  receiptUrl?: string;
  isItemized: boolean;
  lineItems: IExpenseLineItem[];
  mileageData?: IMileageData;
  paidThrough?: string;
  currency?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseLineItemSchema = new Schema({
  expenseAccount: { type: String, required: true },
  notes: { type: String },
  amount: { type: Number, required: true }
}, { _id: false });

const MileageDataSchema = new Schema({
  distance: { type: Number, required: true },
  rate: { type: Number, required: true },
  unit: { type: String, enum: ['km', 'mile'], default: 'km' },
  employee: { type: String }
}, { _id: false });

const ExpenseSchema = new Schema({
  expenseType: { type: String, enum: ['Goods', 'Mileage'], default: 'Goods' },
  date: { type: Date, required: true },
  expenseAccount: { type: String },
  amount: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'BooksVendor' },
  customerId: { type: Schema.Types.ObjectId, ref: 'BooksCustomer' },
  billable: { type: Boolean, default: false },
  reference: { type: String },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['Non-Billable', 'Unbilled', 'Invoiced', 'Reimbursed'],
    default: 'Non-Billable'
  },
  receiptUrl: { type: String },
  isItemized: { type: Boolean, default: false },
  lineItems: { type: [ExpenseLineItemSchema], default: [] },
  mileageData: { type: MileageDataSchema },
  bulkBatchId: { type: String },
  paidThrough: { type: String },
  currency: { type: String, default: 'INR' },
  createdBy: { type: String }
}, { timestamps: true });

export default mongoose.models.BooksExpense || mongoose.model<IExpense>('BooksExpense', ExpenseSchema);
