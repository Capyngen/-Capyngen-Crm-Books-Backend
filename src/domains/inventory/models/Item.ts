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
  warehouseStock?: {
    warehouse: mongoose.Types.ObjectId | string;
    warehouseName?: string;
    bin?: string;
    stockOnHand: number;
    committedStock: number;
    availableStock: number;
  }[];
  costLayers?: {
    date: Date;
    quantity: number;
    unitCost: number;
    remainingQty: number;
    referenceDoc?: string;
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
  warehouseStock: [{
    warehouse: { type: Schema.Types.ObjectId, ref: 'BooksWarehouse' },
    warehouseName: { type: String, default: '' },
    bin: { type: String, default: '' },
    stockOnHand: { type: Number, default: 0 },
    committedStock: { type: Number, default: 0 },
    availableStock: { type: Number, default: 0 }
  }],
  costLayers: [{
    date: { type: Date, default: Date.now },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, required: true },
    remainingQty: { type: Number, required: true },
    referenceDoc: { type: String, default: '' }
  }],

  // CRM Base Fields
  companyId: { type: Schema.Types.Mixed },
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
  orgId: { type: Schema.Types.Mixed },
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

const ProductModel = mongoose.models.Product || mongoose.model<IItem>('Product', ItemSchema, 'products');
if (!mongoose.models.BooksItem) {
  try { mongoose.model('BooksItem', ItemSchema, 'products'); } catch (e) {}
}
if (!mongoose.models.Item) {
  try { mongoose.model('Item', ItemSchema, 'products'); } catch (e) {}
}
export default ProductModel;
