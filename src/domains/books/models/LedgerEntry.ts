import mongoose, { Schema, Document } from 'mongoose';

export interface ILedgerLine {
  accountId: mongoose.Types.ObjectId | string;
  debit: number;
  credit: number;
  contactId?: mongoose.Types.ObjectId | string;
  branchId?: mongoose.Types.ObjectId | string;
  projectId?: mongoose.Types.ObjectId | string;
  reportingTagIds?: (mongoose.Types.ObjectId | string)[];
  description?: string;
}

export interface ILedgerEntry extends Document {
  orgId: string;
  transactionId: string; // The ID of the Invoice, Bill, Payment, etc.
  transactionType: 'Invoice' | 'Bill' | 'Expense' | 'PaymentReceived' | 'PaymentMade' | 'CreditNote' | 'VendorCredit' | 'ManualJournal' | 'InventoryAdjustment';
  date: Date;
  lines: ILedgerLine[];
  currency?: string;
  status: 'Posted' | 'Void';
  createdAt: Date;
}

const LedgerLineSchema = new Schema({
  accountId: { type: Schema.Types.Mixed, required: true },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  contactId: { type: Schema.Types.Mixed },
  branchId: { type: Schema.Types.ObjectId, ref: 'BooksBranch' },
  projectId: { type: Schema.Types.ObjectId, ref: 'BooksProject' },
  reportingTagIds: [{ type: Schema.Types.ObjectId, ref: 'ReportingTag' }],
  description: { type: String }
});

const LedgerEntrySchema = new Schema({
  orgId: { type: String, required: true, index: true },
  transactionId: { type: String, required: true, index: true },
  transactionType: { type: String, required: true },
  date: { type: Date, required: true, index: true },
  lines: [LedgerLineSchema],
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['Posted', 'Void'], default: 'Posted' }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

export default mongoose.model<ILedgerEntry>('LedgerEntry', LedgerEntrySchema);
