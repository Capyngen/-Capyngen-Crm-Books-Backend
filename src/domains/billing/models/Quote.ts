import mongoose, { Document, Schema } from 'mongoose';

export interface IQuoteItem {
  item?: mongoose.Types.ObjectId;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface IQuote extends Document {
  orgId?: string;
  companyId?: string;
  quoteNumber: string;
  customer: mongoose.Types.ObjectId;
  quoteDate: Date;
  expiryDate?: Date;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired' | 'Invoiced';
  approvalStatus?: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  dispatchStatus?: 'Not Sent' | 'Sent' | 'Viewed';
  rejectionReason?: string;
  referenceNumber?: string;
  salesOrderId?: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
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
  // Enterprise Features
  version?: number;
  parentQuoteId?: mongoose.Types.ObjectId;
  eSignature?: { signedBy: string; signedAt: Date; ipAddress: string; documentHash: string };
}

const QuoteItemSchema = new Schema<IQuoteItem>({
  item: { type: Schema.Types.ObjectId, ref: 'Product', required: false },
  description: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 }
});

const QuoteSchema = new Schema<IQuote>({
  orgId: { type: String },
  companyId: { type: String },
  quoteNumber: { type: String, required: true, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: 'ClientAccount', required: true },
  quoteDate: { type: Date, required: true, default: Date.now },
  expiryDate: { type: Date },
  status: { 
    type: String, 
    enum: ['Draft', 'Sent', 'Accepted', 'Declined', 'Expired', 'Invoiced'],
    default: 'Sent'
  },
  approvalStatus: {
    type: String,
    enum: ['Draft', 'Pending', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  dispatchStatus: {
    type: String,
    enum: ['Not Sent', 'Sent', 'Viewed'],
    default: 'Not Sent'
  },
  rejectionReason: { type: String },
  referenceNumber: { type: String },
  salesOrderId: { type: Schema.Types.ObjectId, ref: 'SalesOrder' },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
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
    customer: { type: Schema.Types.ObjectId, ref: 'ClientAccount' },
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
  createdBy: { type: String, default: 'system' },
  version: { type: Number, default: 1 },
  parentQuoteId: { type: Schema.Types.ObjectId, ref: 'Quote' },
  eSignature: {
    signedBy: String,
    signedAt: Date,
    ipAddress: String,
    documentHash: String
  }
}, { timestamps: true });

export default mongoose.model<IQuote>('Quote', QuoteSchema);
