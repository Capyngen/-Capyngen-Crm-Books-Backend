import mongoose, { Schema, Document } from 'mongoose';

export interface IAdjustmentItem {
  item: mongoose.Types.ObjectId;
  warehouse?: mongoose.Types.ObjectId | string;
  currentStock?: number;
  quantityAdjusted: number;
  newStock?: number;
  unitCost?: number;
  valueAdjusted?: number;
}

export interface IInventoryAdjustment extends Document {
  companyId?: string;
  orgId?: string;
  warehouseId?: mongoose.Types.ObjectId;
  mode: 'quantity' | 'value';
  referenceNumber?: string;
  date: Date;
  reason: string;
  description?: string;
  account: string;
  status: 'Draft' | 'Adjusted' | 'Cancelled';
  approvalStatus: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  totalValue?: number;
  items: IAdjustmentItem[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryAdjustmentSchema: Schema = new Schema({
  companyId: { type: String, index: true },
  orgId: { type: String, index: true },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'BooksWarehouse' },
  mode: { type: String, enum: ['quantity', 'value'], default: 'quantity' },
  referenceNumber: { type: String, default: '' },
  date: { type: Date, required: true, default: Date.now },
  reason: { type: String, required: true },
  description: { type: String, default: '' },
  account: { type: String, required: true },
  status: { type: String, enum: ['Draft', 'Adjusted', 'Cancelled'], default: 'Adjusted' },
  approvalStatus: { type: String, enum: ['Draft', 'Pending', 'Approved', 'Rejected'], default: 'Approved' },
  totalValue: { type: Number, default: 0 },
  items: [{
    item: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'BooksWarehouse' },
    currentStock: { type: Number, default: 0 },
    quantityAdjusted: { type: Number, required: true },
    newStock: { type: Number, default: 0 },
    unitCost: { type: Number, default: 0 },
    valueAdjusted: { type: Number, default: 0 }
  }],
  createdBy: { type: String }
}, { timestamps: true });

InventoryAdjustmentSchema.index({ companyId: 1, referenceNumber: 1 });
InventoryAdjustmentSchema.index({ orgId: 1, referenceNumber: 1 });

export default mongoose.models.BooksInventoryAdjustment || mongoose.model<IInventoryAdjustment>('BooksInventoryAdjustment', InventoryAdjustmentSchema);
