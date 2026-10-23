import mongoose, { Schema, Document } from 'mongoose';

export interface IPutaway extends Document {
  companyId?: string;
  orgId?: string;
  putawayNumber: string;
  grnNumber: string;
  purchaseReceive?: mongoose.Types.ObjectId;
  vendor?: mongoose.Types.ObjectId | string;
  vendorName?: string;
  item?: mongoose.Types.ObjectId | string;
  itemName?: string;
  itemSku?: string;
  quantity: number;
  stagingDock: string;
  targetBin: string;
  batchNumber?: string;
  serialNumbers?: string[];
  date: Date;
  status: 'Pending Putaway' | 'Put Away Completed' | 'Cancelled';
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PutawaySchema: Schema = new Schema(
  {
    companyId: { type: String, index: true },
    orgId: { type: String, index: true },
    putawayNumber: { type: String, required: true },
    grnNumber: { type: String, default: '' },
    purchaseReceive: { type: Schema.Types.ObjectId, ref: 'PurchaseReceive' },
    vendor: { type: Schema.Types.Mixed },
    vendorName: { type: String, default: '' },
    item: { type: Schema.Types.Mixed },
    itemName: { type: String, default: '' },
    itemSku: { type: String, default: '' },
    quantity: { type: Number, required: true, default: 1 },
    stagingDock: { type: String, default: 'Receiving Dock A' },
    targetBin: { type: String, required: true, default: 'Bin-A1' },
    batchNumber: { type: String, default: '' },
    serialNumbers: [{ type: String }],
    date: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ['Pending Putaway', 'Put Away Completed', 'Cancelled'],
      default: 'Pending Putaway'
    },
    completedAt: { type: Date },
    completedBy: { type: String },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

PutawaySchema.index({ companyId: 1, putawayNumber: 1 });
PutawaySchema.index({ orgId: 1, status: 1 });

export default mongoose.models.Putaway || mongoose.model<IPutaway>('Putaway', PutawaySchema);
