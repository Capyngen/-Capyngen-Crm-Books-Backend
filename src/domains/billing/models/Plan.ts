import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  orgId?: string;
  planName: string;
  planCode: string;
  productName: string;
  billingFrequency: number;
  billingFrequencyUnit: string;
  price: number;
  setupFee: number;
  freeTrialDays: number;
  status: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema: Schema = new Schema({
    orgId: { type: String },
  planName: { type: String, required: true },
  planCode: { type: String, default: '' },
  productName: { type: String, default: 'General Product' },
  billingFrequency: { type: Number, default: 1 },
  billingFrequencyUnit: { type: String, default: 'month' },
  price: { type: Number, required: true, default: 0 },
  setupFee: { type: Number, default: 0 },
  freeTrialDays: { type: Number, default: 0 },
  status: { type: String, default: 'Active' },
  description: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.BillingPlan || mongoose.model<IPlan>('BillingPlan', PlanSchema);
