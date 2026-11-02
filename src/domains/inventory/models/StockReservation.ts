import mongoose, { Schema, Document } from 'mongoose';

export interface IStockReservation extends Document {
  orgId: string;
  warehouseId?: string;
  itemId: mongoose.Types.ObjectId | string;
  itemSku?: string;
  soId?: string;
  soLineId?: string;
  customerId?: string;
  quantity: number;
  type: 'SOFT' | 'HARD';
  status: 'ACTIVE' | 'PICKED' | 'RELEASED' | 'EXPIRED';
  allocatedBy: string;
  expiresAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockReservationSchema = new Schema<IStockReservation>(
  {
    orgId: { type: String, required: true, index: true },
    warehouseId: { type: String, index: true },
    itemId: { type: Schema.Types.Mixed, required: true, index: true },
    itemSku: { type: String },
    soId: { type: String, index: true },
    soLineId: { type: String, index: true },
    customerId: { type: String },
    quantity: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['SOFT', 'HARD'], default: 'SOFT' },
    status: {
      type: String,
      enum: ['ACTIVE', 'PICKED', 'RELEASED', 'EXPIRED'],
      default: 'ACTIVE',
      index: true
    },
    allocatedBy: { type: String, default: 'SYSTEM' },
    expiresAt: { type: Date, required: true, index: true },
    notes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.StockReservation ||
  mongoose.model<IStockReservation>('StockReservation', StockReservationSchema);
