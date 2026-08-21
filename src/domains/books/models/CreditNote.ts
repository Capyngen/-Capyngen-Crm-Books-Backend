import mongoose, { Document, Schema } from 'mongoose';

export interface ICreditNote extends Document {
  customer: mongoose.Types.ObjectId;
  creditNoteNumber: string;
  referenceNumber?: string;
  creditNoteDate: Date;
  status: 'Draft' | 'Open' | 'Closed' | 'Void';
  
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
  customer: { type: Schema.Types.ObjectId, ref: 'BooksCustomer', required: true },
  creditNoteNumber: { type: String, required: true, unique: true },
  referenceNumber: { type: String },
  creditNoteDate: { type: Date, required: true, default: Date.now },
  status: { 
    type: String, 
    enum: ['Draft', 'Open', 'Closed', 'Void'],
    default: 'Draft'
  },
  
  items: [{
    item: { type: Schema.Types.ObjectId, ref: 'BooksItem', required: true },
    account: { type: String },
    description: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true }
  }],
  
  subTotal: { type: Number, required: true },
  discountType: { type: String, enum: ['percent', 'amount'], default: 'percent' },
  discountValue: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  total: { type: Number, required: true },
  
  notes: { type: String },
  terms: { type: String },
  attachments: [{ type: String }],
  createdBy: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<ICreditNote>('CreditNote', CreditNoteSchema);
