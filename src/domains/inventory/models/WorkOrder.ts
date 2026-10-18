import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkOrder extends Document {
  companyId?: string;
  orgId?: string;
  workOrderNumber: string;
  itemId: mongoose.Types.ObjectId;
  quantity: number;
  routingId?: mongoose.Types.ObjectId;
  salesOrderId?: mongoose.Types.ObjectId;
  targetWarehouseId?: mongoose.Types.ObjectId;
  sourceWarehouseId?: mongoose.Types.ObjectId;
  scrapQuantity?: number;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  startDate?: Date;
  endDate?: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkOrderSchema: Schema = new Schema({
  companyId: { type: String, index: true },
  orgId: { type: String, index: true },
  workOrderNumber: { type: String, required: true },
  itemId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
  routingId: { type: Schema.Types.ObjectId, ref: 'BooksRouting' },
  salesOrderId: { type: Schema.Types.ObjectId, ref: 'SalesOrder' },
  targetWarehouseId: { type: Schema.Types.ObjectId, ref: 'BooksWarehouse' },
  sourceWarehouseId: { type: Schema.Types.ObjectId, ref: 'BooksWarehouse' },
  scrapQuantity: { type: Number, default: 0 },
  status: { type: String, enum: ['Planned', 'In Progress', 'Completed', 'Cancelled'], default: 'Planned' },
  startDate: { type: Date },
  endDate: { type: Date },
  completedAt: { type: Date },
  notes: { type: String, default: '' }
}, { timestamps: true });

WorkOrderSchema.index({ companyId: 1, workOrderNumber: 1 });
WorkOrderSchema.index({ orgId: 1, workOrderNumber: 1 });

export default mongoose.models.BooksWorkOrder || mongoose.model<IWorkOrder>('BooksWorkOrder', WorkOrderSchema);
