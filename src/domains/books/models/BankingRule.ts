import mongoose, { Schema, Document } from 'mongoose';

export interface ICondition {
  field: 'Description' | 'Amount' | 'Payee';
  operator: 'Contains' | 'Equals' | 'StartsWith' | 'IsGreaterThan' | 'IsLessThan';
  value: string;
}

export interface IBankingRule extends Document {
  orgId: string;
  ruleName: string;
  bankAccountId?: mongoose.Types.ObjectId;
  transactionType: 'Deposit' | 'Withdrawal' | 'Both';
  matchType: 'All' | 'Any';
  conditions: ICondition[];
  // Actions
  assignAccountId: mongoose.Types.ObjectId; // The GL account to categorize to
  assignContactId?: mongoose.Types.ObjectId;
  assignTaxId?: mongoose.Types.ObjectId;
  isActive: boolean;
  order: number;
}

const ConditionSchema = new Schema({
  field: { type: String, enum: ['Description', 'Amount', 'Payee'], required: true },
  operator: { type: String, enum: ['Contains', 'Equals', 'StartsWith', 'IsGreaterThan', 'IsLessThan'], required: true },
  value: { type: String, required: true }
});

const BankingRuleSchema = new Schema({
  orgId: { type: String, required: true, index: true },
  ruleName: { type: String, required: true },
  bankAccountId: { type: Schema.Types.ObjectId, ref: 'BankAccount' },
  transactionType: { type: String, enum: ['Deposit', 'Withdrawal', 'Both'], default: 'Both' },
  matchType: { type: String, enum: ['All', 'Any'], default: 'All' },
  conditions: [ConditionSchema],
  assignAccountId: { type: Schema.Types.ObjectId, ref: 'ChartOfAccount', required: true },
  assignContactId: { type: Schema.Types.ObjectId },
  assignTaxId: { type: Schema.Types.ObjectId },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export const BankingRule = mongoose.models.BankingRule || mongoose.model<IBankingRule>('BankingRule', BankingRuleSchema);
