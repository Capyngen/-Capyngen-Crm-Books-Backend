import mongoose, { Schema, Document } from 'mongoose';

export interface ICurrencyAdjustment extends Document {
  orgId: string;
  adjustmentDate: Date;
  adjustedCurrency: string;
  newExchangeRate: number;
  totalGainOrLoss: number;
  details: {
    transactionId: string;
    transactionType: string;
    foreignBalance: number;
    oldBaseValue: number;
    newBaseValue: number;
    gainOrLoss: number;
  }[];
}

const CurrencyAdjustmentSchema = new Schema({
  orgId: { type: String, required: true },
  adjustmentDate: { type: Date, required: true },
  adjustedCurrency: { type: String, required: true },
  newExchangeRate: { type: Number, required: true },
  totalGainOrLoss: { type: Number, required: true },
  details: [{
    transactionId: { type: String, required: true },
    transactionType: { type: String, required: true },
    foreignBalance: { type: Number, required: true },
    oldBaseValue: { type: Number, required: true },
    newBaseValue: { type: Number, required: true },
    gainOrLoss: { type: Number, required: true }
  }]
}, { timestamps: true });

export default mongoose.models.CurrencyAdjustment || mongoose.model<ICurrencyAdjustment>('CurrencyAdjustment', CurrencyAdjustmentSchema);
