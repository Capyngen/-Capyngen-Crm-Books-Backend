import mongoose, { Schema, Document } from 'mongoose';

export interface IJournalLineItem {
  account: string;
  description?: string;
  contact?: string;
  debits: number;
  credits: number;
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
  status: 'Draft' | 'Published' | 'Void';
  createdAt: Date;
  updatedAt: Date;
}

const JournalLineItemSchema = new Schema({
  account: { type: String, required: true },
  description: { type: String },
  contact: { type: String },
  debits: { type: Number, default: 0 },
  credits: { type: Number, default: 0 }
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
    status: { type: String, enum: ['Draft', 'Published', 'Void'], default: 'Draft' }
  },
  { timestamps: true }
);

export const Journal = mongoose.model<IJournal>('Journal', JournalSchema);
