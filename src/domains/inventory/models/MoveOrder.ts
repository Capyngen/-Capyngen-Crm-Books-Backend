import mongoose, { Schema, Document } from 'mongoose';

export interface IMoveOrder extends Document {
  companyId?: string;
  orgId?: string;
  moveOrderNumber: string;
  date: Date;
  warehouse?: mongoose.Types.ObjectId | string;
  warehouseName?: string;
  item?: mongoose.Types.ObjectId | string;
  itemName?: string;
  itemSku?: string;
  quantity: number;
  fromBin: string;
  toBin: string;
  reason: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  executedAt?: Date;
  executedBy?: string;
  createdBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MoveOrderSchema: Schema = new Schema(
  {
    companyId: { type: String, index: true },
    orgId: { type: String, index: true },
    moveOrderNumber: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    warehouse: { type: Schema.Types.Mixed },
    warehouseName: { type: String, default: '' },
    item: { type: Schema.Types.Mixed },
    itemName: { type: String, default: '' },
    itemSku: { type: String, default: '' },
    quantity: { type: Number, required: true, default: 1 },
    fromBin: { type: String, required: true, default: 'Bin-A1' },
    toBin: { type: String, required: true, default: 'Bin-B1' },
    reason: { type: String, default: 'Forward Pick Face Replenishment' },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    executedAt: { type: Date },
    executedBy: { type: String },
    createdBy: { type: String },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

MoveOrderSchema.index({ companyId: 1, moveOrderNumber: 1 });
MoveOrderSchema.index({ orgId: 1, status: 1 });

export default mongoose.models.MoveOrder || mongoose.model<IMoveOrder>('MoveOrder', MoveOrderSchema);
