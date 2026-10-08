import mongoose, { Schema, Document } from 'mongoose';

export interface IChartOfAccount extends Document {
  orgId?: string;
  accountType: string;
  accountGroup?: string;
  accountName: string;
  accountCode?: string;
  description?: string;
  addToWatchlist?: boolean;
  isSubAccount?: boolean;
  parentAccount?: string;
  applicableBranches?: string[];
  costCenters?: string[];
  profitCenters?: string[];
  departments?: string[];
  effectiveDate?: Date;
  systemAccountType?: string;
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
    orgId: { type: String, index: true },
    accountType: { type: String, required: true },
    accountGroup: { type: String },
    accountName: { type: String, required: true },
    accountCode: { type: String },
    description: { type: String, maxlength: 500 },
    addToWatchlist: { type: Boolean, default: false },
    isSubAccount: { type: Boolean, default: false },
    parentAccount: { type: String, ref: 'ChartOfAccount' },
    applicableBranches: [{ type: String }],
    costCenters: [{ type: String }],
    profitCenters: [{ type: String }],
    departments: [{ type: String }],
    effectiveDate: { type: Date },
    systemAccountType: { type: String, index: true },
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
