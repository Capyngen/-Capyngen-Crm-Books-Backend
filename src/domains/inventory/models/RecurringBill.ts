import mongoose, { Schema, Document } from 'mongoose';

export interface IRecurringBillItem {
  itemId?: mongoose.Types.ObjectId;
  account: string;
  quantity: number;
  rate: number;
  customerId?: mongoose.Types.ObjectId;
  amount: number;
}

export interface IRecurringBill extends Document {
  orgId?: string;
  vendorId: mongoose.Types.ObjectId;
  profileName: string;
  repeatEvery: string;
  startsOn: Date;
  endsOn?: Date;
  taxConfigurationId?: mongoose.Types.ObjectId | string;
  neverExpires: boolean;
  accountsPayable: string;
  lineItems: IRecurringBillItem[];
  
  subTotal: number;
  discount: number;
  discountType: 'amount' | 'percent';
  taxWithheldType: 'none' | 'TDS' | 'TCS';
  taxWithheldAmount: number;
  adjustment: number;


  notes?: string;
  status: 'Active' | 'Stopped' | 'Expired';
  currency: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringBillSchema = new Schema({
    orgId: { type: String },
  vendorId: { type: Schema.Types.ObjectId, ref: 'BooksVendor', required: true },
  profileName: { type: String, required: true },
  repeatEvery: { type: String, required: true },
  startsOn: { type: Date, required: true },
  endsOn: { type: Date },
  taxConfigurationId: { type: Schema.Types.ObjectId, ref: 'TaxConfiguration' },
  neverExpires: { type: Boolean, default: false },
  accountsPayable: { type: String, default: 'Accounts Payable' },
  
  lineItems: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'BooksItem' },
    account: { type: String, required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'BooksCustomer' },
    amount: { type: Number, required: true }
  }],
  
  subTotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['amount', 'percent'], default: 'amount' },
  taxWithheldType: { type: String, enum: ['none', 'TDS', 'TCS'], default: 'none' },
  taxWithheldAmount: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['Active', 'Stopped', 'Expired'],
    default: 'Active'
  },
  currency: { type: String, default: 'INR' },
  createdBy: { type: String }
}, { timestamps: true });

export default mongoose.models.BooksRecurringBill || mongoose.model<IRecurringBill>('BooksRecurringBill', RecurringBillSchema);
