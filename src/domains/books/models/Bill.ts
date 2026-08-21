import mongoose, { Schema, Document } from 'mongoose';

export interface IBillItem {
  itemId?: mongoose.Types.ObjectId;
  account: string;
  quantity: number;
  rate: number;
  discount: number;
  customerId?: mongoose.Types.ObjectId;
  amount: number;
}

export interface IBill extends Document {
  vendorId: mongoose.Types.ObjectId;
  billNumber: string;
  orderNumber?: string;
  billDate: Date;
  dueDate?: Date;
  accountsPayable: string;
  subject?: string;
  lineItems: IBillItem[];
  
  subTotal: number;
  discount: number;
  discountType: 'amount' | 'percent';
  taxWithheldType: 'none' | 'TDS' | 'TCS';
  taxWithheldAmount: number;
  adjustment: number;
  totalAmount: number;

  notes?: string;
  status: 'Draft' | 'Open' | 'Partially Paid' | 'Paid' | 'Void';
  currency: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: 'BooksVendor', required: true },
  billNumber: { type: String, required: true },
  orderNumber: { type: String },
  billDate: { type: Date, required: true },
  dueDate: { type: Date },
  accountsPayable: { type: String, default: 'Accounts Payable' },
  subject: { type: String },
  
  lineItems: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'BooksItem' },
    account: { type: String, required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    discount: { type: Number, default: 0 },
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
    enum: ['Draft', 'Open', 'Partially Paid', 'Paid', 'Void'],
    default: 'Open'
  },
  currency: { type: String, default: 'INR' },
  createdBy: { type: String }
}, { timestamps: true });

export default mongoose.models.BooksBill || mongoose.model<IBill>('BooksBill', BillSchema);
