import mongoose, { Schema, Document } from 'mongoose';

export interface IShipment extends Document {
  orgId?: string;
  shipmentNumber: string;
  salesOrderId?: mongoose.Types.ObjectId;
  date: Date;
  status: 'Draft' | 'Picked' | 'Packed' | 'Shipped' | 'Delivered';
  carrier: string;
  trackingNumber: string;
  shippingCost: number;
  items: { item: mongoose.Types.ObjectId; quantity: number }[];
}

const ShipmentSchema: Schema = new Schema({
  orgId: { type: String },
  shipmentNumber: { type: String, required: true },
  salesOrderId: { type: Schema.Types.ObjectId, ref: 'SalesOrder' },
  date: { type: Date, required: true, default: Date.now },
  status: { type: String, enum: ['Draft', 'Picked', 'Packed', 'Shipped', 'Delivered'], default: 'Draft' },
  carrier: { type: String, default: '' },
  trackingNumber: { type: String, default: '' },
  shippingCost: { type: Number, default: 0 },
  items: [{
    item: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true }
  }]
}, { timestamps: true });

export default mongoose.model<IShipment>('BooksShipment', ShipmentSchema);
