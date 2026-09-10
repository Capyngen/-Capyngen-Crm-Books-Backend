import mongoose, { Schema, Document } from 'mongoose';

export interface ITaxConfiguration extends Document {
  orgId: string;
  taxType: 'TDS' | 'TCS';
  sectionCode: string;
  rate: number;
}

const TaxConfigurationSchema = new Schema({
  orgId: { type: String, required: true },
  taxType: { type: String, enum: ['TDS', 'TCS'], required: true },
  sectionCode: { type: String, required: true },
  rate: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.models.TaxConfiguration || mongoose.model<ITaxConfiguration>('TaxConfiguration', TaxConfigurationSchema);
