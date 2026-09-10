import mongoose, { Schema, Document } from 'mongoose';

export interface IBankStatementLine extends Document {
  orgId: string;
  bankAccountId: string | mongoose.Types.ObjectId;
  date: Date;
  description: string;
  amount: number; // Positive = Credit, Negative = Debit
  status: 'Unreconciled' | 'Matched' | 'Categorized';
  linkedTransactionId?: string;
  linkedTransactionType?: string; 
}

const BankStatementLineSchema = new Schema({
  orgId: { type: String, required: true },
  bankAccountId: { type: Schema.Types.ObjectId, ref: 'BankAccount', required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Unreconciled', 'Matched', 'Categorized'], default: 'Unreconciled' },
  linkedTransactionId: { type: String },
  linkedTransactionType: { type: String }
}, { timestamps: true });

export default mongoose.models.BankStatementLine || mongoose.model<IBankStatementLine>('BankStatementLine', BankStatementLineSchema);
