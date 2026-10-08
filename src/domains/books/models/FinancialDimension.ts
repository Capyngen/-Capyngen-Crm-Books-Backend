import mongoose, { Schema, Document } from 'mongoose';

export interface IFinancialDimension extends Document {
  orgId: string;
  type: 'CostCenter' | 'ProfitCenter' | 'Department';
  code: string;
  name: string;
  parentDimensionId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialDimensionSchema = new Schema(
  {
    orgId: { type: String, required: true, index: true },
    type: { type: String, enum: ['CostCenter', 'ProfitCenter', 'Department'], required: true, index: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    parentDimensionId: { type: String, ref: 'FinancialDimension' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Ensure code is unique per org and type
FinancialDimensionSchema.index({ orgId: 1, type: 1, code: 1 }, { unique: true });

export const FinancialDimension = mongoose.model<IFinancialDimension>('FinancialDimension', FinancialDimensionSchema);
