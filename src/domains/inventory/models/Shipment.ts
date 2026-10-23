import mongoose, { Schema, Document } from 'mongoose';

export interface IShipmentItem {
  item: mongoose.Types.ObjectId;
  quantity: number;
  unit?: string;
  serialNumbers?: string[];
  batchNo?: string;
}

export interface IShipment extends Document {
  companyId?: string;
  orgId?: string;
  shipmentNumber: string;
  packageNumber?: string;
  salesOrderId?: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  customerName?: string;
  date: Date;
  status: 'Draft' | 'Picked' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
  shippingMethod?: string;
  shippingCost: number;
  weight?: { value: number; unit: string };
  dimensions?: { length: number; width: number; height: number; unit: string };
  deliveryAddress?: string;
  shippingLabelUrl?: string;
  notes?: string;
  items: IShipmentItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentSchema: Schema = new Schema({
  companyId: { type: Schema.Types.Mixed, index: true },
  orgId: { type: Schema.Types.Mixed, index: true },
  shipmentNumber: { type: String, required: true },
  packageNumber: { type: String, default: '' },
  salesOrderId: { type: Schema.Types.ObjectId, ref: 'SalesOrder' },
  customerId: { type: Schema.Types.ObjectId, ref: 'BooksCustomer' },
  customerName: { type: String, default: '' },
  date: { type: Date, required: true, default: Date.now },
  status: { type: String, enum: ['Draft', 'Picked', 'Packed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Draft' },
  carrier: { type: String, default: '' },
  trackingNumber: { type: String, default: '' },
  trackingUrl: { type: String, default: '' },
  shippingMethod: { type: String, default: 'Standard Express' },
  shippingCost: { type: Number, default: 0 },
  weight: {
    value: { type: Number, default: 1 },
    unit: { type: String, default: 'kg' }
  },
  dimensions: {
    length: { type: Number, default: 10 },
    width: { type: Number, default: 10 },
    height: { type: Number, default: 10 },
    unit: { type: String, default: 'cm' }
  },
  deliveryAddress: { type: String, default: '' },
  shippingLabelUrl: { type: String, default: '' },
  notes: { type: String, default: '' },
  items: [{
    item: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'pcs' },
    serialNumbers: [{ type: String }],
    batchNo: { type: String, default: '' }
  }]
}, { timestamps: true });

ShipmentSchema.index({ companyId: 1, shipmentNumber: 1 });
ShipmentSchema.index({ orgId: 1, shipmentNumber: 1 });

const ShipmentModel = mongoose.models.Shipment || mongoose.model<IShipment>('Shipment', ShipmentSchema, 'shipments');
if (!mongoose.models.BooksShipment) {
  try { mongoose.model('BooksShipment', ShipmentSchema, 'shipments'); } catch (e) {}
}
export default ShipmentModel;
