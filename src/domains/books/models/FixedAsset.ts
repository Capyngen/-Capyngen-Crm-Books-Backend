import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDepreciationHistory {
  date: Date;
  amount: number;
  journalId?: Types.ObjectId;
}

export interface IFixedAsset extends Document {
  orgId: string;
  assetName: string;
  assetNumber: string; // e.g. AST-0001
  categoryId: Types.ObjectId;
  
  // Financial Details
  purchaseDate: Date;
  purchasePrice: number; // Original Cost
  salvageValue: number; // Estimated value at the end of useful life
  usefulLifeMonths: number;
  depreciationMethod: 'Straight_Line' | 'Declining_Balance' | 'None';
  depreciationRate?: number; // Needed primarily for Declining Balance

  // Current Valuations
  accumulatedDepreciation: number;
  currentBookValue: number;

  // Lifecycle
  status: 'Draft' | 'Active' | 'Disposed' | 'Fully_Depreciated';
  disposalDate?: Date;
  disposalAmount?: number;
  
  // Record keeping
  depreciationHistory: IDepreciationHistory[];
}

const FixedAssetSchema = new Schema<IFixedAsset>(
  {
    orgId: { type: String, required: true, index: true },
    assetName: { type: String, required: true },
    assetNumber: { type: String, required: true, unique: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'AssetCategory', required: true },
    
    purchaseDate: { type: Date, required: true },
    purchasePrice: { type: Number, required: true },
    salvageValue: { type: Number, default: 0 },
    usefulLifeMonths: { type: Number, required: true },
    depreciationMethod: { type: String, enum: ['Straight_Line', 'Declining_Balance', 'None'], required: true },
    depreciationRate: { type: Number },
    
    accumulatedDepreciation: { type: Number, default: 0 },
    currentBookValue: { type: Number, required: true },
    
    status: { type: String, enum: ['Draft', 'Active', 'Disposed', 'Fully_Depreciated'], default: 'Draft' },
    disposalDate: { type: Date },
    disposalAmount: { type: Number },
    
    depreciationHistory: [{
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
      journalId: { type: Schema.Types.ObjectId, ref: 'Journal' }
    }]
  },
  { timestamps: true }
);

export const FixedAsset = mongoose.models.FixedAsset || mongoose.model<IFixedAsset>('FixedAsset', FixedAssetSchema);
export default FixedAsset;
