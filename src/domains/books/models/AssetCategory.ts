import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAssetCategory extends Document {
  orgId: string;
  name: string; // e.g., 'Computers & Equipment', 'Vehicles', 'Buildings'
  description?: string;
  depreciationMethod: 'Straight_Line' | 'Declining_Balance' | 'None';
  defaultUsefulLifeMonths: number;
  assetAccountId: Types.ObjectId; // GL Account for Asset (e.g., Fixed Assets - Computers)
  depreciationAccountId: Types.ObjectId; // GL Account for Depreciation Expense
  accumulatedDepreciationAccountId: Types.ObjectId; // GL Account for Accumulated Depreciation (Contra-Asset)
  isActive: boolean;
}

const AssetCategorySchema = new Schema<IAssetCategory>(
  {
    orgId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    depreciationMethod: { type: String, enum: ['Straight_Line', 'Declining_Balance', 'None'], default: 'Straight_Line' },
    defaultUsefulLifeMonths: { type: Number, required: true },
    assetAccountId: { type: Schema.Types.ObjectId, ref: 'ChartOfAccount', required: true },
    depreciationAccountId: { type: Schema.Types.ObjectId, ref: 'ChartOfAccount', required: true },
    accumulatedDepreciationAccountId: { type: Schema.Types.ObjectId, ref: 'ChartOfAccount', required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const AssetCategory = mongoose.models.AssetCategory || mongoose.model<IAssetCategory>('AssetCategory', AssetCategorySchema);
