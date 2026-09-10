import mongoose, { Schema, Document } from 'mongoose';

export interface IChartOfAccount extends Document {
  orgId?: string;
  accountType: string;
  accountName: string;
  accountCode?: string;
  description?: string;
  addToWatchlist?: boolean;
  isSubAccount?: boolean;
  parentAccount?: string;
  currency?: string;
  accountNumber?: string;
  ifsc?: string;
  users?: string[];
  status: 'Active' | 'Inactive';
  isSystemAccount?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChartOfAccountSchema = new Schema({
    orgId: { type: String },
    accountType: { type: String, required: true },
    accountName: { type: String, required: true },
    accountCode: { type: String },
    description: { type: String, maxlength: 500 },
    addToWatchlist: { type: Boolean, default: false },
    isSubAccount: { type: Boolean, default: false },
    parentAccount: { type: String },
    currency: { type: String },
    accountNumber: { type: String },
    ifsc: { type: String },
    users: [{ type: String }],
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    isSystemAccount: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const ChartOfAccount = mongoose.model<IChartOfAccount>('ChartOfAccount', ChartOfAccountSchema);
