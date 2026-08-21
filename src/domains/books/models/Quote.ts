import mongoose, { Document, Schema } from 'mongoose';

export interface IQuoteItem {
  item: mongoose.Types.ObjectId;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface IQuote extends Document {
  quoteNumber: string;
  customer: mongoose.Types.ObjectId;
  quoteDate: Date;
  expiryDate?: Date;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired' | 'Invoiced';
  referenceNumber?: string;
  items: IQuoteItem[];
  subTotal: number;
  discountType?: 'amount' | 'percent';
  discountValue?: number;
  discount?: number; // the calculated amount
  taxWithheldType?: 'TDS' | 'TCS' | 'none';
  taxWithheldAmount?: number;
  adjustment?: number;
  taxTotal?: number;
  total: number;
  
  salesperson?: string;
  projectName?: string;
  projectDetails?: {
    projectName: string;
    projectCode?: string;
    customer?: mongoose.Types.ObjectId;
    billingMethod?: string;
    budgetType?: string;
    users?: string[];
  };
  subject?: string;
  attachments?: string[];
  
  notes?: string;
  terms?: string;
  createdBy: string;
}

const QuoteItemSchema = new Schema<IQuoteItem>({
  item: { type: Schema.Types.ObjectId, ref: 'BooksItem', required: true },
  description: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 }
});

const QuoteSchema = new Schema<IQuote>({
  quoteNumber: { type: String, required: true, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: 'BooksCustomer', required: true },
  quoteDate: { type: Date, required: true, default: Date.now },
  expiryDate: { type: Date },
  status: { 
    type: String, 
    enum: ['Draft', 'Sent', 'Accepted', 'Declined', 'Expired', 'Invoiced'],
    default: 'Draft'
  },
  referenceNumber: { type: String },
  items: [QuoteItemSchema],
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
  projectDetails: {
    projectName: String,
    projectCode: String,
    customer: { type: Schema.Types.ObjectId, ref: 'BooksCustomer' },
    billingMethod: String,
    totalProjectCost: Number,
    description: String,
    budget: {
      costBudget: Number,
      revenueBudget: Number
    },
    users: [{ name: String, email: String }],
    tasks: [{ taskName: String, description: String }],
    addToWatchlist: Boolean
  },
  subject: { type: String },
  attachments: [{ type: String }],
  
  notes: { type: String },
  terms: { type: String },
  createdBy: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IQuote>('Quote', QuoteSchema);
