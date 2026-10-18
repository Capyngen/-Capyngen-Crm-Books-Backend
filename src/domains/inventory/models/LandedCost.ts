import mongoose, { Schema, Document } from 'mongoose';

export interface ILandedCostCharge {
  chargeType: 'Freight' | 'Customs Duty' | 'Insurance' | 'Port Handling' | 'Clearance' | 'Other';
  amount: number;
  vendorName?: string;
  notes?: string;
}

export interface ILandedCostItem {
  item: mongoose.Types.ObjectId;
  itemName?: string;
  quantity: number;
  originalUnitRate: number;
  totalOriginalValue: number;
  weight?: number;
  allocatedLandedCost: number;
  newUnitCost: number;
}

export interface ILandedCost extends Document {
  companyId?: string;
  orgId?: string;
  landedCostNumber: string;
  date: Date;
  billId?: mongoose.Types.ObjectId;
  billNumber?: string;
  purchaseOrderId?: mongoose.Types.ObjectId;
  charges: ILandedCostCharge[];
  totalCharges: number;
  allocationBasis: 'Value' | 'Quantity' | 'Weight';
  items: ILandedCostItem[];
  status: 'Draft' | 'Applied' | 'Cancelled';
  appliedAt?: Date;
  appliedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LandedCostChargeSchema = new Schema({
  chargeType: {
    type: String,
    enum: ['Freight', 'Customs Duty', 'Insurance', 'Port Handling', 'Clearance', 'Other'],
    default: 'Freight'
  },
  amount: { type: Number, required: true },
  vendorName: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { _id: false });

const LandedCostItemSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  itemName: { type: String, default: '' },
  quantity: { type: Number, required: true },
  originalUnitRate: { type: Number, required: true },
  totalOriginalValue: { type: Number, required: true },
  weight: { type: Number, default: 1 },
  allocatedLandedCost: { type: Number, default: 0 },
  newUnitCost: { type: Number, default: 0 }
}, { _id: false });

const LandedCostSchema: Schema = new Schema({
  companyId: { type: String, index: true },
  orgId: { type: String, index: true },
  landedCostNumber: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  billId: { type: Schema.Types.ObjectId, ref: 'BooksBill' },
  billNumber: { type: String, default: '' },
  purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  charges: [LandedCostChargeSchema],
  totalCharges: { type: Number, default: 0 },
  allocationBasis: { type: String, enum: ['Value', 'Quantity', 'Weight'], default: 'Value' },
  items: [LandedCostItemSchema],
  status: { type: String, enum: ['Draft', 'Applied', 'Cancelled'], default: 'Draft' },
  appliedAt: { type: Date },
  appliedBy: { type: String },
  notes: { type: String, default: '' }
}, { timestamps: true });

LandedCostSchema.index({ companyId: 1, landedCostNumber: 1 });
LandedCostSchema.index({ orgId: 1, landedCostNumber: 1 });

export default mongoose.models.BooksLandedCost || mongoose.model<ILandedCost>('BooksLandedCost', LandedCostSchema);
