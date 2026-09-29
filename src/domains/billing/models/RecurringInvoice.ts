import mongoose, { Document, Schema } from 'mongoose';
import { IInvoiceItem } from './Invoice'; // Reuse item structure

export interface IRecurringInvoice extends Document {
  orgId?: string;
  profileName: string;
  customer: mongoose.Types.ObjectId;
  repeatEvery: string; // e.g., "1 month", "2 weeks", "1 year"
  startsOn: Date;
  endsOn?: Date;
  neverExpires: boolean;
  paymentTerms?: string;
  status: 'Active' | 'Stopped' | 'Draft';
  
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
  
  salesperson?: string;
  projectName?: string;
  projectDetails?: any;
  subject?: string;
  attachments?: string[];
  
  notes?: string;
  terms?: string;
  createdBy: string;
}

const RecurringInvoiceItemSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: 'BooksItem', required: true },
  description: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 }
});

const RecurringInvoiceSchema = new Schema<IRecurringInvoice>({
    orgId: { type: String },
  profileName: { type: String, required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'BooksCustomer', required: true },
  repeatEvery: { type: String, required: true, default: '1 month' },
  startsOn: { type: Date, required: true, default: Date.now },
  endsOn: { type: Date },
  neverExpires: { type: Boolean, default: false },
  paymentTerms: { type: String },
  status: { 
    type: String, 
    enum: ['Active', 'Stopped', 'Draft'],
    default: 'Draft'
  },
  
  items: [RecurringInvoiceItemSchema],
  subTotal: { type: Number, required: true, default: 0 },
  discountType: { type: String, enum: ['amount', 'percent'], default: 'amount' },
  discountValue: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  taxWithheldType: { type: String, enum: ['TDS', 'TCS', 'none'], default: 'none' },
  taxWithheldAmount: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  taxTotal: { type: Number, default: 0 },
  total: { type: Number, required: true, default: 0 },
  
  salesperson: { type: String },
  projectName: { type: String },
  projectDetails: { type: Schema.Types.Mixed },
  subject: { type: String },
  attachments: [{ type: String }],
  
  notes: { type: String },
  terms: { type: String },
  createdBy: { type: String, default: 'system' }
}, { timestamps: true });

export default mongoose.model<IRecurringInvoice>('RecurringInvoice', RecurringInvoiceSchema);
