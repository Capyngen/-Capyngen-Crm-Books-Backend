import mongoose, { Schema, Document } from 'mongoose';

export interface IAdjustmentItem {
  item: mongoose.Types.ObjectId;
  quantityAdjusted: number;
}

export interface IInventoryAdjustment extends Document {
  mode: 'quantity' | 'value';
  referenceNumber?: string;
  date: Date;
  reason: string;
  description?: string;
  account: string;
  items: IAdjustmentItem[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryAdjustmentSchema: Schema = new Schema({
  mode: { type: String, enum: ['quantity', 'value'], default: 'quantity' },
  referenceNumber: { type: String, default: '' },
  date: { type: Date, required: true, default: Date.now },
  reason: { type: String, required: true },
  description: { type: String, default: '' },
  account: { type: String, required: true },
  items: [{
    item: { type: Schema.Types.ObjectId, ref: 'BooksItem', required: true },
    quantityAdjusted: { type: Number, required: true }
  }],
  createdBy: { type: String }
}, { timestamps: true });

export default mongoose.model<IInventoryAdjustment>('BooksInventoryAdjustment', InventoryAdjustmentSchema);
