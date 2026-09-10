import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganizationSettings extends Document {
  orgId: string;
  baseCurrency: string;
  enabledCurrencies: string[];
}

const OrganizationSettingsSchema = new Schema({
  orgId: { type: String, required: true, unique: true },
  baseCurrency: { type: String, required: true, default: 'INR' },
  enabledCurrencies: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.models.OrganizationSettings || mongoose.model<IOrganizationSettings>('OrganizationSettings', OrganizationSettingsSchema);
