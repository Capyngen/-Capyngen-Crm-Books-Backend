import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentReceived extends Document {
  customer: mongoose.Types.ObjectId;
  amount: number;
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
  customer: { type: Schema.Types.ObjectId, ref: 'BooksCustomer', required: true },
  amount: { type: Number, required: true },
  bankCharges: { type: Number, default: 0 },
  paymentDate: { type: Date, required: true, default: Date.now },
  paymentNumber: { type: String, required: true, unique: true },
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
  createdBy: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IPaymentReceived>('PaymentReceived', PaymentReceivedSchema);
