import mongoose, { Schema, Document } from 'mongoose';

export interface IInterCompanyTransaction extends Document {
  fromOrgId: string;
  toOrgId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: string;
  transactionDate: Date;
  description: string;
  status: 'Pending' | 'Approved' | 'Posted' | 'Rejected';
  fromJournalId?: string;
  toJournalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InterCompanyTransactionSchema = new Schema<IInterCompanyTransaction>({
  fromOrgId: { type: String, required: true, index: true },
  toOrgId: { type: String, required: true, index: true },
  fromAccountId: { type: String, required: true },
  toAccountId: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  transactionDate: { type: Date, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Posted', 'Rejected'], default: 'Pending' },
  fromJournalId: { type: String },
  toJournalId: { type: String }
}, { timestamps: true });

export const InterCompanyTransaction = mongoose.model<IInterCompanyTransaction>('InterCompanyTransaction', InterCompanyTransactionSchema);
