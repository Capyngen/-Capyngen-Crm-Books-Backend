import mongoose, { Schema, Document } from 'mongoose';

export interface IFulfillmentOrder extends Document {
  companyId?: any;
  orgId?: string;
  waveNumber: string;
  salesOrderId?: mongoose.Types.ObjectId | string;
  salesOrderNumber: string;
  customerName: string;
  warehouseName: string;
  pickBin?: string;
  itemsCount: number;
  priority: 'Urgent' | 'High' | 'Standard';
  stage: 'To Pick' | 'Picked' | 'Packed' | 'Shipped';
  date: Date;
  notes?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FulfillmentOrderSchema: Schema = new Schema({
  companyId: { type: Schema.Types.Mixed, index: true },
  orgId: { type: String, index: true },
  waveNumber: { type: String, required: true },
  salesOrderId: { type: Schema.Types.Mixed, ref: 'SalesOrder' },
  salesOrderNumber: { type: String, required: true },
  customerName: { type: String, default: '' },
  warehouseName: { type: String, default: 'Main Central Warehouse' },
  pickBin: { type: String, default: 'BIN-A1' },
  itemsCount: { type: Number, default: 1 },
  priority: { type: String, enum: ['Urgent', 'High', 'Standard'], default: 'High' },
  stage: { type: String, enum: ['To Pick', 'Picked', 'Packed', 'Shipped'], default: 'To Pick' },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  assignedTo: { type: String, default: '' }
}, { timestamps: true, strict: false });

FulfillmentOrderSchema.index({ orgId: 1, waveNumber: 1 });
FulfillmentOrderSchema.index({ orgId: 1, stage: 1 });

const FulfillmentOrderModel = mongoose.models.FulfillmentOrder || mongoose.model<IFulfillmentOrder>('FulfillmentOrder', FulfillmentOrderSchema, 'fulfillment_orders');
export default FulfillmentOrderModel;
