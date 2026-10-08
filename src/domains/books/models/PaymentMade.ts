import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentMade extends Document {
  branchId?: mongoose.Types.ObjectId | string;
  projectId?: mongoose.Types.ObjectId | string;
  reportingTagIds?: (mongoose.Types.ObjectId | string)[];

  exchangeRate?: number;
  baseTotal?: number;
  orgId?: string;
  vendorId: mongoose.Types.ObjectId;
  paymentType: 'Bill Payment' | 'Vendor Advance';
  paymentNumber: string;
  amount: number;
  paymentDate: Date;
  paymentMode: string;
  paidThrough: string;
  referenceNumber?: string;
  notes?: string;
  
  // For Vendor Advance
  depositTo?: string;
  tds?: {
    taxName: string;
    rate: number;
    act: string;
    section: string;
    isHigherRate: boolean;
    startDate: Date;
    endDate?: Date;
  };
  
  // For Bill Payment
  bills?: {
    billId: mongoose.Types.ObjectId;
    amountApplied: number;
  }[];
  
  status: 'Open' | 'Closed' | 'Void';
  createdAt: Date;
  updatedAt: Date;
}

const PaymentMadeSchema = new Schema({
  branchId: { type: Schema.Types.ObjectId, ref: 'BooksBranch' },
  projectId: { type: Schema.Types.ObjectId, ref: 'BooksProject' },
  reportingTagIds: [{ type: Schema.Types.ObjectId, ref: 'ReportingTag' }],
  currency: { type: String },
  exchangeRate: { type: Number },
  baseTotal: { type: Number },
    orgId: { type: String },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  paymentType: { type: String, enum: ['Bill Payment', 'Vendor Advance'], required: true },
  paymentNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true },
  paymentMode: { type: String, required: true },
  paidThrough: { type: String, required: true },
  referenceNumber: { type: String },
  disbursementStatus: { type: String, enum: ['Pending', 'Processed', 'Failed'], default: 'Pending' },
  remittanceAdviceSent: { type: Boolean, default: false },
  notes: { type: String },
  
  depositTo: { type: String },
  tds: {
    taxName: { type: String },
    rate: { type: Number },
    act: { type: String },
    section: { type: String },
    isHigherRate: { type: Boolean },
    startDate: { type: Date },
    endDate: { type: Date }
  },
  
  bills: [{
    billId: { type: Schema.Types.ObjectId, ref: 'BooksBill' },
    amountApplied: { type: Number }
  }],
  
  status: { type: String, enum: ['Open', 'Closed', 'Void'], default: 'Closed' }
}, { timestamps: true });

export default mongoose.models.BooksPaymentMade || mongoose.model<IPaymentMade>('BooksPaymentMade', PaymentMadeSchema);
