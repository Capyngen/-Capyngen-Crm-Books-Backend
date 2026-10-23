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
  companyId?: any;
  vendorId?: mongoose.Types.ObjectId;
  vendor?: mongoose.Types.ObjectId;
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
  companyId: { type: Schema.Types.Mixed },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  vendor: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  profileName: { type: String, required: true },
  repeatEvery: { type: String, required: false },
  frequency: { type: String },
  startDate: { type: Date },
  startsOn: { type: Date, required: false, default: Date.now },
  endsOn: { type: Date },
  taxConfigurationId: { type: Schema.Types.ObjectId, ref: 'TaxConfiguration' },
  neverExpires: { type: Boolean, default: false },
  accountsPayable: { type: String, default: 'Accounts Payable' },
  
  lineItems: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Product' },
    account: { type: String, required: false },
    quantity: { type: Number, required: false, default: 1 },
    rate: { type: Number, required: false, default: 0 },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    amount: { type: Number, required: false, default: 0 }
  }],
  
  subTotal: { type: Number, required: false, default: 0 },
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['amount', 'percent'], default: 'amount' },
  taxWithheldType: { type: String, enum: ['none', 'TDS', 'TCS'], default: 'none' },
  taxWithheldAmount: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },

  notes: { type: String },
  status: { 
    type: String, 
    enum: ['Active', 'Stopped', 'Expired'],
    default: 'Active'
  },
  currency: { type: String, default: 'INR' },
  createdBy: { type: String }
}, { timestamps: true, strict: false });

const RecurringBillModel = mongoose.models.RecurringBill || mongoose.model<IRecurringBill>('RecurringBill', RecurringBillSchema, 'recurringbills');
if (!mongoose.models.BooksRecurringBill) {
  try { mongoose.model('BooksRecurringBill', RecurringBillSchema, 'recurringbills'); } catch (e) {}
}
export default RecurringBillModel;
