import mongoose, { Schema, Document } from 'mongoose';

export interface IPackageItem {
  itemId?: mongoose.Types.ObjectId | string;
  name?: string;
  sku?: string;
  quantity: number;
  unit?: string;
}

export interface IPackage extends Document {
  companyId?: any;
  orgId?: string;
  packageNumber: string;
  salesOrderId?: mongoose.Types.ObjectId | string;
  salesOrderNumber?: string;
  customerId?: mongoose.Types.ObjectId | string;
  customer?: string;
  warehouseId?: mongoose.Types.ObjectId | string;
  warehouse?: string;
  packageDate: Date | string;
  weightKg?: number;
  dimensions?: string;
  carrier?: string;
  trackingNumber?: string;
  notes?: string;
  status: 'Draft' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: IPackageItem[];
  itemsPacked?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema: Schema = new Schema({
  companyId: { type: Schema.Types.Mixed, index: true },
  orgId: { type: String, index: true },
  packageNumber: { type: String, required: true },
  salesOrderId: { type: Schema.Types.Mixed, ref: 'SalesOrder' },
  salesOrderNumber: { type: String, default: '' },
  customerId: { type: Schema.Types.Mixed, ref: 'ClientAccount' },
  customer: { type: String, default: '' },
  warehouseId: { type: Schema.Types.Mixed, ref: 'Warehouse' },
  warehouse: { type: String, default: '' },
  packageDate: { type: Date, default: Date.now },
  weightKg: { type: Number, default: 1 },
  dimensions: { type: String, default: 'Standard Box' },
  carrier: { type: String, default: 'Standard Express' },
  trackingNumber: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['Draft', 'Packed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Packed' },
  items: [{
    itemId: { type: Schema.Types.Mixed },
    name: { type: String, default: '' },
    sku: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: 'pcs' }
  }],
  itemsPacked: { type: Number, default: 0 }
}, { timestamps: true, strict: false });

const PackageModel = mongoose.models.Package || mongoose.model<IPackage>('Package', PackageSchema, 'packages');
export default PackageModel;
