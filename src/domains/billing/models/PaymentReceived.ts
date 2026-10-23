import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentReceived extends Document {
  branchId?: mongoose.Types.ObjectId | string;
  projectId?: mongoose.Types.ObjectId | string;
  reportingTagIds?: (mongoose.Types.ObjectId | string)[];
  currency?: string;
  exchangeRate?: number;
  baseTotal?: number;
  orgId?: string;
  companyId?: string;
  customer: mongoose.Types.ObjectId;
  amount: number;
  unusedAmount?: number;
  bankCharges?: number;
  paymentDate: Date;
  paymentNumber: string;
  paymentMode: string;
  depositTo?: string;
  referenceNumber?: string;
  taxDeducted: boolean;
  taxType?: string;
  taxAmount?: number;
  
  invoices: {
    invoice: mongoose.Types.ObjectId;
    amountApplied: number;
  }[];
  
  amountUsed: number;
  amountRefunded: number;
  amountInExcess: number;
  
  notes?: string;
  attachments?: string[];
  sendThankYouNote: boolean;
  
  status: 'Unused' | 'Partially Used' | 'Closed';
  createdBy: string;
}

const PaymentReceivedSchema = new Schema<IPaymentReceived>({
  branchId: { type: Schema.Types.ObjectId, ref: 'BooksBranch' },
  projectId: { type: Schema.Types.ObjectId, ref: 'BooksProject' },
  reportingTagIds: [{ type: Schema.Types.ObjectId, ref: 'ReportingTag' }],
  currency: { type: String },
  exchangeRate: { type: Number },
  baseTotal: { type: Number },
  orgId: { type: Schema.Types.Mixed, index: true },
  companyId: { type: Schema.Types.Mixed, index: true },
  customer: { type: Schema.Types.ObjectId, ref: 'ClientAccount', required: true },
  amount: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v: number) => Math.round(v * 100) / 100, required: true },
  unusedAmount: { type: Number, default: 0, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v: number) => Math.round(v * 100) / 100 },
  bankCharges: { type: Number, default: 0 },
  paymentDate: { type: Date, required: true, default: Date.now },
  paymentNumber: { type: String, required: true, /* unique removed for compound */ },
  paymentMode: { type: String, required: true },
  depositTo: { type: String },
  referenceNumber: { type: String },
  
  taxDeducted: { type: Boolean, default: false },
  taxType: { type: String },
  taxAmount: { type: Number, default: 0 },
  
  invoices: [{
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    amountApplied: { type: Number, required: true }
  }],
  
  amountUsed: { type: Number, default: 0 },
  amountRefunded: { type: Number, default: 0 },
  amountInExcess: { type: Number, default: 0 },
  
  notes: { type: String },
  attachments: [{ type: String }],
  sendThankYouNote: { type: Boolean, default: false },
  
  status: { 
    type: String, 
    enum: ['Unused', 'Partially Used', 'Closed'],
    default: 'Unused'
  },
  createdBy: { type: String, default: 'system' }
}, { timestamps: true, optimisticConcurrency: true });

export default mongoose.models.PaymentReceived || mongoose.model<IPaymentReceived>('PaymentReceived', PaymentReceivedSchema, 'paymentsreceived');
