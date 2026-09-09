import mongoose, { Document, Schema } from 'mongoose';

export interface ICreditNote extends Document {
  currency?: string;
  exchangeRate?: number;
  baseTotal?: number;
  orgId?: string;
  customer: mongoose.Types.ObjectId;
  creditNoteNumber: string;
  referenceNumber?: string;
  invoiceId?: mongoose.Types.ObjectId;
  salesperson?: string;
  creditNoteDate: Date;
  status: 'Draft' | 'Open' | 'Closed' | 'Void';
  refunds?: { date: Date; amount: number; reference?: string; }[];
  appliedToInvoices?: { invoiceId: mongoose.Types.ObjectId; amountApplied: number; }[];
  
  items: {
    item: mongoose.Types.ObjectId;
    account?: string;
    description?: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  
  subTotal: number;
  discountType: 'percent' | 'amount';
  discountValue: number;
  discount: number;
  adjustment: number;
  total: number;
  
  notes?: string;
  terms?: string;
  attachments?: string[];
  createdBy: string;
}

const CreditNoteSchema = new Schema<ICreditNote>({
  currency: { type: String },
  exchangeRate: { type: Number },
  baseTotal: { type: Number },
    orgId: { type: String },
  customer: { type: Schema.Types.ObjectId, ref: 'BooksCustomer', required: true },
  creditNoteNumber: { type: String, required: true, /* unique removed for compound */ },
  referenceNumber: { type: String },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'BooksInvoice' },
  salesperson: { type: String },
  creditNoteDate: { type: Date, required: true, default: Date.now },
  status: { 
    type: String, 
    enum: ['Draft', 'Open', 'Closed', 'Void'],
    default: 'Draft'
  },
  refunds: [{ date: { type: Date, required: true }, amount: { type: Number, required: true }, reference: { type: String } }],
  appliedToInvoices: [{ invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' }, amountApplied: { type: Number, required: true } }],
  
  items: [{
    item: { type: Schema.Types.ObjectId, ref: 'BooksItem', required: true },
    account: { type: String },
    description: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true }
  }],
  
  subTotal: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v: number) => Math.round(v * 100) / 100, required: true },
  discountType: { type: String, enum: ['percent', 'amount'], default: 'percent' },
  discountValue: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  total: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v: number) => Math.round(v * 100) / 100, required: true },
  
  notes: { type: String },
  terms: { type: String },
  attachments: [{ type: String }],
  createdBy: { type: String, default: 'system' }
}, { timestamps: true, optimisticConcurrency: true });

CreditNoteSchema.index({ orgId: 1, creditNoteNumber: 1 }, { unique: true });
export default mongoose.model<ICreditNote>('CreditNote', CreditNoteSchema);
