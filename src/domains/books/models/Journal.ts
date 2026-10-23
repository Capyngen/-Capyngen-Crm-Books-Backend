import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IJournalLineItem {
  account: string;
  description?: string;
  contact?: string;
  debits: number;
  credits: number;
  costCenter?: string;
  department?: string;
}

export interface IJournal extends Document {
  orgId?: string;
  date: Date;
  reverseJournalDate?: Date;
  publishReverseOnlyOnDate: boolean;
  journalNumber: string;
  referenceNumber?: string;
  notes: string;
  reportingMethod: 'accrual' | 'cash' | 'both';
  currency: string;
  lineItems: IJournalLineItem[];
  subTotal: number;
  total: number;
  status: 'Draft' | 'Published' | 'Void' | 'Reversed';
  // Enterprise Reversal Tracking
  reversalOfId?: Types.ObjectId;
  reversedById?: Types.ObjectId;
  reversalReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JournalLineItemSchema = new Schema({
  account: { type: String, required: true },
  description: { type: String },
  contact: { type: String },
  debits: { type: Number, default: 0 },
  credits: { type: Number, default: 0 },
  costCenter: { type: String },
  department: { type: String }
});

const JournalSchema = new Schema<IJournal>(
  {
    orgId: { type: String },
    date: { type: Date, required: true },
    reverseJournalDate: { type: Date },
    publishReverseOnlyOnDate: { type: Boolean, default: false },
    journalNumber: { type: String, required: true, unique: true },
    referenceNumber: { type: String },
    notes: { type: String, required: true },
    reportingMethod: { type: String, enum: ['accrual', 'cash', 'both'], required: true },
    currency: { type: String, default: 'INR' },
    lineItems: [JournalLineItemSchema],
    subTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { type: String, enum: ['Draft', 'Published', 'Void', 'Reversed'], default: 'Draft' },
    reversalOfId: { type: Schema.Types.ObjectId, ref: 'Journal' },
    reversedById: { type: Schema.Types.ObjectId, ref: 'Journal' },
    reversalReason: { type: String }
  },
  { timestamps: true }
);

// Indexes for fast lookup of reversals
JournalSchema.index({ orgId: 1, date: -1 });
JournalSchema.index({ reversalOfId: 1 });

export const Journal = mongoose.models.Journal || mongoose.model<IJournal>('Journal', JournalSchema, 'booksjournals');
if (!mongoose.models.BooksJournal) {
  try { mongoose.model('BooksJournal', JournalSchema, 'booksjournals'); } catch (e) {}
}
