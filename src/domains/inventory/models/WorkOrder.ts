import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkOrder extends Document {
  orgId?: string;
  workOrderNumber: string;
  itemId: mongoose.Types.ObjectId;
  quantity: number;
  routingId: mongoose.Types.ObjectId;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  startDate: Date;
  endDate: Date;
}

const WorkOrderSchema: Schema = new Schema({
  orgId: { type: String },
  workOrderNumber: { type: String, required: true },
  itemId: { type: Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number, required: true, default: 1 },
  routingId: { type: Schema.Types.ObjectId, ref: 'BooksRouting' },
  status: { type: String, enum: ['Planned', 'In Progress', 'Completed', 'Cancelled'], default: 'Planned' },
  startDate: { type: Date },
  endDate: { type: Date }
}, { timestamps: true });

export default mongoose.model<IWorkOrder>('BooksWorkOrder', WorkOrderSchema);
