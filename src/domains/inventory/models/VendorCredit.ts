import mongoose, { Schema, Document } from 'mongoose';

export interface IVendorCreditItem {
  itemId?: mongoose.Types.ObjectId;
  account: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface IVendorCredit extends Document {
  currency?: string;
  exchangeRate?: number;
  baseTotal?: number;
  orgId?: string;
  vendorId: mongoose.Types.ObjectId;
  vendorCreditNumber: string;
  creditDate: Date;
  referenceNumber?: string;
  billId?: mongoose.Types.ObjectId;
  lineItems: IVendorCreditItem[];
  subTotal: number;
  totalAmount: number;
  status: 'Draft' | 'Open' | 'Closed' | 'Void';
  refunds: {
    date: Date;
    amount: number;
    reference: string;
  }[];
  appliedToBills: {
    billId: mongoose.Types.ObjectId;
    amountApplied: number;
  }[];
}

const VendorCreditSchema = new Schema({
  currency: { type: String },
  exchangeRate: { type: Number },
  baseTotal: { type: Number },
  orgId: { type: String },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  vendorCreditNumber: { type: String, required: true },
  creditDate: { type: Date, required: true },
  referenceNumber: { type: String },
  billId: { type: Schema.Types.ObjectId, ref: 'BooksBill' },
  lineItems: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Product' },
    account: { type: String, required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true }
  }],
  subTotal: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Draft', 'Open', 'Closed', 'Void'], default: 'Open' },
  refunds: [{
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    reference: { type: String }
  }],
  appliedToBills: [{
    billId: { type: Schema.Types.ObjectId, ref: 'BooksBill' },
    amountApplied: { type: Number, required: true }
  }]
}, { timestamps: true });

export default mongoose.models.VendorCredit || mongoose.model<IVendorCredit>('VendorCredit', VendorCreditSchema);
