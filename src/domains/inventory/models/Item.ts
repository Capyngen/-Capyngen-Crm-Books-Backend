import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
  // CRM / Product fields
  companyId?: string; // Mapped from orgId / tenant
  category?: string;
  hsnCode?: string;
  gstRate?: string;
  price?: number; // CRM sales price
  stockQuantity?: number; // CRM stock
  minimumStock?: number;
  tags?: string[];
  images?: string[];
  status?: string;
  currency?: string;
  features?: string[];

  // Books / Inventory extended fields
  orgId?: string; // Legacy support
  name: string;
  sku: string;
  type: 'goods' | 'service';
  unit: string;
  salesRate: number; // Books sales price
  purchaseRate: number; // Books purchase price
  description?: string;
  stock: number; // Books stock
  createdBy?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema: Schema = new Schema({
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
}, { timestamps: true, optimisticConcurrency: true });

// CRITICAL: Pointing the Item model directly to the CRM's 'products' collection!
export default mongoose.models.Product || mongoose.model<IItem>('Product', ItemSchema, 'products');
