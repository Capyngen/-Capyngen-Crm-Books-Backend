import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
  // Enterprise Inventory Features
  itemClass?: 'Standard' | 'Variant' | 'Kit' | 'Assembly';
  trackingType?: 'None' | 'Serial' | 'Batch';
  valuationMethod?: 'FIFO' | 'FEFO' | 'WAC';
  barcode?: string;
  dimensions?: { length?: number; width?: number; height?: number; unit?: string };
  weight?: { value?: number; unit?: string };
  reorderPoint?: number;
  safetyStock?: number;
  leadTimeDays?: number;
  defaultWarehouseId?: string;
  defaultBin?: string;
  salesAccount?: string;
  purchaseAccount?: string;
  inventoryAccount?: string;
  purchaseDescription?: string;
  preferredVendorId?: string;
  variants?: {
    attributeName: string;
    attributeValue: string;
    sku: string;
    priceOverride?: number;
    purchaseRateOverride?: number;
    stock?: number;
    reorderPoint?: number;
    barcode?: string;
  }[];
  bom?: {
    itemId: mongoose.Types.ObjectId;
    itemName?: string;
    quantity: number;
    wastagePercent?: number;
    unitCost?: number;
    notes?: string;
  }[];
  serialNumbers?: {
    serialNo: string;
    status: 'Available' | 'Committed' | 'Sold' | 'Damaged';
    warehouse?: string;
    bin?: string;
    addedDate?: string;
    warrantyExpiry?: string;
  }[];
  batches?: {
    batchNo: string;
    mfgDate?: string;
    expiryDate?: string;
    quantity: number;
    warehouse?: string;
    bin?: string;
    status?: 'Active' | 'Quarantine' | 'Expired';
  }[];

  // CRM / Product fields
  companyId?: string;
  category?: string;
  hsnCode?: string;
  gstRate?: string;
  price?: number;
  stockQuantity?: number;
  minimumStock?: number;
  tags?: string[];
  images?: string[];
  status?: string;
  currency?: string;
  features?: string[];

  // Books / Inventory extended fields
  orgId?: string;
  name: string;
  sku: string;
  type: 'goods' | 'service';
  unit: string;
  salesRate: number;
  purchaseRate: number;
  description?: string;
  stock: number;
  createdBy?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema: Schema = new Schema({
  // Enterprise Inventory Features
  itemClass: { type: String, enum: ['Standard', 'Variant', 'Kit', 'Assembly'], default: 'Standard' },
  trackingType: { type: String, enum: ['None', 'Serial', 'Batch'], default: 'None' },
  valuationMethod: { type: String, enum: ['FIFO', 'FEFO', 'WAC'], default: 'FIFO' },
  barcode: { type: String, default: '' },
  dimensions: {
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    unit: { type: String, default: 'cm' }
  },
  weight: {
    value: { type: Number, default: 0 },
    unit: { type: String, default: 'kg' }
  },
  reorderPoint: { type: Number, default: 0 },
  safetyStock: { type: Number, default: 0 },
  leadTimeDays: { type: Number, default: 0 },
  defaultWarehouseId: { type: String, default: '' },
  defaultBin: { type: String, default: '' },
  salesAccount: { type: String, default: 'Sales' },
  purchaseAccount: { type: String, default: 'Cost of Goods Sold' },
  inventoryAccount: { type: String, default: 'Inventory Asset' },
  purchaseDescription: { type: String, default: '' },
  preferredVendorId: { type: String, default: '' },
  variants: [{
    attributeName: String,
    attributeValue: String,
    sku: String,
    priceOverride: Number,
    purchaseRateOverride: Number,
    stock: { type: Number, default: 0 },
    reorderPoint: { type: Number, default: 0 },
    barcode: String
  }],
  bom: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Product' },
    itemName: String,
    quantity: { type: Number, required: true },
    wastagePercent: { type: Number, default: 0 },
    unitCost: { type: Number, default: 0 },
    notes: String
  }],
  serialNumbers: [{
    serialNo: String,
    status: { type: String, enum: ['Available', 'Committed', 'Sold', 'Damaged'], default: 'Available' },
    warehouse: String,
    bin: String,
    addedDate: String,
    warrantyExpiry: String
  }],
  batches: [{
    batchNo: String,
    mfgDate: String,
    expiryDate: String,
    quantity: { type: Number, default: 0 },
    warehouse: String,
    bin: String,
    status: { type: String, enum: ['Active', 'Quarantine', 'Expired'], default: 'Active' }
  }],

  // CRM Base Fields
  companyId: { type: String },
  category: { type: String },
  hsnCode: { type: String },
  gstRate: { type: String },
  price: { type: Number },
  stockQuantity: { type: Number },
  minimumStock: { type: Number },
  tags: [String],
  images: [String],
  status: { type: String },
  currency: { type: String },
  features: [String],

  // Books / Inventory Fields
  orgId: { type: String },
  name: { type: String, required: true },
  sku: { type: String, default: '' },
  type: { type: String, enum: ['goods', 'service'], default: 'goods' },
  unit: { type: String, default: 'pcs' },
  salesRate: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v: number) => Math.round(v * 100) / 100, required: true, default: 0 },
  purchaseRate: { type: Number, min: [0, 'Amount cannot be negative'], max: 100000000000000, set: (v: number) => Math.round(v * 100) / 100, required: true, default: 0 },
  description: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  createdBy: { type: String, default: 'piyushsharma12452' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, strict: false });

export default mongoose.models.Product || mongoose.model<IItem>('Product', ItemSchema, 'products');
