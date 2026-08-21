import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoiceItem {
  item: mongoose.Types.ObjectId;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  customer: mongoose.Types.ObjectId;
  invoiceDate: Date;
  dueDate?: Date;
  paymentTerms?: string;
  status: 'Draft' | 'Sent' | 'Viewed' | 'Paid' | 'PartiallyPaid' | 'Void' | 'Overdue';
  referenceNumber?: string;
  orderNumber?: string;
  accountsReceivable?: string;
  items: IInvoiceItem[];
  subTotal: number;
  discountType?: 'amount' | 'percent';
  discountValue?: number;
  discount?: number;
  taxWithheldType?: 'TDS' | 'TCS' | 'none';
  taxWithheldAmount?: number;
  adjustment?: number;
  taxTotal?: number;
  total: number;
  balanceDue: number;
  
  salesperson?: string;
  projectName?: string;
  projectDetails?: any;
  subject?: string;
  attachments?: string[];
  
  notes?: string;
  terms?: string;
  createdBy: string;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
  item: { type: Schema.Types.ObjectId, ref: 'BooksItem', required: true },
  description: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 }
});

const InvoiceSchema = new Schema<IInvoice>({
  invoiceNumber: { type: String, required: true, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: 'BooksCustomer', required: true },
  invoiceDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date },
  paymentTerms: { type: String },
  status: { 
    type: String, 
    enum: ['Draft', 'Sent', 'Viewed', 'Paid', 'PartiallyPaid', 'Void', 'Overdue'],
    default: 'Draft'
  },
  referenceNumber: { type: String },
  orderNumber: { type: String },
  accountsReceivable: { type: String, default: 'Accounts Receivable' },
  items: [InvoiceItemSchema],
  subTotal: { type: Number, required: true, default: 0 },
  discountType: { type: String, enum: ['amount', 'percent'], default: 'amount' },
  discountValue: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  taxWithheldType: { type: String, enum: ['TDS', 'TCS', 'none'], default: 'none' },
  taxWithheldAmount: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  taxTotal: { type: Number, default: 0 },
  total: { type: Number, required: true, default: 0 },
  balanceDue: { type: Number, required: true, default: 0 },
  
  salesperson: { type: String },
  projectName: { type: String },
  projectDetails: { type: Schema.Types.Mixed },
  subject: { type: String },
  attachments: [{ type: String }],
  
  notes: { type: String },
  terms: { type: String },
  createdBy: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
