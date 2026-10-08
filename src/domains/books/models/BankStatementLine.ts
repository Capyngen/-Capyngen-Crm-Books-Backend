import mongoose, { Schema, Document } from 'mongoose';

export interface IBankStatementLine extends Document {
  orgId: string;
  bankAccountId: mongoose.Types.ObjectId;
  date: Date;
  description: string;
  payee?: string;
  reference?: string;
  amount: number; // Positive = Deposit, Negative = Withdrawal
  
  // Enterprise Reconciliation Fields
  reconciliationStatus: 'Unreconciled' | 'Reconciled' | 'Ignored';
  matchedTransactionId?: mongoose.Types.ObjectId;
  matchedTransactionModel?: 'Journal' | 'Expense' | 'PaymentMade';
  
  // Smart matching metadata (Not saved persistently if Unreconciled, but useful for caching)
  suggestedMatch?: {
    matchType: 'Rule' | 'AI' | 'Exact';
    confidence: number;
    ruleId?: mongoose.Types.ObjectId;
    accountId?: mongoose.Types.ObjectId; // suggested GL account
    transactionId?: mongoose.Types.ObjectId; // suggested existing transaction
    message?: string;
  };
}

const BankStatementLineSchema = new Schema({
  orgId: { type: String, required: true, index: true },
  bankAccountId: { type: Schema.Types.ObjectId, ref: 'BankAccount', required: true, index: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  payee: { type: String },
  reference: { type: String },
  amount: { type: Number, required: true },
  
  reconciliationStatus: { type: String, enum: ['Unreconciled', 'Reconciled', 'Ignored'], default: 'Unreconciled', index: true },
  matchedTransactionId: { type: Schema.Types.ObjectId },
  matchedTransactionModel: { type: String, enum: ['Journal', 'Expense', 'PaymentMade'] },
  
  suggestedMatch: { type: Schema.Types.Mixed }
}, { timestamps: true });

export const BankStatementLine = mongoose.models.BankStatementLine || mongoose.model<IBankStatementLine>('BankStatementLine', BankStatementLineSchema);
