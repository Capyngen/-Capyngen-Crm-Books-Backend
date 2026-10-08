import mongoose, { Schema, Document } from 'mongoose';
import { IJournalLineItem } from './Journal';

export interface IRecurringJournal extends Document {
  orgId: string;
  profileName: string;
  notes: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | 'Custom';
  interval: number; // e.g., every 1 month
  startsOn: Date;
  endsOn?: Date;
  endsAfterOccurrences?: number;
  occurrencesPosted: number;
  nextRunDate: Date;
  lastRunDate?: Date;
  status: 'Active' | 'Paused' | 'Expired';
  lastError?: string;
  reportingMethod: 'accrual' | 'cash' | 'both';
  currency: string;
  lineItems: IJournalLineItem[];
  subTotal: number;
  total: number;
}

const LineItemSchema = new Schema({
  account: { type: String, required: true },
  description: { type: String },
  contact: { type: String },
  debits: { type: Number, default: 0 },
  credits: { type: Number, default: 0 },
  costCenter: { type: String },
  department: { type: String }
});

const RecurringJournalSchema = new Schema({
  orgId: { type: String, required: true, index: true },
  profileName: { type: String, required: true },
  notes: { type: String, required: true },
  frequency: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'], required: true },
  interval: { type: Number, default: 1 },
  startsOn: { type: Date, required: true },
  endsOn: { type: Date },
  endsAfterOccurrences: { type: Number },
  occurrencesPosted: { type: Number, default: 0 },
  nextRunDate: { type: Date, required: true, index: true },
  lastRunDate: { type: Date },
  status: { type: String, enum: ['Active', 'Paused', 'Expired'], default: 'Active', index: true },
  lastError: { type: String },
  reportingMethod: { type: String, enum: ['accrual', 'cash', 'both'], required: true },
  currency: { type: String, default: 'INR' },
  lineItems: [LineItemSchema],
  subTotal: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { timestamps: true });

export const RecurringJournal = mongoose.models.RecurringJournal || mongoose.model<IRecurringJournal>('RecurringJournal', RecurringJournalSchema);
