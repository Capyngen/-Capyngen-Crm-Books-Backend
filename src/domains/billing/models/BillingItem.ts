import mongoose, { Schema, Document } from 'mongoose';

export interface IBillingItem extends Document {
  orgId?: string;
  name: string;
  sku: string;
  type: 'goods' | 'service';
  unit: string;
  salesRate: number;
  purchaseRate: number;
  description?: string;
  stock: number;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BillingItemSchema: Schema = new Schema({
    orgId: { type: String },
  name: { type: String, required: true },
  sku: { type: String, default: '' },
  type: { type: String, enum: ['goods', 'service'], default: 'goods' },
  unit: { type: String, default: 'pcs' },
  salesRate: { type: Number, required: true, default: 0 },
  purchaseRate: { type: Number, required: true, default: 0 },
  description: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  createdBy: { type: String }
}, { timestamps: true });

export default mongoose.models.BillingItem || mongoose.model<IBillingItem>('BillingItem', BillingItemSchema);
