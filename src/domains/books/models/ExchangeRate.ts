import mongoose, { Schema, Document } from 'mongoose';

export interface IExchangeRate extends Document {
  orgId: string;
  currency: string;
  effectiveDate: Date;
  rate: number;
}

const ExchangeRateSchema = new Schema({
  orgId: { type: String, required: true },
  currency: { type: String, required: true },
  effectiveDate: { type: Date, required: true },
  rate: { type: Number, required: true }
}, { timestamps: true });

// Index for efficient querying of closest rate
ExchangeRateSchema.index({ orgId: 1, currency: 1, effectiveDate: -1 });

export default mongoose.models.ExchangeRate || mongoose.model<IExchangeRate>('ExchangeRate', ExchangeRateSchema);
