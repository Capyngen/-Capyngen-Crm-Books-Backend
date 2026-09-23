import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
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

const ItemSchema: Schema = new Schema({
    orgId: { type: String },
  name: { type: String, required: true },
  sku: { type: String, default: '' },
  type: { type: String, enum: ['goods', 'service'], default: 'goods' },
  unit: { type: String, default: 'pcs' },
  salesRate: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v: number) => Math.round(v * 100) / 100, required: true, default: 0 },
  purchaseRate: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v: number) => Math.round(v * 100) / 100, required: true, default: 0 },
  description: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  createdBy: { type: String, default: 'piyushsharma12452' }
}, { isActive: { type: Boolean, default: true },
  timestamps: true, optimisticConcurrency: true });



 mongoose.model<IItem>('BooksItem', ItemSchema);

export default mongoose.models.BooksItem || mongoose.model<IItem>('BooksItem', ItemSchema);
