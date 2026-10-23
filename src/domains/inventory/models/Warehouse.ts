import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouseBin {
  binCode: string;
  name: string;
  zone?: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  capacityVolume?: number; // m3
  capacityWeight?: number; // kg
  isQuarantine?: boolean;
  isDamaged?: boolean;
  status: 'Active' | 'Full' | 'Maintenance';
}

export interface IWarehouse extends Document {
  companyId?: string;
  orgId?: string;
  name: string;
  code: string;
  type: 'Central Hub' | 'Regional Distribution' | 'Transit' | 'Quarantine' | 'Damaged' | 'Production Staging' | 'Standard';
  branchId?: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  managerName?: string;
  contactPhone?: string;
  contactEmail?: string;
  isDefault?: boolean;
  bins: IWarehouseBin[];
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseBinSchema = new Schema({
  binCode: { type: String, required: true },
  name: { type: String, required: true },
  zone: { type: String, default: 'Zone A' },
  aisle: { type: String, default: '' },
  rack: { type: String, default: '' },
  shelf: { type: String, default: '' },
  capacityVolume: { type: Number, default: 0 },
  capacityWeight: { type: Number, default: 0 },
  isQuarantine: { type: Boolean, default: false },
  isDamaged: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Full', 'Maintenance'], default: 'Active' }
}, { _id: true });

const WarehouseSchema: Schema = new Schema({
  companyId: { type: String, index: true },
  orgId: { type: String, index: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Central Hub', 'Regional Distribution', 'Transit', 'Quarantine', 'Damaged', 'Production Staging', 'Standard'], 
    default: 'Standard' 
  },
  branchId: { type: String },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  country: { type: String, default: 'India' },
  pincode: { type: String, default: '' },
  managerName: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  isDefault: { type: Boolean, default: false },
  bins: [WarehouseBinSchema],
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

WarehouseSchema.index({ companyId: 1, code: 1 });
WarehouseSchema.index({ orgId: 1, code: 1 });

const WarehouseModel = mongoose.models.Warehouse || mongoose.model<IWarehouse>('Warehouse', WarehouseSchema, 'warehouses');
if (!mongoose.models.BooksWarehouse) {
  try { mongoose.model('BooksWarehouse', WarehouseSchema, 'warehouses'); } catch (e) {}
}
export default WarehouseModel;
