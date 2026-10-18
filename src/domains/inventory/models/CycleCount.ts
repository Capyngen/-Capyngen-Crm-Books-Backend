import mongoose, { Schema, Document } from 'mongoose';

export interface ICycleCountLine {
  item: mongoose.Types.ObjectId;
  itemName?: string;
  sku?: string;
  bin?: string;
  systemQuantity: number;
  countedQuantity: number;
  varianceQuantity: number;
  unitCost: number;
  varianceValue: number;
  notes?: string;
}

export interface ICycleCount extends Document {
  companyId?: string;
  orgId?: string;
  countNumber: string;
  date: Date;
  warehouseId: mongoose.Types.ObjectId;
  countType: 'Full' | 'Class A' | 'Class B' | 'Class C' | 'Spot Count' | 'Custom';
  isBlindCount: boolean;
  status: 'Draft' | 'In Progress' | 'Under Review' | 'Reconciled' | 'Cancelled';
  assignedTo?: string;
  countedBy?: string;
  reconciledAt?: Date;
  reconciledBy?: string;
  adjustmentId?: mongoose.Types.ObjectId;
  lines: ICycleCountLine[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CycleCountLineSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  itemName: { type: String, default: '' },
  sku: { type: String, default: '' },
  bin: { type: String, default: '' },
  systemQuantity: { type: Number, required: true },
  countedQuantity: { type: Number, default: 0 },
  varianceQuantity: { type: Number, default: 0 },
  unitCost: { type: Number, default: 0 },
  varianceValue: { type: Number, default: 0 },
  notes: { type: String, default: '' }
}, { _id: false });

const CycleCountSchema: Schema = new Schema({
  companyId: { type: String, index: true },
  orgId: { type: String, index: true },
  countNumber: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'BooksWarehouse', required: true },
  countType: {
    type: String,
    enum: ['Full', 'Class A', 'Class B', 'Class C', 'Spot Count', 'Custom'],
    default: 'Spot Count'
  },
  isBlindCount: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['Draft', 'In Progress', 'Under Review', 'Reconciled', 'Cancelled'],
    default: 'Draft'
  },
  assignedTo: { type: String, default: '' },
  countedBy: { type: String, default: '' },
  reconciledAt: { type: Date },
  reconciledBy: { type: String, default: '' },
  adjustmentId: { type: Schema.Types.ObjectId, ref: 'BooksInventoryAdjustment' },
  lines: [CycleCountLineSchema],
  notes: { type: String, default: '' }
}, { timestamps: true });

CycleCountSchema.index({ companyId: 1, countNumber: 1 });
CycleCountSchema.index({ orgId: 1, countNumber: 1 });

export default mongoose.models.BooksCycleCount || mongoose.model<ICycleCount>('BooksCycleCount', CycleCountSchema);
