import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBankAccount extends Document {
  orgId: string;
  accountName: string;
  accountNumber?: string;
  accountType: 'Checking' | 'Savings' | 'Current' | 'CreditCard' | 'Cash' | 'Overdraft';
  bankName?: string;
  ifscCode?: string;
  swiftCode?: string;
  branch?: string;
  currency: string;
  chartOfAccountId?: Types.ObjectId | string;
  openingBalance: number;
  openingBalanceDate?: Date;
  currentBalance: number;
  unreconciledBalance: number;
  reconciledBalance: number;
  status: 'Active' | 'Inactive';
  isPrimary: boolean;
  feedSource: 'Manual' | 'CSV' | 'Plaid' | 'OpenBanking';
  createdAt: Date;
  updatedAt: Date;
}

const BankAccountSchema = new Schema<IBankAccount>({
  orgId: { type: String, required: true, index: true },
  accountName: { type: String, required: true },
  accountNumber: { type: String, default: '' },
  accountType: { 
    type: String, 
    enum: ['Checking', 'Savings', 'Current', 'CreditCard', 'Cash', 'Overdraft'], 
    default: 'Checking' 
  },
  bankName: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  swiftCode: { type: String, default: '' },
  branch: { type: String, default: '' },
  currency: { type: String, default: 'INR' },
  chartOfAccountId: { type: Schema.Types.Mixed },
  openingBalance: { type: Number, default: 0 },
  openingBalanceDate: { type: Date, default: Date.now },
  currentBalance: { type: Number, default: 0 },
  unreconciledBalance: { type: Number, default: 0 },
  reconciledBalance: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  isPrimary: { type: Boolean, default: false },
  feedSource: { type: String, enum: ['Manual', 'CSV', 'Plaid', 'OpenBanking'], default: 'Manual' }
}, { timestamps: true });

BankAccountSchema.index({ orgId: 1, accountName: 1 });

export default mongoose.models.BankAccount || mongoose.model<IBankAccount>('BankAccount', BankAccountSchema);
